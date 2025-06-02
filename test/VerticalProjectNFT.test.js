const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerticalProjectNFT", function () {
  let nft;
  let vertToken;
  let virtualToken;
  let owner;
  let user;
  let treasury;
  let deployer;

  const PRICE_VIRTUAL = ethers.parseEther("2.5");
  const PRICE_VERT = ethers.parseEther("1.5");

  beforeEach(async function () {
    [deployer, owner, user, treasury] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("MockERC20");
    vertToken = await MockToken.deploy("VERT Token", "VERT");
    virtualToken = await MockToken.deploy("VIRTUAL Token", "VIRTUAL");

    // Deploy NFT contract
    const VerticalProjectNFT = await ethers.getContractFactory("VerticalProjectNFT");
    nft = await VerticalProjectNFT.deploy(
      await virtualToken.getAddress(),
      await vertToken.getAddress(),
      treasury.address
    );

    // Mint some tokens to user for testing
    await vertToken.mint(user.address, ethers.parseEther("1000"));
    await virtualToken.mint(user.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(deployer.address);
    });

    it("Should set the correct token addresses", async function () {
      expect(await nft.vertToken()).to.equal(await vertToken.getAddress());
      expect(await nft.virtualToken()).to.equal(await virtualToken.getAddress());
    });

    it("Should set the correct treasury address", async function () {
      expect(await nft.treasury()).to.equal(treasury.address);
    });

    it("Should set the correct prices", async function () {
      expect(await nft.priceVirtual()).to.equal(PRICE_VIRTUAL);
      expect(await nft.priceVert()).to.equal(PRICE_VERT);
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await vertToken.connect(user).approve(await nft.getAddress(), PRICE_VERT);
      await virtualToken.connect(user).approve(await nft.getAddress(), PRICE_VIRTUAL);
    });

    it("Should mint with VIRTUAL token", async function () {
      const initialBalance = await virtualToken.balanceOf(treasury.address);
      await nft.connect(user).mintWithVirtual("ipfs://test");
      expect(await virtualToken.balanceOf(treasury.address)).to.equal(initialBalance + PRICE_VIRTUAL);
    });

    it("Should mint with VERT token", async function () {
      const initialBalance = await vertToken.balanceOf(treasury.address);
      await nft.connect(user).mintWithVert("ipfs://test");
      expect(await vertToken.balanceOf(treasury.address)).to.equal(initialBalance + (PRICE_VERT * 25n) / 100n);
    });

    it("Should fail minting with insufficient balance", async function () {
      await expect(nft.connect(user).mintWithVert("ipfs://test")).to.be.revertedWith("VERT payment failed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set prices", async function () {
      const newVirtualPrice = ethers.parseEther("3.0");
      const newVertPrice = ethers.parseEther("2.0");
      await nft.setPrices(newVirtualPrice, newVertPrice);
      expect(await nft.priceVirtual()).to.equal(newVirtualPrice);
      expect(await nft.priceVert()).to.equal(newVertPrice);
    });

    it("Should allow owner to set treasury", async function () {
      const newTreasury = user.address;
      await nft.setTreasury(newTreasury);
      expect(await nft.treasury()).to.equal(newTreasury);
    });

    it("Should allow owner to set prize percentages", async function () {
      await nft.setPrizePercent(1, 5); // Set Rare to 5%
      expect(await nft.prizePercentByRarity(1)).to.equal(5);
    });

    it("Should allow owner to pause/unpause", async function () {
      await nft.pause();
      await expect(nft.connect(user).mintWithVirtual("ipfs://test")).to.be.revertedWith("Pausable: paused");
      await nft.unpause();
      await nft.connect(user).mintWithVirtual("ipfs://test");
    });
  });

  describe("Token Management", function () {
    it("Should allow owner to set VERT token", async function () {
      const newVertToken = await (await ethers.getContractFactory("MockERC20")).deploy("New VERT", "NVERT");
      await nft.setVertToken(await newVertToken.getAddress());
      expect(await nft.vertToken()).to.equal(await newVertToken.getAddress());
    });

    it("Should allow owner to set VIRTUAL token", async function () {
      const newVirtualToken = await (await ethers.getContractFactory("MockERC20")).deploy("New VIRTUAL", "NVIRT");
      await nft.setVirtualToken(await newVirtualToken.getAddress());
      expect(await nft.virtualToken()).to.equal(await newVirtualToken.getAddress());
    });
  });

  describe("Prize Pool", function () {
    it("Should update prize pool on VERT mint", async function () {
      const initialPool = await nft.getPrizePoolBalance();
      await nft.connect(user).mintWithVert("ipfs://test");
      expect(await nft.getPrizePoolBalance()).to.be.gt(initialPool);
    });

    it("Should allow owner to claim prize", async function () {
      await nft.connect(user).mintWithVert("ipfs://test");
      const poolBalance = await nft.getPrizePoolBalance();
      await nft.claimPrize(owner.address, poolBalance);
      expect(await nft.getPrizePoolBalance()).to.equal(0);
    });
  });

  describe("Royalties", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1.0");
      const [receiver, amount] = await nft.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(treasury.address);
      expect(amount).to.equal((salePrice * 500n) / 10000n); // 5%
    });
  });
}); 