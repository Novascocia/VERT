const hre = require("hardhat");

async function main() {
  console.log("💰 Funding NFT Contract with pVERT for Prize Payouts...\n");

  // Contract addresses - Base mainnet
  const PVERT_ADDRESS = "0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA"; // Deployed pVERT contract
  const NFT_CONTRACT = "0x414280a38d52eB30768275Eb95D16714c69d216A"; // NEW Fixed NFT contract
  
  // Amount to fund (50 million pVERT for early rewards)
  const FUND_AMOUNT = hre.ethers.parseUnits("50000000", 18); // 50M pVERT

  if (!PVERT_ADDRESS || !NFT_CONTRACT) {
    console.log("❌ Please set PVERT_ADDRESS and NFT_CONTRACT addresses in the script");
    return;
  }

  // Get signer (should be team wallet that owns the pVERT)
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Get contract instances
  const pvert = await hre.ethers.getContractAt("pVERT", PVERT_ADDRESS);
  const nft = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);

  // Check current states
  console.log("📊 Current State:");
  const pvertBalance = await pvert.balanceOf(signer.address);
  const currentVertToken = await nft.vertToken();
  
  console.log(`Your pVERT Balance: ${hre.ethers.formatEther(pvertBalance)} pVERT`);
  console.log(`Current VERT token in NFT contract: ${currentVertToken}`);
  console.log(`Amount to fund: ${hre.ethers.formatEther(FUND_AMOUNT)} pVERT\n`);

  // Verify you have enough pVERT
  if (pvertBalance < FUND_AMOUNT) {
    console.log("❌ Insufficient pVERT balance for funding");
    return;
  }

  // Step 1: Set pVERT as the VERT token in NFT contract
  console.log("1️⃣ Setting pVERT as VERT token in NFT contract...");
  const setTokenTx = await nft.setVertToken(PVERT_ADDRESS);
  await setTokenTx.wait();
  console.log("✅ pVERT set as VERT token in NFT contract");

  // Step 2: Transfer pVERT to NFT contract for prize payouts
  console.log("2️⃣ Transferring pVERT to NFT contract...");
  const transferTx = await pvert.transfer(NFT_CONTRACT, FUND_AMOUNT);
  await transferTx.wait();
  console.log("✅ pVERT transferred to NFT contract");

  // Step 3: Verify the setup
  console.log("3️⃣ Verifying setup...");
  const newVertToken = await nft.vertToken();
  const nftPvertBalance = await pvert.balanceOf(NFT_CONTRACT);
  
  console.log(`\n📊 Final State:`);
  console.log(`NFT Contract VERT token: ${newVertToken}`);
  console.log(`NFT Contract pVERT balance: ${hre.ethers.formatEther(nftPvertBalance)} pVERT`);
  console.log(`Remaining team pVERT: ${hre.ethers.formatEther(await pvert.balanceOf(signer.address))} pVERT`);

  console.log("\n✅ pVERT Prize Funding Complete!");
  console.log("\n📋 What happens now:");
  console.log("- NFT mints with VIRTUAL will now pay prizes in pVERT");
  console.log("- Prize payouts are automatic when rare+ NFTs are minted");
  console.log("- Users earn pVERT that they can later claim for real VERT");
  console.log("\n🔄 When real VERT launches:");
  console.log("- Call setVertToken(REAL_VERT_ADDRESS) to switch to real VERT");
  console.log("- Deploy claim contract for pVERT → VERT redemption");
}

// Script can be run directly or imported
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main }; 