const { ethers } = require('ethers');

// Configuration 
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const CONTRACT_ADDRESS = '0x414280a38d52eB30768275Eb95D16714c69d216A';
const PVERT_TOKEN_ADDRESS = '0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA';

// ERC20 ABI
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔍 CHECKING CONTRACT SELF-ALLOWANCE');
  console.log('===================================');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('pVERT Token Address:', PVERT_TOKEN_ADDRESS);
  console.log('');

  try {
    const pvertToken = new ethers.Contract(PVERT_TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Get pVERT token info
    const symbol = await pvertToken.symbol();
    const decimals = await pvertToken.decimals();
    
    // Check contract's pVERT balance
    const contractBalance = await pvertToken.balanceOf(CONTRACT_ADDRESS);
    
    // Check if contract has approved ITSELF to spend its own pVERT
    const selfAllowance = await pvertToken.allowance(CONTRACT_ADDRESS, CONTRACT_ADDRESS);
    
    console.log('💰 CONTRACT pVERT STATUS:');
    console.log('Symbol:', symbol);
    console.log('Contract Balance:', ethers.formatUnits(contractBalance, decimals), symbol);
    console.log('Self-Allowance:', ethers.formatUnits(selfAllowance, decimals), symbol);
    console.log('');
    
    console.log('🔍 ANALYSIS:');
    if (contractBalance > 0n && selfAllowance === 0n) {
      console.log('❌ PROBLEM FOUND: Contract has pVERT balance but no self-allowance!');
      console.log('💡 The contract cannot transfer its own pVERT for prize payouts');
      console.log('💡 This would cause "ERC20: insufficient allowance" errors during minting');
      console.log('');
      console.log('🔧 SOLUTION NEEDED:');
      console.log('   The contract needs to approve itself to spend its own pVERT tokens');
      console.log('   This is usually done by calling pVERT.approve(contractAddress, maxAmount)');
      console.log('   from the contract owner/admin account');
    } else if (contractBalance > 0n && selfAllowance > 0n) {
      console.log('✅ Contract has both balance and allowance - should work fine');
    } else if (contractBalance === 0n) {
      console.log('ℹ️ Contract has no pVERT balance - no prizes available anyway');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 