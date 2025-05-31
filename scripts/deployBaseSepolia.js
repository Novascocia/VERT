const hre = require("hardhat");

async function main() {
  console.log("🔧 Starting Base Sepolia deployment...");

  // Get the contract factory
  const VerticalProjectNFT = await hre.ethers.getContractFactory("contracts/VerticalProjectNFT.sol:VerticalProjectNFT");

  // Get the deployer's signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  console.log("Deploying VerticalProjectNFT...");
  const nft = await VerticalProjectNFT.deploy(
    process.env.VIRTUAL_TOKEN_ADDRESS,
    process.env.VERT_TOKEN_ADDRESS,
    process.env.TREASURY_ADDRESS
  );

  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();

  console.log("VerticalProjectNFT deployed to:", nftAddress);

  // Verify the contract on Base Sepolia Explorer
  if (process.env.BASESCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds for block confirmations

    console.log("Verifying contract on Base Sepolia Explorer...");
    try {
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [
          process.env.VIRTUAL_TOKEN_ADDRESS,
          process.env.VERT_TOKEN_ADDRESS,
          process.env.TREASURY_ADDRESS
        ],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Log deployment information
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Contract Address:", nftAddress);
  console.log("Network: Base Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("VIRTUAL Token:", process.env.VIRTUAL_TOKEN_ADDRESS);
  console.log("VERT Token:", process.env.VERT_TOKEN_ADDRESS);
  console.log("Treasury:", process.env.TREASURY_ADDRESS);

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 