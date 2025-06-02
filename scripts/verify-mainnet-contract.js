require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying Mainnet Contract...");
  console.log("=".repeat(50));
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  
  // Get contract instance
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT_Fixed.sol:VerticalProjectNFT", 
    contractAddress
  );
  
  try {
    console.log("\n🧪 Testing Contract Functions:");
    
    // Basic info
    const name = await nft.name();
    const symbol = await nft.symbol();
    const totalMinted = await nft.getTotalMinted();
    const paused = await nft.paused();
    
    console.log("✅ Name:", name);
    console.log("✅ Symbol:", symbol);
    console.log("✅ Total Minted:", totalMinted.toString());
    console.log("✅ Paused:", paused);
    
    // Pricing
    const priceVirtual = await nft.priceVirtual();
    const priceVert = await nft.priceVert();
    
    console.log("✅ VIRTUAL Price:", hre.ethers.formatEther(priceVirtual), "VIRTUAL");
    console.log("✅ VERT Price:", hre.ethers.formatEther(priceVert), "VERT");
    
    // Token addresses
    const virtualToken = await nft.virtualToken();
    const vertToken = await nft.vertToken();
    const treasury = await nft.treasury();
    
    console.log("✅ VIRTUAL Token:", virtualToken);
    console.log("✅ VERT Token:", vertToken);
    console.log("✅ Treasury:", treasury);
    
    // Prize pool
    const prizePoolBalance = await nft.getPrizePoolBalance();
    console.log("✅ Prize Pool:", hre.ethers.formatEther(prizePoolBalance), "VERT");
    
    console.log("\n🎯 Prize Percentages:");
    const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
    for (let i = 0; i < 5; i++) {
      const percent = await nft.prizePercentByRarity(i);
      console.log(`✅ ${rarities[i]}: ${percent}%`);
    }
    
    console.log("\n✅ All contract functions working correctly!");
    console.log("🚀 Ready for Phase 1 launch!");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🏁 Verification complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  }); 