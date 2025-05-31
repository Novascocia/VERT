const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying Recent VERT Mint and Prize Payout...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x2F4D103560Ab2848176feeBe1F2D760a0a9Fd2e5";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // 1. Check Contract State
  console.log("📊 Current Contract State:");
  const totalMinted = await nft.getTotalMinted();
  console.log(`Total NFTs Minted: ${totalMinted}`);

  const prizePool = await nft.getPrizePoolBalance();
  console.log(`Prize Pool Balance: ${hre.ethers.formatEther(prizePool)} VERT`);

  const contractVertBalance = await vertToken.balanceOf(NFT_CONTRACT);
  console.log(`Contract VERT Balance: ${hre.ethers.formatEther(contractVertBalance)} VERT`);

  // 2. Check Latest Mint
  if (totalMinted > 0) {
    const latestTokenId = totalMinted;
    console.log(`\n🔍 Latest Mint Details (Token ID: ${latestTokenId}):`);
    
    // Get rarity
    const rarity = await nft.tokenRarity(latestTokenId);
    console.log(`Rarity: ${rarity}`); // 1 = Rare

    // Calculate expected prize
    const prizePercent = await nft.prizePercentByRarity(1); // 1 = Rare
    const expectedPrize = (prizePool * BigInt(prizePercent)) / 100n;
    console.log(`\nPrize Calculation:`);
    console.log(`Prize Pool: ${hre.ethers.formatEther(prizePool)} VERT`);
    console.log(`Prize Percent for Rare: ${prizePercent}%`);
    console.log(`Expected Prize: ${hre.ethers.formatEther(expectedPrize)} VERT`);

    // 3. Check Recent Events
    console.log("\n📜 Recent Events:");
    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const startBlock = latestBlock - 100; // Look at last 100 blocks

    // Get NFTMinted events
    const mintFilter = nft.filters.NFTMinted();
    const mintEvents = await nft.queryFilter(mintFilter, startBlock, latestBlock);
    
    // Get PrizeClaimed events
    const prizeFilter = nft.filters.PrizeClaimed();
    const prizeEvents = await nft.queryFilter(prizeFilter, startBlock, latestBlock);

    // Find the latest mint event
    const latestMintEvent = mintEvents[mintEvents.length - 1];
    if (latestMintEvent) {
      console.log("\nLatest Mint Event:");
      console.log(`Block: ${latestMintEvent.blockNumber}`);
      console.log(`Token ID: ${latestMintEvent.args[1]}`);
      console.log(`User: ${latestMintEvent.args[0]}`);
      console.log(`Rarity: ${latestMintEvent.args[2]}`);

      // Check for PrizeClaimed event in same block
      const prizeEvent = prizeEvents.find(e => e.blockNumber === latestMintEvent.blockNumber);
      if (prizeEvent) {
        console.log("\nPrize Claimed in Same Block:");
        console.log(`Amount: ${hre.ethers.formatEther(prizeEvent.args[1])} VERT`);
        console.log(`User: ${prizeEvent.args[0]}`);
      } else {
        console.log("\n❌ No PrizeClaimed event found in mint block");
      }
    }

    // 4. Check Prize Pool Updates
    console.log("\n📈 Prize Pool Updates:");
    const poolFilter = nft.filters.PrizePoolUpdated();
    const poolEvents = await nft.queryFilter(poolFilter, startBlock, latestBlock);
    
    if (poolEvents.length > 0) {
      console.log("Recent Prize Pool Updates:");
      poolEvents.forEach(event => {
        console.log(`Block ${event.blockNumber}: ${hre.ethers.formatEther(event.args[0])} VERT`);
      });
    }
  } else {
    console.log("\n❌ No NFTs have been minted yet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 