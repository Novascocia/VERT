const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔄 Generating Typechain types...');

  try {
    // Run typechain generation
    execSync('npx hardhat typechain', { stdio: 'inherit' });

    // Verify the generated types
    const typechainDir = path.join(__dirname, '../app/typechain-types');
    const factoryPath = path.join(typechainDir, 'VerticalProjectNFT__factory.ts');

    if (!fs.existsSync(factoryPath)) {
      throw new Error('Typechain types were not generated correctly');
    }

    // Verify the contract ABI is properly exported
    const factoryContent = fs.readFileSync(factoryPath, 'utf8');
    if (!factoryContent.includes('export class VerticalProjectNFT__factory')) {
      throw new Error('Factory class not found in generated types');
    }

    console.log('✅ Typechain types generated successfully!');
    console.log('📁 Types location:', typechainDir);
    console.log('🔍 Verifying imports...');

    // Test the import in contracts.ts
    const contractsPath = path.join(__dirname, '../app/config/contracts.ts');
    const contractsContent = fs.readFileSync(contractsPath, 'utf8');
    
    if (!contractsContent.includes('import { VerticalProjectNFT__factory }')) {
      throw new Error('Import statement not found in contracts.ts');
    }

    console.log('✅ Import verification successful!');
    console.log('\nNext steps:');
    console.log('1. Run the Base Sepolia deployment script');
    console.log('2. Execute the test script');
    console.log('3. Verify contract on Base Sepolia Explorer');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 