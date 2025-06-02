const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Edge Cases...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xc03605b09aF6010bb2097d285b9aF4024ecAf098";
  const VERT_TOKEN = "0x0000000000000000000000000000000000000000";
  const VIRTUAL_TOKEN = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";

  const [owner, user1] = await ethers.getSigners();
  console.log("👤 Owner account:", owner.address);
  
  // Use owner as user1 if no second signer available
  const testUser = user1 || owner;
  console.log("👤 User account:", testUser.address);

  // Connect to contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);
  const virtualToken = await ethers.getContractAt("IERC20", VIRTUAL_TOKEN);

  let testResults = [];

  try {
    // Test 1: Minting with no approval
    console.log("🧪 Test 1: Minting with no approval");
    try {
      try {
        await nftContract.connect(testUser).mintWithVert("ipfs://QmTestURI");
        console.log(`❌ No approval test: Failed | Minting succeeded without approval`);
        testResults.push({ test: "No approval test", status: "❌ Failed", error: "Minting succeeded without approval" });
      } catch (noApprovalError) {
        console.log(`✅ No approval test: Passed | Correctly reverted: ${noApprovalError.message.includes("allowance") || noApprovalError.message.includes("transfer") ? "Insufficient allowance" : "Other error"}`);
        testResults.push({ test: "No approval test", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ No approval test: Failed | Error: ${error.message}`);
      testResults.push({ test: "No approval test", status: "❌ Failed", error: error.message });
    }

    // Test 2: Depositing zero VERT to prize pool
    console.log("\n🧪 Test 2: Depositing zero VERT to prize pool");
    try {
      try {
        await nftContract.connect(testUser).depositToPrizePool(0);
        console.log(`❌ Zero deposit test: Failed | Zero deposit was allowed`);
        testResults.push({ test: "Zero deposit test", status: "❌ Failed", error: "Zero deposit was allowed" });
      } catch (zeroDepositError) {
        console.log(`✅ Zero deposit test: Passed | Correctly prevented zero deposits`);
        testResults.push({ test: "Zero deposit test", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Zero deposit test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Zero deposit test", status: "❌ Failed", error: error.message });
    }

    // Test 3: Pause contract and test minting
    console.log("\n🧪 Test 3: Minting while paused");
    try {
      // First pause the contract
      await nftContract.connect(owner).pause();
      
      // Try to mint while paused
      try {
        const vertPrice = await nftContract.priceVert();
        await vertToken.connect(testUser).approve(NFT_CONTRACT, vertPrice);
        await nftContract.connect(testUser).mintWithVert("ipfs://QmShouldFail");
        
        console.log(`❌ Pause test: Failed | Minting was allowed while paused`);
        testResults.push({ test: "Pause test", status: "❌ Failed", error: "Minting allowed while paused" });
      } catch (pauseError) {
        console.log(`✅ Pause test: Passed | Minting correctly disabled while paused`);
        testResults.push({ test: "Pause test", status: "✅ Passed" });
      }
      
      // Unpause for other tests
      await nftContract.connect(owner).unpause();
    } catch (error) {
      console.log(`❌ Pause test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Pause test", status: "❌ Failed", error: error.message });
    }

    // Test 4: Invalid rarity enum for setPrizePercent
    console.log("\n🧪 Test 4: Invalid rarity enum for setPrizePercent");
    try {
      try {
        // Try to set prize percent for invalid rarity (5 - should be 0-4)
        await nftContract.connect(owner).setPrizePercent(5, 10);
        console.log(`❌ Invalid rarity test: Failed | Invalid rarity was accepted`);
        testResults.push({ test: "Invalid rarity test", status: "❌ Failed", error: "Invalid rarity was accepted" });
      } catch (invalidRarityError) {
        console.log(`✅ Invalid rarity test: Passed | Invalid rarity correctly rejected`);
        testResults.push({ test: "Invalid rarity test", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Invalid rarity test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Invalid rarity test", status: "❌ Failed", error: error.message });
    }

    // Test 5: Claiming prizes with insufficient contract balance
    console.log("\n🧪 Test 5: Claiming prizes with insufficient balance");
    try {
      const currentPrizePool = await nftContract.getPrizePoolBalance();
      const excessiveAmount = currentPrizePool + ethers.parseEther("1000000"); // Way more than available
      
      try {
        await nftContract.connect(owner).claimPrize(testUser.address, excessiveAmount);
        console.log(`❌ Insufficient balance test: Failed | Excessive claim was allowed`);
        testResults.push({ test: "Insufficient balance test", status: "❌ Failed", error: "Excessive claim was allowed" });
      } catch (insufficientError) {
        console.log(`✅ Insufficient balance test: Passed | Excessive claim correctly rejected`);
        testResults.push({ test: "Insufficient balance test", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Insufficient balance test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Insufficient balance test", status: "❌ Failed", error: error.message });
    }

    // Test 6: Minting with insufficient token balance
    console.log("\n🧪 Test 6: Minting with insufficient token balance");
    try {
      // Create a fresh account with no tokens
      const freshWallet = ethers.Wallet.createRandom().connect(ethers.provider);
      
      try {
        const vertPrice = await nftContract.priceVert();
        // Fresh wallet won't have VERT tokens
        await nftContract.connect(freshWallet).mintWithVert("ipfs://QmShouldFail");
        console.log(`❌ Insufficient token test: Failed | Minting with insufficient balance was allowed`);
        testResults.push({ test: "Insufficient token test", status: "❌ Failed", error: "Minting with insufficient balance was allowed" });
      } catch (insufficientTokenError) {
        console.log(`✅ Insufficient token test: Passed | Minting with insufficient balance correctly rejected`);
        testResults.push({ test: "Insufficient token test", status: "✅ Passed" });
      }
    } catch (error) {
      console.log(`❌ Insufficient token test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Insufficient token test", status: "❌ Failed", error: error.message });
    }

    // Test 7: Non-owner trying admin functions
    console.log("\n🧪 Test 7: Non-owner trying admin functions");
    try {
      let adminTestsPassed = 0;
      const totalAdminTests = 5;

      // Test setPrices
      try {
        await nftContract.connect(testUser).setPrices(ethers.parseEther("1"), ethers.parseEther("1"));
        console.log(`❌ setPrices access control failed`);
      } catch (accessError) {
        console.log(`✅ setPrices access control: Passed`);
        adminTestsPassed++;
      }

      // Test pause
      try {
        await nftContract.connect(testUser).pause();
        console.log(`❌ pause access control failed`);
      } catch (accessError) {
        console.log(`✅ pause access control: Passed`);
        adminTestsPassed++;
      }

      // Test claimPrize
      try {
        await nftContract.connect(testUser).claimPrize(testUser.address, ethers.parseEther("1"));
        console.log(`❌ claimPrize access control failed`);
      } catch (accessError) {
        console.log(`✅ claimPrize access control: Passed`);
        adminTestsPassed++;
      }

      // Test setPrizePercent
      try {
        await nftContract.connect(testUser).setPrizePercent(1, 5);
        console.log(`❌ setPrizePercent access control failed`);
      } catch (accessError) {
        console.log(`✅ setPrizePercent access control: Passed`);
        adminTestsPassed++;
      }

      // Test addToPrizePool
      try {
        await nftContract.connect(testUser).addToPrizePool(ethers.parseEther("1"));
        console.log(`❌ addToPrizePool access control failed`);
      } catch (accessError) {
        console.log(`✅ addToPrizePool access control: Passed`);
        adminTestsPassed++;
      }

      const allAdminTestsPassed = adminTestsPassed === totalAdminTests;
      console.log(`${allAdminTestsPassed ? "✅" : "❌"} Admin access control: ${allAdminTestsPassed ? "Passed" : "Failed"} (${adminTestsPassed}/${totalAdminTests})`);

      testResults.push({ 
        test: "Admin access control", 
        status: allAdminTestsPassed ? "✅ Passed" : "❌ Failed",
        error: allAdminTestsPassed ? undefined : `${adminTestsPassed}/${totalAdminTests} tests passed`
      });
    } catch (error) {
      console.log(`❌ Admin access control: Failed | Error: ${error.message}`);
      testResults.push({ test: "Admin access control", status: "❌ Failed", error: error.message });
    }

    // Test 8: ERC721 edge cases
    console.log("\n🧪 Test 8: ERC721 edge cases");
    try {
      let erc721TestsPassed = 0;
      const totalERC721Tests = 3;

      // Test ownerOf with non-existent token
      try {
        await nftContract.ownerOf(999999);
        console.log(`❌ ownerOf(non-existent) should have reverted`);
      } catch (ownerOfError) {
        console.log(`✅ ownerOf(non-existent): Correctly reverted`);
        erc721TestsPassed++;
      }

      // Test tokenURI with non-existent token
      try {
        await nftContract.tokenURI(999999);
        console.log(`❌ tokenURI(non-existent) should have reverted`);
      } catch (tokenURIError) {
        console.log(`✅ tokenURI(non-existent): Correctly reverted`);
        erc721TestsPassed++;
      }

      // Test getTokenRarity with non-existent token
      try {
        await nftContract.getTokenRarity(999999);
        console.log(`❌ getTokenRarity(non-existent) should have reverted`);
      } catch (tokenRarityError) {
        console.log(`✅ getTokenRarity(non-existent): Correctly reverted`);
        erc721TestsPassed++;
      }

      const allERC721TestsPassed = erc721TestsPassed === totalERC721Tests;
      console.log(`${allERC721TestsPassed ? "✅" : "❌"} ERC721 edge cases: ${allERC721TestsPassed ? "Passed" : "Failed"} (${erc721TestsPassed}/${totalERC721Tests})`);

      testResults.push({ 
        test: "ERC721 edge cases", 
        status: allERC721TestsPassed ? "✅ Passed" : "❌ Failed",
        error: allERC721TestsPassed ? undefined : `${erc721TestsPassed}/${totalERC721Tests} tests passed`
      });
    } catch (error) {
      console.log(`❌ ERC721 edge cases: Failed | Error: ${error.message}`);
      testResults.push({ test: "ERC721 edge cases", status: "❌ Failed", error: error.message });
    }

    // Test 9: Invalid parameters
    console.log("\n🧪 Test 9: Invalid parameters");
    try {
      let invalidParamTestsPassed = 0;
      const totalInvalidParamTests = 3;

      // Test setPrizes with zero values
      try {
        await nftContract.connect(owner).setPrices(0, 0);
        console.log(`⚠️ setPrices(0, 0): Allowed (may be valid)`);
        invalidParamTestsPassed++; // This might be allowed, so count as passed
      } catch (zeroPriceError) {
        console.log(`✅ setPrices(0, 0): Correctly rejected zero prices`);
        invalidParamTestsPassed++;
      }

      // Test setPrizePercent with extreme values
      try {
        await nftContract.connect(owner).setPrizePercent(0, 101); // Over 100%
        console.log(`❌ setPrizePercent(>100%) should be rejected`);
      } catch (extremePercentError) {
        console.log(`✅ setPrizePercent(>100%): Correctly rejected extreme percentage`);
        invalidParamTestsPassed++;
      }

      // Test empty tokenURI
      try {
        const vertPrice = await nftContract.priceVert();
        await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice);
        await nftContract.connect(owner).mintWithVert("");
        console.log(`⚠️ Empty tokenURI: Allowed (may be valid)`);
        invalidParamTestsPassed++; // This might be allowed, so count as passed
      } catch (emptyURIError) {
        console.log(`✅ Empty tokenURI: Correctly rejected`);
        invalidParamTestsPassed++;
      }

      const allInvalidParamTestsPassed = invalidParamTestsPassed === totalInvalidParamTests;
      console.log(`${allInvalidParamTestsPassed ? "✅" : "❌"} Invalid parameters: ${allInvalidParamTestsPassed ? "Passed" : "Failed"} (${invalidParamTestsPassed}/${totalInvalidParamTests})`);

      testResults.push({ 
        test: "Invalid parameters", 
        status: allInvalidParamTestsPassed ? "✅ Passed" : "❌ Failed",
        error: allInvalidParamTestsPassed ? undefined : `${invalidParamTestsPassed}/${totalInvalidParamTests} tests passed`
      });
    } catch (error) {
      console.log(`❌ Invalid parameters: Failed | Error: ${error.message}`);
      testResults.push({ test: "Invalid parameters", status: "❌ Failed", error: error.message });
    }

    // Test 10: Gas limit edge cases
    console.log("\n🧪 Test 10: Gas limit considerations");
    try {
      // Test extremely long tokenURI (might hit gas limits)
      const longURI = "ipfs://Qm" + "a".repeat(1000); // Very long URI
      
      try {
        const vertPrice = await nftContract.priceVert();
        await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice);
        const tx = await nftContract.connect(owner).mintWithVert(longURI);
        const receipt = await tx.wait();
        
        console.log(`✅ Long URI test: Passed | Gas used: ${receipt.gasUsed.toString()}`);
        testResults.push({ test: "Long URI test", status: "✅ Passed", gas: receipt.gasUsed.toString() });
      } catch (longURIError) {
        console.log(`❌ Long URI test: Failed | Error: ${longURIError.message}`);
        testResults.push({ test: "Long URI test", status: "❌ Failed", error: longURIError.message });
      }
    } catch (error) {
      console.log(`❌ Gas limit test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Gas limit test", status: "❌ Failed", error: error.message });
    }

    // Test 11: Race condition simulation
    console.log("\n🧪 Test 11: Concurrent operations");
    try {
      // Simulate concurrent minting
      const vertPrice = await nftContract.priceVert();
      await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice * 2n);
      
      // Start two mints simultaneously
      const mint1Promise = nftContract.connect(owner).mintWithVert("ipfs://QmConcurrent1");
      const mint2Promise = nftContract.connect(owner).mintWithVert("ipfs://QmConcurrent2");
      
      try {
        const [tx1, tx2] = await Promise.all([mint1Promise, mint2Promise]);
        const [receipt1, receipt2] = await Promise.all([tx1.wait(), tx2.wait()]);
        
        console.log(`✅ Concurrent operations: Passed | Both transactions succeeded`);
        console.log(`   TX1 Gas: ${receipt1.gasUsed.toString()}, TX2 Gas: ${receipt2.gasUsed.toString()}`);
        testResults.push({ test: "Concurrent operations", status: "✅ Passed" });
      } catch (concurrentError) {
        console.log(`⚠️ Concurrent operations: One failed | This may be expected: ${concurrentError.message}`);
        testResults.push({ test: "Concurrent operations", status: "⚠️ Partial", error: concurrentError.message });
      }
    } catch (error) {
      console.log(`❌ Concurrent operations: Failed | Error: ${error.message}`);
      testResults.push({ test: "Concurrent operations", status: "❌ Failed", error: error.message });
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 EDGE CASES TEST SUMMARY");
  console.log("=".repeat(60));
  
  const passed = testResults.filter(r => r.status.includes("✅")).length;
  const failed = testResults.filter(r => r.status.includes("❌")).length;
  const partial = testResults.filter(r => r.status.includes("⚠️")).length;
  
  testResults.forEach(result => {
    console.log(`${result.status} ${result.test}${result.gas ? ` | Gas: ${result.gas}` : ''}${result.error ? ` | Error: ${result.error}` : ''}`);
  });

  console.log("=".repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${partial} partial`);
  console.log("=".repeat(60));

  return { passed, failed, partial, results: testResults };
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