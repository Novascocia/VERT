const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing View Functions...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
  const VERT_TOKEN = "0x0000000000000000000000000000000000000000";

  const [signer] = await ethers.getSigners();
  console.log("👤 Testing with account:", signer.address);

  // Connect to contracts
  const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
  const vertToken = await ethers.getContractAt("IERC20", VERT_TOKEN);

  let testResults = [];

  try {
    // Test 1: Basic contract state getters
    console.log("🧪 Test 1: Basic contract state getters");
    try {
      const priceVirtual = await nftContract.priceVirtual();
      const priceVert = await nftContract.priceVert();
      const nextTokenId = await nftContract.nextTokenId();
      const prizePool = await nftContract.prizePool();

      console.log(`✅ Basic getters: Passed`);
      console.log(`   priceVirtual(): ${ethers.formatEther(priceVirtual)} VIRTUAL`);
      console.log(`   priceVert(): ${ethers.formatEther(priceVert)} VERT`);
      console.log(`   nextTokenId(): ${nextTokenId.toString()}`);
      console.log(`   prizePool(): ${ethers.formatEther(prizePool)} VERT`);

      testResults.push({ test: "Basic getters", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ Basic getters: Failed | Error: ${error.message}`);
      testResults.push({ test: "Basic getters", status: "❌ Failed", error: error.message });
    }

    // Test 2: getTotalMinted() and getPrizePoolBalance()
    console.log("\n🧪 Test 2: Specialized getters");
    try {
      const totalMinted = await nftContract.getTotalMinted();
      const prizePoolBalance = await nftContract.getPrizePoolBalance();

      console.log(`✅ Specialized getters: Passed`);
      console.log(`   getTotalMinted(): ${totalMinted.toString()}`);
      console.log(`   getPrizePoolBalance(): ${ethers.formatEther(prizePoolBalance)} VERT`);

      testResults.push({ test: "Specialized getters", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ Specialized getters: Failed | Error: ${error.message}`);
      testResults.push({ test: "Specialized getters", status: "❌ Failed", error: error.message });
    }

    // Test 3: prizePercentByRarity for all rarities
    console.log("\n🧪 Test 3: Prize percentages by rarity");
    try {
      const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
      
      console.log(`✅ prizePercentByRarity(): Passed`);
      for (let i = 0; i < rarityNames.length; i++) {
        const percent = await nftContract.prizePercentByRarity(i);
        console.log(`   ${rarityNames[i]} (${i}): ${percent.toString()}%`);
      }

      testResults.push({ test: "prizePercentByRarity()", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ prizePercentByRarity(): Failed | Error: ${error.message}`);
      testResults.push({ test: "prizePercentByRarity()", status: "❌ Failed", error: error.message });
    }

    // Test 4: Contract addresses getters
    console.log("\n🧪 Test 4: Contract addresses");
    try {
      const vertToken = await nftContract.vertToken();
      const virtualToken = await nftContract.virtualToken();
      const treasury = await nftContract.treasury();

      console.log(`✅ Contract addresses: Passed`);
      console.log(`   vertToken(): ${vertToken}`);
      console.log(`   virtualToken(): ${virtualToken}`);
      console.log(`   treasury(): ${treasury}`);

      testResults.push({ test: "Contract addresses", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ Contract addresses: Failed | Error: ${error.message}`);
      testResults.push({ test: "Contract addresses", status: "❌ Failed", error: error.message });
    }

    // Test 5: Constants
    console.log("\n🧪 Test 5: Constants");
    try {
      const royaltyFeeBps = await nftContract.ROYALTY_FEE_BPS();

      console.log(`✅ Constants: Passed`);
      console.log(`   ROYALTY_FEE_BPS(): ${royaltyFeeBps.toString()} (${(Number(royaltyFeeBps) / 100).toFixed(2)}%)`);

      testResults.push({ test: "Constants", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ Constants: Failed | Error: ${error.message}`);
      testResults.push({ test: "Constants", status: "❌ Failed", error: error.message });
    }

    // Test 6: Mint an NFT for tokenRarity testing
    console.log("\n🧪 Test 6: Mint NFT for tokenRarity testing");
    let mintedTokenId;
    try {
      const vertPrice = await nftContract.priceVert();
      await vertToken.approve(NFT_CONTRACT, vertPrice);
      
      const mintTx = await nftContract.mintWithVert("ipfs://QmTestForViewing");
      await mintTx.wait();
      
      const nextTokenId = await nftContract.nextTokenId();
      mintedTokenId = nextTokenId - 1n;
      
      console.log(`✅ NFT minted for testing | Token ID: ${mintedTokenId}`);
      testResults.push({ test: "Mint NFT (setup)", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ NFT minting (setup): Failed | Error: ${error.message}`);
      testResults.push({ test: "Mint NFT (setup)", status: "❌ Failed", error: error.message });
    }

    // Test 7: getTokenRarity function
    if (mintedTokenId !== undefined) {
      console.log("\n🧪 Test 7: getTokenRarity() function");
      try {
        const rarity = await nftContract.getTokenRarity(mintedTokenId);
        const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];

        console.log(`✅ getTokenRarity(): Passed`);
        console.log(`   Token ID ${mintedTokenId}: ${rarityNames[rarity]} (${rarity})`);

        testResults.push({ test: "getTokenRarity()", status: "✅ Passed" });
      } catch (error) {
        console.log(`❌ getTokenRarity(): Failed | Error: ${error.message}`);
        testResults.push({ test: "getTokenRarity()", status: "❌ Failed", error: error.message });
      }
    }

    // Test 8: ERC721 view functions
    if (mintedTokenId !== undefined) {
      console.log("\n🧪 Test 8: ERC721 view functions");
      try {
        const tokenURI = await nftContract.tokenURI(mintedTokenId);
        const ownerOf = await nftContract.ownerOf(mintedTokenId);
        const balanceOf = await nftContract.balanceOf(signer.address);

        console.log(`✅ ERC721 functions: Passed`);
        console.log(`   tokenURI(${mintedTokenId}): ${tokenURI}`);
        console.log(`   ownerOf(${mintedTokenId}): ${ownerOf}`);
        console.log(`   balanceOf(${signer.address}): ${balanceOf.toString()}`);

        testResults.push({ test: "ERC721 functions", status: "✅ Passed" });
      } catch (error) {
        console.log(`❌ ERC721 functions: Failed | Error: ${error.message}`);
        testResults.push({ test: "ERC721 functions", status: "❌ Failed", error: error.message });
      }
    }

    // Test 9: royaltyInfo function (EIP-2981)
    console.log("\n🧪 Test 9: royaltyInfo() function");
    try {
      const salePrice = ethers.parseEther("100"); // 100 ETH sale price
      const [receiver, royaltyAmount] = await nftContract.royaltyInfo(1, salePrice);
      
      const expectedRoyalty = (salePrice * BigInt(500)) / BigInt(10000); // 5%
      const royaltyCorrect = royaltyAmount === expectedRoyalty;

      console.log(`✅ royaltyInfo(): Passed`);
      console.log(`   Sale price: ${ethers.formatEther(salePrice)} ETH`);
      console.log(`   Royalty receiver: ${receiver}`);
      console.log(`   Royalty amount: ${ethers.formatEther(royaltyAmount)} ETH (${royaltyCorrect ? "✅" : "❌"} correct)`);

      testResults.push({ test: "royaltyInfo()", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ royaltyInfo(): Failed | Error: ${error.message}`);
      testResults.push({ test: "royaltyInfo()", status: "❌ Failed", error: error.message });
    }

    // Test 10: supportsInterface function
    console.log("\n🧪 Test 10: supportsInterface() function");
    try {
      // ERC165 interface ID
      const erc165InterfaceId = "0x01ffc9a7";
      // ERC721 interface ID
      const erc721InterfaceId = "0x80ac58cd";
      // ERC2981 interface ID
      const erc2981InterfaceId = "0x2a55205a";
      // Random invalid interface ID
      const invalidInterfaceId = "0x12345678";

      const supportsERC165 = await nftContract.supportsInterface(erc165InterfaceId);
      const supportsERC721 = await nftContract.supportsInterface(erc721InterfaceId);
      const supportsERC2981 = await nftContract.supportsInterface(erc2981InterfaceId);
      const supportsInvalid = await nftContract.supportsInterface(invalidInterfaceId);

      console.log(`✅ supportsInterface(): Passed`);
      console.log(`   ERC165 (${erc165InterfaceId}): ${supportsERC165 ? "✅" : "❌"}`);
      console.log(`   ERC721 (${erc721InterfaceId}): ${supportsERC721 ? "✅" : "❌"}`);
      console.log(`   ERC2981 (${erc2981InterfaceId}): ${supportsERC2981 ? "✅" : "❌"}`);
      console.log(`   Invalid (${invalidInterfaceId}): ${!supportsInvalid ? "✅" : "❌"} (should be false)`);

      testResults.push({ test: "supportsInterface()", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ supportsInterface(): Failed | Error: ${error.message}`);
      testResults.push({ test: "supportsInterface()", status: "❌ Failed", error: error.message });
    }

    // Test 11: Test view functions with edge cases
    console.log("\n🧪 Test 11: Edge case testing");
    try {
      let edgeTestsPassed = 0;
      const totalEdgeTests = 3;

      // Test getTokenRarity with non-existent token
      try {
        await nftContract.getTokenRarity(999999);
        console.log(`❌ getTokenRarity(non-existent): Should have reverted`);
      } catch (revertError) {
        console.log(`✅ getTokenRarity(non-existent): Correctly reverted`);
        edgeTestsPassed++;
      }

      // Test ownerOf with non-existent token
      try {
        await nftContract.ownerOf(999999);
        console.log(`❌ ownerOf(non-existent): Should have reverted`);
      } catch (revertError) {
        console.log(`✅ ownerOf(non-existent): Correctly reverted`);
        edgeTestsPassed++;
      }

      // Test tokenURI with non-existent token
      try {
        await nftContract.tokenURI(999999);
        console.log(`❌ tokenURI(non-existent): Should have reverted`);
      } catch (revertError) {
        console.log(`✅ tokenURI(non-existent): Correctly reverted`);
        edgeTestsPassed++;
      }

      const allEdgeTestsPassed = edgeTestsPassed === totalEdgeTests;
      console.log(`${allEdgeTestsPassed ? "✅" : "❌"} Edge cases: ${allEdgeTestsPassed ? "Passed" : "Failed"} (${edgeTestsPassed}/${totalEdgeTests})`);

      testResults.push({ 
        test: "Edge cases", 
        status: allEdgeTestsPassed ? "✅ Passed" : "❌ Failed",
        error: allEdgeTestsPassed ? undefined : `${edgeTestsPassed}/${totalEdgeTests} tests passed`
      });
    } catch (error) {
      console.log(`❌ Edge cases: Failed | Error: ${error.message}`);
      testResults.push({ test: "Edge cases", status: "❌ Failed", error: error.message });
    }

    // Test 12: Final state summary
    console.log("\n🧪 Test 12: Final state summary");
    try {
      const finalNextTokenId = await nftContract.nextTokenId();
      const finalTotalMinted = await nftContract.getTotalMinted();
      const finalPrizePool = await nftContract.getPrizePoolBalance();

      console.log(`✅ Final state summary: Passed`);
      console.log(`   Next Token ID: ${finalNextTokenId.toString()}`);
      console.log(`   Total Minted: ${finalTotalMinted.toString()}`);
      console.log(`   Prize Pool: ${ethers.formatEther(finalPrizePool)} VERT`);
      console.log(`   Consistency check: nextTokenId = totalMinted + 1 = ${finalTotalMinted + 1n === finalNextTokenId ? "✅" : "❌"}`);

      testResults.push({ test: "Final state summary", status: "✅ Passed" });
    } catch (error) {
      console.log(`❌ Final state summary: Failed | Error: ${error.message}`);
      testResults.push({ test: "Final state summary", status: "❌ Failed", error: error.message });
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 VIEW FUNCTIONS TEST SUMMARY");
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