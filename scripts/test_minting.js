const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Minting Functions...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x9ede64fe689aa03B049497E2A70676d02f3437E9";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  const VIRTUAL_TOKEN = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";

  const [signer] = await ethers.getSigners();
  console.log("👤 Testing with account:", signer.address);

  // Connect to contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);
  const virtualToken = await ethers.getContractAt("IERC20", VIRTUAL_TOKEN);

  let testResults = [];

  try {
    // Get initial state
    const initialTokenId = await nftContract.nextTokenId();
    const initialTotalMinted = await nftContract.getTotalMinted();
    const virtualPrice = await nftContract.priceVirtual();
    const vertPrice = await nftContract.priceVert();

    console.log("📊 Initial State:");
    console.log(`   Next Token ID: ${initialTokenId}`);
    console.log(`   Total Minted: ${initialTotalMinted}`);
    console.log(`   VIRTUAL Price: ${ethers.formatEther(virtualPrice)} VIRTUAL`);
    console.log(`   VERT Price: ${ethers.formatEther(vertPrice)} VERT`);

    // Check balances
    const vertBalance = await vertToken.balanceOf(signer.address);
    const virtualBalance = await virtualToken.balanceOf(signer.address);
    console.log(`   VERT Balance: ${ethers.formatEther(vertBalance)} VERT`);
    console.log(`   VIRTUAL Balance: ${ethers.formatEther(virtualBalance)} VIRTUAL`);

    // Test 1: Approve VIRTUAL spending
    console.log("\n🧪 Test 1: Approve VIRTUAL spending");
    try {
      const approveTx = await virtualToken.approve(NFT_CONTRACT, virtualPrice);
      const receipt = await approveTx.wait();
      const gasUsed = receipt.gasUsed;
      console.log(`✅ VIRTUAL approval: Passed | Gas used: ${gasUsed.toString()}`);
      testResults.push({ test: "VIRTUAL approval", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ VIRTUAL approval: Failed | Error: ${error.message}`);
      testResults.push({ test: "VIRTUAL approval", status: "❌ Failed", error: error.message });
    }

    // Test 2: Mint with VIRTUAL
    console.log("\n🧪 Test 2: Mint with VIRTUAL");
    try {
      const mintTx = await nftContract.mintWithVirtual("ipfs://QmTestURI1");
      const receipt = await mintTx.wait();
      const gasUsed = receipt.gasUsed;

      // Check if token ID incremented
      const newTokenId = await nftContract.nextTokenId();
      const tokenIdIncremented = newTokenId > initialTokenId;

      // Get minted token ID
      const mintedTokenId = newTokenId - 1n;

      // Check rarity
      const rarity = await nftContract.tokenRarity(mintedTokenId);
      const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];

      // Parse events
      let nftMintedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "NFTMinted") {
            nftMintedEvent = parsedLog;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ mintWithVirtual(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   Token ID incremented: ${tokenIdIncremented ? "✅" : "❌"}`);
      console.log(`   Minted Token ID: ${mintedTokenId}`);
      console.log(`   Rarity: ${rarityNames[rarity]} (${rarity})`);
      if (nftMintedEvent) {
        console.log(`   Event emitted: ✅ NFTMinted(${nftMintedEvent.args.user}, ${nftMintedEvent.args.tokenId}, ${nftMintedEvent.args.rarity})`);
      }

      testResults.push({ test: "mintWithVirtual()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ mintWithVirtual(): Failed | Error: ${error.message}`);
      testResults.push({ test: "mintWithVirtual()", status: "❌ Failed", error: error.message });
    }

    // Test 3: Approve VERT spending
    console.log("\n🧪 Test 3: Approve VERT spending");
    try {
      const approveTx = await vertToken.approve(NFT_CONTRACT, vertPrice);
      const receipt = await approveTx.wait();
      const gasUsed = receipt.gasUsed;
      console.log(`✅ VERT approval: Passed | Gas used: ${gasUsed.toString()}`);
      testResults.push({ test: "VERT approval", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ VERT approval: Failed | Error: ${error.message}`);
      testResults.push({ test: "VERT approval", status: "❌ Failed", error: error.message });
    }

    // Test 4: Mint with VERT
    console.log("\n🧪 Test 4: Mint with VERT");
    try {
      const initialPrizePool = await nftContract.getPrizePoolBalance();
      const initialUserBalance = await vertToken.balanceOf(signer.address);

      const mintTx = await nftContract.mintWithVert("ipfs://QmTestURI2");
      const receipt = await mintTx.wait();
      const gasUsed = receipt.gasUsed;

      // Check if token ID incremented again
      const newTokenId = await nftContract.nextTokenId();
      const mintedTokenId = newTokenId - 1n;

      // Check rarity
      const rarity = await nftContract.tokenRarity(mintedTokenId);
      const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];

      // Check prize pool and balance changes
      const finalPrizePool = await nftContract.getPrizePoolBalance();
      const finalUserBalance = await vertToken.balanceOf(signer.address);
      
      const prizePoolIncreased = finalPrizePool > initialPrizePool;
      const userBalanceDecreased = finalUserBalance < initialUserBalance;

      // Parse events
      let nftMintedEvent = null;
      let prizeClaimedEvent = null;
      let prizePoolUpdatedEvent = null;

      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog.name === "NFTMinted") {
            nftMintedEvent = parsedLog;
          } else if (parsedLog.name === "PrizeClaimed") {
            prizeClaimedEvent = parsedLog;
          } else if (parsedLog.name === "PrizePoolUpdated") {
            prizePoolUpdatedEvent = parsedLog;
          }
        } catch (e) {
          continue;
        }
      }

      console.log(`✅ mintWithVert(): Passed | Gas used: ${gasUsed.toString()}`);
      console.log(`   Minted Token ID: ${mintedTokenId}`);
      console.log(`   Rarity: ${rarityNames[rarity]} (${rarity})`);
      console.log(`   Prize pool increased: ${prizePoolIncreased ? "✅" : "❌"} (${ethers.formatEther(finalPrizePool - initialPrizePool)} VERT)`);
      console.log(`   User balance decreased: ${userBalanceDecreased ? "✅" : "❌"} (${ethers.formatEther(initialUserBalance - finalUserBalance)} VERT)`);
      
      if (nftMintedEvent) {
        console.log(`   NFTMinted event: ✅`);
      }
      if (prizeClaimedEvent) {
        console.log(`   PrizeClaimed event: ✅ (${ethers.formatEther(prizeClaimedEvent.args.amount)} VERT)`);
      }
      if (prizePoolUpdatedEvent) {
        console.log(`   PrizePoolUpdated event: ✅`);
      }

      testResults.push({ test: "mintWithVert()", status: "✅ Passed", gas: gasUsed.toString() });
    } catch (error) {
      console.log(`❌ mintWithVert(): Failed | Error: ${error.message}`);
      testResults.push({ test: "mintWithVert()", status: "❌ Failed", error: error.message });
    }

    // Test 5: Verify final state
    console.log("\n🧪 Test 5: Verify final state");
    try {
      const finalTokenId = await nftContract.nextTokenId();
      const finalTotalMinted = await nftContract.getTotalMinted();
      
      const expectedTokenId = initialTokenId + 2n;
      const expectedTotalMinted = initialTotalMinted + 2n;
      
      const tokenIdCorrect = finalTokenId === expectedTokenId;
      const totalMintedCorrect = finalTotalMinted === expectedTotalMinted;

      console.log(`✅ Final state verification: ${tokenIdCorrect && totalMintedCorrect ? "Passed" : "Failed"}`);
      console.log(`   Final Token ID: ${finalTokenId} (expected: ${expectedTokenId}) ${tokenIdCorrect ? "✅" : "❌"}`);
      console.log(`   Final Total Minted: ${finalTotalMinted} (expected: ${expectedTotalMinted}) ${totalMintedCorrect ? "✅" : "❌"}`);

      testResults.push({ 
        test: "Final state verification", 
        status: tokenIdCorrect && totalMintedCorrect ? "✅ Passed" : "❌ Failed" 
      });
    } catch (error) {
      console.log(`❌ Final state verification: Failed | Error: ${error.message}`);
      testResults.push({ test: "Final state verification", status: "❌ Failed", error: error.message });
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 MINTING TEST SUMMARY");
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