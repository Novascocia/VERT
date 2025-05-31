require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking recent mint events and prize claims...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get contract instance
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  
  console.log("\n📊 Current Contract State:");
  
  try {
    // Check total minted
    const totalMinted = await nftContract.getTotalMinted();
    console.log("Total Minted:", totalMinted.toString());
    
    // Check prize pool balance
    try {
      const prizePool = await nftContract.getPrizePoolBalance();
      console.log("Prize Pool Balance:", hre.ethers.formatEther(prizePool), "VERT");
    } catch (error) {
      console.log("❌ Could not read prize pool balance:", error.message);
      // Try reading the prizePool storage directly
      try {
        const prizePool = await nftContract.prizePool();
        console.log("Prize Pool (direct):", hre.ethers.formatEther(prizePool), "VERT");
      } catch (e) {
        console.log("❌ Could not read prizePool storage either");
      }
    }
    
    // Check prize percentages
    console.log("\n🎯 Prize Percentages:");
    const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
    for (let i = 0; i < 5; i++) {
      const percent = await nftContract.prizePercentByRarity(i);
      console.log(`${rarities[i]}: ${percent}%`);
    }
    
  } catch (error) {
    console.error("❌ Error reading contract state:", error.message);
  }
  
  console.log("\n🔍 Checking recent events...");
  
  try {
    // Get recent blocks (last 100 blocks due to RPC limits)
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = Math.max(currentBlock - 100, 0);
    
    console.log(`Searching from block ${fromBlock} to ${currentBlock}`);
    
    // Get NFTMinted events
    const mintFilter = nftContract.filters.NFTMinted();
    const mintEvents = await nftContract.queryFilter(mintFilter, fromBlock);
    
    console.log(`\n🎨 Found ${mintEvents.length} recent mints:`);
    
    for (const event of mintEvents.slice(-10)) { // Show last 10 mints
      const { user, tokenId, rarity, uri } = event.args;
      const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
      console.log(`Token ${tokenId}: ${rarityNames[rarity]} (User: ${user.slice(0,8)}...)`);
    }
    
    // Get PrizeClaimed events
    const prizeFilter = nftContract.filters.PrizeClaimed();
    const prizeEvents = await nftContract.queryFilter(prizeFilter, fromBlock);
    
    console.log(`\n💰 Found ${prizeEvents.length} recent prize claims:`);
    
    for (const event of prizeEvents) {
      const { user, amount } = event.args;
      console.log(`Prize: ${hre.ethers.formatEther(amount)} VERT to ${user.slice(0,8)}...`);
    }
    
    // Get PrizePoolUpdated events
    const poolFilter = nftContract.filters.PrizePoolUpdated();
    const poolEvents = await nftContract.queryFilter(poolFilter, fromBlock);
    
    console.log(`\n📈 Found ${poolEvents.length} prize pool updates:`);
    
    for (const event of poolEvents.slice(-5)) { // Show last 5 updates
      const { newTotal } = event.args;
      console.log(`Pool updated to: ${hre.ethers.formatEther(newTotal)} VERT`);
    }
    
  } catch (error) {
    console.error("❌ Error reading events:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 