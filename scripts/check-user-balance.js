const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("💰 Checking user balances and allowances...");
  
  const userAddress = "0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca";
  const contractAddress = "0x46aA53a47fB31E6A2FC80F405A94b3732BC05039";
  const virtualTokenAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
  
  // Connect to Base Mainnet
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  
  try {
    console.log("🌐 Network:", await provider.getNetwork());
    console.log("👤 User:", userAddress);
    console.log("📄 NFT Contract:", contractAddress);
    console.log("🪙 VIRTUAL Token:", virtualTokenAddress);
    
    // Check ETH balance
    const ethBalance = await provider.getBalance(userAddress);
    console.log("\n💰 ETH Balance:", ethers.formatEther(ethBalance), "ETH");
    
    // Check VIRTUAL token balance
    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const virtualToken = new ethers.Contract(virtualTokenAddress, erc20ABI, provider);
    
    const virtualBalance = await virtualToken.balanceOf(userAddress);
    const decimals = await virtualToken.decimals();
    const allowance = await virtualToken.allowance(userAddress, contractAddress);
    
    console.log("🪙 VIRTUAL Balance:", ethers.formatUnits(virtualBalance, decimals), "VIRTUAL");
    console.log("✅ VIRTUAL Allowance:", ethers.formatUnits(allowance, decimals), "VIRTUAL");
    
    // Check if user has enough for minting
    const mintPrice = ethers.parseUnits("0.01", decimals); // 0.01 VIRTUAL
    const hasEnoughBalance = virtualBalance >= mintPrice;
    const hasEnoughAllowance = allowance >= mintPrice;
    
    console.log("\n🎯 Minting Requirements:");
    console.log("- Required:", ethers.formatUnits(mintPrice, decimals), "VIRTUAL");
    console.log("- Has Balance:", hasEnoughBalance ? "✅" : "❌");
    console.log("- Has Allowance:", hasEnoughAllowance ? "✅" : "❌");
    
    if (!hasEnoughBalance) {
      console.log("\n❌ Insufficient VIRTUAL balance for minting!");
    }
    if (!hasEnoughAllowance) {
      console.log("\n❌ Insufficient VIRTUAL allowance! Need to approve the contract.");
    }
    if (hasEnoughBalance && hasEnoughAllowance) {
      console.log("\n✅ Ready to mint!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error); 