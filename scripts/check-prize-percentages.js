const hre = require("hardhat");

async function main() {
  console.log("📊 Current Prize Percentages\n");

  const NFT_CONTRACT = "0x9114420a6e77E41784590a9D2eE66AE3751F434c";
  
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );

  // Check current percentages
  const rarePercent = await nft.prizePercentByRarity(1);
  const epicPercent = await nft.prizePercentByRarity(2);
  const legendaryPercent = await nft.prizePercentByRarity(3);
  const mythicalPercent = await nft.prizePercentByRarity(4);

  console.log("🎯 Current Prize Percentages:");
  console.log(`Rare (18.75% chance): ${rarePercent}% of prize pool`);
  console.log(`Epic (9% chance): ${epicPercent}% of prize pool`);
  console.log(`Legendary (1.875% chance): ${legendaryPercent}% of prize pool`);
  console.log(`Mythical (0.375% chance): ${mythicalPercent}% of prize pool`);

  // Convert BigInt to numbers for calculations
  const rare = Number(rarePercent);
  const epic = Number(epicPercent);
  const legendary = Number(legendaryPercent);
  const mythical = Number(mythicalPercent);

  console.log("\n🥩 Proposed Staking Tier Boosts:");
  console.log("\n📈 Tier 1 (10k VERT staked) - +50% boost:");
  console.log(`Rare: ${Math.floor(rare * 1.5)}% (was ${rare}%)`);
  console.log(`Epic: ${Math.floor(epic * 1.5)}% (was ${epic}%)`);
  console.log(`Legendary: ${Math.floor(legendary * 1.5)}% (was ${legendary}%)`);
  console.log(`Mythical: ${Math.floor(mythical * 1.5)}% (was ${mythical}%)`);

  console.log("\n📈 Tier 2 (50k VERT staked) - +100% boost:");
  console.log(`Rare: ${rare * 2}% (was ${rare}%)`);
  console.log(`Epic: ${epic * 2}% (was ${epic}%)`);
  console.log(`Legendary: ${legendary * 2}% (was ${legendary}%)`);
  console.log(`Mythical: ${mythical * 2}% (was ${mythical}%)`);

  console.log("\n📈 Tier 3 (100k VERT staked) - +150% boost:");
  console.log(`Rare: ${Math.floor(rare * 2.5)}% (was ${rare}%)`);
  console.log(`Epic: ${Math.floor(epic * 2.5)}% (was ${epic}%)`);
  console.log(`Legendary: ${Math.floor(legendary * 2.5)}% (was ${legendary}%)`);
  console.log(`Mythical: ${Math.floor(mythical * 2.5)}% (was ${mythical}%)`);

  console.log("\n💡 Implementation Notes:");
  console.log("✅ These percentages can be changed AFTER deployment");
  console.log("✅ Use setPrizePercent(rarity, newPercent) function");
  console.log("✅ Only contract owner can adjust percentages");
  console.log("✅ Changes take effect immediately for new mints");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 