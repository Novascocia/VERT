const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting mint prices to match current working contract...");
  
  // Contract address will be set after deployment
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    throw new Error("❌ CONTRACT_ADDRESS environment variable is required");
  }
  
  console.log("📍 Target Contract:", CONTRACT_ADDRESS);
  
  // Current prices from working contract
  const VIRTUAL_PRICE = hre.ethers.parseEther("0.01");  // 0.01 VIRTUAL
  const VERT_PRICE = hre.ethers.parseEther("500");      // 500 VERT
  
  console.log("💰 Setting prices:");
  console.log("VIRTUAL Price:", hre.ethers.formatEther(VIRTUAL_PRICE), "VIRTUAL");
  console.log("VERT Price:", hre.ethers.formatEther(VERT_PRICE), "VERT");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Admin account:", deployer.address);
  
  // Connect to contract
  const nftContract = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_WithManualSync.sol:VerticalProjectNFT",
    CONTRACT_ADDRESS
  );
  
  // Check current prices before update
  try {
    const currentVirtualPrice = await nftContract.priceVirtual();
    const currentVertPrice = await nftContract.priceVert();
    
    console.log("\n📊 Current prices:");
    console.log("VIRTUAL:", hre.ethers.formatEther(currentVirtualPrice), "VIRTUAL");
    console.log("VERT:", hre.ethers.formatEther(currentVertPrice), "VERT");
  } catch (error) {
    console.warn("⚠️ Could not read current prices:", error.message);
  }
  
  // Update prices
  console.log("\n🚀 Updating prices...");
  
  try {
    const tx = await nftContract.setPrices(VIRTUAL_PRICE, VERT_PRICE);
    console.log("⏳ Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.error("❌ Failed to update prices:", error.message);
    throw error;
  }
  
  // Verify prices were updated correctly
  console.log("\n🔍 Verifying updated prices...");
  
  try {
    const updatedVirtualPrice = await nftContract.priceVirtual();
    const updatedVertPrice = await nftContract.priceVert();
    
    console.log("📊 Updated prices:");
    console.log("VIRTUAL:", hre.ethers.formatEther(updatedVirtualPrice), "VIRTUAL");
    console.log("VERT:", hre.ethers.formatEther(updatedVertPrice), "VERT");
    
    // Check if prices match expected values
    const virtualMatch = updatedVirtualPrice === VIRTUAL_PRICE;
    const vertMatch = updatedVertPrice === VERT_PRICE;
    
    if (virtualMatch && vertMatch) {
      console.log("✅ All prices updated successfully!");
    } else {
      console.error("❌ Price mismatch detected!");
      if (!virtualMatch) console.error("VIRTUAL price mismatch");
      if (!vertMatch) console.error("VERT price mismatch");
    }
    
  } catch (error) {
    console.error("❌ Failed to verify prices:", error.message);
  }
  
  console.log("\n🎉 Mint price configuration complete!");
  console.log("Contract is now ready for production use.");
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  }); 