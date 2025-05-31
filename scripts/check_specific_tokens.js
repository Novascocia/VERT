require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking specific recent tokens...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get contract instance
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  
  // Check total minted
  const totalMinted = await nftContract.getTotalMinted();
  console.log("Total Minted:", totalMinted.toString());
  
  // Check last 20 tokens
  const startToken = Math.max(1, Number(totalMinted) - 19);
  const endToken = Number(totalMinted);
  
  console.log(`\n🎨 Checking tokens ${startToken} to ${endToken}:`);
  
  const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
  let rarityCount = { Common: 0, Rare: 0, Epic: 0, Legendary: 0, Mythical: 0 };
  
  for (let tokenId = startToken; tokenId <= endToken; tokenId++) {
    try {
      const rarity = await nftContract.tokenRarity(tokenId);
      const rarityName = rarityNames[rarity];
      rarityCount[rarityName]++;
      console.log(`Token ${tokenId}: ${rarityName}`);
    } catch (error) {
      console.log(`Token ${tokenId}: Error reading rarity`);
    }
  }
  
  console.log("\n📊 Rarity Distribution (last 20 tokens):");
  for (const [rarity, count] of Object.entries(rarityCount)) {
    console.log(`${rarity}: ${count} (${((count/20)*100).toFixed(1)}%)`);
  }
  
  // Check for any prize claims in a wider range
  console.log("\n💰 Checking for prize claims in last 2000 blocks...");
  try {
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    
    // Check in chunks of 500 blocks
    for (let i = 0; i < 4; i++) {
      const fromBlock = currentBlock - (500 * (i + 1));
      const toBlock = currentBlock - (500 * i);
      
      try {
        const prizeFilter = nftContract.filters.PrizeClaimed();
        const prizeEvents = await nftContract.queryFilter(prizeFilter, fromBlock, toBlock);
        
        if (prizeEvents.length > 0) {
          console.log(`Found ${prizeEvents.length} prize claims in blocks ${fromBlock}-${toBlock}:`);
          for (const event of prizeEvents) {
            const { user, amount } = event.args;
            console.log(`  Prize: ${hre.ethers.formatEther(amount)} VERT to ${user.slice(0,8)}...`);
          }
        }
      } catch (error) {
        // Skip this range if it fails
      }
    }
  } catch (error) {
    console.log("❌ Error checking prize claims:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 