require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("💰 Checking wallet balances...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer account:", deployer.address);
  
  const FRESH_WALLET = "0x47a8960701bd90504ABa30767794FbeA2B6bDe2F";
  const VIRTUAL_TOKEN_ADDRESS = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";
  const NFT_CONTRACT_ADDRESS = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  
  // Get VIRTUAL token contract
  const virtualToken = await hre.ethers.getContractAt("IERC20", VIRTUAL_TOKEN_ADDRESS);
  
  // Check balances
  const deployerBalance = await virtualToken.balanceOf(deployer.address);
  const freshWalletBalance = await virtualToken.balanceOf(FRESH_WALLET);
  
  console.log("Deployer VIRTUAL balance:", hre.ethers.formatEther(deployerBalance));
  console.log("Fresh wallet VIRTUAL balance:", hre.ethers.formatEther(freshWalletBalance));
  
  // Get mint price
  const nftContract = await hre.ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT_ADDRESS);
  const mintPrice = await nftContract.priceVirtual();
  console.log("Mint price:", hre.ethers.formatEther(mintPrice), "VIRTUAL");
  
  // Check if fresh wallet needs tokens
  const needed = mintPrice * 5n; // Give enough for 5 mints
  if (freshWalletBalance < needed) {
    console.log(`\n🚀 Fresh wallet needs more VIRTUAL tokens...`);
    console.log(`Transferring ${hre.ethers.formatEther(needed)} VIRTUAL to fresh wallet...`);
    
    const tx = await virtualToken.transfer(FRESH_WALLET, needed);
    await tx.wait();
    
    console.log("✅ Transfer complete!");
    
    // Check new balance
    const newBalance = await virtualToken.balanceOf(FRESH_WALLET);
    console.log("Fresh wallet new balance:", hre.ethers.formatEther(newBalance), "VIRTUAL");
  } else {
    console.log("✅ Fresh wallet has sufficient VIRTUAL tokens");
  }
  
  // Check allowance (should be 0 for fresh wallet)
  const allowance = await virtualToken.allowance(FRESH_WALLET, NFT_CONTRACT_ADDRESS);
  console.log("Fresh wallet allowance:", hre.ethers.formatEther(allowance), "VIRTUAL");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 