const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const CONTRACT_ADDRESS = '0x1C1b7d15F73f4ab0E3bb95F280fC180B5fC9C2B';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔍 SIMPLE CONTRACT CHECK');
  console.log('========================');
  
  try {
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log('Contract exists:', code !== '0x' ? '✅' : '❌');
    console.log('Contract code length:', code.length);
    console.log('');
    
    // Try to call basic view functions
    const simpleABI = [
      'function priceVirtual() view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
    
    try {
      const price = await contract.priceVirtual();
      console.log('✅ priceVirtual() call successful');
      console.log('Price Virtual (raw):', price.toString());
      console.log('Price Virtual (ETH):', ethers.formatEther(price));
    } catch (priceError) {
      console.log('❌ priceVirtual() failed:', priceError.message);
    }
    
    // Check if price is 0
    const price = await contract.priceVirtual();
    if (price.toString() === '0') {
      console.log('');
      console.log('❌ FOUND ISSUE: priceVirtual is 0!');
      console.log('This means VIRTUAL mints would try to transfer 0 tokens');
      console.log('Some ERC20 tokens reject 0-value transfers');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 