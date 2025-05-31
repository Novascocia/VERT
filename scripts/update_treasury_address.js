require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔧 Updating treasury address...");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const NEW_TREASURY_ADDRESS = "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";
  
  // Get contract instance
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  
  // Check current treasury
  const currentTreasury = await nftContract.treasury();
  console.log("Current treasury:", currentTreasury);
  console.log("New treasury:", NEW_TREASURY_ADDRESS);
  
  if (currentTreasury.toLowerCase() === NEW_TREASURY_ADDRESS.toLowerCase()) {
    console.log("✅ Treasury address is already correct!");
    return;
  }
  
  // Update treasury address
  console.log("\n🚀 Updating treasury address...");
  const tx = await nftContract.setTreasury(NEW_TREASURY_ADDRESS);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  await tx.wait();
  console.log("✅ Transaction confirmed!");
  
  // Verify the change
  const newTreasury = await nftContract.treasury();
  console.log("Updated treasury:", newTreasury);
  
  if (newTreasury.toLowerCase() === NEW_TREASURY_ADDRESS.toLowerCase()) {
    console.log("🎉 Treasury address successfully updated!");
    console.log("\n💡 Future VIRTUAL token payments will now go to the correct treasury wallet.");
  } else {
    console.log("❌ Treasury address update failed!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 