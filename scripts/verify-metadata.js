const hre = require("hardhat");
const { create } = require('ipfs-http-client');
const { Buffer } = require('buffer');

async function main() {
  console.log("🔍 Starting Metadata Verification...");

  // Initialize IPFS client
  const ipfs = create({ url: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0' });

  const nft = await hre.ethers.getContractAt(
    "VerticalProjectNFT",
    process.env.NFT_CONTRACT_ADDRESS
  );

  const [deployer, user] = await hre.ethers.getSigners();

  // Mint a test NFT
  console.log("\nMinting test NFT...");
  const tx = await nft.connect(user).mintWithVirtual("ipfs://test");
  const receipt = await tx.wait();

  // Find NFTMinted event
  const mintedEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === "NFTMinted"
  );

  if (!mintedEvent) {
    throw new Error("NFTMinted event not found");
  }

  const tokenId = mintedEvent.args[1];
  const tokenURI = mintedEvent.args[3];
  const rarity = mintedEvent.args[2];

  console.log(`Token ID: ${tokenId}`);
  console.log(`Token URI: ${tokenURI}`);
  console.log(`Rarity: ${rarity}`);

  // Verify metadata structure
  console.log("\nVerifying metadata structure...");

  // Extract IPFS hash from URI
  const ipfsHash = tokenURI.replace('ipfs://', '');
  
  try {
    // Fetch metadata from IPFS
    const stream = ipfs.cat(ipfsHash);
    let data = '';
    
    for await (const chunk of stream) {
      data += chunk.toString();
    }

    const metadata = JSON.parse(data);
    console.log("\nMetadata Content:", metadata);

    // Verify required fields
    const requiredFields = ['name', 'description', 'image', 'attributes'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Verify attributes structure
    if (!Array.isArray(metadata.attributes)) {
      throw new Error('Attributes must be an array');
    }

    // Verify only Rarity trait exists
    if (metadata.attributes.length !== 1) {
      throw new Error('Only Rarity trait should be present');
    }

    const rarityTrait = metadata.attributes[0];
    if (rarityTrait.trait_type !== 'Rarity') {
      throw new Error('Only Rarity trait_type is allowed');
    }

    // Verify rarity value matches contract
    const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
    if (!rarityNames.includes(rarityTrait.value)) {
      throw new Error(`Invalid rarity value: ${rarityTrait.value}`);
    }

    console.log("\n✅ Metadata verification successful!");
    console.log("✅ All required fields present");
    console.log("✅ Attributes structure correct");
    console.log("✅ Only Rarity trait present");
    console.log("✅ Rarity value valid");

  } catch (error) {
    console.error("\n❌ Metadata verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 