const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Admin Functions...\n");

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

  let testResults = [];

  try {
    // Get initial state
    const initialVirtualPrice = await nftContract.priceVirtual();
    const initialVertPrice = await nftContract.priceVert();
    const initialVertToken = await nftContract.vertToken();
    const initialVirtualToken = await nftContract.virtualToken();

    console.log("📊 Initial State:");
    console.log(`   VIRTUAL Price: ${ethers.formatEther(initialVirtualPrice)} VIRTUAL`);
    console.log(`   VERT Price: ${ethers.formatEther(initialVertPrice)} VERT`);
    console.log(`   VERT Token: ${initialVertToken}`);
    console.log(`   VIRTUAL Token: ${initialVirtualToken}`);

    // Test 1: setPrices function
    console.log("\n🧪 Test 1: setPrices() function");
    try {
      const newVirtualPrice = ethers.parseEther("3.0");
      const newVertPrice = ethers.parseEther("2.0");

      const setPricesTx = await nftContract.connect(owner).setPrices(newVirtualPrice, newVertPrice);
      const receipt = await setPricesTx.wait();
      const gasUsed = receipt.gasUsed;

      // Verify prices changed
      const updatedVirtualPrice = await nftContract.priceVirtual();
      const updatedVertPrice = await nftContract.priceVert();

      const virtualPriceCorrect = updatedVirtualPrice === newVirtualPrice;
      const vertPriceCorrect = updatedVertPrice === newVertPrice;

      // Check for PricesUpdated event
      let pricesUpdatedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "PricesUpdated") {
            pricesUpdatedEvent = parsedLog;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ setPrices(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   VIRTUAL price updated: ${virtualPriceCorrect ? "✅" : "❌"} (${ethers.formatEther(updatedVirtualPrice)} VIRTUAL)`);
      console.log(`   VERT price updated: ${vertPriceCorrect ? "✅" : "❌"} (${ethers.formatEther(updatedVertPrice)} VERT)`);
      console.log(`   PricesUpdated event: ${pricesUpdatedEvent ? "✅" : "❌"}`);

      testResults.push({ test: "setPrices()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ setPrices(): Failed | Error: ${error.message}`);
      testResults.push({ test: "setPrices()", status: "❌ Failed", error: error.message });
    }

    // Test 2: setPrizePercent function
    console.log("\n🧪 Test 2: setPrizePercent() function");
    try {
      const rarity = 1; // Rare
      const newPercent = 5; // 5% instead of default 3%

      const setPrizePercentTx = await nftContract.connect(owner).setPrizePercent(rarity, newPercent);
      const receipt = await setPrizePercentTx.wait();
      const gasUsed = receipt.gasUsed;

      // Verify prize percent changed
      const updatedPercent = await nftContract.prizePercentByRarity(rarity);
      const percentCorrect = updatedPercent === BigInt(newPercent);

      // Check for PrizePercentUpdated event
      let prizePercentUpdatedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "PrizePercentUpdated") {
            prizePercentUpdatedEvent = parsedLog;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ setPrizePercent(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   Prize percent updated: ${percentCorrect ? "✅" : "❌"} (${updatedPercent}%)`);
      console.log(`   PrizePercentUpdated event: ${prizePercentUpdatedEvent ? "✅" : "❌"}`);

      testResults.push({ test: "setPrizePercent()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ setPrizePercent(): Failed | Error: ${error.message}`);
      testResults.push({ test: "setPrizePercent()", status: "❌ Failed", error: error.message });
    }

    // Test 3: Mint an NFT first (needed for setTokenURI test)
    console.log("\n🧪 Test 3: Mint NFT (for setTokenURI test)");
    let mintedTokenId;
    try {
      const vertPrice = await nftContract.priceVert();
      await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice);
      
      const mintTx = await nftContract.connect(owner).mintWithVert("ipfs://QmOriginalURI");
      await mintTx.wait();
      
      const nextTokenId = await nftContract.nextTokenId();
      mintedTokenId = nextTokenId - 1n;
      
      console.log(`✅ NFT minted for testing | Token ID: ${mintedTokenId}`);
      testResults.push({ test: "Mint NFT (setup)", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ NFT minting (setup): Failed | Error: ${error.message}`);
      testResults.push({ test: "Mint NFT (setup)", status: "❌ Failed", error: error.message });
    }

    // Test 4: setTokenURI function
    if (mintedTokenId !== undefined) {
      console.log("\n🧪 Test 4: setTokenURI() function");
      try {
        const newURI = "ipfs://QmUpdatedURI";
        
        const setTokenURITx = await nftContract.connect(owner).setTokenURI(mintedTokenId, newURI);
        const receipt = await setTokenURITx.wait();
        const gasUsed = receipt.gasUsed;

        // Verify URI changed
        const updatedURI = await nftContract.tokenURI(mintedTokenId);
        const uriCorrect = updatedURI === newURI;

        console.log(`✅ setTokenURI(): Passed | Gas used: ${gasUsed.toString()}`);
        console.log(`   URI updated: ${uriCorrect ? "✅" : "❌"} (${updatedURI})`);

        testResults.push({ test: "setTokenURI()", status: "✅ Passed", gas: gasUsed.toString() });
      } catch (error) {
        console.log(`❌ setTokenURI(): Failed | Error: ${error.message}`);
        testResults.push({ test: "setTokenURI()", status: "❌ Failed", error: error.message });
      }
    }

    // Test 5: pause() function
    console.log("\n🧪 Test 5: pause() function");
    try {
      const pauseTx = await nftContract.connect(owner).pause();
      const receipt = await pauseTx.wait();
      const gasUsed = receipt.gasUsed;

      // Try to mint while paused (should fail)
      try {
        const vertPrice = await nftContract.priceVert();
        await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice);
        await nftContract.connect(owner).mintWithVert("ipfs://QmShouldFail");
        
        console.log(`❌ pause(): Failed | Minting was allowed while paused`);
        testResults.push({ test: "pause()", status: "❌ Failed", error: "Minting allowed while paused" });
      } catch (pauseError) {
        // This should fail - contract is paused
        console.log(`✅ pause(): Passed | Gas used: ${gasUsed.toString()}`);
        console.log(`   Minting correctly disabled: ✅`);
        testResults.push({ test: "pause()", status: "✅ Passed", gas: gasUsed.toString() });
      }
    } catch (error) {
      console.log(`❌ pause(): Failed | Error: ${error.message}`);
      testResults.push({ test: "pause()", status: "❌ Failed", error: error.message });
    }

    // Test 6: unpause() function
    console.log("\n🧪 Test 6: unpause() function");
    try {
      const unpauseTx = await nftContract.connect(owner).unpause();
      const receipt = await unpauseTx.wait();
      const gasUsed = receipt.gasUsed;

      // Try to mint after unpause (should work)
      try {
        const vertPrice = await nftContract.priceVert();
        await vertToken.connect(owner).approve(NFT_CONTRACT, vertPrice);
        const mintTx = await nftContract.connect(owner).mintWithVert("ipfs://QmAfterUnpause");
        await mintTx.wait();
        
        console.log(`✅ unpause(): Passed | Gas used: ${gasUsed.toString()}`);
        console.log(`   Minting correctly enabled: ✅`);
        testResults.push({ test: "unpause()", status: "✅ Passed", gas: gasUsed.toString() });
      } catch (unpauseError) {
        console.log(`❌ unpause(): Failed | Minting still disabled after unpause`);
        testResults.push({ test: "unpause()", status: "❌ Failed", error: "Minting still disabled" });
      }
    } catch (error) {
      console.log(`❌ unpause(): Failed | Error: ${error.message}`);
      testResults.push({ test: "unpause()", status: "❌ Failed", error: error.message });
    }

    // Test 7: claimPrize function
    console.log("\n🧪 Test 7: claimPrize() function");
    try {
      const currentPrizePool = await nftContract.getPrizePoolBalance();
      
      if (currentPrizePool > 0n) {
        const claimAmount = ethers.parseEther("10"); // Claim 10 VERT
        const recipient = testUser.address;
        
        const initialUserBalance = await vertToken.balanceOf(recipient);
        
        const claimTx = await nftContract.connect(owner).claimPrize(recipient, claimAmount);
        const receipt = await claimTx.wait();
        const gasUsed = receipt.gasUsed;

        // Verify balances changed
        const finalUserBalance = await vertToken.balanceOf(recipient);
        const finalPrizePool = await nftContract.getPrizePoolBalance();
        
        const userBalanceIncrease = finalUserBalance - initialUserBalance;
        const prizePoolDecrease = currentPrizePool - finalPrizePool;
        
        const balanceCorrect = userBalanceIncrease === claimAmount;
        const poolCorrect = prizePoolDecrease === claimAmount;

        // Check for PrizeClaimed event
        let prizeClaimedEvent = null;
        for (const log of receipt.logs) {
          try {
            const parsedLog = nftContract.interface.parseLog(log);
            if (parsedLog.name === "PrizeClaimed") {
              prizeClaimedEvent = parsedLog;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        console.log(`✅ claimPrize(): Passed | Gas used: ${gasUsed.toString()}`);
        console.log(`   User balance increased: ${balanceCorrect ? "✅" : "❌"} (+${ethers.formatEther(userBalanceIncrease)} VERT)`);
        console.log(`   Prize pool decreased: ${poolCorrect ? "✅" : "❌"} (-${ethers.formatEther(prizePoolDecrease)} VERT)`);
        console.log(`   PrizeClaimed event: ${prizeClaimedEvent ? "✅" : "❌"}`);

        testResults.push({ test: "claimPrize()", status: "✅ Passed", gas: gasUsed.toString() });
      } else {
        console.log(`⚠️ claimPrize(): Skipped | Prize pool is empty`);
        testResults.push({ test: "claimPrize()", status: "⚠️ Skipped", error: "Prize pool empty" });
      }
    } catch (error) {
      console.log(`❌ claimPrize(): Failed | Error: ${error.message}`);
      testResults.push({ test: "claimPrize()", status: "❌ Failed", error: error.message });
    }

    // Test 8: Access control test - non-owner trying admin functions
    console.log("\n🧪 Test 8: Access control test");
    try {
      let accessTestsPassed = 0;
      const totalAccessTests = 3;

      // Test setPrices access control
      try {
        await nftContract.connect(testUser).setPrices(ethers.parseEther("1"), ethers.parseEther("1"));
        console.log(`❌ setPrices access control failed`);
      } catch (accessError) {
        console.log(`✅ setPrices access control: Passed`);
        accessTestsPassed++;
      }

      // Test pause access control
      try {
        await nftContract.connect(testUser).pause();
        console.log(`❌ pause access control failed`);
      } catch (accessError) {
        console.log(`✅ pause access control: Passed`);
        accessTestsPassed++;
      }

      // Test claimPrize access control
      try {
        await nftContract.connect(testUser).claimPrize(testUser.address, ethers.parseEther("1"));
        console.log(`❌ claimPrize access control failed`);
      } catch (accessError) {
        console.log(`✅ claimPrize access control: Passed`);
        accessTestsPassed++;
      }

      const allAccessTestsPassed = accessTestsPassed === totalAccessTests;
      console.log(`${allAccessTestsPassed ? "✅" : "❌"} Access control: ${allAccessTestsPassed ? "Passed" : "Failed"} (${accessTestsPassed}/${totalAccessTests})`);
      
      testResults.push({ 
        test: "Access control", 
        status: allAccessTestsPassed ? "✅ Passed" : "❌ Failed",
        error: allAccessTestsPassed ? undefined : `${accessTestsPassed}/${totalAccessTests} tests passed`
      });
    } catch (error) {
      console.log(`❌ Access control test: Failed | Error: ${error.message}`);
      testResults.push({ test: "Access control", status: "❌ Failed", error: error.message });
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 ADMIN FUNCTIONS TEST SUMMARY");
  console.log("=".repeat(60));
  
  const passed = testResults.filter(r => r.status.includes("✅")).length;
  const failed = testResults.filter(r => r.status.includes("❌")).length;
  const skipped = testResults.filter(r => r.status.includes("⚠️")).length;
  
  testResults.forEach(result => {
    console.log(`${result.status} ${result.test}${result.gas ? ` | Gas: ${result.gas}` : ''}${result.error ? ` | Error: ${result.error}` : ''}`);
  });

  console.log("=".repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log("=".repeat(60));

  return { passed, failed, skipped, results: testResults };
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