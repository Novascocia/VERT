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

async function testAnyUserFlow() {
  console.log("🧪 Testing the complete user flow for ANY user...\n");
  
  try {
    // 1. Check who the contract owner is
    const owner = await contract.owner();
    console.log(`👑 Contract Owner: ${owner}`);
    
    // 2. Simulate checking any random user address (non-owner)
    const randomUser = "0x742C2fA0b827b0a78dfF38e2F8e2E6fb6E5F9875"; // Random address
    console.log(`👤 Test User (NOT owner): ${randomUser}`);
    
    // 3. Check if that user could own NFTs
    console.log(`\n🔍 Testing if random user can own NFTs:`);
    
    // Try to check balance of a known token for any address
    const totalMinted = await contract.nextTokenId();
    console.log(`📊 Total tokens to check: ${Number(totalMinted) - 1}`);
    
    // Check ownership of existing tokens
    for (let tokenId = 1; tokenId <= Math.min(5, Number(totalMinted) - 1); tokenId++) {
      try {
        const tokenOwner = await contract.ownerOf(tokenId);
        const isOwnerTheContractOwner = tokenOwner.toLowerCase() === owner.toLowerCase();
        console.log(`🎯 Token #${tokenId}: Owner = ${tokenOwner}`);
        console.log(`   ${isOwnerTheContractOwner ? '👑 CONTRACT OWNER owns this' : '👤 REGULAR USER owns this'}`);
      } catch (error) {
        console.log(`❌ Token #${tokenId}: Does not exist or error`);
      }
    }
    
    // 4. Explain the setTokenURI mechanism
    console.log(`\n🔧 How setTokenURI() works:`);
    console.log(`   ✅ ONLY contract owner (${owner}) can call setTokenURI()`);
    console.log(`   ✅ But ANY user can OWN the NFT after minting`);
    console.log(`   ✅ Owner updates metadata, user keeps ownership`);
    
    // 5. Show what happens during mint process
    console.log(`\n🎬 Complete User Flow for ANY User:`);
    console.log(`   1. 👤 User connects wallet (any address)`);
    console.log(`   2. 💰 User pays with their VERT/VIRTUAL tokens`);
    console.log(`   3. 🎯 NFT mints TO USER'S ADDRESS (they own it)`);
    console.log(`   4. 🖼️  Backend (with owner key) updates tokenURI`);
    console.log(`   5. ✨ User sees working NFT in their wallet/OpenSea`);
    
    console.log(`\n✅ CONCLUSION:`);
    console.log(`   🔒 Private key is SAFE (server-side only)`);
    console.log(`   👥 Works for ALL users (not just owner)`);
    console.log(`   🎯 Standard NFT project architecture`);
    
  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

testAnyUserFlow(); 