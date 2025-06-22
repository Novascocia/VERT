const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Checking OpenSea compatibility...");
  
  const contractAddress = "0x414280a38d52eB30768275Eb95D16714c69d216A";
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  const contractABI = require("../abis/Vertical.json");
  const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
  
  try {
    console.log("📋 Contract Metadata Check:");
    
    // Check basic ERC721 compliance
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log("✅ Name:", name);
    console.log("✅ Symbol:", symbol);
    
    // Check if contract supports required interfaces
    try {
      const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
      const supportsERC721Metadata = await contract.supportsInterface("0x5b5e139f");
      const supportsERC165 = await contract.supportsInterface("0x01ffc9a7");
      
      console.log("✅ Supports ERC721:", supportsERC721);
      console.log("✅ Supports ERC721Metadata:", supportsERC721Metadata);
      console.log("✅ Supports ERC165:", supportsERC165);
    } catch (error) {
      console.log("❌ Interface check failed:", error.message);
    }
    
    // Check token metadata format
    const nextTokenId = await contract.nextTokenId();
    const totalMinted = nextTokenId - 1n;
    
    if (totalMinted > 0) {
      console.log("\n🔍 Checking metadata format for OpenSea:");
      
      const tokenURI = await contract.tokenURI(1);
      console.log("Token URI:", tokenURI);
      
      // Fetch and validate metadata
      try {
        const metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        const response = await fetch(metadataUrl);
        const metadata = await response.json();
        
        console.log("\n📄 Metadata structure:");
        console.log("- Name:", metadata.name ? "✅" : "❌");
        console.log("- Description:", metadata.description ? "✅" : "❌");
        console.log("- Image:", metadata.image ? "✅" : "❌");
        console.log("- Attributes:", metadata.attributes ? "✅" : "❌");
        
        if (metadata.image) {
          const imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
          console.log("\n🖼️ Testing image accessibility:");
          try {
            const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
            console.log("- Image accessible:", imageResponse.ok ? "✅" : "❌");
            console.log("- Image content-type:", imageResponse.headers.get('content-type'));
          } catch (error) {
            console.log("- Image test failed:", error.message);
          }
        }
        
      } catch (error) {
        console.log("❌ Metadata fetch failed:", error.message);
      }
    }
    
    console.log("\n🌐 OpenSea URLs to try:");
    console.log("Collection: https://opensea.io/collection/vertical-project-nft");
    console.log("Asset: https://opensea.io/assets/base/" + contractAddress + "/1");
    console.log("Contract: https://opensea.io/assets/base/" + contractAddress);
    
    console.log("\n💡 If OpenSea still doesn't show:");
    console.log("1. The contract is very new - can take 24-48 hours");
    console.log("2. Try OpenSea testnet first to verify metadata format");
    console.log("3. Contact OpenSea support to manually index the contract");
    console.log("4. Consider using alternative marketplaces like Blur or LooksRare");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch(console.error); 