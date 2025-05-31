require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking contract VERT token balance...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VERT_TOKEN_ADDRESS = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  
  // Get contract instances
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN_ADDRESS);
  
  // Check prize pool (what the contract thinks it has)
  const prizePool = await nftContract.prizePool();
  console.log("Prize Pool (contract storage):", hre.ethers.formatEther(prizePool), "VERT");
  
  // Check actual VERT balance of the contract
  const actualBalance = await vertToken.balanceOf(NFT_CONTRACT_ADDRESS);
  console.log("Actual VERT Balance:", hre.ethers.formatEther(actualBalance), "VERT");
  
  // Check the difference
  const difference = actualBalance - prizePool;
  console.log("Difference:", hre.ethers.formatEther(difference), "VERT");
  
  if (actualBalance < prizePool) {
    console.log("❌ CRITICAL: Contract doesn't have enough VERT to pay prizes!");
    console.log("   This explains why prizes aren't being paid out.");
  } else if (actualBalance >= prizePool) {
    console.log("✅ Contract has sufficient VERT balance for prizes");
  }
  
  // Calculate what an Epic prize should be
  const epicPercent = await nftContract.prizePercentByRarity(2);
  const epicPrize = (prizePool * epicPercent) / 100n;
  console.log(`\nEpic Prize (${epicPercent}%):`, hre.ethers.formatEther(epicPrize), "VERT");
  
  if (actualBalance < epicPrize) {
    console.log("❌ Not enough balance for even one Epic prize!");
  }
  
  // Check treasury address
  try {
    const treasury = await nftContract.treasury();
    console.log("\nTreasury Address:", treasury);
    
    const treasuryBalance = await vertToken.balanceOf(treasury);
    console.log("Treasury VERT Balance:", hre.ethers.formatEther(treasuryBalance), "VERT");
  } catch (error) {
    console.log("❌ Could not read treasury info");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 