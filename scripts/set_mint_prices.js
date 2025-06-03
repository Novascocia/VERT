const { ethers } = require('ethers');
require('dotenv').config();
const VerticalABI = require('../abis/Vertical.json').abi;

async function setMintPrices() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = process.env.CONTRACT_ADDRESS || '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';
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
    
    // Set new prices - Virtual price to 0.01, keep VERT price the same
    const newVertPrice = currentVertPrice;  // Keep current VERT price
    const newVirtualPrice = ethers.parseEther("0.01");  // Set VIRTUAL to 0.01
    
    console.log('\n🚀 Setting new prices:');
    console.log('💎 VERT price (unchanged):', ethers.formatEther(newVertPrice), 'VERT');
    console.log('🌟 New VIRTUAL price:', ethers.formatEther(newVirtualPrice), 'VIRTUAL');
    
    // Verify owner
    const owner = await contract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ERROR: You are not the contract owner!');
      console.log('   Owner:', owner);
      console.log('   Your wallet:', wallet.address);
      return;
    }
    
    console.log('✅ Owner verification passed');
    
    const tx = await contract.setPrices(newVirtualPrice, newVertPrice);
    console.log('📤 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Prices set successfully!');
    console.log('🧾 Gas used:', receipt.gasUsed.toString());
    console.log('🔗 Block number:', receipt.blockNumber);
    
    // Verify new prices
    const finalVertPrice = await contract.priceVert();
    const finalVirtualPrice = await contract.priceVirtual();
    
    console.log('\n🔍 Final Prices:');
    console.log('💎 VERT:', ethers.formatEther(finalVertPrice), 'VERT');
    console.log('🌟 VIRTUAL:', ethers.formatEther(finalVirtualPrice), 'VIRTUAL');
    
    console.log('\n📈 New Mint Economics:');
    console.log('Per VIRTUAL mint (0.01 VIRTUAL):');
    console.log('   💼 Goes to treasury: 0.01 VIRTUAL');
    console.log('   🏆 Prize pool: No change (VIRTUAL mints don\'t fund prize pool)');
    
  } catch (error) {
    console.error('❌ Error setting mint prices:', error.message);
    if (error.reason) {
      console.error('🔍 Reason:', error.reason);
    }
    if (error.code) {
      console.error('🔢 Error code:', error.code);
    }
  }
}

setMintPrices(); 