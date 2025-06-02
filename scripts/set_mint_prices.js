const { ethers } = require('ethers');
require('dotenv').config();
const VerticalABI = require('../abis/Vertical.json').abi;

async function setMintPrices() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL || 'https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x653015826EdbF26Fe61ad08E5220cD6150D9cB56';
    const contract = new ethers.Contract(contractAddress, VerticalABI, wallet);
    
    console.log('💰 Setting Phase 1 launch prices...');
    console.log('📝 Contract:', contractAddress);
    console.log('🔑 Wallet:', wallet.address);
    
    // Check current prices
    const currentVertPrice = await contract.priceVert();
    const currentVirtualPrice = await contract.priceVirtual();
    
    console.log('\n📊 Current Prices:');
    console.log('💎 VERT:', ethers.formatEther(currentVertPrice), 'VERT');
    console.log('🌟 VIRTUAL:', ethers.formatEther(currentVirtualPrice), 'VIRTUAL');
    
    // Set Phase 1 launch prices
    const newVertPrice = ethers.parseEther("500");     // 500 VERT (ready for Phase 2)
    const newVirtualPrice = ethers.parseEther("0.1");  // 0.1 VIRTUAL (Phase 1 launch price)
    
    console.log('\n🚀 Setting Phase 1 launch prices:');
    console.log('💎 VERT price:', ethers.formatEther(newVertPrice), 'VERT (ready for Phase 2)');
    console.log('🌟 VIRTUAL price:', ethers.formatEther(newVirtualPrice), 'VIRTUAL (Phase 1 launch price)');
    
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