const { ethers } = require('ethers');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://mainnet.base.org';
const CONTRACT_ADDRESS = '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';

// Load ABI
const abiPath = './abis/Vertical.json';
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function checkRecentTokens() {
  console.log("🔍 Checking recent tokens (12-18)...\n");
  
  try {
    // Check the most recent tokens
    for (let tokenId = 12; tokenId <= 18; tokenId++) {
      console.log(`🔍 Token #${tokenId}:`);
      
      try {
        // Check if token exists
        const owner = await contract.ownerOf(tokenId);
        console.log(`  👤 Owner: ${owner}`);
        
        // Get tokenURI from contract
        const tokenURI = await contract.tokenURI(tokenId);
        console.log(`  📄 Contract tokenURI: ${tokenURI}`);
        
        // Get rarity 
        const rarity = await contract.tokenRarity(tokenId);
        const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
        console.log(`  ⭐ Rarity: ${rarityNames[rarity]} (${rarity})`);
        
        // Check if it's a placeholder
        const isPlaceholder = tokenURI.includes('QmPlaceholder') || tokenURI === 'ipfs://QmPlaceholder';
        console.log(`  🏷️  Is Placeholder: ${isPlaceholder ? '❌ YES' : '✅ NO'}`);
        
        if (!isPlaceholder) {
          console.log(`  ✅ Has real metadata URI!`);
        } else {
          console.log(`  ⚠️  Still has placeholder - setTokenURI never called or failed`);
        }
        
        console.log(''); // Empty line between tokens
        
      } catch (error) {
        if (error.message.includes('nonexistent token') || error.message.includes('ERC721: invalid token ID')) {
          console.log(`  ❌ Token ${tokenId} does not exist\n`);
        } else {
          console.log(`  ❌ Error checking token ${tokenId}: ${error.message}\n`);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking recent tokens:", error);
  }
}

// Run the check
checkRecentTokens()
  .then(() => {
    console.log("✅ Recent token check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }); 