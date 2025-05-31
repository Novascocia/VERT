const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Updated VerticalProjectNFT Contract...\n");

  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying from account:", deployer.address);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Contract addresses from testnet.addresses.json
  const VIRTUAL_TOKEN = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  const TREASURY = "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";

  console.log("\n📋 Constructor Parameters:");
  console.log("🟡 VIRTUAL Token:", VIRTUAL_TOKEN);
  console.log("🟢 VERT Token:", VERT_TOKEN);
  console.log("🏛️ Treasury:", TREASURY);

  try {
    // Get the contract factory
    console.log("\n⚡ Getting contract factory...");
    const VerticalProjectNFT = await ethers.getContractFactory("contracts/VerticalProjectNFT.sol:VerticalProjectNFT");

    // Deploy the contract
    console.log("📡 Deploying contract...");
    const nft = await VerticalProjectNFT.deploy(
      VIRTUAL_TOKEN,
      VERT_TOKEN,
      TREASURY
    );

    // Wait for deployment
    console.log("⏳ Waiting for deployment confirmation...");
    await nft.waitForDeployment();

    const contractAddress = await nft.getAddress();
    console.log("\n🎉 Contract deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);

    // Verify contract state
    console.log("\n🔍 Verifying contract state...");
    const priceVirt = await nft.priceVirtual();
    const priceVert = await nft.priceVert();
    const nextTokenId = await nft.nextTokenId();
    const prizePool = await nft.prizePool();

    console.log("💰 VIRTUAL Price:", ethers.formatEther(priceVirt), "VIRTUAL");
    console.log("💰 VERT Price:", ethers.formatEther(priceVert), "VERT");
    console.log("🔢 Next Token ID:", nextTokenId.toString());
    console.log("🏆 Prize Pool:", ethers.formatEther(prizePool), "VERT");

    // Test new function exists
    console.log("\n🧪 Testing new function...");
    try {
      // This should not revert if the function exists
      const interface = nft.interface;
      const hasDepositFunction = interface.functions['depositToPrizePool(uint256)'] !== undefined;
      console.log("✅ depositToPrizePool function exists:", hasDepositFunction ? "YES" : "NO");
    } catch (error) {
      console.log("❌ Error checking function:", error.message);
    }

    // Output for easy copying
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`🆕 New Contract Address: ${contractAddress}`);
    console.log(`🔗 Etherscan: https://sepolia.basescan.org/address/${contractAddress}`);
    console.log("=".repeat(60));

    // Update instructions
    console.log("\n📝 Next Steps:");
    console.log("1. Add this address to your .env and .env.local files:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("2. Update testnet.addresses.json");
    console.log("3. Test the new depositToPrizePool function");

    return contractAddress;

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎯 Deployment completed successfully!");
    console.log("New contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }); 