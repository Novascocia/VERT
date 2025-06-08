const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("pVERT Integration Tests", function () {
  let nftContract, pvertContract, virtualToken, realVertToken;
  let owner, treasury, user1, user2;
  let pvertAddress, nftAddress, virtualAddress, realVertAddress;

  const INITIAL_PVERT_SUPPLY = ethers.parseUnits("1000000000", 18); // 1B pVERT
  const FUND_AMOUNT = ethers.parseUnits("50000000", 18); // 50M pVERT for prizes
  const VIRTUAL_PRICE = ethers.parseUnits("0.01", 18);
  const VERT_PRICE = ethers.parseUnits("500", 18);

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();

    // Deploy mock VIRTUAL token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    virtualToken = await MockERC20.deploy("Virtual Token", "VIRTUAL", INITIAL_PVERT_SUPPLY);
    virtualAddress = await virtualToken.getAddress();

    // Deploy real VERT token (for later switch test)
    realVertToken = await MockERC20.deploy("VERT Token", "VERT", INITIAL_PVERT_SUPPLY);
    realVertAddress = await realVertToken.getAddress();

    // Deploy pVERT token
    const pVERT = await ethers.getContractFactory("pVERT");
    pvertContract = await pVERT.deploy(owner.address);
    pvertAddress = await pvertContract.getAddress();

    // Deploy NFT contract (start with pVERT as VERT token)
    const VerticalProjectNFT = await ethers.getContractFactory("VerticalProjectNFT");
    nftContract = await VerticalProjectNFT.deploy(
      virtualAddress,
      pvertAddress, // Start with pVERT
      treasury.address
    );
    nftAddress = await nftContract.getAddress();

    // Set prices
    await nftContract.setPrices(VIRTUAL_PRICE, VERT_PRICE);

    // Fund users with VIRTUAL tokens
    await virtualToken.transfer(user1.address, ethers.parseUnits("100", 18));
    await virtualToken.transfer(user2.address, ethers.parseUnits("100", 18));

    // Fund NFT contract with pVERT for prizes
    await pvertContract.transfer(nftAddress, FUND_AMOUNT);
  });

  describe("pVERT Token Contract", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await pvertContract.name()).to.equal("Placeholder VERT");
      expect(await pvertContract.symbol()).to.equal("pVERT");
      expect(await pvertContract.totalSupply()).to.equal(INITIAL_PVERT_SUPPLY);
      expect(await pvertContract.balanceOf(owner.address)).to.equal(INITIAL_PVERT_SUPPLY - FUND_AMOUNT);
      expect(await pvertContract.transfersEnabled()).to.equal(false);
    });

    it("Should prevent transfers between users", async function () {
      // First, give user1 some pVERT (owner can send)
      await pvertContract.transfer(user1.address, ethers.parseUnits("100", 18));
      
      // User1 should not be able to send to user2
      await expect(
        pvertContract.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18))
      ).to.be.revertedWith("pVERT: transfers disabled between users");
    });

    it("Should allow owner to distribute rewards", async function () {
      const amount = ethers.parseUnits("1000", 18);
      
      await expect(pvertContract.distributeReward(user1.address, amount))
        .to.emit(pvertContract, "RewardDistributed")
        .withArgs(user1.address, amount);
        
      expect(await pvertContract.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should support batch reward distribution", async function () {
      const recipients = [user1.address, user2.address];
      const amounts = [ethers.parseUnits("500", 18), ethers.parseUnits("300", 18)];
      
      await pvertContract.batchDistributeRewards(recipients, amounts);
      
      expect(await pvertContract.balanceOf(user1.address)).to.equal(amounts[0]);
      expect(await pvertContract.balanceOf(user2.address)).to.equal(amounts[1]);
    });
  });

  describe("NFT Prize System with pVERT", function () {
    beforeEach(async function () {
      // Approve VIRTUAL spending for users
      await virtualToken.connect(user1).approve(nftAddress, ethers.parseUnits("100", 18));
      await virtualToken.connect(user2).approve(nftAddress, ethers.parseUnits("100", 18));
    });

    it("Should use pVERT for prize payouts during VIRTUAL mints", async function () {
      const initialBalance = await pvertContract.balanceOf(user1.address);
      
      // Mint NFT with VIRTUAL (this might win a prize)
      await nftContract.connect(user1).mintWithVirtual("test-uri");
      
      // Check if user received any pVERT (depends on rarity)
      const finalBalance = await pvertContract.balanceOf(user1.address);
      
      // Prize amount depends on rarity roll, but balance should not decrease
      expect(finalBalance).to.be.gte(initialBalance);
    });

    it("Should track prize pool correctly", async function () {
      const initialPrizePool = await nftContract.getPrizePoolBalance();
      expect(initialPrizePool).to.equal(0); // Prize pool starts at 0 for pVERT phase
      
      // Prize pool only grows with VERT mints, not VIRTUAL mints
      await nftContract.connect(user1).mintWithVirtual("test-uri");
      
      const afterVirtualMint = await nftContract.getPrizePoolBalance();
      expect(afterVirtualMint).to.equal(0); // Still 0, no change from VIRTUAL mints
    });

    it("Should handle multiple mints correctly", async function () {
      // Multiple VIRTUAL mints should work fine
      for (let i = 0; i < 5; i++) {
        await nftContract.connect(user1).mintWithVirtual(`test-uri-${i}`);
      }
      
      const totalMinted = await nftContract.getTotalMinted();
      expect(totalMinted).to.equal(5);
    });
  });

  describe("Token Switching (pVERT → Real VERT)", function () {
    it("Should successfully switch from pVERT to real VERT", async function () {
      // Verify initial state
      expect(await nftContract.vertToken()).to.equal(pvertAddress);
      
      // Switch to real VERT
      await expect(nftContract.setVertToken(realVertAddress))
        .to.emit(nftContract, "VertTokenUpdated")
        .withArgs(realVertAddress);
        
      // Verify switch
      expect(await nftContract.vertToken()).to.equal(realVertAddress);
    });

    it("Should work with real VERT after switch", async function () {
      // Switch to real VERT
      await nftContract.setVertToken(realVertAddress);
      
      // Fund user with real VERT and NFT contract
      await realVertToken.transfer(user1.address, ethers.parseUnits("10000", 18));
      await realVertToken.transfer(nftAddress, ethers.parseUnits("50000", 18));
      
      // Approve spending
      await realVertToken.connect(user1).approve(nftAddress, ethers.parseUnits("10000", 18));
      
      // Mint with real VERT should work
      await nftContract.connect(user1).mintWithVert("real-vert-uri");
      
      // Prize pool should grow with real VERT mints
      const prizePool = await nftContract.getPrizePoolBalance();
      expect(prizePool).to.be.gt(0);
    });

    it("Should maintain contract state during token switch", async function () {
      // Mint some NFTs with pVERT
      await nftContract.connect(user1).mintWithVirtual("test-1");
      await nftContract.connect(user2).mintWithVirtual("test-2");
      
      const mintedBefore = await nftContract.getTotalMinted();
      const prizePoolBefore = await nftContract.getPrizePoolBalance();
      
      // Switch tokens
      await nftContract.setVertToken(realVertAddress);
      
      // State should be preserved
      expect(await nftContract.getTotalMinted()).to.equal(mintedBefore);
      expect(await nftContract.getPrizePoolBalance()).to.equal(prizePoolBefore);
      
      // Previous NFTs should still exist
      expect(await nftContract.ownerOf(1)).to.equal(user1.address);
      expect(await nftContract.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("Security and Edge Cases", function () {
    it("Should prevent non-owner from switching tokens", async function () {
      await expect(
        nftContract.connect(user1).setVertToken(realVertAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent setting zero address as VERT token", async function () {
      await expect(
        nftContract.setVertToken(ethers.ZeroAddress)
      ).to.be.revertedWith("VERT token cannot be zero address");
    });

    it("Should handle insufficient pVERT balance gracefully", async function () {
      // Drain the NFT contract's pVERT balance
      const contractBalance = await pvertContract.balanceOf(nftAddress);
      await pvertContract.transfer(owner.address, contractBalance);
      
      // Minting should still work, just no prizes paid out
      await expect(
        nftContract.connect(user1).mintWithVirtual("test-uri")
      ).to.not.be.reverted;
    });

    it("Should track distributed pVERT correctly", async function () {
      const initialDistributed = await pvertContract.getTotalDistributed();
      
      // Distribute some rewards
      await pvertContract.distributeReward(user1.address, ethers.parseUnits("1000", 18));
      
      const finalDistributed = await pvertContract.getTotalDistributed();
      expect(finalDistributed - initialDistributed).to.equal(ethers.parseUnits("1000", 18));
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for pVERT operations", async function () {
      // Test gas cost of minting with pVERT rewards
      const tx = await nftContract.connect(user1).mintWithVirtual("test-uri");
      const receipt = await tx.wait();
      
      // Log gas usage for monitoring
      console.log(`Gas used for VIRTUAL mint with pVERT: ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lt(500000); // Should be under 500k gas
    });

    it("Should handle batch operations efficiently", async function () {
      const recipients = Array(10).fill(0).map((_, i) => user1.address);
      const amounts = Array(10).fill(ethers.parseUnits("100", 18));
      
      const tx = await pvertContract.batchDistributeRewards(recipients, amounts);
      const receipt = await tx.wait();
      
      console.log(`Gas used for batch distribute (10 recipients): ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lt(1000000); // Should be reasonable for batch ops
    });
  });
});

// Note: You'll need to create a MockERC20 contract for testing
// or use an existing ERC20 implementation in your test setup 