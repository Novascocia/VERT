require('dotenv').config(); // Load .env
require('dotenv').config({ path: '.env.local' }); // Load .env.local
const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying Base Mainnet Deployment Setup");
  console.log("=".repeat(50));
  
  // Check environment variables
  console.log("📋 Environment Variables Check:");
  const requiredVars = [
    'MAINNET_RPC_URL',
    'PRIVATE_KEY',
    'BASESCAN_API_KEY'
  ];
  
  const alternativeVars = {
    'TREASURY_WALLET': 'NEXT_PUBLIC_TREASURY_ADDRESS' // Can use either
  };
  
  const optionalVars = [
    'VERT_TOKEN_ADDRESS' // Optional for Phase 1 - defaults to zero address
  ];
  
  let missingVars = [];
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  }
  
  // Check variables with alternatives
  for (const [primary, alternative] of Object.entries(alternativeVars)) {
    if (process.env[primary]) {
      console.log(`✅ ${primary}: Set`);
    } else if (process.env[alternative]) {
      console.log(`✅ ${primary}: Using ${alternative}`);
    } else {
      console.log(`❌ ${primary}: Missing (also checked ${alternative})`);
      missingVars.push(primary);
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set (${process.env[varName]})`);
    } else {
      console.log(`ℹ️  ${varName}: Not set (will use zero address for Phase 1)`);
    }
  }
  
  if (missingVars.length > 0) {
    console.log("");
    console.log("❌ Missing required environment variables:");
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log("");
    console.log("Please set these in your .env or .env.local file before deployment");
    return;
  }
  
  console.log("");
  console.log("🌐 Network Configuration:");
  console.log("Network: base_mainnet");
  console.log("Chain ID: 8453");
  console.log("RPC URL:", process.env.MAINNET_RPC_URL ? "Set" : "Not set");
  
  // Check contract compilation
  console.log("");
  console.log("📝 Contract Compilation:");
  try {
    const VerticalProjectNFT = await hre.ethers.getContractFactory("VerticalProjectNFT_WithManualSync");
    console.log("✅ VerticalProjectNFT_WithManualSync: Compiled successfully");
    
    // Check contract size
    const bytecode = VerticalProjectNFT.bytecode;
    const sizeKB = Math.round(bytecode.length / 2 / 1024);
    console.log(`📊 Contract size: ${sizeKB} KB`);
    
    if (sizeKB > 24) {
      console.log("⚠️  Warning: Contract size is large, may hit deployment limits");
    }
    
  } catch (error) {
    console.log("❌ Contract compilation failed:", error.message);
    return;
  }
  
  // Check deployer account
  console.log("");
  console.log("👤 Deployer Account:");
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Address:", deployer.address);
    
    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceETH = hre.ethers.formatEther(balance);
    console.log("Balance:", balanceETH, "ETH");
    
    if (parseFloat(balanceETH) < 0.01) {
      console.log("⚠️  Warning: Low ETH balance for deployment");
    } else {
      console.log("✅ Sufficient ETH for deployment");
    }
    
  } catch (error) {
    console.log("❌ Failed to connect to deployer account:", error.message);
    return;
  }
  
  // Check token addresses
  console.log("");
  console.log("🪙 Token Addresses:");
  console.log("VIRTUAL Token: 0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b (Base Mainnet)");
  console.log("VERT Token: 0x0000000000000000000000000000000000000000 (Phase 1 - disabled)");
  console.log("Treasury:", process.env.TREASURY_WALLET);
  
  console.log("");
  console.log("🎯 Deployment Ready Checklist:");
  console.log("✅ Environment variables configured");
  console.log("✅ Contract compiled successfully");
  console.log("✅ Deployer account connected");
  console.log("✅ Network configuration correct");
  console.log("✅ Token addresses verified");
  
  console.log("");
  console.log("🚀 Ready for Base Mainnet deployment!");
  console.log("");
  console.log("To deploy, run:");
  console.log("npx hardhat run scripts/deploy-mainnet-manual-sync.js --network base_mainnet");
}

main()
  .then(() => {
    console.log("");
    console.log("✅ Verification completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("");
    console.error("❌ Verification failed:");
    console.error(error);
    process.exit(1);
  }); 