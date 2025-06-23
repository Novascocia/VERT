const { ethers } = require('ethers');
const VerticalABI = require('../abis/Vertical.json').abi;

async function checkMainnetPrices() {
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const contractAddress = '0x46aA53a47fB31E6A2FC80F405A94b3732BC05039'; // New fresh contract
    const contract = new ethers.Contract(contractAddress, VerticalABI, provider);
    
    console.log('💰 Checking MAINNET mint prices...');
    console.log('📝 Contract:', contractAddress);
    console.log('🌐 Network: Base Mainnet');
    
    const vertPrice = await contract.priceVert();
    const virtualPrice = await contract.priceVirtual();
    const totalMinted = await contract.getTotalMinted();
    
    console.log('\n📊 Current MAINNET Settings:');
    console.log('💎 VERT mint price:', ethers.formatEther(vertPrice), 'VERT');
    console.log('🌟 VIRTUAL mint price:', ethers.formatEther(virtualPrice), 'VIRTUAL');
    console.log('🎯 Total minted:', totalMinted.toString());
    
    // Check if prices are 0
    if (vertPrice.toString() === '0' && virtualPrice.toString() === '0') {
      console.log('\n🚨 CRITICAL PROBLEM FOUND:');
      console.log('❌ Both VERT and VIRTUAL mint prices are 0!');
      console.log('❌ This means users can mint for free!');
      console.log('💡 The owner needs to set proper mint prices using setPrices() function.');
    } else if (vertPrice.toString() === '0') {
      console.log('\n⚠️ VERT mint price is 0');
    } else if (virtualPrice.toString() === '0') {
      console.log('\n⚠️ VIRTUAL mint price is 0');
    } else {
      console.log('\n✅ Prices are set correctly.');
    }
    
    // Compare with expected frontend fallback values
    console.log('\n🔍 Frontend Fallback Comparison:');
    console.log('Expected VIRTUAL:', '0.01 VIRTUAL');
    console.log('Actual VIRTUAL:', ethers.formatEther(virtualPrice), 'VIRTUAL');
    console.log('Expected VERT:', '500 VERT');
    console.log('Actual VERT:', ethers.formatEther(vertPrice), 'VERT');
    
  } catch (error) {
    console.error('❌ Error checking mainnet prices:', error.message);
    if (error.message.includes('call revert exception')) {
      console.error('💡 This could mean the contract is not deployed or the ABI is incorrect');
    }
  }
}

checkMainnetPrices(); 