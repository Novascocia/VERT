const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking VERT allowance and approving if needed...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Mint cost (1.5 VERT)
  const mintCost = hre.ethers.parseEther("1.5");

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Check current allowance
  const currentAllowance = await vertToken.allowance(signer.address, NFT_CONTRACT);
  console.log(`Current VERT allowance: ${hre.ethers.formatEther(currentAllowance)} VERT`);

  // Approve if needed
  if (currentAllowance < mintCost) {
    console.log("\nApproving VERT transfer...");
    const approveTx = await vertToken.approve(NFT_CONTRACT, hre.ethers.constants.MaxUint256);
    await approveTx.wait();
    console.log("✅ VERT transfer approved");
  } else {
    console.log("✅ VERT allowance sufficient");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 