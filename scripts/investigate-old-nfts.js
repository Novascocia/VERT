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

async function investigateOldNFTs() {
  console.log("🔍 Investigating old NFT metadata...\n");
  
  try {
    // Get current nextTokenId to know what tokens exist
    const nextTokenId = await contract.nextTokenId();
    console.log(`📊 Next token ID: ${nextTokenId}`);
    console.log(`📊 Total minted tokens: ${nextTokenId - 1n}\n`);
    
    // Check tokens 1-10 (or up to nextTokenId if less)
    const maxTokensToCheck = Math.min(10, Number(nextTokenId) - 1);
    
    for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
      console.log(`🔍 Checking Token #${tokenId}:`);
      
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
          
          // Try to fetch the metadata
          try {
            const metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            console.log(`  🌐 Trying to fetch: ${metadataUrl}`);
            
            const response = await fetch(metadataUrl);
            if (response.ok) {
              const metadata = await response.json();
              console.log(`  📝 Metadata name: ${metadata.name}`);
              console.log(`  🖼️  Image URI: ${metadata.image}`);
            } else {
              console.log(`  ❌ Failed to fetch metadata: ${response.status}`);
            }
          } catch (fetchError) {
            console.log(`  ❌ Error fetching metadata: ${fetchError.message}`);
          }
        }
        
        console.log(''); // Empty line between tokens
        
      } catch (error) {
        if (error.message.includes('nonexistent token')) {
          console.log(`  ❌ Token ${tokenId} does not exist`);
        } else {
          console.log(`  ❌ Error checking token ${tokenId}: ${error.message}`);
        }
        console.log('');
      }
    }
    
    // Also check for NFTMinted events for the first few tokens
    console.log("\n🔍 Checking NFTMinted events...\n");
    
    try {
      // Get NFTMinted events from recent blocks
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100000); // Last ~100k blocks
      
      const filter = contract.filters.NFTMinted();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);
      
      console.log(`📊 Found ${events.length} NFTMinted events in last 100k blocks:`);
      
      events.slice(0, 5).forEach((event, index) => {
        console.log(`\n📅 Event #${index + 1}:`);
        console.log(`  🆔 Token ID: ${event.args.tokenId}`);
        console.log(`  👤 User: ${event.args.user}`);
        console.log(`  ⭐ Rarity: ${event.args.rarity}`);
        console.log(`  📄 URI in event: ${event.args.uri}`);
        console.log(`  🏷️  URI is placeholder: ${event.args.uri.includes('QmPlaceholder') ? '❌ YES' : '✅ NO'}`);
        console.log(`  📦 Block: ${event.blockNumber}`);
        console.log(`  🔗 Tx: ${event.transactionHash}`);
      });
      
    } catch (eventError) {
      console.log(`❌ Error fetching events: ${eventError.message}`);
    }
    
  } catch (error) {
    console.error("❌ Error investigating NFTs:", error);
  }
}

// Run the investigation
investigateOldNFTs()
  .then(() => {
    console.log("\n✅ Investigation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Investigation failed:", error);
    process.exit(1);
  }); 