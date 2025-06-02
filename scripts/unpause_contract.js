const { ethers } = require('ethers');
require('dotenv').config();
const VerticalABI = require('../abis/Vertical.json').abi;

async function unpauseContract() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = '0x653015826EdbF26Fe61ad08E5220cD6150D9cB56';
    const contract = new ethers.Contract(contractAddress, VerticalABI, wallet);
    
    console.log('🔍 Checking current pause status...');
    const isPaused = await contract.paused();
    const owner = await contract.owner();
    
    console.log('⏸️  Contract Paused:', isPaused);
    console.log('👑 Contract Owner:', owner);
    console.log('🔑 Wallet Address:', wallet.address);
    
    if (!isPaused) {
      console.log('✅ Contract is already unpaused!');
      return;
    }
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ERROR: You are not the contract owner!');
      console.log('   Owner:', owner);
      console.log('   Your wallet:', wallet.address);
      return;
    }
    
    console.log('');
    console.log('🚀 Unpausing contract...');
    
    const tx = await contract.unpause();
    console.log('📤 Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Contract unpaused successfully!');
    console.log('🧾 Gas used:', receipt.gasUsed.toString());
    
    // Verify
    const finalPauseStatus = await contract.paused();
    console.log('🔍 Final pause status:', finalPauseStatus);
    
  } catch (error) {
    console.error('❌ Error unpausing contract:', error.message);
    if (error.message.includes('Ownable: caller is not the owner')) {
      console.log('💡 Only the contract owner can unpause the contract.');
    }
  }
}

unpauseContract(); 