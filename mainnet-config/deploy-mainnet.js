const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Base Mainnet Deployment - Phase 1 (VIRTUAL only)");
  console.log("=".repeat(60));
  
  // Validate environment
  if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("❌ Missing required environment variables: RPC_URL, PRIVATE_KEY");
  }
  
  // Contract addresses
  const VIRTUAL_TOKEN_ADDRESS = process.env.VIRTUAL_TOKEN_ADDRESS || "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // Real VIRTUAL mainnet
  const VERT_TOKEN_ADDRESS = process.env.VERT_TOKEN_ADDRESS || "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // Placeholder - will be updated in Phase 2
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  
  if (!TREASURY_ADDRESS) {
    throw new Error("❌ TREASURY_ADDRESS environment variable is required");
  }
  
  console.log("📋 Deployment Configuration:");
  console.log("VIRTUAL Token:", VIRTUAL_TOKEN_ADDRESS);
  console.log("VERT Token:", VERT_TOKEN_ADDRESS, "(placeholder - will be updated in Phase 2)");
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("💰 Phase 1 Pricing: 0.1 VIRTUAL (launch price)");
  console.log("💰 Phase 2 Pricing: 0.5 VIRTUAL OR 500 VERT (separate options)");
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
  const VerticalProjectNFT = await hre.ethers.getContractFactory("contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT");

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
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log("Current gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  const estimatedCost = gasEstimate * gasPrice;
  console.log("Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "ETH");
  console.log("");

  // Deploy contract
  console.log("🚀 Deploying VerticalProjectNFT...");
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
  
  // Set correct pricing for mainnet
  console.log("");
  console.log("💰 Setting Phase 1 launch pricing...");
  
  try {
    // Set VIRTUAL price to 0.1 VIRTUAL (0.1 * 10^18) - Launch pricing
    const virtualPrice = hre.ethers.parseEther("0.1");
    console.log("Setting VIRTUAL price to 0.1 VIRTUAL (launch price)...");
    const setPriceVirtualTx = await nft.setPriceVirtual(virtualPrice);
    await setPriceVirtualTx.wait();
    console.log("✅ VIRTUAL price set to 0.1 VIRTUAL");
    
    // Set VERT price to 500 VERT (500 * 10^18) - Ready for Phase 2
    const vertPrice = hre.ethers.parseEther("500");
    console.log("Setting VERT price to 500 VERT (ready for Phase 2)...");
    const setPriceVertTx = await nft.setPriceVert(vertPrice);
    await setPriceVertTx.wait();
    console.log("✅ VERT price set to 500 VERT (ready for Phase 2)");
    
  } catch (error) {
    console.warn("⚠️  Failed to set prices during deployment:", error.message);
    console.log("   You can set prices manually after deployment");
  }
  
  // Verify deployment
  console.log("");
  console.log("🔍 Verifying deployment...");
  
  try {
    // Test basic contract calls
    const name = await nft.name();
    const symbol = await nft.symbol();
    const totalMinted = await nft.getTotalMinted();
    const priceVirtual = await nft.priceVirtual();
    const priceVert = await nft.priceVert();
    const paused = await nft.paused();
    
    console.log("✅ Contract verification successful:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Minted:", totalMinted.toString());
    console.log("   VIRTUAL Price:", hre.ethers.formatEther(priceVirtual), "VIRTUAL");
    console.log("   VERT Price:", hre.ethers.formatEther(priceVert), "VERT");
    console.log("   Paused:", paused);
    
    // Verify constructor parameters
    const virtualToken = await nft.virtualToken();
    const vertToken = await nft.vertToken();
    const treasury = await nft.treasury();
    
    console.log("✅ Constructor parameters verified:");
    console.log("   VIRTUAL Token:", virtualToken);
    console.log("   VERT Token:", vertToken, vertToken === VERT_TOKEN_ADDRESS ? "✅" : "❌");
    console.log("   Treasury:", treasury, treasury === TREASURY_ADDRESS ? "✅" : "❌");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
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
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE - PHASE 1");
  console.log("=".repeat(60));
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network: Base Mainnet (Chain ID: 8453)");
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Deployment Cost:", hre.ethers.formatEther(estimatedCost), "ETH (estimated)");
  console.log("");
  console.log("📝 NEXT STEPS:");
  console.log("1. Update .env.local with contract address:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("");
  console.log("2. Update mainnet.addresses.json");
  console.log("3. Test VIRTUAL minting functionality");
  console.log("4. Deploy frontend to production");
  console.log("5. Monitor for Virtuals Protocol VERT token launch");
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
    console.log("");
    console.log("🏁 Deployment script completed successfully");
    console.log("📊 Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("");
    console.error("💥 Deployment failed:");
    console.error(error);
    process.exit(1);
  }); 