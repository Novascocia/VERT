const { ethers } = require('ethers');
const VerticalABI = require('../abis/Vertical.json').abi;

async function checkMintPrices() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contractAddress = '0x653015826EdbF26Fe61ad08E5220cD6150D9cB56';
    const contract = new ethers.Contract(contractAddress, VerticalABI, provider);
    
    console.log('💰 Checking mint prices and prize pool...');
    console.log('📝 Contract:', contractAddress);
    
    const vertPrice = await contract.priceVert();
    const virtualPrice = await contract.priceVirtual();
    const prizePool = await contract.getPrizePoolBalance();
    const totalMinted = await contract.getTotalMinted();
    
    console.log('\n📊 Current Settings:');
    console.log('💎 VERT mint price:', ethers.formatEther(vertPrice), 'VERT');
    console.log('🌟 VIRTUAL mint price:', ethers.formatEther(virtualPrice), 'VIRTUAL');
    console.log('🏆 Prize pool balance:', ethers.formatEther(prizePool), 'VERT');
    console.log('🎯 Total minted:', totalMinted.toString());
    
    if (vertPrice.toString() === '0') {
      console.log('\n🚨 PROBLEM FOUND:');
      console.log('❌ VERT mint price is 0! This means no funds are added to prize pool.');
      console.log('💡 The owner needs to set proper mint prices using setPrices() function.');
    } else {
      console.log('\n✅ VERT price is set correctly.');
      
      // Calculate expected prize pool contribution per mint
      const toTreasury = (vertPrice * BigInt(25)) / BigInt(100);
      const toPrizePool = vertPrice - toTreasury;
      
      console.log('📈 Per VERT mint contribution:');
      console.log('   💼 To treasury (25%):', ethers.formatEther(toTreasury), 'VERT');
      console.log('   🏆 To prize pool (75%):', ethers.formatEther(toPrizePool), 'VERT');
    }
    
  } catch (error) {
    console.error('❌ Error checking mint prices:', error.message);
  }
}

checkMintPrices(); 