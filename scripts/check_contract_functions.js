const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking available functions on deployed contract...\n");

  const NFT_CONTRACT = "0xD77dDA7b71b0fF0D1597dbEDfd11a3aAEd8B74a2";
  
  try {
    // Connect to the deployed contract
    const nftContract = await ethers.getContractAt("contracts/VerticalProjectNFT.sol:VerticalProjectNFT", NFT_CONTRACT);
    
    // Get the interface
    const contractInterface = nftContract.interface;
    
    console.log("📋 Available Functions:");
    console.log("====================");
    
    const functions = Object.keys(contractInterface.functions);
    functions.sort().forEach((func, index) => {
      const fragment = contractInterface.functions[func];
      console.log(`${index + 1}. ${fragment.name}(${fragment.inputs.map(input => `${input.type} ${input.name}`).join(', ')})`);
    });

    console.log(`\n📊 Total Functions: ${functions.length}`);
    
    // Check if depositToPrizePool exists
    const hasDepositFunction = functions.some(func => func.includes('depositToPrizePool'));
    console.log(`\n🔍 depositToPrizePool function exists: ${hasDepositFunction ? '✅ YES' : '❌ NO'}`);
    
    if (!hasDepositFunction) {
      console.log("\n❗ The depositToPrizePool function is not available on the deployed contract.");
      console.log("   You need to deploy the updated contract or upgrade if using a proxy.");
    } else {
      console.log("\n🎉 New depositToPrizePool function is available!");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 