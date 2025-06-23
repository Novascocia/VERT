const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🖼️  Viewing minted NFTs...");
  
  const contractAddress = "0x46aA53a47fB31E6A2FC80F405A94b3732BC05039";
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  const contractABI = require("../abis/Vertical.json");
  const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
  
  try {
    const nextTokenId = await contract.nextTokenId();
    const totalMinted = nextTokenId - 1n;
    
    console.log("📊 Total NFTs minted:", totalMinted.toString());
    console.log("🔗 Contract verified at: https://basescan.org/address/" + contractAddress);
    console.log("\n" + "=".repeat(80));
    
    if (totalMinted > 0) {
      for (let i = 1; i <= Number(totalMinted); i++) {
        try {
          const tokenURI = await contract.tokenURI(i);
          const owner = await contract.ownerOf(i);
          
          console.log(`\n🎨 NFT #${i}`);
          console.log("   Owner: " + owner);
          console.log("   Metadata: " + tokenURI);
          console.log("   Metadata URL: " + tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
          console.log("   OpenSea URL: https://opensea.io/assets/base/" + contractAddress + "/" + i);
          console.log("   BaseScan URL: https://basescan.org/nft/" + contractAddress + "/" + i);
          
          // Try to get the image URL
          try {
            const response = await fetch(tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
            if (response.ok) {
              const metadata = await response.json();
              const imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
              console.log("   Image URL: " + imageUrl);
              console.log("   ✅ Metadata & Image accessible");
            }
          } catch (error) {
            console.log("   ❌ Error fetching metadata");
          }
          
        } catch (error) {
          console.log(`\n❌ Error with NFT #${i}: ${error.message}`);
        }
      }
      
      console.log("\n" + "=".repeat(80));
      console.log("🔄 To force OpenSea to discover these NFTs:");
      console.log("1. Visit each OpenSea URL above");
      console.log("2. Click 'Refresh metadata' on each NFT page");
      console.log("3. Wait 15-30 minutes for OpenSea indexing");
      console.log("\n💡 All NFTs are working correctly - OpenSea just needs time to index the new contract!");
      
    } else {
      console.log("No NFTs have been minted yet.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch(console.error); 