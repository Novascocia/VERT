const { ethers } = require("hardhat");

// Import all test modules
const testMinting = require("./test_minting.js");
const testPrizePool = require("./test_prize_pool.js");
const testAdminFunctions = require("./test_admin_functions.js");
const testViewFunctions = require("./test_view_functions.js");
const testEdgeCases = require("./test_edge_cases.js");

async function main() {
  console.log("🚀 Running Complete Test Suite for VerticalProjectNFT...\n");
  console.log("📍 Contract Address: 0x653015826EdbF26Fe61ad08E5220cD6150D9cB56");
  console.log("🌐 Network: Base Sepolia Testnet");
  
  const [signer] = await ethers.getSigners();
  console.log("👤 Test Account:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH");

  let overallResults = {
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    totalPartial: 0,
    suiteResults: []
  };

  const testSuites = [
    { name: "View Functions", func: testViewFunctions },
    { name: "Prize Pool", func: testPrizePool },
    { name: "Minting", func: testMinting },
    { name: "Admin Functions", func: testAdminFunctions },
    { name: "Edge Cases", func: testEdgeCases }
  ];

  console.log("\n" + "=".repeat(80));
  console.log("🧪 STARTING TEST SUITE EXECUTION");
  console.log("=".repeat(80));

  for (let i = 0; i < testSuites.length; i++) {
    const suite = testSuites[i];
    
    console.log(`\n📦 [${i + 1}/${testSuites.length}] Running ${suite.name} Tests...`);
    console.log("─".repeat(60));

    try {
      const startTime = Date.now();
      const result = await suite.func();
      const duration = Date.now() - startTime;

      // Aggregate results
      overallResults.totalPassed += result.passed || 0;
      overallResults.totalFailed += result.failed || 0;
      overallResults.totalSkipped += result.skipped || 0;
      overallResults.totalPartial += result.partial || 0;

      overallResults.suiteResults.push({
        name: suite.name,
        passed: result.passed || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        partial: result.partial || 0,
        duration: duration,
        status: (result.failed || 0) === 0 ? "✅ PASSED" : "❌ FAILED"
      });

      console.log(`\n⏱️ ${suite.name} completed in ${duration}ms`);
      
      // Short pause between test suites
      if (i < testSuites.length - 1) {
        console.log("⏳ Waiting 2 seconds before next suite...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ ${suite.name} test suite failed:`, error.message);
      overallResults.suiteResults.push({
        name: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        partial: 0,
        duration: 0,
        status: "💥 CRASHED",
        error: error.message
      });
      overallResults.totalFailed += 1;
    }
  }

  // Final Summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 COMPLETE TEST SUITE SUMMARY");
  console.log("=".repeat(80));

  // Suite by suite breakdown
  console.log("\n📋 Test Suite Results:");
  overallResults.suiteResults.forEach((suite, index) => {
    const total = suite.passed + suite.failed + suite.skipped + suite.partial;
    console.log(`${index + 1}. ${suite.status} ${suite.name}`);
    console.log(`   📊 ${suite.passed} passed, ${suite.failed} failed, ${suite.skipped} skipped, ${suite.partial} partial (${total} total)`);
    console.log(`   ⏱️ Duration: ${suite.duration}ms`);
    if (suite.error) {
      console.log(`   ❌ Error: ${suite.error}`);
    }
    console.log("");
  });

  // Overall statistics
  const totalTests = overallResults.totalPassed + overallResults.totalFailed + overallResults.totalSkipped + overallResults.totalPartial;
  const passRate = totalTests > 0 ? ((overallResults.totalPassed / totalTests) * 100).toFixed(1) : 0;
  const overallSuccess = overallResults.totalFailed === 0;

  console.log("📈 Overall Statistics:");
  console.log(`   ✅ Passed: ${overallResults.totalPassed}`);
  console.log(`   ❌ Failed: ${overallResults.totalFailed}`);
  console.log(`   ⚠️ Skipped: ${overallResults.totalSkipped}`);
  console.log(`   🔄 Partial: ${overallResults.totalPartial}`);
  console.log(`   📊 Total Tests: ${totalTests}`);
  console.log(`   📈 Pass Rate: ${passRate}%`);

  console.log("\n" + "=".repeat(80));
  if (overallSuccess) {
    console.log("🎉 ALL TEST SUITES PASSED! 🎉");
    console.log("✅ The contract is ready for use!");
  } else {
    console.log("⚠️ SOME TESTS FAILED");
    console.log("❌ Please review the failed tests before proceeding.");
    
    // List critical failures
    const criticalFailures = overallResults.suiteResults.filter(s => s.failed > 0 && ["Minting", "Prize Pool", "Admin Functions"].includes(s.name));
    if (criticalFailures.length > 0) {
      console.log("\n🚨 Critical failures detected in:");
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.name} (${failure.failed} failures)`);
      });
    }
  }
  console.log("=".repeat(80));

  // Recommendations
  console.log("\n💡 Next Steps:");
  if (overallSuccess) {
    console.log("1. 🚀 Deploy to mainnet when ready");
    console.log("2. 📖 Update documentation");
    console.log("3. 🔄 Set up monitoring");
  } else {
    console.log("1. 🔍 Review failed test details above");
    console.log("2. 🛠️ Fix identified issues");
    console.log("3. 🔄 Re-run tests: npx hardhat run scripts/run_all_tests.js --network base_sepolia");
  }

  console.log("\n📚 Individual test commands:");
  console.log("   npx hardhat run scripts/test_minting.js --network base_sepolia");
  console.log("   npx hardhat run scripts/test_prize_pool.js --network base_sepolia");
  console.log("   npx hardhat run scripts/test_admin_functions.js --network base_sepolia");
  console.log("   npx hardhat run scripts/test_view_functions.js --network base_sepolia");
  console.log("   npx hardhat run scripts/test_edge_cases.js --network base_sepolia");

  return {
    success: overallSuccess,
    totalTests: totalTests,
    passRate: parseFloat(passRate),
    results: overallResults
  };
}

if (require.main === module) {
  main()
    .then((result) => {
      if (result.success) {
        console.log("\n🎯 Test suite completed successfully!");
        process.exit(0);
      } else {
        console.log("\n💥 Test suite completed with failures!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Test suite crashed:", error);
      process.exit(1);
    });
}

module.exports = main; 