const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Example: Depositing VERT to Prize Pool\n");

  // Get the signer (first account from hardhat)
  const [signer] = await ethers.getSigners();
  console.log("👤 Depositor:", signer.address);

  // Contract addresses (update these for your network)
  const NFT_CONTRACT = "0xD77dDA7b71b0fF0D1597dbEDfd11a3aAEd8B74a2"; // Testnet
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";   // Testnet

  // Connect to contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);

  // Amount to deposit (adjust as needed)
  const depositAmount = ethers.parseEther("50"); // 50 VERT
  console.log("📤 Deposit Amount:", ethers.formatEther(depositAmount), "VERT");

  try {
    // Check current balance and prize pool
    const balance = await vertToken.balanceOf(signer.address);
    const currentPrizePool = await nftContract.getPrizePoolBalance();
    
    console.log("💰 Your VERT Balance:", ethers.formatEther(balance), "VERT");
    console.log("🏆 Current Prize Pool:", ethers.formatEther(currentPrizePool), "VERT");

    if (balance < depositAmount) {
      console.log("❌ Insufficient VERT balance");
      return;
    }

    // Step 1: Approve spending
    console.log("\n📝 Approving VERT spending...");
    const approveTx = await vertToken.approve(NFT_CONTRACT, depositAmount);
    await approveTx.wait();
    console.log("✅ Approval confirmed");

    // Step 2: Deposit to prize pool
    console.log("\n💰 Depositing to prize pool...");
    const depositTx = await nftContract.depositToPrizePool(depositAmount);
    const receipt = await depositTx.wait();
    console.log("✅ Deposit confirmed!");
    console.log("📄 Transaction Hash:", depositTx.hash);

    // Step 3: Verify the results
    const newPrizePool = await nftContract.getPrizePoolBalance();
    console.log("\n🏆 New Prize Pool:", ethers.formatEther(newPrizePool), "VERT");
    console.log("📈 Increase:", ethers.formatEther(newPrizePool - currentPrizePool), "VERT");

    // Show the event
    for (const log of receipt.logs) {
      try {
        const parsedLog = nftContract.interface.parseLog(log);
        if (parsedLog.name === "PrizePoolFunded") {
          console.log("\n📡 Event Emitted:");
          console.log("   - Event: PrizePoolFunded");
          console.log("   - Sender:", parsedLog.args.sender);
          console.log("   - Amount:", ethers.formatEther(parsedLog.args.amount), "VERT");
        }
      } catch (e) {
        // Ignore logs from other contracts
      }
    }

    console.log("\n🎉 Successfully deposited to prize pool!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 