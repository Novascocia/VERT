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

async function analyzeWorkingPeriod() {
  console.log("🔍 Analyzing the working period (all tokens)...\n");
  
  try {
    // Get current nextTokenId
    const nextTokenId = await contract.nextTokenId();
    console.log(`📊 Total tokens to check: ${Number(nextTokenId) - 1}\n`);
    
    // Check all tokens that exist
    const tokenResults = [];
    
    for (let tokenId = 1; tokenId < Number(nextTokenId); tokenId++) {
      console.log(`🔍 Checking Token #${tokenId}:`);
      
      try {
        // Check if token exists
        const owner = await contract.ownerOf(tokenId);
        
        // Get tokenURI from contract
        const tokenURI = await contract.tokenURI(tokenId);
        
        // Get rarity 
        const rarity = await contract.tokenRarity(tokenId);
        const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
        
        // Check if it's a placeholder
        const isPlaceholder = tokenURI.includes('QmPlaceholder') || tokenURI === 'ipfs://QmPlaceholder';
        
        const result = {
          tokenId,
          owner,
          tokenURI,
          rarity: rarityNames[rarity],
          isPlaceholder,
          exists: true
        };
        
        tokenResults.push(result);
        
        console.log(`  👤 Owner: ${owner}`);
        console.log(`  📄 URI: ${tokenURI}`);
        console.log(`  ⭐ Rarity: ${rarityNames[rarity]}`);
        console.log(`  🏷️  Placeholder: ${isPlaceholder ? '❌ YES' : '✅ NO'}`);
        console.log('');
        
      } catch (error) {
        if (error.message.includes('nonexistent token') || error.message.includes('ERC721: invalid token ID')) {
          console.log(`  ❌ Token ${tokenId} does not exist\n`);
          tokenResults.push({
            tokenId,
            exists: false,
            error: 'Token does not exist'
          });
        } else {
          console.log(`  ❌ Error: ${error.message}\n`);
          tokenResults.push({
            tokenId,
            exists: false,
            error: error.message
          });
        }
      }
    }
    
    // Summary analysis
    console.log("\n📊 SUMMARY ANALYSIS:");
    console.log("=" * 50);
    
    const existingTokens = tokenResults.filter(t => t.exists);
    const realURITokens = existingTokens.filter(t => !t.isPlaceholder);
    const placeholderTokens = existingTokens.filter(t => t.isPlaceholder);
    
    console.log(`Total existing tokens: ${existingTokens.length}`);
    console.log(`Tokens with REAL URIs: ${realURITokens.length}`);
    console.log(`Tokens with PLACEHOLDER URIs: ${placeholderTokens.length}`);
    
    if (realURITokens.length > 0) {
      console.log(`\n✅ WORKING TOKENS (Real URIs):`);
      realURITokens.forEach(t => {
        console.log(`  Token #${t.tokenId}: ${t.rarity} - ${t.tokenURI.substring(0, 50)}...`);
      });
    }
    
    if (placeholderTokens.length > 0) {
      console.log(`\n❌ BROKEN TOKENS (Placeholder URIs):`);
      placeholderTokens.forEach(t => {
        console.log(`  Token #${t.tokenId}: ${t.rarity} - ${t.tokenURI}`);
      });
    }
    
    // Try to get NFTMinted events for comparison
    console.log("\n🔍 Attempting to get NFTMinted events...");
    
    try {
      // Try with a smaller block range first
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000); // Last 50k blocks instead of 100k
      
      console.log(`📦 Checking blocks ${fromBlock} to ${currentBlock}...`);
      
      const filter = contract.filters.NFTMinted();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);
      
      console.log(`📊 Found ${events.length} NFTMinted events:`);
      
      events.forEach((event, index) => {
        console.log(`\n📅 Event #${index + 1}:`);
        console.log(`  🆔 Token ID: ${event.args.tokenId}`);
        console.log(`  📄 URI at mint: ${event.args.uri}`);
        console.log(`  🏷️  Was placeholder at mint: ${event.args.uri.includes('QmPlaceholder') ? '❌ YES' : '✅ NO'}`);
        console.log(`  📦 Block: ${event.blockNumber}`);
        console.log(`  🔗 Tx: ${event.transactionHash}`);
        
        // Compare with current tokenURI
        const currentToken = tokenResults.find(t => t.tokenId === Number(event.args.tokenId));
        if (currentToken && currentToken.exists) {
          const uriChanged = event.args.uri !== currentToken.tokenURI;
          console.log(`  🔄 URI changed since mint: ${uriChanged ? '✅ YES' : '❌ NO'}`);
          if (uriChanged) {
            console.log(`  📄 Current URI: ${currentToken.tokenURI}`);
          }
        }
      });
      
    } catch (eventError) {
      console.log(`❌ Error fetching events: ${eventError.message}`);
      
      // If that fails, try an even smaller range
      try {
        console.log("\n🔍 Trying smaller block range (last 10k blocks)...");
        const smallerFromBlock = Math.max(0, currentBlock - 10000);
        const smallerEvents = await contract.queryFilter(filter, smallerFromBlock, currentBlock);
        
        console.log(`📊 Found ${smallerEvents.length} NFTMinted events in smaller range:`);
        smallerEvents.forEach((event, index) => {
          console.log(`📅 Event #${index + 1}: Token ${event.args.tokenId} - ${event.args.uri}`);
        });
        
      } catch (smallerError) {
        console.log(`❌ Even smaller range failed: ${smallerError.message}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error in analysis:", error);
  }
}

// Run the analysis
analyzeWorkingPeriod()
  .then(() => {
    console.log("\n✅ Analysis completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  }); 