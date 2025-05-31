require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🧪 Simulating Epic mint prize calculation...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VERT_TOKEN_ADDRESS = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  
  // Get contract instances
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN_ADDRESS);
  
  console.log("📊 Current State:");
  const currentPrizePool = await nftContract.prizePool();
  console.log("Prize Pool:", hre.ethers.formatEther(currentPrizePool), "VERT");
  
  const contractBalance = await vertToken.balanceOf(NFT_CONTRACT_ADDRESS);
  console.log("Contract VERT Balance:", hre.ethers.formatEther(contractBalance), "VERT");
  
  // Simulate Epic mint (rarity = 2)
  const epicPercent = await nftContract.prizePercentByRarity(2);
  console.log(`\n🎯 Epic Prize Percentage: ${epicPercent}%`);
  
  const epicPrize = (currentPrizePool * epicPercent) / 100n;
  console.log("Epic Prize Amount:", hre.ethers.formatEther(epicPrize), "VERT");
  
  const toUser = (epicPrize * 95n) / 100n;
  const toTreasury = epicPrize - toUser;
  
  console.log("To User (95%):", hre.ethers.formatEther(toUser), "VERT");
  console.log("To Treasury (5%):", hre.ethers.formatEther(toTreasury), "VERT");
  
  // Check if the contract can make these transfers
  console.log("\n🔍 Checking transfer feasibility:");
  
  if (contractBalance >= epicPrize) {
    console.log("✅ Contract has enough VERT for the prize");
  } else {
    console.log("❌ Contract doesn't have enough VERT for the prize");
  }
  
  // Check treasury address
  const treasury = await nftContract.treasury();
  console.log("Treasury Address:", treasury);
  
  // Simulate what happens when VERT is minted
  const vertPrice = await nftContract.priceVert();
  console.log(`\n💰 VERT Mint Price: ${hre.ethers.formatEther(vertPrice)} VERT`);
  
  const toTreasuryFromMint = (vertPrice * 25n) / 100n;
  const toPrizePoolFromMint = vertPrice - toTreasuryFromMint;
  
  console.log("From VERT mint - To Treasury (25%):", hre.ethers.formatEther(toTreasuryFromMint), "VERT");
  console.log("From VERT mint - To Prize Pool (75%):", hre.ethers.formatEther(toPrizePoolFromMint), "VERT");
  
  // Calculate new prize pool after mint
  const newPrizePool = currentPrizePool + toPrizePoolFromMint;
  console.log("New Prize Pool after mint:", hre.ethers.formatEther(newPrizePool), "VERT");
  
  // Calculate Epic prize from NEW pool (this is the bug!)
  const epicPrizeFromNewPool = (newPrizePool * epicPercent) / 100n;
  console.log("Epic Prize from NEW pool:", hre.ethers.formatEther(epicPrizeFromNewPool), "VERT");
  
  console.log("\n🐛 POTENTIAL BUG:");
  console.log("The contract calculates prize from the NEW pool size, but the pool was smaller when the mint started!");
  console.log("This could cause the prize calculation to be higher than expected.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 