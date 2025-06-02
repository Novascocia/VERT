const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Minting Functions...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xc03605b09aF6010bb2097d285b9aF4024ecAf098";
  const VERT_TOKEN = "0x0000000000000000000000000000000000000000";
  const VIRTUAL_TOKEN = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";

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