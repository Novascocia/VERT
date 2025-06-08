const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const VIRTUAL_TOKEN_ADDRESS = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
const CONTRACT_ADDRESS = '0x1C1b7d15F73f4ab0E3bb95F280fC180B5fC9C2B';

// You need to set your private key 
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';

if (!PRIVATE_KEY || PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
  console.log('❌ Please set PRIVATE_KEY environment variable');
  console.log('Usage: PRIVATE_KEY=0x... node approve_virtual_manually.js');
  process.exit(1);
}

// ERC20 ABI
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('🔗 MANUAL VIRTUAL APPROVAL');
  console.log('==========================');
  console.log('Wallet Address:', wallet.address);
  console.log('VIRTUAL Token:', VIRTUAL_TOKEN_ADDRESS);
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('');

  try {
    const virtualToken = new ethers.Contract(VIRTUAL_TOKEN_ADDRESS, ERC20_ABI, wallet);
    
    // Get current status
    const symbol = await virtualToken.symbol();
    const decimals = await virtualToken.decimals();
    const balance = await virtualToken.balanceOf(wallet.address);
    const currentAllowance = await virtualToken.allowance(wallet.address, CONTRACT_ADDRESS);
    
    console.log('📊 CURRENT STATUS:');
    console.log('Token Symbol:', symbol);
    console.log('Your Balance:', ethers.formatUnits(balance, decimals), symbol);
    console.log('Current Allowance:', ethers.formatUnits(currentAllowance, decimals), symbol);
    console.log('');
    
    // Check if balance is sufficient (need at least 0.01 VIRTUAL)
    const minimumRequired = ethers.parseUnits('0.01', decimals);
    if (balance < minimumRequired) {
      console.log('❌ INSUFFICIENT VIRTUAL BALANCE!');
      console.log('You need at least 0.01 VIRTUAL to mint');
      console.log('Current balance:', ethers.formatUnits(balance, decimals), symbol);
      return;
    }
    
    if (currentAllowance > minimumRequired) {
      console.log('✅ You already have sufficient VIRTUAL allowance');
      console.log('Current allowance should be sufficient for minting');
      
      // But let's refresh it anyway to make sure
      console.log('🔄 Refreshing allowance to MAX for future mints...');
    } else {
      console.log('🔄 Setting VIRTUAL allowance to MAX...');
    }
    
    // Send approval transaction
    const tx = await virtualToken.approve(CONTRACT_ADDRESS, MAX_UINT256);
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Approval confirmed in block:', receipt.blockNumber);
    
    // Verify the approval worked
    const newAllowance = await virtualToken.allowance(wallet.address, CONTRACT_ADDRESS);
    console.log('New allowance:', ethers.formatUnits(newAllowance, decimals), symbol);
    
    console.log('');
    console.log('🎉 SUCCESS! VIRTUAL approval completed');
    console.log('You can now try minting again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 