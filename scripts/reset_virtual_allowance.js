require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔄 Resetting VIRTUAL token allowance...");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  const VIRTUAL_TOKEN_ADDRESS = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get VIRTUAL token contract
  const virtualToken = await hre.ethers.getContractAt("IERC20", VIRTUAL_TOKEN_ADDRESS);
  
  // Check current allowance
  const currentAllowance = await virtualToken.allowance(signer.address, NFT_CONTRACT_ADDRESS);
  console.log("Current allowance:", hre.ethers.formatEther(currentAllowance), "VIRTUAL");
  
  if (currentAllowance > 0) {
    // Reset allowance to 0
    console.log("Resetting allowance to 0...");
    const tx = await virtualToken.approve(NFT_CONTRACT_ADDRESS, 0);
    await tx.wait();
    console.log("✅ Allowance reset to 0");
  } else {
    console.log("✅ Allowance is already 0");
  }
  
  // Verify reset
  const newAllowance = await virtualToken.allowance(signer.address, NFT_CONTRACT_ADDRESS);
  console.log("New allowance:", hre.ethers.formatEther(newAllowance), "VIRTUAL");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 