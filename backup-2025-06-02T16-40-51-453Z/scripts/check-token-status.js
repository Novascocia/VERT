const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI (minimal for tokenURI)
const CONTRACT_ABI = [
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';
const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_KEY ? 
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}` : 
  'https://mainnet.base.org';

async function checkTokenStatus(tokenId) {
  try {
    console.log(`🔍 Checking Token #${tokenId} Status`);
    console.log('================================');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Get current token URI
    const currentURI = await contract.tokenURI(tokenId);
    console.log(`📋 Current On-Chain URI: ${currentURI}`);
    
    // Get owner
    const owner = await contract.ownerOf(tokenId);
    console.log(`👤 Token Owner: ${owner}`);
    
    // If it's an IPFS URI, let's try to fetch the metadata
    if (currentURI.startsWith('ipfs://')) {
      const ipfsHash = currentURI.replace('ipfs://', '');
      const httpUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      console.log(`🌐 HTTP URL: ${httpUrl}`);
      
      try {
        const response = await fetch(httpUrl);
        const metadata = await response.json();
        console.log(`📝 Metadata:`, JSON.stringify(metadata, null, 2));
        
        if (metadata.image) {
          const imageHash = metadata.image.replace('ipfs://', '');
          const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
          console.log(`🖼️  Image URL: ${imageUrl}`);
        }
      } catch (error) {
        console.log(`❌ Failed to fetch metadata: ${error.message}`);
      }
    }
    
    return {
      tokenId,
      uri: currentURI,
      owner
    };
    
  } catch (error) {
    console.error(`❌ Failed to check token #${tokenId}:`, error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const tokenIds = process.argv.slice(2).map(id => parseInt(id));
  
  if (tokenIds.length === 0) {
    console.log('Usage: node check-token-status.js <tokenId1> <tokenId2> ...');
    console.log('Example: node check-token-status.js 3 4 5');
    process.exit(1);
  }
  
  console.log('🔍 Token Status Checker');
  console.log('=======================\n');
  
  for (const tokenId of tokenIds) {
    await checkTokenStatus(tokenId);
    console.log('\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkTokenStatus }; 