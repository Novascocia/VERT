const hre = require("hardhat");

class PrizePoolMonitor {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 60000; // Check every 60 seconds
    this.contractAddress = "0x9114420a6e77E41784590a9D2eE66AE3751F434c";
    this.vertTokenAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // VIRTUAL token address
    this.lastCheck = null;
    this.syncHistory = [];
  }

  async initialize() {
    console.log("🔍 Initializing Prize Pool Monitor...");
    
    // Get contract instances
    this.nftContract = await hre.ethers.getContractAt(
      "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
      this.contractAddress
    );
    
    this.vertToken = await hre.ethers.getContractAt(
      "IERC20", 
      this.vertTokenAddress
    );

    // Get signer (deployer wallet)
    const [signer] = await hre.ethers.getSigners();
    this.signer = signer;
    
    console.log(`📝 Using admin wallet: ${signer.address}`);
    console.log(`📋 NFT Contract: ${this.contractAddress}`);
    console.log(`🪙 VERT Token: ${this.vertTokenAddress}`);
    
    // Verify we're the owner
    const owner = await this.nftContract.owner();
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(`❌ Not the contract owner! Owner: ${owner}, You: ${signer.address}`);
    }
    
    console.log("✅ Admin privileges verified");
  }

  async checkForUnaccountedTokens() {
    try {
      // Get actual VERT balance of the contract
      const actualBalance = await this.vertToken.balanceOf(this.contractAddress);
      
      // Get recorded prize pool amount
      const recordedPrizePool = await this.nftContract.getPrizePoolBalance();
      
      const actualBalanceFormatted = hre.ethers.formatEther(actualBalance);
      const recordedPrizePoolFormatted = hre.ethers.formatEther(recordedPrizePool);
      
      console.log(`\n📊 Balance Check (${new Date().toLocaleTimeString()})`);
      console.log(`   Actual VERT Balance: ${actualBalanceFormatted}`);
      console.log(`   Recorded Prize Pool: ${recordedPrizePoolFormatted}`);
      
      // Check if there are unaccounted tokens
      if (actualBalance > recordedPrizePool) {
        const unaccountedAmount = actualBalance - recordedPrizePool;
        const unaccountedFormatted = hre.ethers.formatEther(unaccountedAmount);
        
        console.log(`🚨 UNACCOUNTED TOKENS DETECTED: ${unaccountedFormatted} VERT`);
        
        // Auto-sync if the amount is significant (> 0.001 VERT to avoid dust)
        if (unaccountedAmount > hre.ethers.parseEther("0.001")) {
          await this.syncUnaccountedTokens(unaccountedAmount);
        } else {
          console.log(`   Amount too small to sync (dust): ${unaccountedFormatted} VERT`);
        }
      } else if (actualBalance < recordedPrizePool) {
        const deficit = recordedPrizePool - actualBalance;
        const deficitFormatted = hre.ethers.formatEther(deficit);
        console.log(`⚠️ WARNING: Recorded pool > actual balance by ${deficitFormatted} VERT`);
      } else {
        console.log(`✅ Balances match perfectly`);
      }
      
      this.lastCheck = new Date();
      
    } catch (error) {
      console.error(`❌ Error during balance check:`, error.message);
    }
  }

  async syncUnaccountedTokens(amount) {
    try {
      const amountFormatted = hre.ethers.formatEther(amount);
      console.log(`🔄 Syncing ${amountFormatted} VERT to prize pool...`);
      
      // The addToPrizePool function expects us to transfer tokens FROM our wallet TO the contract
      // But the tokens are already IN the contract, so we need a different approach
      
      // Since tokens are already in the contract, we can't use addToPrizePool
      // We need to just update the prizePool variable by withdrawing the difference first
      
      console.log(`⚠️ MANUAL SYNC REQUIRED`);
      console.log(`📋 Steps to manually sync:`);
      console.log(`   1. Someone sent ${amountFormatted} VERT directly to the contract`);
      console.log(`   2. You need to manually adjust the prize pool`);
      console.log(`   3. Or implement a custom sync function in the contract`);
      
      // Log this event for admin review
      this.syncHistory.push({
        timestamp: new Date(),
        amount: amountFormatted,
        status: 'MANUAL_SYNC_REQUIRED',
        txHash: null
      });
      
      // TODO: For now, we can't auto-sync because addToPrizePool expects us to send tokens FROM wallet
      // In a future contract version, we'd add a syncPrizePool function
      
    } catch (error) {
      console.error(`❌ Error during sync:`, error.message);
      
      this.syncHistory.push({
        timestamp: new Date(),
        amount: hre.ethers.formatEther(amount),
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async start() {
    if (this.isRunning) {
      console.log("Monitor is already running");
      return;
    }
    
    await this.initialize();
    this.isRunning = true;
    
    console.log(`🚀 Prize Pool Monitor started (checking every ${this.checkInterval/1000}s)`);
    console.log("Press Ctrl+C to stop\n");
    
    // Initial check
    await this.checkForUnaccountedTokens();
    
    // Set up periodic checking
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.checkForUnaccountedTokens();
      }
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    console.log("\n🛑 Prize Pool Monitor stopped");
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      syncHistory: this.syncHistory,
      checkInterval: this.checkInterval
    };
  }
}

async function main() {
  const monitor = new PrizePoolMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });
  
  try {
    await monitor.start();
  } catch (error) {
    console.error("❌ Failed to start monitor:", error.message);
    process.exit(1);
  }
}

// Export for use in other scripts or as a module
module.exports = { PrizePoolMonitor };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 