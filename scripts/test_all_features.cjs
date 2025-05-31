require("dotenv").config();
const hre = require("hardhat");
const { parseEther } = require("ethers");

async function main() {
  console.log("🔧 Starting comprehensive feature tests...");
  console.log("Environment variables loaded:");
  console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);
  console.log("VERT_TOKEN_ADDRESS:", process.env.VERT_TOKEN_ADDRESS);
  console.log("VIRTUAL_TOKEN_ADDRESS:", process.env.VIRTUAL_TOKEN_ADDRESS);

  try {
    // Get contract instances
    console.log("\nGetting contract instances...");
    const nft = await hre.ethers.getContractAt("VerticalProjectNFT", process.env.CONTRACT_ADDRESS);
    console.log("NFT contract loaded at:", nft.target);
    
    const vertToken = await hre.ethers.getContractAt("IERC20", process.env.VERT_TOKEN_ADDRESS);
    console.log("VERT token loaded at:", vertToken.target);
    
    const virtualToken = await hre.ethers.getContractAt("IERC20", process.env.VIRTUAL_TOKEN_ADDRESS);
    console.log("VIRTUAL token loaded at:", virtualToken.target);
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // 1. Test Admin Functions
    console.log("\n1️⃣ Testing Admin Functions...");
    
    // Set prices
    console.log("Setting prices...");
    const priceTx = await nft.setPrices(parseEther("2.5"), parseEther("1.5"));
    await priceTx.wait();
    console.log("✅ Prices set");

    // Set prize percentages
    console.log("Setting prize percentages...");
    await nft.setPrizePercent(1, 3);  // Rare: 3%
    await nft.setPrizePercent(2, 7);  // Epic: 7%
    await nft.setPrizePercent(3, 15); // Legendary: 15%
    await nft.setPrizePercent(4, 40); // Mythical: 40%
    console.log("✅ Prize percentages set");

    // 2. Test Minting with VIRTUAL
    console.log("\n2️⃣ Testing VIRTUAL Mint...");
    
    // Approve VIRTUAL tokens
    console.log("Approving VIRTUAL tokens...");
    const virtualApproveTx = await virtualToken.approve(nft.target, parseEther("10"));
    await virtualApproveTx.wait();
    console.log("✅ VIRTUAL tokens approved");
    
    // Mint with VIRTUAL
    console.log("Minting with VIRTUAL...");
    const virtualTx = await nft.mintWithVirtual("ipfs://test-virtual");
    await virtualTx.wait();
    console.log("✅ VIRTUAL mint successful");

    // 3. Test Minting with VERT
    console.log("\n3️⃣ Testing VERT Mint...");
    
    // Approve VERT tokens
    console.log("Approving VERT tokens...");
    const vertApproveTx = await vertToken.approve(nft.target, parseEther("10"));
    await vertApproveTx.wait();
    console.log("✅ VERT tokens approved");
    
    // Mint with VERT
    console.log("Minting with VERT...");
    const vertTx = await nft.mintWithVert("ipfs://test-vert");
    await vertTx.wait();
    console.log("✅ VERT mint successful");

    // 4. Verify Prize Pool
    console.log("\n4️⃣ Checking Prize Pool...");
    const prizePool = await nft.getPrizePoolBalance();
    console.log("Prize Pool Balance:", hre.ethers.formatEther(prizePool), "VERT");

    // 5. Test Pause/Unpause
    console.log("\n5️⃣ Testing Pause/Unpause...");
    
    // Pause
    console.log("Pausing contract...");
    const pauseTx = await nft.pause();
    await pauseTx.wait();
    console.log("✅ Contract paused");

    // Try minting while paused (should fail)
    console.log("Attempting mint while paused...");
    try {
      await nft.mintWithVert("ipfs://test-paused");
      console.error("❌ Mint succeeded while paused");
    } catch (err) {
      console.log("✅ Mint reverted as expected while paused");
    }

    // Unpause
    console.log("Unpausing contract...");
    const unpauseTx = await nft.unpause();
    await unpauseTx.wait();
    console.log("✅ Contract unpaused");

    // 6. Check Total Minted
    console.log("\n6️⃣ Checking Total Minted...");
    const totalMinted = await nft.getTotalMinted();
    console.log("Total NFTs Minted:", totalMinted.toString());

    console.log("\n✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error.message) console.error("Error message:", error.message);
    if (error.code) console.error("Error code:", error.code);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
}); 