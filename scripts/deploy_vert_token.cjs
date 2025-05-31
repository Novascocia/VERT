const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying VertToken_Testnet with address:", deployer.address);

  const ContractFactory = await ethers.getContractFactory("VertToken_Testnet");
  const contract = await ContractFactory.deploy();
  console.log("Full contract object:", contract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 