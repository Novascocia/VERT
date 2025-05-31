require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Investigating Token 70 (Epic rarity)...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get contract instance
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  
  // Check token 70 details
  const rarity = await nftContract.tokenRarity(70);
  const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
  console.log(`Token 70 Rarity: ${rarityNames[rarity]} (${rarity})`);
  
  // Check current prize pool
  const currentPrizePool = await nftContract.prizePool();
  console.log(`Current Prize Pool: ${hre.ethers.formatEther(currentPrizePool)} VERT`);
  
  // Check Epic prize percentage
  const epicPercent = await nftContract.prizePercentByRarity(2); // Epic = 2
  console.log(`Epic Prize Percentage: ${epicPercent}%`);
  
  // Calculate what the prize should have been
  const expectedPrize = (currentPrizePool * epicPercent) / 100n;
  console.log(`Expected Prize for Epic: ${hre.ethers.formatEther(expectedPrize)} VERT`);
  
  // Check the owner of token 70
  try {
    const owner = await nftContract.ownerOf(70);
    console.log(`Token 70 Owner: ${owner}`);
  } catch (error) {
    console.log("❌ Could not get owner of token 70");
  }
  
  // Look for the mint transaction of token 70
  console.log("\n🔍 Looking for Token 70 mint transaction...");
  
  try {
    // Search in larger chunks for the mint event
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    
    for (let i = 0; i < 10; i++) {
      const fromBlock = currentBlock - (500 * (i + 1));
      const toBlock = currentBlock - (500 * i);
      
      try {
        const mintFilter = nftContract.filters.NFTMinted(null, 70); // Filter for token 70
        const mintEvents = await nftContract.queryFilter(mintFilter, fromBlock, toBlock);
        
        if (mintEvents.length > 0) {
          console.log(`Found Token 70 mint in blocks ${fromBlock}-${toBlock}:`);
          const event = mintEvents[0];
          const { user, tokenId, rarity, uri } = event.args;
          console.log(`  Minted by: ${user}`);
          console.log(`  Token ID: ${tokenId}`);
          console.log(`  Rarity: ${rarityNames[rarity]}`);
          console.log(`  Block: ${event.blockNumber}`);
          console.log(`  Tx Hash: ${event.transactionHash}`);
          
          // Check if there was a prize claim in the same transaction
          const prizeFilter = nftContract.filters.PrizeClaimed();
          const prizeEvents = await nftContract.queryFilter(prizeFilter, event.blockNumber, event.blockNumber);
          
          console.log(`\n💰 Prize claims in block ${event.blockNumber}: ${prizeEvents.length}`);
          for (const prizeEvent of prizeEvents) {
            const { user: prizeUser, amount } = prizeEvent.args;
            console.log(`  Prize: ${hre.ethers.formatEther(amount)} VERT to ${prizeUser}`);
          }
          
          break;
        }
      } catch (error) {
        // Skip this range if it fails
      }
    }
  } catch (error) {
    console.log("❌ Error searching for mint event:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 