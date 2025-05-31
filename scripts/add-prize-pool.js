const hre = require("hardhat");

async function main() {
  console.log("💰 Adding VERT to Prize Pool...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x9114420a6e77E41784590a9D2eE66AE3751F434c";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Amount to add (in VERT)
  const amount = hre.ethers.parseUnits("5000", 18); // 5000 VERT

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Check initial prize pool
  const initialPrizePool = await nft.prizePool();
  console.log(`Initial Prize Pool: ${hre.ethers.formatEther(initialPrizePool)} VERT`);

  // Check VERT balance
  const vertBalance = await vertToken.balanceOf(signer.address);
  console.log(`Your VERT Balance: ${hre.ethers.formatEther(vertBalance)} VERT`);

  // Since our contract doesn't have addToPrizePool function,
  // we'll simulate adding to prize pool by minting with VERT
  // This will add 75% of the mint price to the prize pool
  
  console.log("\nSimulating prize pool addition by minting with VERT...");
  console.log("This will add 1.125 VERT to prize pool per mint (75% of 1.5 VERT)");
  
  // Calculate how many mints needed to reach desired amount
  const mintPrice = hre.ethers.parseUnits("1.5", 18); // 1.5 VERT per mint
  const prizePoolAddition = (mintPrice * BigInt(75)) / BigInt(100); // 75% goes to prize pool
  const mintsNeeded = amount / prizePoolAddition;
  
  console.log(`To add ${hre.ethers.formatEther(amount)} VERT to prize pool:`);
  console.log(`Need approximately ${mintsNeeded} mints with VERT`);
  console.log(`Each mint adds ${hre.ethers.formatEther(prizePoolAddition)} VERT to prize pool`);
  
  console.log("\n💡 To add prize pool funds:");
  console.log("1. Use the frontend to mint NFTs with VERT tokens");
  console.log("2. Each VERT mint adds 1.125 VERT to the prize pool");
  console.log("3. Or manually transfer VERT to contract and update prizePool variable");
  
  // Check final prize pool
  const finalPrizePool = await nft.prizePool();
  console.log(`\nCurrent Prize Pool: ${hre.ethers.formatEther(finalPrizePool)} VERT`);
  console.log(`Contract VERT Balance: ${hre.ethers.formatEther(await vertToken.balanceOf(NFT_CONTRACT))} VERT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 