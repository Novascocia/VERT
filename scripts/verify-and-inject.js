const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying VERT token and injecting into prize pool...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Amount to inject (5000 VERT)
  const amount = hre.ethers.parseUnits("5000", 18);

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Verify VERT token address
  const currentVertToken = await nft.vertToken();
  console.log(`Current VERT token address: ${currentVertToken}`);
  if (currentVertToken.toLowerCase() !== VERT_TOKEN.toLowerCase()) {
    console.log("❌ VERT token address mismatch!");
    return;
  }
  console.log("✅ VERT token address verified");

  // Check initial prize pool
  const initialPrizePool = await nft.getPrizePoolBalance();
  console.log(`Initial Prize Pool: ${hre.ethers.formatEther(initialPrizePool)} VERT`);

  // Check VERT balance
  const vertBalance = await vertToken.balanceOf(signer.address);
  console.log(`Your VERT Balance: ${hre.ethers.formatEther(vertBalance)} VERT`);

  // Approve VERT transfer
  console.log("\nApproving VERT transfer...");
  const approveTx = await vertToken.approve(NFT_CONTRACT, amount);
  await approveTx.wait();
  console.log("✅ VERT transfer approved");

  // Add to prize pool
  console.log("\nAdding to prize pool...");
  const addTx = await nft.addToPrizePool(amount);
  const receipt = await addTx.wait();
  console.log("✅ Transaction successful!");
  console.log(`Transaction hash: ${receipt.hash}`);

  // Check final prize pool
  const finalPrizePool = await nft.getPrizePoolBalance();
  console.log(`\nFinal Prize Pool: ${hre.ethers.formatEther(finalPrizePool)} VERT`);
  console.log(`Added: ${hre.ethers.formatEther(finalPrizePool - initialPrizePool)} VERT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 