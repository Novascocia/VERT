const hre = require("hardhat");

async function main() {
  console.log("💰 Adding 1,262,070 pVERT tokens to Prize Pool...\n");

  // Contract addresses - Base mainnet
  const NFT_CONTRACT_ADDRESS = "0x46aA53a47fB31E6A2FC80F405A94b3732BC05039"; // NFT contract with addToPrizePool function
  const PVERT_TOKEN_ADDRESS = "0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA"; // pVERT token contract
  
  // Amount to add: 1,262,070 pVERT tokens (18 decimals)
  const AMOUNT_TO_ADD = hre.ethers.parseUnits("1262070", 18);

  console.log(`📊 Configuration:`);
  console.log(`NFT Contract: ${NFT_CONTRACT_ADDRESS}`);
  console.log(`pVERT Token: ${PVERT_TOKEN_ADDRESS}`);
  console.log(`Amount to add: ${hre.ethers.formatEther(AMOUNT_TO_ADD)} pVERT\n`);

  // Get signer (should be the owner of the NFT contract)
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  try {
    // Get contract instances
    const nftContract = await hre.ethers.getContractAt(
      "contracts/VerticalProjectNFT_WithManualSync_Fixed.sol:VerticalProjectNFT_WithManualSync_Fixed",
      NFT_CONTRACT_ADDRESS
    );
    const pvertToken = await hre.ethers.getContractAt("pVERT", PVERT_TOKEN_ADDRESS);

    // Check current state
    console.log("\n📈 Current State:");
    const currentPrizePool = await nftContract.getPrizePoolBalance();
    const signerPVertBalance = await pvertToken.balanceOf(signer.address);
    const currentVertToken = await nftContract.vertToken();
    const contractOwner = await nftContract.owner();
    
    console.log(`Current Prize Pool: ${hre.ethers.formatEther(currentPrizePool)} tokens`);
    console.log(`Your pVERT Balance: ${hre.ethers.formatEther(signerPVertBalance)} pVERT`);
    console.log(`Current VERT token in contract: ${currentVertToken}`);
    console.log(`Contract Owner: ${contractOwner}`);
    console.log(`Your Address: ${signer.address}`);
    
    // Verify ownership
    if (contractOwner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("❌ Error: You are not the owner of the NFT contract!");
      console.log("Only the owner can call addToPrizePool function.");
      return;
    }

    // Verify sufficient pVERT balance
    if (signerPVertBalance < AMOUNT_TO_ADD) {
      console.log("❌ Error: Insufficient pVERT balance!");
      console.log(`Required: ${hre.ethers.formatEther(AMOUNT_TO_ADD)} pVERT`);
      console.log(`Available: ${hre.ethers.formatEther(signerPVertBalance)} pVERT`);
      return;
    }

    // Check if pVERT is the current VERT token in the contract
    if (currentVertToken.toLowerCase() !== PVERT_TOKEN_ADDRESS.toLowerCase()) {
      console.log(`\n⚠️  Warning: Current VERT token in contract (${currentVertToken}) is not pVERT (${PVERT_TOKEN_ADDRESS})`);
      console.log("This might be intended if you're using real VERT instead of pVERT.");
      console.log("Proceeding with the current VERT token...\n");
    }

    // Step 1: Approve pVERT spending by NFT contract
    console.log("1️⃣ Approving pVERT spending by NFT contract...");
    const approveTx = await pvertToken.approve(NFT_CONTRACT_ADDRESS, AMOUNT_TO_ADD);
    console.log(`Transaction hash: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("✅ pVERT spending approved");

    // Step 2: Add tokens to prize pool
    console.log("\n2️⃣ Adding pVERT tokens to prize pool...");
    const addTx = await nftContract.addToPrizePool(AMOUNT_TO_ADD);
    console.log(`Transaction hash: ${addTx.hash}`);
    await addTx.wait();
    console.log("✅ Tokens added to prize pool successfully!");

    // Step 3: Verify the addition
    console.log("\n📊 Final State:");
    const finalPrizePool = await nftContract.getPrizePoolBalance();
    const finalPVertBalance = await pvertToken.balanceOf(signer.address);
    
    console.log(`Final Prize Pool: ${hre.ethers.formatEther(finalPrizePool)} tokens`);
    console.log(`Your Final pVERT Balance: ${hre.ethers.formatEther(finalPVertBalance)} pVERT`);
    console.log(`Prize Pool Increase: ${hre.ethers.formatEther(finalPrizePool - currentPrizePool)} tokens`);

    console.log("\n🎉 Prize pool funding completed successfully!");
    console.log(`Added ${hre.ethers.formatEther(AMOUNT_TO_ADD)} pVERT tokens to the prize pool.`);

  } catch (error) {
    console.error("❌ Error during execution:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 