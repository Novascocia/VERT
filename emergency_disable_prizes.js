const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const CONTRACT_ADDRESS = '0x1C1b7d15F73f4ab0E3bb95F280fC180B5fC9C2B';

// You need to set your private key for the admin account
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'YOUR_ADMIN_PRIVATE_KEY_HERE';

if (!ADMIN_PRIVATE_KEY || ADMIN_PRIVATE_KEY === 'YOUR_ADMIN_PRIVATE_KEY_HERE') {
  console.log('❌ Please set ADMIN_PRIVATE_KEY environment variable');
  console.log('Usage: ADMIN_PRIVATE_KEY=0x... node emergency_disable_prizes.js');
  process.exit(1);
}

// NFT Contract ABI
const NFT_ABI = [
  'function owner() view returns (address)',
  'function setPrizePercent(uint8 rarity, uint256 percent) external',
  'function prizePercentByRarity(uint8 rarity) view returns (uint256)'
];

// Rarity enum values
const RARITY = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
  Mythical: 4
};

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  console.log('🚨 EMERGENCY: DISABLING ALL PRIZES');
  console.log('==================================');
  console.log('Admin Address:', wallet.address);
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('');

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NFT_ABI, wallet);
    
    // Check if the wallet is the owner
    const owner = await contract.owner();
    
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Error: This wallet is not the contract owner');
      console.log('Contract Owner:', owner);
      console.log('Your Address:', wallet.address);
      return;
    }
    
    console.log('✅ Confirmed: You are the contract owner');
    console.log('');

    // Check current prize percentages
    console.log('📊 CURRENT PRIZE PERCENTAGES:');
    for (const [name, value] of Object.entries(RARITY)) {
      if (name !== 'Common') { // Skip Common as it should always be 0
        const currentPercent = await contract.prizePercentByRarity(value);
        console.log(`${name}: ${currentPercent}%`);
      }
    }
    console.log('');
    
    // Set all prize percentages to 0
    console.log('🔄 Setting all prize percentages to 0...');
    
    for (const [name, value] of Object.entries(RARITY)) {
      if (name !== 'Common') { // Skip Common as it should already be 0
        console.log(`Setting ${name} prize to 0%...`);
        
        const tx = await contract.setPrizePercent(value, 0);
        console.log(`Transaction sent: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ ${name} prize disabled in block ${receipt.blockNumber}`);
      }
    }
    
    console.log('');
    console.log('✅ ALL PRIZES DISABLED SUCCESSFULLY');
    console.log('');
    console.log('📝 WHAT THIS MEANS:');
    console.log('- All mints (VIRTUAL and VERT) will now work without errors');
    console.log('- No prizes will be paid out until this is re-enabled');
    console.log('- The prize pool is preserved and safe');
    console.log('');
    console.log('🔧 TO RE-ENABLE PRIZES LATER:');
    console.log('- Fix the contract self-allowance issue first');
    console.log('- Then set prize percentages back to: Rare 3%, Epic 7%, Legendary 15%, Mythical 40%');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 