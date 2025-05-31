const hre = require("hardhat");

async function main() {
  console.log("🧪 Starting Prize Pool Distribution Tests...");

  const nft = await hre.ethers.getContractAt(
    "VerticalProjectNFT",
    process.env.NFT_CONTRACT_ADDRESS
  );

  const [deployer, user] = await hre.ethers.getSigners();

  // Test prize pool percentages for each rarity
  const rarityTests = [
    { rarity: 1, expectedPercent: 3, name: "Rare" },
    { rarity: 2, expectedPercent: 7, name: "Epic" },
    { rarity: 3, expectedPercent: 15, name: "Legendary" },
    { rarity: 4, expectedPercent: 40, name: "Mythical" }
  ];

  for (const test of rarityTests) {
    console.log(`\nTesting ${test.name} Prize Distribution...`);
    
    // Get initial prize pool balance
    const initialPool = await nft.getPrizePoolBalance();
    console.log(`Initial Prize Pool: ${hre.ethers.formatEther(initialPool)} VERT`);

    // Calculate expected prize amount
    const expectedPrize = (initialPool * BigInt(test.expectedPercent)) / 100n;
    console.log(`Expected Prize (${test.expectedPercent}%): ${hre.ethers.formatEther(expectedPrize)} VERT`);

    // Mint NFT and get actual prize
    const tx = await nft.connect(user).mintWithVert("ipfs://test");
    const receipt = await tx.wait();

    // Find NFTMinted event
    const mintedEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "NFTMinted"
    );

    if (!mintedEvent) {
      console.error("❌ NFTMinted event not found");
      continue;
    }

    const rarity = mintedEvent.args[2];
    console.log(`Minted NFT Rarity: ${rarity}`);

    // Find PrizeClaimed event
    const claimedEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "PrizeClaimed"
    );

    if (!claimedEvent) {
      console.log("ℹ️ No prize claimed (Common rarity)");
      continue;
    }

    const actualPrize = claimedEvent.args[1];
    console.log(`Actual Prize: ${hre.ethers.formatEther(actualPrize)} VERT`);

    // Verify prize amount
    const tolerance = hre.ethers.parseEther("0.001"); // 0.001 VERT tolerance
    const difference = actualPrize > expectedPrize 
      ? actualPrize - expectedPrize 
      : expectedPrize - actualPrize;

    if (difference <= tolerance) {
      console.log("✅ Prize distribution matches expected percentage");
    } else {
      console.error("❌ Prize distribution does not match expected percentage");
      console.log(`Difference: ${hre.ethers.formatEther(difference)} VERT`);
    }

    // Get final prize pool balance
    const finalPool = await nft.getPrizePoolBalance();
    console.log(`Final Prize Pool: ${hre.ethers.formatEther(finalPool)} VERT`);
  }

  console.log("\n✅ Prize Pool Distribution Tests Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 