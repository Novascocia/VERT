const { ethers } = require('ethers');
const contractABI = require('../abis/Vertical.json');
require('dotenv').config({ path: '.env.local' });

async function fixTokenURI() {
  try {
    console.log('🔧 Starting tokenURI fix for mainnet...');
    
    // Check environment variables
    const requiredVars = {
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
      RPC_URL: process.env.RPC_URL,
      PRIVATE_KEY: process.env.PRIVATE_KEY
    };
    
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
      }
    }
    
    console.log('✅ Environment variables loaded');
    console.log('📝 Contract Address:', process.env.CONTRACT_ADDRESS);
    console.log('🌐 RPC URL:', process.env.RPC_URL);
    
    // Connect to mainnet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, signer);
    
    console.log('🔗 Connected to contract, signer address:', await signer.getAddress());
    
    // Check if token 1 exists
    try {
      const owner = await contract.ownerOf(1);
      console.log('👤 Token #1 owner:', owner);
      
      const currentURI = await contract.tokenURI(1);
      console.log('📄 Current tokenURI:', currentURI);
      
      if (currentURI === 'ipfs://QmPlaceholder') {
        console.log('🚨 Token #1 needs URI update!');
        
        // Re-trigger the backend API to generate proper metadata
        console.log('🔄 Re-triggering backend API...');
        
        const response = await fetch('http://localhost:3000/api/generateAndStoreNFT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenId: 1 }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend API successful:', data);
          console.log('🎨 New image URI:', data.image);
          console.log('📄 New metadata URI:', data.metadata);
          
          // The backend should have already updated the contract
          // Let's verify
          const newURI = await contract.tokenURI(1);
          console.log('📄 Updated tokenURI:', newURI);
          
        } else {
          const error = await response.text();
          console.error('❌ Backend API failed:', error);
        }
        
      } else {
        console.log('✅ Token #1 already has proper URI');
      }
      
    } catch (error) {
      console.error('❌ Error checking token #1:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
fixTokenURI(); 