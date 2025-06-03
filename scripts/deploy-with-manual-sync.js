const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying New Vertical Project NFT Contract (With Manual Sync)...");
  console.log("=".repeat(70));
  
  // Use same token addresses as current working contract
  const VIRTUAL_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // Real VIRTUAL mainnet
  const VERT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // address(0) for now
  const TREASURY_ADDRESS = process.env.TREASURY_WALLET || "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";
  
  console.log("📋 Deployment Configuration:");
  console.log("VIRTUAL Token:", VIRTUAL_TOKEN_ADDRESS);
  console.log("VERT Token:", VERT_TOKEN_ADDRESS, "(Phase 1 - disabled)");
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low ETH balance for gas fees");
  }
  console.log("");

  // Get contract factory
  console.log("🔧 Getting contract factory...");
  const VerticalProjectNFT = await hre.ethers.getContractFactory(
    "contracts/VerticalProjectNFT_WithManualSync.sol:VerticalProjectNFT"
  );

  // Estimate deployment gas
  console.log("⛽ Estimating deployment gas...");
  const deploymentData = VerticalProjectNFT.interface.encodeDeploy([
    VIRTUAL_TOKEN_ADDRESS,
    VERT_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  ]);
  
  const gasEstimate = await hre.ethers.provider.estimateGas({
    data: deploymentData
  });
  
  console.log("Gas estimate:", gasEstimate.toString());
  
  // Get current gas price
  const gasPrice = await hre.ethers.provider.getGasPrice();
  console.log("Current gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  const estimatedCost = gasEstimate * gasPrice;
  console.log("Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "ETH");
  console.log("");

  // Deploy contract
  console.log("🚀 Deploying VerticalProjectNFT (With Manual Sync)...");
  const startTime = Date.now();
  
  const nft = await VerticalProjectNFT.deploy(
    VIRTUAL_TOKEN_ADDRESS,
    VERT_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await nft.waitForDeployment();
  
  const deploymentTime = (Date.now() - startTime) / 1000;
  const contractAddress = await nft.getAddress();
  
  console.log("");
  console.log("✅ Deployment successful!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("⏱️  Deployment time:", deploymentTime, "seconds");
  console.log("🔗 Transaction hash:", nft.deploymentTransaction().hash);
  
  // Verify deployment by testing new functions
  console.log("");
  console.log("🔍 Verifying new manual sync functionality...");
  
  try {
    // Test getUnaccountedBalance function
    const unaccountedBalance = await nft.getUnaccountedBalance();
    console.log("✅ getUnaccountedBalance():", hre.ethers.formatEther(unaccountedBalance), "VERT");
    
    // Test other critical functions
    const prizePool = await nft.getPrizePoolBalance();
    const totalMinted = await nft.getTotalMinted();
    const priceVirtual = await nft.priceVirtual();
    const priceVert = await nft.priceVert();
    
    console.log("✅ Prize Pool Balance:", hre.ethers.formatEther(prizePool), "VERT");
    console.log("✅ Total Minted:", totalMinted.toString());
    console.log("✅ VIRTUAL Price:", hre.ethers.formatEther(priceVirtual), "VIRTUAL");
    console.log("✅ VERT Price:", hre.ethers.formatEther(priceVert), "VERT");
    
    console.log("✅ All contract functions verified successfully!");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
  }

  // Verify initial prices are same as current contract
  console.log("");
  console.log("🔍 Verifying price configuration matches current contract...");
  
  try {
    // These should match the current working contract
    const expectedVirtualPrice = hre.ethers.parseEther("0.01"); // Current price
    const expectedVertPrice = hre.ethers.parseEther("500");      // Current price
    
    const actualVirtualPrice = await nft.priceVirtual();
    const actualVertPrice = await nft.priceVert();
    
    console.log("Expected VIRTUAL price:", hre.ethers.formatEther(expectedVirtualPrice));
    console.log("Actual VIRTUAL price:", hre.ethers.formatEther(actualVirtualPrice));
    console.log("Expected VERT price:", hre.ethers.formatEther(expectedVertPrice));
    console.log("Actual VERT price:", hre.ethers.formatEther(actualVertPrice));
    
    // Note: Prices will be different because contract starts with default values
    console.log("⚠️  Note: Contract starts with default prices - use setPrices() to match current");
    
  } catch (error) {
    console.error("❌ Error checking prices:", error.message);
  }

  // BaseScan verification
  if (process.env.BASESCAN_API_KEY) {
    console.log("");
    console.log("📝 Submitting for BaseScan verification...");
    console.log("⏳ Waiting 30 seconds for block confirmations...");
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          VIRTUAL_TOKEN_ADDRESS,
          VERT_TOKEN_ADDRESS,
          TREASURY_ADDRESS
        ],
      });
      console.log("✅ Contract verified on BaseScan!");
    } catch (error) {
      console.log("⚠️  BaseScan verification failed:", error.message);
      console.log("   You can verify manually at: https://basescan.org/verifyContract");
    }
  } else {
    console.log("⚠️  BASESCAN_API_KEY not set, skipping automatic verification");
  }

  // Final summary
  console.log("");
  console.log("🎉 NEW CONTRACT DEPLOYMENT COMPLETE");
  console.log("=".repeat(70));
  console.log("📍 NEW Contract Address:", contractAddress);
  console.log("📍 OLD Contract Address: 0xc03605b09aF6010bb2097d285b9aF4024ecAf098");
  console.log("🌐 Network: Base Mainnet (Chain ID: 8453)");
  console.log("👤 Deployer:", deployer.address);
  console.log("");
  console.log("🆕 NEW FEATURES:");
  console.log("✅ syncPrizePool() - Manual sync function for admin");
  console.log("✅ getUnaccountedBalance() - View unsynced VERT tokens");
  console.log("✅ PrizePoolSynced event - Emitted when sync occurs");
  console.log("");
  console.log("📝 NEXT STEPS:");
  console.log("1. Update environment variables:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("");
  console.log("2. Update hardcoded contract address in frontend:");
  console.log("   app/page.tsx line ~45");
  console.log("   utils/generateAndStoreNFT.ts line ~227");
  console.log("");
  console.log("3. Set correct mint prices:");
  console.log("   npx hardhat run scripts/set-mint-prices.js --network base");
  console.log("");
  console.log("4. Test manual sync functionality:");
  console.log("   - Send VERT directly to contract");
  console.log("   - Call getUnaccountedBalance()");
  console.log("   - Call syncPrizePool()");
  console.log("");
  console.log("🔗 View on BaseScan:");
  console.log(`   https://basescan.org/address/${contractAddress}`);
  
  return {
    contractAddress,
    deploymentTransaction: nft.deploymentTransaction().hash,
    deploymentTime,
    gasUsed: gasEstimate,
    deployer: deployer.address
  };
}

main()
  .then((result) => {
    console.log(`\n🎉 Deployment completed! New Contract: ${result.contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 