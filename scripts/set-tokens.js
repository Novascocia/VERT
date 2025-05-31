const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting token addresses...\n");

  // Contract addresses
  const NFT_CONTRACT = "0xD909b300a9F233129B0b6d19c466D1Ec0490137E";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";
  const VIRTUAL_TOKEN = "0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a";

  // Get contract instance
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );

  // Set VERT token address
  console.log("Setting VERT token address...");
  const setVertTx = await nft.setVertToken(VERT_TOKEN);
  await setVertTx.wait();
  console.log("✅ VERT token address set");

  // Set VIRTUAL token address
  console.log("Setting VIRTUAL token address...");
  const setVirtualTx = await nft.setVirtualToken(VIRTUAL_TOKEN);
  await setVirtualTx.wait();
  console.log("✅ VIRTUAL token address set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 