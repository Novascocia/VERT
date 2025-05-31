require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking contract configuration...");
  
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VIRTUAL_TOKEN_ADDRESS = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const EXPECTED_TREASURY = "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";
  
  // Get contract instance
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  const virtualToken = await hre.ethers.getContractAt("IERC20", VIRTUAL_TOKEN_ADDRESS);
  
  console.log("\n📋 Contract Configuration:");
  
  // Check treasury address
  const treasuryAddress = await nftContract.treasury();
  console.log("Treasury address:", treasuryAddress);
  console.log("Expected treasury:", EXPECTED_TREASURY);
  console.log("Treasury matches:", treasuryAddress.toLowerCase() === EXPECTED_TREASURY.toLowerCase());
  
  // Check VIRTUAL token address
  const virtualTokenAddress = await nftContract.virtualToken();
  console.log("\nVIRTUAL token address:", virtualTokenAddress);
  console.log("Expected VIRTUAL:", VIRTUAL_TOKEN_ADDRESS);
  console.log("VIRTUAL matches:", virtualTokenAddress.toLowerCase() === VIRTUAL_TOKEN_ADDRESS.toLowerCase());
  
  // Check VIRTUAL token price
  const virtualPrice = await nftContract.priceVirtual();
  console.log("\nVIRTUAL price:", hre.ethers.formatEther(virtualPrice), "tokens");
  
  // Check treasury VIRTUAL balance
  const treasuryBalance = await virtualToken.balanceOf(treasuryAddress);
  console.log("\nTreasury VIRTUAL balance:", hre.ethers.formatEther(treasuryBalance), "VIRTUAL");
  
  // Check total minted
  const totalMinted = await nftContract.getTotalMinted();
  console.log("Total NFTs minted:", totalMinted.toString());
  
  console.log("\n💡 Analysis:");
  if (treasuryAddress.toLowerCase() !== EXPECTED_TREASURY.toLowerCase()) {
    console.log("❌ Treasury address mismatch! VIRTUAL tokens are going to wrong address.");
    console.log("   Current:", treasuryAddress);
    console.log("   Expected:", EXPECTED_TREASURY);
  } else {
    console.log("✅ Treasury address is correct");
  }
  
  if (virtualTokenAddress.toLowerCase() !== VIRTUAL_TOKEN_ADDRESS.toLowerCase()) {
    console.log("❌ VIRTUAL token address mismatch!");
  } else {
    console.log("✅ VIRTUAL token address is correct");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 