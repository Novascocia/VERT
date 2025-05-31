const hre = require("hardhat");

async function main() {
  console.log("💰 Adding 10,000 VERT to Prize Pool...\n");

  // Contract addresses
  const NFT_CONTRACT = "0x9114420a6e77E41784590a9D2eE66AE3751F434c";
  const VERT_TOKEN = "0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd";

  // Amount to add (10,000 VERT)
  const amount = hre.ethers.parseUnits("10000", 18);

  // Get contract instances
  const nft = await hre.ethers.getContractAt(
    "contracts/VerticalProjectNFT.sol:VerticalProjectNFT",
    NFT_CONTRACT
  );
  const vertToken = await hre.ethers.getContractAt("IERC20", VERT_TOKEN);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Check initial prize pool
  const initialPrizePool = await nft.getPrizePoolBalance();
  console.log(`Initial Prize Pool: ${hre.ethers.formatEther(initialPrizePool)} VERT`);

  // Check VERT balance
  const vertBalance = await vertToken.balanceOf(signer.address);
  console.log(`Your VERT Balance: ${hre.ethers.formatEther(vertBalance)} VERT`);

  if (vertBalance < amount) {
    console.log("❌ Insufficient VERT balance!");
    return;
  }

  // Check allowance
  const allowance = await vertToken.allowance(signer.address, NFT_CONTRACT);
  console.log(`Current allowance: ${hre.ethers.formatEther(allowance)} VERT`);

  if (allowance < amount) {
    console.log("\n📝 Approving VERT transfer...");
    const approveTx = await vertToken.approve(NFT_CONTRACT, amount);
    await approveTx.wait();
    console.log("✅ VERT transfer approved");
  }

  // Add to prize pool
  console.log("\n💰 Adding 10,000 VERT to prize pool...");
  const addTx = await nft.addToPrizePool(amount);
  console.log(`Transaction sent: ${addTx.hash}`);
  
  const receipt = await addTx.wait();
  console.log("✅ Transaction confirmed!");

  // Check final prize pool
  const finalPrizePool = await nft.getPrizePoolBalance();
  console.log(`\nFinal Prize Pool: ${hre.ethers.formatEther(finalPrizePool)} VERT`);
  console.log(`Added: ${hre.ethers.formatEther(finalPrizePool - initialPrizePool)} VERT`);
  
  // Check contract VERT balance
  const contractBalance = await vertToken.balanceOf(NFT_CONTRACT);
  console.log(`Contract VERT Balance: ${hre.ethers.formatEther(contractBalance)} VERT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 