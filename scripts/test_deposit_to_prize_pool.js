const { ethers } = require("hardhat");
const { expect } = require("chai");

async function main() {
  console.log("🧪 Testing depositToPrizePool function...\n");

  // Get signers
  const [deployer, user1] = await ethers.getSigners();
  console.log("📋 Deployer:", deployer.address);
  console.log("👤 Test User:", user1.address);

  // Contract addresses (testnet)
  const NFT_CONTRACT = "0xD77dDA7b71b0fF0D1597dbEDfd11a3aAEd8B74a2";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Connect to deployed contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);

  console.log("\n🔍 Initial State:");
  
  // Get initial prize pool
  const initialPrizePool = await nftContract.getPrizePoolBalance();
  console.log("💰 Initial Prize Pool:", ethers.formatEther(initialPrizePool), "VERT");

  // Get user1's VERT balance
  const userBalance = await vertToken.balanceOf(user1.address);
  console.log("👤 User1 VERT Balance:", ethers.formatEther(userBalance), "VERT");

  // Test deposit amount
  const depositAmount = ethers.parseEther("100"); // 100 VERT
  console.log("📤 Deposit Amount:", ethers.formatEther(depositAmount), "VERT");

  try {
    // Step 1: Approve the NFT contract to spend VERT
    console.log("\n📝 Step 1: Approving VERT spending...");
    const approveTx = await vertToken.connect(user1).approve(NFT_CONTRACT, depositAmount);
    await approveTx.wait();
    console.log("✅ Approval transaction confirmed");

    // Verify allowance
    const allowance = await vertToken.allowance(user1.address, NFT_CONTRACT);
    console.log("✅ Allowance set:", ethers.formatEther(allowance), "VERT");

    // Step 2: Call depositToPrizePool
    console.log("\n💰 Step 2: Depositing to prize pool...");
    const depositTx = await nftContract.connect(user1).depositToPrizePool(depositAmount);
    const receipt = await depositTx.wait();
    console.log("✅ Deposit transaction confirmed");

    // Step 3: Verify prize pool increased
    console.log("\n🔍 Step 3: Verifying results...");
    const finalPrizePool = await nftContract.getPrizePoolBalance();
    const expectedPrizePool = initialPrizePool + depositAmount;
    
    console.log("💰 Final Prize Pool:", ethers.formatEther(finalPrizePool), "VERT");
    console.log("💰 Expected Prize Pool:", ethers.formatEther(expectedPrizePool), "VERT");
    console.log("💰 Increase:", ethers.formatEther(finalPrizePool - initialPrizePool), "VERT");

    // Assert prize pool increased correctly
    if (finalPrizePool.toString() === expectedPrizePool.toString()) {
      console.log("✅ Prize pool increased correctly!");
    } else {
      console.log("❌ Prize pool increase mismatch!");
      return;
    }

    // Step 4: Verify event was emitted
    console.log("\n📡 Step 4: Checking events...");
    const events = receipt.logs;
    let foundEvent = false;
    
    for (const log of events) {
      try {
        const parsedLog = nftContract.interface.parseLog(log);
        if (parsedLog.name === "PrizePoolFunded") {
          console.log("✅ PrizePoolFunded event found!");
          console.log("   - Sender:", parsedLog.args.sender);
          console.log("   - Amount:", ethers.formatEther(parsedLog.args.amount), "VERT");
          
          if (parsedLog.args.sender === user1.address && 
              parsedLog.args.amount.toString() === depositAmount.toString()) {
            console.log("✅ Event data is correct!");
            foundEvent = true;
          } else {
            console.log("❌ Event data mismatch!");
          }
          break;
        }
      } catch (e) {
        // Log might not be from our contract
        continue;
      }
    }

    if (!foundEvent) {
      console.log("❌ PrizePoolFunded event not found!");
      return;
    }

    // Step 5: Verify user's balance decreased
    console.log("\n👤 Step 5: Checking user balance...");
    const finalUserBalance = await vertToken.balanceOf(user1.address);
    const expectedUserBalance = userBalance - depositAmount;
    
    console.log("👤 Final User Balance:", ethers.formatEther(finalUserBalance), "VERT");
    console.log("👤 Expected User Balance:", ethers.formatEther(expectedUserBalance), "VERT");

    if (finalUserBalance.toString() === expectedUserBalance.toString()) {
      console.log("✅ User balance decreased correctly!");
    } else {
      console.log("❌ User balance decrease mismatch!");
      return;
    }

    console.log("\n🎉 ALL TESTS PASSED! 🎉");
    console.log("✅ VERT transfer successful");
    console.log("✅ Prize pool increased correctly");
    console.log("✅ PrizePoolFunded event emitted");
    console.log("✅ User balance decreased correctly");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    
    // Additional error handling for common issues
    if (error.message.includes("insufficient allowance")) {
      console.log("💡 Tip: Make sure the user has approved enough VERT tokens");
    } else if (error.message.includes("transfer amount exceeds balance")) {
      console.log("💡 Tip: Make sure the user has enough VERT tokens");
    } else if (error.message.includes("execution reverted")) {
      console.log("💡 Tip: Check if the contract addresses are correct");
    }
  }
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 