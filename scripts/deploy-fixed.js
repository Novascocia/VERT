require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Fixed Vertical Project NFT Contract...");
  
  // Contract addresses from environment
  const VIRTUAL_TOKEN_ADDRESS = process.env.VIRTUAL_TOKEN_ADDRESS || "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const VERT_TOKEN_ADDRESS = process.env.VERT_TOKEN_ADDRESS || "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";
  
  console.log("📋 Deployment Parameters:");
  console.log("VIRTUAL Token:", VIRTUAL_TOKEN_ADDRESS);
  console.log("VERT Token:", VERT_TOKEN_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);
  
  // Get the contract factory
  const VerticalProjectNFT = await hre.ethers.getContractFactory("contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT");
  
  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const nftContract = await VerticalProjectNFT.deploy(
    VIRTUAL_TOKEN_ADDRESS,
    VERT_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  );
  
  await nftContract.waitForDeployment();
  const contractAddress = await nftContract.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const virtualToken = await nftContract.virtualToken();
    const vertToken = await nftContract.vertToken();
    const treasury = await nftContract.treasury();
    const priceVirtual = await nftContract.priceVirtual();
    const priceVert = await nftContract.priceVert();
    const totalMinted = await nftContract.getTotalMinted();
    const prizePool = await nftContract.getPrizePoolBalance();
    
    console.log("Virtual Token:", virtualToken);
    console.log("VERT Token:", vertToken);
    console.log("Treasury:", treasury);
    console.log("VIRTUAL Price:", hre.ethers.formatEther(priceVirtual), "VIRTUAL");
    console.log("VERT Price:", hre.ethers.formatEther(priceVert), "VERT");
    console.log("Total Minted:", totalMinted.toString());
    console.log("Prize Pool:", hre.ethers.formatEther(prizePool), "VERT");
    
    // Check prize percentages
    console.log("\n🎯 Prize Percentages:");
    const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
    for (let i = 0; i < 5; i++) {
      const percent = await nftContract.prizePercentByRarity(i);
      console.log(`${rarities[i]}: ${percent}%`);
    }
    
    console.log("\n✅ All contract functions verified successfully!");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    virtualToken: VIRTUAL_TOKEN_ADDRESS,
    vertToken: VERT_TOKEN_ADDRESS,
    treasury: TREASURY_ADDRESS,
    deployedAt: new Date().toISOString(),
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update .env files with new contract address:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Update frontend and backend configuration files");
  console.log("3. Add initial prize pool using add-prize-pool.js script");
  console.log("4. Test minting functionality");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log(`\n🎉 Deployment completed! Contract: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 