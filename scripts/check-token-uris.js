const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Checking token URIs...");
  
  // Contract address
  const contractAddress = "0x414280a38d52eB30768275Eb95D16714c69d216A";
  
  // Connect to contract
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  
  // Load contract ABI
  const contractABI = require("../abis/Vertical.json");
  const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
  
  try {
    // Get next token ID to see how many have been minted
    const nextTokenId = await contract.nextTokenId();
    const totalMinted = nextTokenId - 1n;
    
    console.log("📊 Contract Status:");
    console.log("- Total minted:", totalMinted.toString());
    
    if (totalMinted > 0) {
      console.log("\n🔗 Checking token URIs:");
      
      // Check the last few tokens
      const tokensToCheck = Math.min(Number(totalMinted), 5);
      
      for (let i = Number(totalMinted); i > Number(totalMinted) - tokensToCheck; i--) {
        try {
          const tokenURI = await contract.tokenURI(i);
          const owner = await contract.ownerOf(i);
          console.log(`\n📝 Token #${i}:`);
          console.log("  Owner:", owner);
          console.log("  URI:", tokenURI);
          
          // Try to fetch the metadata
          if (tokenURI.startsWith('ipfs://')) {
            const httpUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            try {
              const response = await fetch(httpUrl);
              if (response.ok) {
                const metadata = await response.json();
                console.log("  ✅ Metadata accessible");
                console.log("  Name:", metadata.name);
                console.log("  Image:", metadata.image);
              } else {
                console.log("  ❌ Metadata not accessible:", response.status);
              }
            } catch (fetchError) {
              console.log("  ❌ Error fetching metadata:", fetchError.message);
            }
          }
        } catch (error) {
          console.log(`\n❌ Token #${i}: ${error.message}`);
        }
      }
    } else {
      console.log("No tokens have been minted yet.");
    }
    
  } catch (error) {
    console.error("❌ Error checking tokens:", error);
  }
}

main().catch(console.error); 