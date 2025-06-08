const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const CONTRACT_ADDRESS = '0x1C1b7d15F73f4ab0E3bb95F280fC180B5fC9C2B';
const PVERT_TOKEN_ADDRESS = '0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA';

// You need to set your private key for the admin account
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'YOUR_ADMIN_PRIVATE_KEY_HERE';

if (!ADMIN_PRIVATE_KEY || ADMIN_PRIVATE_KEY === 'YOUR_ADMIN_PRIVATE_KEY_HERE') {
  console.log('❌ Please set ADMIN_PRIVATE_KEY environment variable');
  console.log('Usage: ADMIN_PRIVATE_KEY=0x... node fix_contract_self_approval.js');
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

// NFT Contract ABI
const NFT_ABI = [
  'function owner() view returns (address)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  console.log('🔧 FIXING CONTRACT SELF-ALLOWANCE');
  console.log('=================================');
  console.log('Admin Address:', wallet.address);
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('pVERT Token Address:', PVERT_TOKEN_ADDRESS);
  console.log('');

  try {
    // Check if the wallet is the owner
    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, NFT_ABI, provider);
    const owner = await nftContract.owner();
    
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Error: This wallet is not the contract owner');
      console.log('Contract Owner:', owner);
      console.log('Your Address:', wallet.address);
      return;
    }
    
    console.log('✅ Confirmed: You are the contract owner');
    console.log('');

    const pvertToken = new ethers.Contract(PVERT_TOKEN_ADDRESS, ERC20_ABI, wallet);
    
    // Get current status
    const symbol = await pvertToken.symbol();
    const decimals = await pvertToken.decimals();
    const contractBalance = await pvertToken.balanceOf(CONTRACT_ADDRESS);
    const currentAllowance = await pvertToken.allowance(CONTRACT_ADDRESS, CONTRACT_ADDRESS);
    
    console.log('📊 CURRENT STATUS:');
    console.log('Contract pVERT Balance:', ethers.formatUnits(contractBalance, decimals), symbol);
    console.log('Contract Self-Allowance:', ethers.formatUnits(currentAllowance, decimals), symbol);
    console.log('');
    
    if (currentAllowance >= contractBalance) {
      console.log('✅ Contract already has sufficient self-allowance');
      return;
    }
    
    // Approve contract to spend its own tokens (from the contract's perspective)
    console.log('🔄 Approving contract to spend its own pVERT tokens...');
    console.log('Note: This transaction is sent FROM the contract owner TO the pVERT token');
    console.log('We are approving the NFT contract to spend pVERT tokens owned by the NFT contract');
    console.log('');
    
    // This is the tricky part - we need the NFT contract to approve itself
    // But we can't do this directly. The contract would need a function to do this.
    
    console.log('❌ LIMITATION DISCOVERED');
    console.log('The NFT contract needs to have a function to approve itself to spend pVERT');
    console.log('');
    console.log('💡 ALTERNATIVE SOLUTIONS:');
    console.log('1. Add a function to the contract like: approveSelfForPrizes()');
    console.log('2. Or modify the prize payout logic to not require self-approval');
    console.log('3. Or temporarily disable prize payouts until this is fixed');
    console.log('');
    console.log('🔍 For now, let\'s check if the contract has any admin functions...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 