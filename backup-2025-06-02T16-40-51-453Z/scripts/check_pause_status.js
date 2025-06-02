const { ethers } = require('ethers');
const VerticalABI = require('../abis/Vertical.json').abi;

async function checkPauseStatus() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contractAddress = '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';
    const contract = new ethers.Contract(contractAddress, VerticalABI, provider);
    
    console.log('🔍 Checking contract pause status...');
    
    const isPaused = await contract.paused();
    const owner = await contract.owner();
    
    console.log('📝 Contract Address:', contractAddress);
    console.log('⏸️  Contract Paused:', isPaused);
    console.log('👑 Contract Owner:', owner);
    
    if (isPaused) {
      console.log('');
      console.log('🚨 CONTRACT IS PAUSED! This is why minting is failing.');
      console.log('💡 To fix: The owner needs to call unpause() function.');
    } else {
      console.log('');
      console.log('✅ Contract is not paused - something else is wrong.');
    }
    
  } catch (error) {
    console.error('❌ Error checking pause status:', error.message);
  }
}

checkPauseStatus(); 