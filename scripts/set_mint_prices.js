const { ethers } = require('ethers');
require('dotenv').config();
const VerticalABI = require('../abis/Vertical.json').abi;

async function setMintPrices() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = '0x9ede64fe689aa03B049497E2A70676d02f3437E9';
    const contract = new ethers.Contract(contractAddress, VerticalABI, wallet);
    
    console.log('💰 Setting mint prices...');
    console.log('📝 Contract:', contractAddress);
    console.log('🔑 Wallet:', wallet.address);
    
    // Check current prices
    const currentVertPrice = await contract.priceVert();
    const currentVirtualPrice = await contract.priceVirtual();
    
    console.log('\n📊 Current Prices:');
    console.log('💎 VERT:', ethers.formatEther(currentVertPrice), 'VERT');
    console.log('🌟 VIRTUAL:', ethers.formatEther(currentVirtualPrice), 'VIRTUAL');
    
    // Set reasonable prices
    const newVertPrice = ethers.parseEther("100");      // 100 VERT per mint
    const newVirtualPrice = ethers.parseEther("50");    // 50 VIRTUAL per mint
    
    console.log('\n🚀 Setting new prices:');
    console.log('💎 New VERT price:', ethers.formatEther(newVertPrice), 'VERT');
    console.log('🌟 New VIRTUAL price:', ethers.formatEther(newVirtualPrice), 'VIRTUAL');
    
    // Verify owner
    const owner = await contract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ERROR: You are not the contract owner!');
      console.log('   Owner:', owner);
      console.log('   Your wallet:', wallet.address);
      return;
    }
    
    const tx = await contract.setPrices(newVirtualPrice, newVertPrice);
    console.log('📤 Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Prices set successfully!');
    console.log('🧾 Gas used:', receipt.gasUsed.toString());
    
    // Verify new prices
    const finalVertPrice = await contract.priceVert();
    const finalVirtualPrice = await contract.priceVirtual();
    
    console.log('\n🔍 Final Prices:');
    console.log('💎 VERT:', ethers.formatEther(finalVertPrice), 'VERT');
    console.log('🌟 VIRTUAL:', ethers.formatEther(finalVirtualPrice), 'VIRTUAL');
    
    console.log('\n📈 Prize Pool Impact:');
    console.log('Per VERT mint (100 VERT):');
    console.log('   💼 To treasury (25%): 25 VERT');
    console.log('   🏆 To prize pool (75%): 75 VERT');
    
  } catch (error) {
    console.error('❌ Error setting mint prices:', error.message);
  }
}

setMintPrices(); 