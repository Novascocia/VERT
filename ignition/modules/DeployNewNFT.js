const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VerticalNFTModule", (m) => {
  // Mainnet Addresses
  const pVERT_TOKEN_ADDRESS = "0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA";
  const VIRTUAL_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
  const TREASURY_ADDRESS = "0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23";

  console.log("🚀 Deploying VerticalProjectNFT Contract with the following parameters:");
  console.log("pVERT Token:", pVERT_TOKEN_ADDRESS);
  console.log("VIRTUAL Token:", VIRTUAL_TOKEN_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);

  const nftContract = m.contract("contracts/VerticalProjectNFT_WithManualSync_Fixed.sol:VerticalProjectNFT_WithManualSync_Fixed", [
    pVERT_TOKEN_ADDRESS,
    VIRTUAL_TOKEN_ADDRESS,
    TREASURY_ADDRESS,
  ]);

  return { nftContract };
}); 