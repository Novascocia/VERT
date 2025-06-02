const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Contract ABI (minimal for setTokenURI)
const CONTRACT_ABI = [
  "function setTokenURI(uint256 tokenId, string memory _tokenURI) external",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Using existing PRIVATE_KEY from .env
const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_KEY ? 
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}` : 
  'https://mainnet.base.org';

async function fixFailedNFT(tokenId, forceRegenerate = false) {
  try {
    console.log(`🔄 ${forceRegenerate ? 'Force regenerating' : 'Fixing'} NFT #${tokenId}...`);
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    // Check current token URI
    const currentURI = await contract.tokenURI(tokenId);
    console.log(`📋 Current URI: ${currentURI}`);
    
    if (!forceRegenerate && currentURI !== 'ipfs://QmPlaceholder') {
      console.log(`✅ Token #${tokenId} already has proper metadata`);
      return;
    }
    
    // Check if token exists
    try {
      const owner = await contract.ownerOf(tokenId);
      console.log(`👤 Token owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Token #${tokenId} does not exist`);
      return;
    }
    
    // Call our API to generate NFT
    console.log(`🎨 ${forceRegenerate ? 'Regenerating' : 'Generating'} NFT for token #${tokenId}...`);
    const response = await axios.post(`https://vertnft.com/api/generateAndStoreNFT`, {
      tokenId: tokenId.toString()
    }, {
      timeout: 300000 // 5 minutes
    });
    
    if (!response.data.metadata) {
      throw new Error('No metadata URL returned from API');
    }
    
    const newURI = response.data.metadata;
    console.log(`📝 Generated metadata URI: ${newURI}`);
    
    // Only update if URI is different or force regenerate
    if (forceRegenerate || currentURI !== newURI) {
      // Update token URI on-chain
      console.log(`📤 Updating token URI on-chain...`);
      const tx = await contract.setTokenURI(tokenId, newURI);
      console.log(`🔗 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Token #${tokenId} metadata updated successfully!`);
      console.log(`📊 Gas used: ${receipt.gasUsed.toString()}`);
      
      return {
        tokenId,
        oldURI: currentURI,
        newURI,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } else {
      console.log(`⚠️ New URI same as current URI, skipping blockchain update`);
      return { tokenId, newURI, status: 'same_uri' };
    }
    
  } catch (error) {
    console.error(`❌ Failed to fix token #${tokenId}:`, error.message);
    throw error;
  }
}

async function fixMultipleTokens(tokenIds, forceRegenerate = false) {
  console.log(`🚀 Starting ${forceRegenerate ? 'bulk NFT regeneration' : 'bulk NFT fix'} for tokens: ${tokenIds.join(', ')}`);
  
  const results = [];
  
  for (const tokenId of tokenIds) {
    try {
      const result = await fixFailedNFT(tokenId, forceRegenerate);
      if (result) {
        results.push(result);
      }
      
      // Wait 5 seconds between transactions to avoid nonce issues
      if (tokenId !== tokenIds[tokenIds.length - 1]) {
        console.log('⏳ Waiting 5 seconds before next transaction...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`💥 Error with token #${tokenId}:`, error.message);
      results.push({ tokenId, error: error.message });
    }
  }
  
  console.log('📊 Final Results:');
  console.table(results);
  
  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force') || args.includes('-f');
  const tokensToFix = args.filter(arg => !arg.startsWith('-')).map(id => parseInt(id));
  
  if (tokensToFix.length === 0) {
    console.log('Usage: node fix-failed-nfts.js [--force|-f] <tokenId1> <tokenId2> ...');
    console.log('Examples:');
    console.log('  node fix-failed-nfts.js 3 4           # Fix only broken NFTs');
    console.log('  node fix-failed-nfts.js --force 3     # Force regenerate NFT #3');
    console.log('  node fix-failed-nfts.js -f 1 2 3      # Force regenerate multiple NFTs');
    process.exit(1);
  }
  
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable is required');
    process.exit(1);
  }
  
  console.log('🔧 Vertical NFT Fixer Tool');
  console.log('==========================');
  if (forceRegenerate) {
    console.log('🔄 FORCE MODE: Will regenerate images even if metadata exists');
  }
  
  await fixMultipleTokens(tokensToFix, forceRegenerate);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixFailedNFT, fixMultipleTokens }; 