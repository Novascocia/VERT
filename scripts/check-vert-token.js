require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { ethers } = require('hardhat');

async function main() {
  const contractAddress = '0xB1E0fB284dE7cc242EBB95653845BDB18B045BF2';
  
  console.log('🔍 Checking VERT token configuration in deployed contract...');
  
  try {
    const [signer] = await ethers.getSigners();
    
    // Simple ABI just for the functions we need
    const abi = [
      'function vertToken() view returns (address)',
      'function prizePool() view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const vertTokenAddr = await contract.vertToken();
    const prizePool = await contract.prizePool();
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🪙 VERT Token Address:', vertTokenAddr);
    console.log('💰 Prize Pool:', ethers.formatEther(prizePool), 'VERT');
    
    if (vertTokenAddr === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️  VERT token is set to zero address - this will cause getUnaccountedBalance() to revert');
      console.log('✅ This is expected for Phase 1 deployment');
    } else {
      console.log('✅ VERT token is properly configured');
    }
    
  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
  }
}

main().catch(console.error); 