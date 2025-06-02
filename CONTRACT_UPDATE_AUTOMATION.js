const fs = require('fs');
const path = require('path');

/**
 * 🚀 Contract Address Update Automation Script
 * 
 * This script automatically updates all contract addresses throughout the codebase
 * after deploying a new contract.
 * 
 * Usage:
 * node CONTRACT_UPDATE_AUTOMATION.js [NEW_CONTRACT_ADDRESS]
 */

const OLD_CONTRACT_ADDRESS = '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';

// All files that need contract address updates
const FILES_TO_UPDATE = [
  // Frontend Application Files
  'app/page.tsx',
  'app/components/AdminTerminal.tsx',
  'app/components/MintLeaderboard.tsx',
  'app/config/contracts.ts',
  
  // Configuration Files
  'mainnet-config/mainnet.addresses.json',
  
  // Script Files
  'scripts/analyze_gas_usage.js',
  'scripts/check-nft-status.js',
  'scripts/check-token-status.js',
  'scripts/check_mint_prices.js',
  'scripts/check_pause_status.js',
  'scripts/fix-failed-nfts.js',
  'scripts/run_all_tests.js',
  'scripts/set_mint_prices.js',
  'scripts/test_admin_functions.js',
  'scripts/test_edge_cases.js',
  'scripts/test_minting.js',
  'scripts/test_prize_pool.js',
  'scripts/test_view_functions.js',
  'scripts/unpause_contract.js',
  'scripts/verify-all-addresses.js',
  'scripts/verify-basescan.js',
  'scripts/verify-mainnet-contract.js',
  
  // Utility Files
  'utils/generateAndStoreNFT.ts',
  
  // Documentation Files
  'ENVIRONMENT_SETUP.md',
  'MAINNET_REFERENCE.md',
  'PHASE1_LAUNCH_STATUS.md',
  'CONTRACT_DEPLOYMENT_REFERENCE.md'
];

function updateContractAddress(filePath, newAddress) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all instances of the old contract address with the new one
    content = content.replace(new RegExp(OLD_CONTRACT_ADDRESS, 'g'), newAddress);
    
    // Check if any changes were made
    if (content === originalContent) {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
      return false;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function validateAddress(address) {
  // Check if it's a valid Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  // Check if it's different from the old address
  if (address.toLowerCase() === OLD_CONTRACT_ADDRESS.toLowerCase()) {
    throw new Error('New address cannot be the same as the old address');
  }
  
  return true;
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-${timestamp}`;
  
  console.log(`📁 Creating backup in: ${backupDir}`);
  
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    
    FILES_TO_UPDATE.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(backupDir, filePath);
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        fs.copyFileSync(filePath, backupPath);
      }
    });
    
    console.log(`✅ Backup created successfully`);
    return backupDir;
  } catch (error) {
    console.error(`❌ Failed to create backup:`, error.message);
    throw error;
  }
}

function updateEnvironmentTemplate(newAddress) {
  const envTemplate = `# Contract addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=${newAddress}
CONTRACT_ADDRESS=${newAddress}

# Update these in your Vercel environment variables too!
`;
  
  try {
    fs.writeFileSync('.env.update.template', envTemplate);
    console.log('✅ Created .env.update.template with new address');
  } catch (error) {
    console.error('❌ Failed to create environment template:', error.message);
  }
}

function generateDeploymentSummary(newAddress, updatedFiles) {
  const summary = `# 🚀 Deployment Summary

## Contract Deployment
- **Old Contract**: \`${OLD_CONTRACT_ADDRESS}\`
- **New Contract**: \`${newAddress}\`
- **Deployment Date**: ${new Date().toISOString()}

## Files Updated (${updatedFiles.length})
${updatedFiles.map(file => `- ✅ ${file}`).join('\n')}

## Next Steps
1. **Update Environment Variables**:
   \`\`\`bash
   # Update your .env.local file:
   NEXT_PUBLIC_CONTRACT_ADDRESS=${newAddress}
   CONTRACT_ADDRESS=${newAddress}
   \`\`\`

2. **Update Vercel Environment Variables**:
   - Go to Vercel dashboard
   - Update NEXT_PUBLIC_CONTRACT_ADDRESS
   - Update CONTRACT_ADDRESS
   - Redeploy

3. **Verify Deployment**:
   \`\`\`bash
   npx hardhat run scripts/test_view_functions.js --network base_mainnet
   \`\`\`

4. **Test Frontend**:
   - Start local development server
   - Connect wallet
   - Test minting functionality
   - Verify admin terminal works

## BaseScan Links
- **Contract**: https://basescan.org/address/${newAddress}
- **Verify Contract**: https://basescan.org/verifyContract

## OpenSea
⚠️ **Note**: New contract = new OpenSea collection (clean slate)

---
*Generated on: ${new Date().toLocaleString()}*
`;

  try {
    fs.writeFileSync('DEPLOYMENT_SUMMARY.md', summary);
    console.log('✅ Created DEPLOYMENT_SUMMARY.md');
  } catch (error) {
    console.error('❌ Failed to create deployment summary:', error.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Contract Address Update Automation

Usage: node CONTRACT_UPDATE_AUTOMATION.js [NEW_CONTRACT_ADDRESS]

Example: node CONTRACT_UPDATE_AUTOMATION.js 0x1234567890123456789012345678901234567890

This script will:
1. 📁 Create a backup of all files
2. 🔄 Update all contract addresses in ${FILES_TO_UPDATE.length} files
3. 📝 Generate environment variable templates
4. 📋 Create deployment summary

Current contract address: ${OLD_CONTRACT_ADDRESS}
`);
    return;
  }

  const newAddress = args[0];
  
  try {
    console.log('🔍 Validating new contract address...');
    validateAddress(newAddress);
    
    console.log('📁 Creating backup...');
    const backupDir = createBackup();
    
    console.log(`🔄 Updating contract addresses from ${OLD_CONTRACT_ADDRESS} to ${newAddress}...`);
    
    const updatedFiles = [];
    let totalUpdated = 0;
    
    FILES_TO_UPDATE.forEach(filePath => {
      if (updateContractAddress(filePath, newAddress)) {
        updatedFiles.push(filePath);
        totalUpdated++;
      }
    });
    
    console.log(`\n✅ Successfully updated ${totalUpdated} files`);
    
    console.log('\n📝 Generating additional files...');
    updateEnvironmentTemplate(newAddress);
    generateDeploymentSummary(newAddress, updatedFiles);
    
    console.log(`
🎉 Contract address update completed successfully!

📊 Summary:
- ✅ Updated ${totalUpdated} files
- 📁 Backup created in: ${backupDir}
- 🔗 New contract: ${newAddress}

🚨 Important Next Steps:
1. Update your .env.local file with the new address
2. Update Vercel environment variables
3. Test the application thoroughly
4. Verify the contract on BaseScan
5. Deploy to production

📄 Check DEPLOYMENT_SUMMARY.md for detailed next steps.
`);

  } catch (error) {
    console.error(`\n❌ Update failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  updateContractAddress,
  validateAddress,
  FILES_TO_UPDATE,
  OLD_CONTRACT_ADDRESS
};

// Run if called directly
if (require.main === module) {
  main();
} 