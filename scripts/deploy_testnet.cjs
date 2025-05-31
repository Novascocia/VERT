require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔧 Deploying VerticalProjectNFT to Base Sepolia...");
  
  // Debug logs for constructor arguments
  console.log("Constructor arguments:");
  console.log("VIRTUAL:", process.env.VIRTUAL_TOKEN_ADDRESS);
  console.log("VERT:", process.env.VERT_TOKEN_ADDRESS);
  console.log("TREASURY:", process.env.TREASURY_ADDRESS);

  // Get the contract factory
  const VerticalProjectNFT = await hre.ethers.getContractFactory("VerticalProjectNFT");

  // Deploy the contract with constructor arguments
  const nft = await VerticalProjectNFT.deploy(
    process.env.VIRTUAL_TOKEN_ADDRESS,
    process.env.VERT_TOKEN_ADDRESS,
    process.env.TREASURY_ADDRESS
  );

  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log("✅ VerticalProjectNFT deployed to:", address);
  console.log("Transaction hash:", nft.deploymentTransaction().hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 