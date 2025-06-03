const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Manual Sync Functionality...");
  
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    throw new Error("❌ CONTRACT_ADDRESS environment variable is required");
  }
  
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  
  // Get deployer (admin)
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Admin account:", deployer.address);
  
  // Connect to contract
  const nftContract = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_WithManualSync.sol:VerticalProjectNFT",
    CONTRACT_ADDRESS
  );
  
  console.log("\n📊 Contract State Analysis:");
  
  try {
    // Check current prize pool
    const prizePool = await nftContract.getPrizePoolBalance();
    console.log("Prize Pool (tracked):", hre.ethers.formatEther(prizePool), "VERT");
    
    // Check unaccounted balance (new function)
    const unaccountedBalance = await nftContract.getUnaccountedBalance();
    console.log("Unaccounted Balance:", hre.ethers.formatEther(unaccountedBalance), "VERT");
    
    // Check actual VERT token balance of contract
    const vertTokenAddress = await nftContract.vertToken();
    console.log("VERT Token Address:", vertTokenAddress);
    
    if (vertTokenAddress !== "0x0000000000000000000000000000000000000000") {
      const vertToken = await hre.ethers.getContractAt("IERC20", vertTokenAddress);
      const actualBalance = await vertToken.balanceOf(CONTRACT_ADDRESS);
      console.log("Actual VERT Balance:", hre.ethers.formatEther(actualBalance), "VERT");
      
      // Calculate difference
      const difference = actualBalance - prizePool;
      console.log("Difference (unsynced):", hre.ethers.formatEther(difference), "VERT");
      
      if (unaccountedBalance > 0n) {
        console.log("\n🔄 Testing syncPrizePool function...");
        
        // Test the sync function
        const tx = await nftContract.syncPrizePool();
        console.log("⏳ Sync transaction submitted:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Sync transaction confirmed in block:", receipt.blockNumber);
        
        // Check for PrizePoolSynced event
        const logs = receipt.logs;
        for (const log of logs) {
          try {
            const parsed = nftContract.interface.parseLog(log);
            if (parsed.name === "PrizePoolSynced") {
              console.log("🎯 PrizePoolSynced event emitted:");
              console.log("  Unaccounted Amount:", hre.ethers.formatEther(parsed.args.unaccountedAmount), "VERT");
              console.log("  New Prize Pool:", hre.ethers.formatEther(parsed.args.newPrizePool), "VERT");
            }
          } catch (e) {
            // Ignore logs that can't be parsed
          }
        }
        
        // Verify sync worked
        const newPrizePool = await nftContract.getPrizePoolBalance();
        const newUnaccountedBalance = await nftContract.getUnaccountedBalance();
        
        console.log("\n📊 After Sync:");
        console.log("Prize Pool (tracked):", hre.ethers.formatEther(newPrizePool), "VERT");
        console.log("Unaccounted Balance:", hre.ethers.formatEther(newUnaccountedBalance), "VERT");
        
        if (newUnaccountedBalance === 0n) {
          console.log("✅ Sync successful - all VERT tokens now tracked in prize pool!");
        } else {
          console.log("❌ Sync may have failed - unaccounted balance still exists");
        }
        
      } else {
        console.log("✅ No unaccounted VERT tokens found - sync not needed");
      }
      
    } else {
      console.log("⚠️ VERT token not set (Phase 1 - VIRTUAL only)");
    }
    
  } catch (error) {
    console.error("❌ Error testing manual sync:", error.message);
  }
  
  console.log("\n🧪 Manual Sync Test Complete!");
}

main()
  .then(() => {
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }); 