const { ethers } = require('ethers');
const VerticalABI = require('../abis/Vertical.json').abi;

async function analyzeGasUsage() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contractAddress = '0x653015826EdbF26Fe61ad08E5220cD6150D9cB56';
    const contract = new ethers.Contract(contractAddress, VerticalABI, provider);
    
    console.log('⛽ Analyzing gas usage for VERT contract...');
    console.log('📝 Contract:', contractAddress);
    
    // Test account (you can replace with any address that has tokens)
    const testAccount = '0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca';
    
    console.log('\n🔍 Estimating gas for various operations:');
    
    try {
      // Get mint prices
      const vertPrice = await contract.priceVert();
      const virtualPrice = await contract.priceVirtual();
      
      console.log('💰 VERT mint price:', ethers.formatEther(vertPrice), 'VERT');
      console.log('💰 VIRTUAL mint price:', ethers.formatEther(virtualPrice), 'VIRTUAL');
      
      // Estimate gas for VERT mint
      try {
        const vertGasEstimate = await contract.mintWithVert.estimateGas(
          'ipfs://QmPlaceholder',
          { from: testAccount }
        );
        console.log('⛽ VERT mint gas estimate:', vertGasEstimate.toString());
      } catch (e) {
        console.log('⚠️ Could not estimate VERT mint gas:', e.message.split('\n')[0]);
      }
      
      // Estimate gas for VIRTUAL mint  
      try {
        const virtualGasEstimate = await contract.mintWithVirtual.estimateGas(
          'ipfs://QmPlaceholder', 
          { from: testAccount }
        );
        console.log('⛽ VIRTUAL mint gas estimate:', virtualGasEstimate.toString());
      } catch (e) {
        console.log('⚠️ Could not estimate VIRTUAL mint gas:', e.message.split('\n')[0]);
      }
      
      // Get current gas price
      const gasPrice = await provider.getGasPrice();
      console.log('⛽ Current gas price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
      
      // Calculate estimated costs
      const avgGasEstimate = 200000; // Rough estimate
      const estimatedCost = BigInt(avgGasEstimate) * gasPrice;
      console.log('💰 Estimated cost for ~200k gas:', ethers.formatEther(estimatedCost), 'ETH');
      console.log('💰 Estimated cost (USD ~$2500/ETH):', '$' + (Number(ethers.formatEther(estimatedCost)) * 2500).toFixed(4));
      
      // Compare with simple transfer
      console.log('\n📊 For comparison:');
      console.log('💰 Simple ERC20 transfer: ~21,000 gas ($0.05-$0.10)');
      console.log('💰 Basic ERC721 mint: ~80,000 gas ($0.15-$0.25)');
      console.log('💰 Our complex mint: ~200,000+ gas ($0.30-$0.50)');
      
    } catch (error) {
      console.error('❌ Error reading contract data:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing gas usage:', error.message);
  }
}

analyzeGasUsage(); 