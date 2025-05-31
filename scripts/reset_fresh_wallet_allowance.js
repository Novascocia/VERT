require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔄 Resetting fresh wallet VIRTUAL allowance...");
  
  // This script will need to be run with the fresh wallet's private key
  // For now, let's check the current state and provide instructions
  
  const FRESH_WALLET = "0x47a8960701bd90504ABa30767794FbeA2B6bDe2F";
  const VIRTUAL_TOKEN_ADDRESS = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get VIRTUAL token contract
  const virtualToken = await hre.ethers.getContractAt("IERC20", VIRTUAL_TOKEN_ADDRESS);
  
  // Check current allowance
  const currentAllowance = await virtualToken.allowance(FRESH_WALLET, NFT_CONTRACT_ADDRESS);
  console.log("Fresh wallet current allowance:", hre.ethers.formatEther(currentAllowance), "VIRTUAL");
  
  if (currentAllowance > 0) {
    console.log("\n❗ The fresh wallet has an existing allowance of", hre.ethers.formatEther(currentAllowance), "VIRTUAL");
    console.log("\n🔧 To reset this allowance, you need to:");
    console.log("1. Connect your fresh wallet to the dApp");
    console.log("2. Call approve() with amount = 0");
    console.log("3. Or use MetaMask to revoke the token approval");
    console.log("\n📱 Since you're testing on mobile, the easiest way is:");
    console.log("- Go to MetaMask mobile app");
    console.log("- Settings > Security & Privacy > Token Approvals");
    console.log("- Find the VIRTUAL token approval for the NFT contract");
    console.log("- Revoke or set to 0");
  } else {
    console.log("✅ Fresh wallet allowance is already 0");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 