const hre = require("hardhat");

async function main() {
  console.log("🔧 Starting deployment of optimized contract...");

  // Get the contract factory with fully qualified name
  const VerticalProjectNFT = await hre.ethers.getContractFactory(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT"
  );

  // Get the deployer's signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get current gas price
  const gasPrice = await hre.ethers.provider.getFeeData();
  
  // Deploy the contract with gas optimization settings
  console.log("Deploying optimized VerticalProjectNFT...");
  const nft = await VerticalProjectNFT.deploy(
    "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a", // VIRTUAL token
    "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd", // VERT token
    "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23"  // Treasury
  );

  console.log("Waiting for deployment transaction...");
  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`\n✅ Optimized contract deployed to: ${address}`);

  // Log gas usage
  const deployTx = nft.deploymentTransaction();
  console.log("\n📊 Deployment Gas Usage:");
  console.log(`Gas Limit: ${deployTx.gasLimit?.toString() || 'N/A'}`);
  console.log(`Gas Price: ${deployTx.gasPrice?.toString() || 'N/A'} wei`);

  // Verify the contract
  console.log("\nVerifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [
        "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a", // VIRTUAL token
        "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd", // VERT token
        "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23"  // Treasury
      ],
    });
    console.log("✅ Contract verified on Etherscan!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 