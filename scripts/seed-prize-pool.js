const hre = require("hardhat");

async function main() {
  console.log("🌱 Seeding Prize Pool by minting with VERT...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x9114420a6e77E41784590a9D2eE66AE3751F434c";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Check initial state
  const initialPrizePool = await nft.prizePool();
  const vertBalance = await vertToken.balanceOf(signer.address);
  console.log(`Initial Prize Pool: ${hre.ethers.formatEther(initialPrizePool)} VERT`);
  console.log(`Your VERT Balance: ${hre.ethers.formatEther(vertBalance)} VERT`);

  // Mint price
  const mintPrice = await nft.priceVert();
  console.log(`VERT Mint Price: ${hre.ethers.formatEther(mintPrice)} VERT`);

  // Number of mints to seed the pool
  const numMints = 5;
  const totalCost = mintPrice * BigInt(numMints);
  
  console.log(`\nPlanning to mint ${numMints} NFTs to seed prize pool`);
  console.log(`Total cost: ${hre.ethers.formatEther(totalCost)} VERT`);
  console.log(`This will add ~${hre.ethers.formatEther(totalCost * BigInt(75) / BigInt(100))} VERT to prize pool`);

  // Approve VERT spending
  console.log("\nApproving VERT spending...");
  const approveTx = await vertToken.approve(NFT_CONTRACT, totalCost);
  await approveTx.wait();
  console.log("✅ VERT spending approved");

  // Mint NFTs
  for (let i = 0; i < numMints; i++) {
    console.log(`\nMinting NFT ${i + 1}/${numMints}...`);
    const mintTx = await nft.mintWithVert("placeholder-uri");
    const receipt = await mintTx.wait();
    console.log(`✅ Minted! Gas used: ${receipt.gasUsed}`);
    
    // Check prize pool after each mint
    const currentPrizePool = await nft.prizePool();
    console.log(`Prize Pool: ${hre.ethers.formatEther(currentPrizePool)} VERT`);
  }

  // Final state
  const finalPrizePool = await nft.prizePool();
  const finalVertBalance = await vertToken.balanceOf(signer.address);
  const totalMinted = await nft.nextTokenId() - BigInt(1);
  
  console.log(`\n🎉 Seeding Complete!`);
  console.log(`Final Prize Pool: ${hre.ethers.formatEther(finalPrizePool)} VERT`);
  console.log(`Added to Prize Pool: ${hre.ethers.formatEther(finalPrizePool - initialPrizePool)} VERT`);
  console.log(`Your VERT Balance: ${hre.ethers.formatEther(finalVertBalance)} VERT`);
  console.log(`Total NFTs Minted: ${totalMinted}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 