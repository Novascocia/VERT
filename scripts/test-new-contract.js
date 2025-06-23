const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Testing new NFT contract...");
  
  // Contract address
  const contractAddress = "0x46aA53a47fB31E6A2FC80F405A94b3732BC05039";
  
  // Connect to contract
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Load contract ABI
  const contractABI = require("../abis/Vertical.json");
  const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
  try {
    console.log("📊 Contract Info:");
    console.log("- Address:", contractAddress);
    console.log("- Signer:", signer.address);
    
    // Check basic contract info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();
    const nextTokenId = await contract.nextTokenId();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Owner:", owner);
    console.log("- Next Token ID:", nextTokenId.toString());
    
    // Check if our signer is the owner
    const isOwner = signer.address.toLowerCase() === owner.toLowerCase();
    console.log("- Is Signer Owner?", isOwner);
    
    // Try to call setTokenURI (this should work if we're the owner)
    if (isOwner) {
      console.log("\n🧪 Testing setTokenURI function...");
      try {
        // Test with a dummy URI for token ID 1 (if it exists)
        const testUri = "ipfs://QmTest123";
        const gasEstimate = await contract.setTokenURI.estimateGas(1, testUri);
        console.log("✅ setTokenURI gas estimate:", gasEstimate.toString());
        console.log("✅ setTokenURI function is callable");
      } catch (error) {
        console.error("❌ setTokenURI test failed:", error.message);
      }
    } else {
      console.log("⚠️ Signer is not the contract owner, cannot test setTokenURI");
    }
    
  } catch (error) {
    console.error("❌ Error testing contract:", error);
  }
}

main().catch(console.error); 