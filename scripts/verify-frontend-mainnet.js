require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

console.log("🔍 Verifying Frontend Mainnet Configuration");
console.log("=".repeat(50));

// Expected mainnet addresses
const EXPECTED_ADDRESSES = {
      NFT_CONTRACT: "0x1C1b7d15F73f4ab0E33bb95F280fC180B5fC9C2B",
  VIRTUAL_TOKEN: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
  VERT_TOKEN: "0x0000000000000000000000000000000000000000",
  TREASURY: "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23",
  ADMIN: "0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca"
};

console.log("📋 Expected Mainnet Addresses:");
Object.entries(EXPECTED_ADDRESSES).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log("\n🔍 Environment Variables Check:");

// Check environment variables
const envVars = {
  'NEXT_PUBLIC_CONTRACT_ADDRESS': process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  'CONTRACT_ADDRESS': process.env.CONTRACT_ADDRESS,
  'NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS': process.env.NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS,
  'NEXT_PUBLIC_VERT_TOKEN_ADDRESS': process.env.NEXT_PUBLIC_VERT_TOKEN_ADDRESS,
  'NEXT_PUBLIC_TREASURY_ADDRESS': process.env.NEXT_PUBLIC_TREASURY_ADDRESS,
  'NEXT_PUBLIC_ADMIN_WALLET_ADDRESS': process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
  'MAINNET_RPC_URL': process.env.MAINNET_RPC_URL,
  'NEXT_PUBLIC_ALCHEMY_KEY': process.env.NEXT_PUBLIC_ALCHEMY_KEY ? '[SET]' : '[NOT SET]'
};

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
});

console.log("\n🔎 Configuration Validation:");

// Validate contract addresses
const contractOk = envVars['NEXT_PUBLIC_CONTRACT_ADDRESS'] === EXPECTED_ADDRESSES.NFT_CONTRACT;
const virtualOk = envVars['NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS'] === EXPECTED_ADDRESSES.VIRTUAL_TOKEN;
const vertOk = envVars['NEXT_PUBLIC_VERT_TOKEN_ADDRESS'] === EXPECTED_ADDRESSES.VERT_TOKEN;
const treasuryOk = envVars['NEXT_PUBLIC_TREASURY_ADDRESS'] === EXPECTED_ADDRESSES.TREASURY;
const adminOk = envVars['NEXT_PUBLIC_ADMIN_WALLET_ADDRESS'] === EXPECTED_ADDRESSES.ADMIN;

console.log(`  ${contractOk ? '✅' : '❌'} NFT Contract Address: ${contractOk ? 'CORRECT' : 'MISMATCH'}`);
console.log(`  ${virtualOk ? '✅' : '❌'} VIRTUAL Token Address: ${virtualOk ? 'CORRECT' : 'MISMATCH'}`);
console.log(`  ${vertOk ? '✅' : '❌'} VERT Token Address: ${vertOk ? 'CORRECT' : 'MISMATCH'}`);
console.log(`  ${treasuryOk ? '✅' : '❌'} Treasury Address: ${treasuryOk ? 'CORRECT' : 'MISMATCH'}`);
console.log(`  ${adminOk ? '✅' : '❌'} Admin Address: ${adminOk ? 'CORRECT' : 'MISMATCH'}`);

// Check RPC configuration
const rpcOk = envVars['MAINNET_RPC_URL'] && envVars['MAINNET_RPC_URL'].includes('base-mainnet');
console.log(`  ${rpcOk ? '✅' : '⚠️'} RPC URL: ${rpcOk ? 'MAINNET CONFIGURED' : 'CHECK CONFIGURATION'}`);

const alchemyOk = envVars['NEXT_PUBLIC_ALCHEMY_KEY'] !== '[NOT SET]';
console.log(`  ${alchemyOk ? '✅' : '⚠️'} Alchemy Key: ${alchemyOk ? 'CONFIGURED' : 'NOT SET (optional)'}`);

console.log("\n📊 Overall Status:");
const allCorrect = contractOk && virtualOk && vertOk && treasuryOk && adminOk && rpcOk;

if (allCorrect) {
  console.log("🎉 ALL CONFIGURATIONS CORRECT - READY FOR MAINNET!");
} else {
  console.log("⚠️  CONFIGURATION ISSUES FOUND - PLEASE REVIEW");
  
  if (!contractOk) console.log("   - Update NEXT_PUBLIC_CONTRACT_ADDRESS");
  if (!virtualOk) console.log("   - Update NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS");
  if (!vertOk) console.log("   - Update NEXT_PUBLIC_VERT_TOKEN_ADDRESS");
  if (!treasuryOk) console.log("   - Update NEXT_PUBLIC_TREASURY_ADDRESS");
  if (!adminOk) console.log("   - Update NEXT_PUBLIC_ADMIN_WALLET_ADDRESS");
  if (!rpcOk) console.log("   - Update MAINNET_RPC_URL");
}

console.log("\n📝 Quick Setup Commands:");
console.log("If any addresses are incorrect, update your .env.local file:");
console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${EXPECTED_ADDRESSES.NFT_CONTRACT}`);
console.log(`CONTRACT_ADDRESS=${EXPECTED_ADDRESSES.NFT_CONTRACT}`);
console.log(`NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=${EXPECTED_ADDRESSES.VIRTUAL_TOKEN}`);
console.log(`NEXT_PUBLIC_VERT_TOKEN_ADDRESS=${EXPECTED_ADDRESSES.VERT_TOKEN}`);
console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${EXPECTED_ADDRESSES.TREASURY}`);
console.log(`NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=${EXPECTED_ADDRESSES.ADMIN}`);

console.log("\n🚀 Next Steps:");
console.log("1. ✅ Build and deploy frontend: npm run build");
console.log("2. ✅ Test admin panel with deployer wallet");
console.log("3. ✅ Test VIRTUAL minting");
console.log("4. ✅ Test manual sync functionality");
console.log("5. ✅ Monitor leaderboard updates"); 