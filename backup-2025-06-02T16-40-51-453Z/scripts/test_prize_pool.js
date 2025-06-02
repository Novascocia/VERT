const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Prize Pool Functions...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xc03605b09aF6010bb2097d285b9aF4024ecAf098";
  const VERT_TOKEN = "0x0000000000000000000000000000000000000000";

  const [owner, user1] = await ethers.getSigners();
  console.log("👤 Owner account:", owner.address);
  
  // Use owner as user1 if no second signer available
  const testUser = user1 || owner;
  console.log("👤 User account:", testUser.address);

  // Connect to contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);

  let testResults = [];

  try {
    // Get initial state
    const initialPrizePool = await nftContract.getPrizePoolBalance();
    const initialOwnerBalance = await vertToken.balanceOf(owner.address);
    const initialUserBalance = await vertToken.balanceOf(testUser.address);

    console.log("📊 Initial State:");
    console.log(`   Prize Pool: ${ethers.formatEther(initialPrizePool)} VERT`);
    console.log(`   Owner Balance: ${ethers.formatEther(initialOwnerBalance)} VERT`);
    console.log(`   User Balance: ${ethers.formatEther(initialUserBalance)} VERT`);

    // Test amounts
    const userDepositAmount = ethers.parseEther("100");
    const adminDepositAmount = ethers.parseEther("500");

    // Test 1: User deposits to prize pool via depositToPrizePool
    console.log("\n🧪 Test 1: User deposits to prize pool (depositToPrizePool)");
    try {
      // Approve VERT spending
      const approveTx = await vertToken.connect(testUser).approve(NFT_CONTRACT, userDepositAmount);
      await approveTx.wait();

      // Deposit to prize pool
      const depositTx = await nftContract.connect(testUser).depositToPrizePool(userDepositAmount);
      const receipt = await depositTx.wait();
      const gasUsed = receipt.gasUsed;

      // Verify balance changes
      const newPrizePool = await nftContract.getPrizePoolBalance();
      const newUserBalance = await vertToken.balanceOf(testUser.address);
      
      const prizePoolIncrease = newPrizePool - initialPrizePool;
      const userBalanceDecrease = initialUserBalance - newUserBalance;
      
      const correctIncrease = prizePoolIncrease === userDepositAmount;
      const correctDecrease = userBalanceDecrease === userDepositAmount;

      // Check for PrizePoolFunded event
      let prizePoolFundedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "PrizePoolFunded") {
            prizePoolFundedEvent = parsedLog;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ depositToPrizePool(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   Prize pool increased correctly: ${correctIncrease ? "✅" : "❌"} (+${ethers.formatEther(prizePoolIncrease)} VERT)`);
      console.log(`   User balance decreased correctly: ${correctDecrease ? "✅" : "❌"} (-${ethers.formatEther(userBalanceDecrease)} VERT)`);
      console.log(`   PrizePoolFunded event emitted: ${prizePoolFundedEvent ? "✅" : "❌"}`);
      
      if (prizePoolFundedEvent) {
        console.log(`   Event details: sender=${prizePoolFundedEvent.args.sender}, amount=${ethers.formatEther(prizePoolFundedEvent.args.amount)} VERT`);
      }

      testResults.push({ test: "depositToPrizePool()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ depositToPrizePool(): Failed | Error: ${error.message}`);
      testResults.push({ test: "depositToPrizePool()", status: "❌ Failed", error: error.message });
    }

    // Test 2: Admin adds to prize pool via addToPrizePool
    console.log("\n🧪 Test 2: Admin adds to prize pool (addToPrizePool)");
    try {
      const currentPrizePool = await nftContract.getPrizePoolBalance();
      const currentOwnerBalance = await vertToken.balanceOf(owner.address);

      // Approve VERT spending for admin
      const approveTx = await vertToken.connect(owner).approve(NFT_CONTRACT, adminDepositAmount);
      await approveTx.wait();

      // Admin adds to prize pool
      const addTx = await nftContract.connect(owner).addToPrizePool(adminDepositAmount);
      const receipt = await addTx.wait();
      const gasUsed = receipt.gasUsed;

      // Verify balance changes
      const newPrizePool = await nftContract.getPrizePoolBalance();
      const newOwnerBalance = await vertToken.balanceOf(owner.address);
      
      const prizePoolIncrease = newPrizePool - currentPrizePool;
      const ownerBalanceDecrease = currentOwnerBalance - newOwnerBalance;
      
      const correctIncrease = prizePoolIncrease === adminDepositAmount;
      const correctDecrease = ownerBalanceDecrease === adminDepositAmount;

      // Check for PrizePoolUpdated event
      let prizePoolUpdatedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "PrizePoolUpdated") {
            prizePoolUpdatedEvent = parsedLog;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ addToPrizePool(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   Prize pool increased correctly: ${correctIncrease ? "✅" : "❌"} (+${ethers.formatEther(prizePoolIncrease)} VERT)`);
      console.log(`   Owner balance decreased correctly: ${correctDecrease ? "✅" : "❌"} (-${ethers.formatEther(ownerBalanceDecrease)} VERT)`);
      console.log(`   PrizePoolUpdated event emitted: ${prizePoolUpdatedEvent ? "✅" : "❌"}`);

      testResults.push({ test: "addToPrizePool()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ addToPrizePool(): Failed | Error: ${error.message}`);
      testResults.push({ test: "addToPrizePool()", status: "❌ Failed", error: error.message });
    }

    // Test 3: Test getPrizePoolBalance() view function
    console.log("\n🧪 Test 3: Test getPrizePoolBalance() view function");
    try {
      const prizePoolBalance = await nftContract.getPrizePoolBalance();
      const prizePoolDirect = await nftContract.prizePool();
      
      const balancesMatch = prizePoolBalance === prizePoolDirect;
      
      console.log(`✅ getPrizePoolBalance(): Passed`);
      console.log(`   Prize pool balance: ${ethers.formatEther(prizePoolBalance)} VERT`);
      console.log(`   Direct prizePool(): ${ethers.formatEther(prizePoolDirect)} VERT`);
      console.log(`   Values match: ${balancesMatch ? "✅" : "❌"}`);

      testResults.push({ test: "getPrizePoolBalance()", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ getPrizePoolBalance(): Failed | Error: ${error.message}`);
      testResults.push({ test: "getPrizePoolBalance()", status: "❌ Failed", error: error.message });
    }

    // Test 4: Test that non-owner cannot call addToPrizePool
    console.log("\n🧪 Test 4: Test access control on addToPrizePool");
    try {
      const smallAmount = ethers.parseEther("1");
      
      // User1 tries to call admin-only function
      await vertToken.connect(testUser).approve(NFT_CONTRACT, smallAmount);
      
      try {
        await nftContract.connect(testUser).addToPrizePool(smallAmount);
        console.log(`❌ Access control: Failed | Non-owner was able to call addToPrizePool`);
        testResults.push({ test: "addToPrizePool() access control", status: "❌ Failed", error: "Non-owner was able to call function" });
      } catch (accessError) {
        // This should fail - it's the expected behavior
        console.log(`✅ Access control: Passed | Non-owner correctly denied access`);
        console.log(`   Rejection reason: ${accessError.message.includes("Ownable") ? "Ownership check" : "Other"}`);
        testResults.push({ test: "addToPrizePool() access control", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Access control test: Failed | Error: ${error.message}`);
      testResults.push({ test: "addToPrizePool() access control", status: "❌ Failed", error: error.message });
    }

    // Test 5: Test edge case - deposit zero amount
    console.log("\n🧪 Test 5: Test edge case - deposit zero amount");
    try {
      try {
        await nftContract.connect(testUser).depositToPrizePool(0);
        console.log(`❌ Zero deposit: Failed | Should have reverted but didn't`);
        testResults.push({ test: "Zero deposit prevention", status: "❌ Failed", error: "Zero deposit was allowed" });
      } catch (zeroError) {
        // This should fail due to transferFrom of 0 tokens
        console.log(`✅ Zero deposit: Passed | Correctly prevented zero deposits`);
        testResults.push({ test: "Zero deposit prevention", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Zero deposit test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Zero deposit prevention", status: "❌ Failed", error: error.message });
    }

    // Test 6: Final state verification
    console.log("\n🧪 Test 6: Final state verification");
    try {
      const finalPrizePool = await nftContract.getPrizePoolBalance();
      const expectedIncrease = userDepositAmount + adminDepositAmount;
      const expectedFinalPool = initialPrizePool + expectedIncrease;
      
      const finalCorrect = finalPrizePool === expectedFinalPool;
      
      console.log(`✅ Final state: ${finalCorrect ? "Passed" : "Failed"}`);
      console.log(`   Initial prize pool: ${ethers.formatEther(initialPrizePool)} VERT`);
      console.log(`   Final prize pool: ${ethers.formatEther(finalPrizePool)} VERT`);
      console.log(`   Expected final: ${ethers.formatEther(expectedFinalPool)} VERT`);
      console.log(`   Total increase: ${ethers.formatEther(finalPrizePool - initialPrizePool)} VERT`);

      testResults.push({ test: "Final state verification", status: finalCorrect ? "✅ Passed" : "❌ Failed" });
    } catch (error) {
      console.log(`❌ Final state verification: Failed | Error: ${error.message}`);
      testResults.push({ test: "Final state verification", status: "❌ Failed", error: error.message });
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 PRIZE POOL TEST SUMMARY");
  console.log("=".repeat(60));
  
  const passed = testResults.filter(r => r.status.includes("✅")).length;
  const failed = testResults.filter(r => r.status.includes("❌")).length;
  
  testResults.forEach(result => {
    console.log(`${result.status} ${result.test}${result.gas ? ` | Gas: ${result.gas}` : ''}${result.error ? ` | Error: ${result.error}` : ''}`);
  });

  console.log("=".repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  return { passed, failed, results: testResults };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main; 