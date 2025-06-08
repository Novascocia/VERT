const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying pVERT Placeholder Token...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Team wallet address (same as deployer for this project)
  const TEAM_WALLET = "0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca";
  console.log(`Team wallet (will receive all pVERT): ${TEAM_WALLET}\n`);

  // Deploy pVERT token
  console.log("Deploying pVERT token...");
  const pVERT = await hre.ethers.deployContract("pVERT", [TEAM_WALLET]);
  await pVERT.waitForDeployment();

  const pvertAddress = await pVERT.getAddress();
  console.log(`✅ pVERT deployed to: ${pvertAddress}`);

  // Verify deployment
  console.log("\n📊 Verifying deployment...");
  const name = await pVERT.name();
  const symbol = await pVERT.symbol();
  const totalSupply = await pVERT.totalSupply();
  const teamBalance = await pVERT.balanceOf(TEAM_WALLET);
  const transfersEnabled = await pVERT.transfersEnabled();

  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} pVERT`);
  console.log(`Team Balance: ${hre.ethers.formatEther(teamBalance)} pVERT`);
  console.log(`Transfers Enabled: ${transfersEnabled}`);

  // Contract verification info
  console.log("\n🔍 Contract Verification:");
  console.log("Contract Address:", pvertAddress);
  console.log("Constructor Args:", TEAM_WALLET);
  
  console.log("\n✅ pVERT deployment complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contract on Etherscan (if on mainnet)");
  console.log("2. Call setVertToken(pVERT_ADDRESS) on your NFT contract");
  console.log("3. Transfer some pVERT to your NFT contract for prize payouts");
  
  return {
    pvertAddress,
    teamWallet: TEAM_WALLET
  };
}

// Script can be run directly or imported
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main }; 