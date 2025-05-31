const hre = require("hardhat");

async function main() {
  console.log("🧪 Starting Base Sepolia tests...");

  // Get the contract instance
  const nft = await hre.ethers.getContractAt(
    "VerticalProjectNFT",
    process.env.NFT_CONTRACT_ADDRESS
  );

  const [deployer, user] = await hre.ethers.getSigners();

  // Test 1: Core Contract Functionality
  console.log("\n1. Testing Core Contract Functionality");
  console.log("-------------------------------------");

  // Test mintWithVirtual
  console.log("\nTesting mintWithVirtual...");
  try {
    const tx = await nft.connect(user).mintWithVirtual("ipfs://test");
    await tx.wait();
    console.log("✅ mintWithVirtual successful");
  } catch (error) {
    console.error("❌ mintWithVirtual failed:", error.message);
  }

  // Test mintWithVert before setting token
  console.log("\nTesting mintWithVert before setVertToken...");
  try {
    await nft.connect(user).mintWithVert("ipfs://test");
    console.log("❌ mintWithVert should have failed");
  } catch (error) {
    console.log("✅ mintWithVert correctly blocked");
  }

  // Test setVertToken
  console.log("\nTesting setVertToken...");
  try {
    const tx = await nft.setVertToken(process.env.VERT_TOKEN_ADDRESS);
    await tx.wait();
    console.log("✅ setVertToken successful");
  } catch (error) {
    console.error("❌ setVertToken failed:", error.message);
  }

  // Test mintWithVert after setting token
  console.log("\nTesting mintWithVert after setVertToken...");
  try {
    const tx = await nft.connect(user).mintWithVert("ipfs://test");
    await tx.wait();
    console.log("✅ mintWithVert successful");
  } catch (error) {
    console.error("❌ mintWithVert failed:", error.message);
  }

  // Test admin functions
  console.log("\nTesting admin functions...");
  try {
    // Test pause
    await nft.pause();
    console.log("✅ pause successful");

    // Test setPrices
    await nft.setPrices(
      hre.ethers.parseEther("3.0"),
      hre.ethers.parseEther("2.0")
    );
    console.log("✅ setPrices successful");

    // Test unpause
    await nft.unpause();
    console.log("✅ unpause successful");
  } catch (error) {
    console.error("❌ Admin function test failed:", error.message);
  }

  // Test royalty info
  console.log("\nTesting royalty info...");
  try {
    const [receiver, amount] = await nft.royaltyInfo(1, hre.ethers.parseEther("1.0"));
    console.log("✅ royaltyInfo successful");
    console.log("Receiver:", receiver);
    console.log("Amount:", hre.ethers.formatEther(amount));
  } catch (error) {
    console.error("❌ royaltyInfo test failed:", error.message);
  }

  // Test supportsInterface
  console.log("\nTesting supportsInterface...");
  try {
    const supportsERC2981 = await nft.supportsInterface("0x2a55205a");
    console.log("✅ supportsInterface test successful");
    console.log("Supports ERC2981:", supportsERC2981);
  } catch (error) {
    console.error("❌ supportsInterface test failed:", error.message);
  }

  console.log("\n✅ Base Sepolia tests complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 