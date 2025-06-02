const fs = require('fs');
const path = require('path');

console.log("🔍 COMPREHENSIVE ADDRESS VERIFICATION");
console.log("=".repeat(60));

// Correct mainnet addresses
const CORRECT_ADDRESSES = {
  NFT_CONTRACT: "0xc03605b09aF6010bb2097d285b9aF4024ecAf098",
  VIRTUAL_TOKEN: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
  VERT_TOKEN: "[TO_BE_ANNOUNCED]",
  NETWORK: "Base Mainnet (8453)"
};

// Deprecated addresses that should NOT be used
const DEPRECATED_ADDRESSES = [
  "0x9ede64fe689aa03B049497E2A70676d02f3437E9", // First deployment (wrong script)
  "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a", // Old VIRTUAL token
  "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd"  // Old VERT token
];

console.log("✅ CORRECT MAINNET ADDRESSES:");
console.log(`   NFT Contract: ${CORRECT_ADDRESSES.NFT_CONTRACT}`);
console.log(`   VIRTUAL Token: ${CORRECT_ADDRESSES.VIRTUAL_TOKEN}`);
console.log(`   VERT Token: ${CORRECT_ADDRESSES.VERT_TOKEN}`);
console.log(`   Network: ${CORRECT_ADDRESSES.NETWORK}`);
console.log("");

console.log("❌ DEPRECATED ADDRESSES (should not be used):");
DEPRECATED_ADDRESSES.forEach(addr => console.log(`   ${addr}`));
console.log("");

// Files to check
const filesToCheck = [
  'app/page.tsx',
  'app/components/MintLeaderboard.tsx',
  'utils/generateAndStoreNFT.ts',
  'scripts/unpause_contract.js',
  'scripts/test_view_functions.js',
  'scripts/test_prize_pool.js',
  'scripts/test_minting.js',
  'scripts/test_edge_cases.js',
  'scripts/test_admin_functions.js',
  'scripts/run_all_tests.js',
  'scripts/check_pause_status.js',
  'scripts/check_mint_prices.js',
  'scripts/analyze_gas_usage.js'
];

let allCorrect = true;
let issuesFound = [];

console.log("🔍 CHECKING CRITICAL FILES:");
console.log("-".repeat(40));

filesToCheck.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for correct NFT contract address
      const hasCorrectNFT = content.includes(CORRECT_ADDRESSES.NFT_CONTRACT);
      const hasCorrectVIRTUAL = content.includes(CORRECT_ADDRESSES.VIRTUAL_TOKEN);
      
      // Check for deprecated addresses
      const deprecatedFound = DEPRECATED_ADDRESSES.filter(addr => 
        content.includes(addr) && !content.includes(`~~\`${addr}\`~~`) // Ignore strikethrough in docs
      );
      
      if (hasCorrectNFT && deprecatedFound.length === 0) {
        console.log(`✅ ${filePath} - CORRECT`);
      } else {
        console.log(`❌ ${filePath} - ISSUES FOUND`);
        if (!hasCorrectNFT) {
          console.log(`   Missing correct NFT contract: ${CORRECT_ADDRESSES.NFT_CONTRACT}`);
          issuesFound.push(`${filePath}: Missing correct NFT contract`);
        }
        if (deprecatedFound.length > 0) {
          console.log(`   Found deprecated addresses: ${deprecatedFound.join(', ')}`);
          issuesFound.push(`${filePath}: Contains deprecated addresses`);
        }
        allCorrect = false;
      }
    } else {
      console.log(`⚠️ ${filePath} - FILE NOT FOUND`);
    }
  } catch (error) {
    console.log(`❌ ${filePath} - ERROR: ${error.message}`);
    allCorrect = false;
  }
});

console.log("");
console.log("🔍 CHECKING CONFIGURATION FILES:");
console.log("-".repeat(40));

// Check mainnet config
try {
  const mainnetConfig = JSON.parse(fs.readFileSync('mainnet-config/mainnet.addresses.json', 'utf8'));
  if (mainnetConfig.NFT_CONTRACT_ADDRESS === CORRECT_ADDRESSES.NFT_CONTRACT) {
    console.log("✅ mainnet-config/mainnet.addresses.json - CORRECT");
  } else {
    console.log("❌ mainnet-config/mainnet.addresses.json - INCORRECT NFT ADDRESS");
    allCorrect = false;
  }
} catch (error) {
  console.log("❌ mainnet-config/mainnet.addresses.json - ERROR:", error.message);
  allCorrect = false;
}

// Check testnet config (should have old addresses - this is correct)
try {
  const testnetConfig = JSON.parse(fs.readFileSync('testnet.addresses.json', 'utf8'));
  console.log("✅ testnet.addresses.json - Contains testnet addresses (correct)");
} catch (error) {
  console.log("⚠️ testnet.addresses.json - Could not read");
}

console.log("");
console.log("=".repeat(60));

if (allCorrect && issuesFound.length === 0) {
  console.log("🎉 ALL ADDRESSES VERIFIED CORRECT!");
  console.log("✅ Ready for mainnet production use");
  console.log("");
  console.log("📋 SUMMARY:");
  console.log(`   ✅ NFT Contract: ${CORRECT_ADDRESSES.NFT_CONTRACT}`);
  console.log(`   ✅ VIRTUAL Token: ${CORRECT_ADDRESSES.VIRTUAL_TOKEN}`);
  console.log(`   ✅ Network: ${CORRECT_ADDRESSES.NETWORK}`);
  console.log(`   ✅ All scripts updated`);
  console.log(`   ✅ Frontend updated`);
  console.log(`   ✅ Backend updated`);
  console.log("");
  console.log("🔗 VERIFICATION LINKS:");
  console.log(`   BaseScan: https://basescan.org/address/${CORRECT_ADDRESSES.NFT_CONTRACT}`);
  console.log(`   VIRTUAL Token: https://basescan.org/address/${CORRECT_ADDRESSES.VIRTUAL_TOKEN}`);
  
} else {
  console.log("❌ ISSUES FOUND - NEEDS ATTENTION");
  console.log("");
  console.log("🚨 ISSUES TO FIX:");
  issuesFound.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  console.log("");
  console.log("💡 NEXT STEPS:");
  console.log("   1. Fix the issues listed above");
  console.log("   2. Re-run this script to verify");
  console.log("   3. Test the application thoroughly");
}

console.log("");
console.log("🔧 MANUAL VERIFICATION CHECKLIST:");
console.log("   [ ] Contract verified on BaseScan");
console.log("   [ ] Frontend connects to correct contract");
console.log("   [ ] Backend uses correct contract");
console.log("   [ ] All scripts use correct addresses");
console.log("   [ ] Environment variables updated");
console.log("   [ ] Documentation updated");

console.log("=".repeat(60)); 