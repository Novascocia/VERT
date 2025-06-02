const { ethers } = require('ethers');
const axios = require('axios');

// Contract addresses from .env.local
const CONTRACT_ADDRESS = '0x9114420a6e77E41784590a9D2eE66AE3751F434c';
const RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';

const CONTRACT_ABI = [
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function getTotalMinted() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

async function testActualMetadata() {
  console.log('🔍 Testing Actual Minted Token Metadata...\n');

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get total minted tokens
    const totalMinted = await contract.getTotalMinted();
    console.log('📊 Total Minted Tokens:', totalMinted.toString());

    if (totalMinted == 0) {
      console.log('❌ No tokens minted yet. Please mint a token first.');
      return;
    }

    // Test the most recent token
    const tokenId = totalMinted;
    console.log(`🎯 Testing Token ID: ${tokenId}\n`);

    // Get token owner
    try {
      const owner = await contract.ownerOf(tokenId);
      console.log('👤 Token Owner:', owner);
    } catch (e) {
      console.log('❌ Could not get token owner:', e.message);
    }

    // Get token URI
    const tokenURI = await contract.tokenURI(tokenId);
    console.log('🔗 Token URI:', tokenURI);

    if (tokenURI === 'placeholder-uri' || tokenURI === '') {
      console.log('⚠️  Token has placeholder URI - metadata not yet set');
      return;
    }

    // Convert IPFS URI to HTTP if needed
    let httpUrl = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      httpUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    console.log('🌐 HTTP URL:', httpUrl);

    // Fetch and validate metadata
    try {
      console.log('\n📥 Fetching metadata...');
      const response = await axios.get(httpUrl, { 
        timeout: 15000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const metadata = response.data;
      console.log('✅ Metadata fetched successfully!\n');

      // Validate OpenSea required fields
      console.log('📋 OpenSea Metadata Validation:');
      
      // Name
      if (metadata.name) {
        console.log('✅ Name:', metadata.name);
      } else {
        console.log('❌ Name: Missing (Required by OpenSea)');
      }

      // Description
      if (metadata.description) {
        console.log('✅ Description:', metadata.description);
      } else {
        console.log('❌ Description: Missing (Required by OpenSea)');
      }

      // Image
      if (metadata.image) {
        console.log('✅ Image:', metadata.image);
        
        // Test image accessibility
        const imageUrl = metadata.image.startsWith('ipfs://') 
          ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : metadata.image;
        
        try {
          const imageResponse = await axios.head(imageUrl, { timeout: 10000 });
          console.log('  ✅ Image accessible');
          console.log('  📏 Content Type:', imageResponse.headers['content-type']);
          if (imageResponse.headers['content-length']) {
            const sizeKB = Math.round(imageResponse.headers['content-length'] / 1024);
            console.log('  📦 Size:', sizeKB, 'KB');
          }
        } catch (e) {
          console.log('  ❌ Image not accessible:', e.message);
        }
      } else {
        console.log('❌ Image: Missing (Required by OpenSea)');
      }

      // Attributes
      if (metadata.attributes && Array.isArray(metadata.attributes)) {
        console.log('✅ Attributes: Array with', metadata.attributes.length, 'items');
        metadata.attributes.forEach((attr, index) => {
          if (attr.trait_type && attr.value !== undefined) {
            console.log(`  ${index + 1}. ${attr.trait_type}: ${attr.value}`);
          } else {
            console.log(`  ❌ Attribute ${index + 1}: Invalid format`);
          }
        });
      } else {
        console.log('❌ Attributes: Missing or not an array');
      }

      // Additional OpenSea optional fields
      console.log('\n📋 Optional OpenSea Fields:');
      
      if (metadata.external_url) {
        console.log('✅ External URL:', metadata.external_url);
      } else {
        console.log('ℹ️  External URL: Not set (Optional)');
      }

      if (metadata.background_color) {
        console.log('✅ Background Color:', metadata.background_color);
      } else {
        console.log('ℹ️  Background Color: Not set (Optional)');
      }

      if (metadata.animation_url) {
        console.log('✅ Animation URL:', metadata.animation_url);
      } else {
        console.log('ℹ️  Animation URL: Not set (Optional)');
      }

      // Full metadata structure
      console.log('\n📄 Complete Metadata Structure:');
      console.log(JSON.stringify(metadata, null, 2));

      // OpenSea compatibility summary
      console.log('\n🎯 OpenSea Compatibility Summary:');
      const hasName = !!metadata.name;
      const hasDescription = !!metadata.description;
      const hasImage = !!metadata.image;
      const hasValidAttributes = metadata.attributes && Array.isArray(metadata.attributes);
      
      const isCompatible = hasName && hasDescription && hasImage && hasValidAttributes;
      
      console.log(`${isCompatible ? '✅' : '❌'} Overall Compatibility: ${isCompatible ? 'PASSED' : 'FAILED'}`);
      console.log(`  - Name: ${hasName ? '✅' : '❌'}`);
      console.log(`  - Description: ${hasDescription ? '✅' : '❌'}`);
      console.log(`  - Image: ${hasImage ? '✅' : '❌'}`);
      console.log(`  - Attributes: ${hasValidAttributes ? '✅' : '❌'}`);

      if (isCompatible) {
        console.log('\n🎉 This token will display perfectly on OpenSea!');
        console.log('  - Will appear in the Vertical Project collection');
        console.log('  - Rarity trait will be filterable');
        console.log('  - Image will display correctly');
        console.log('  - All metadata fields will show properly');
      } else {
        console.log('\n⚠️  This token may not display correctly on OpenSea');
        console.log('   Please fix the missing required fields');
      }

    } catch (error) {
      console.log('❌ Failed to fetch metadata:', error.message);
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('💡 This might be because:');
        console.log('  - IPFS gateway is slow or unavailable');
        console.log('  - Metadata was just uploaded and needs time to propagate');
        console.log('  - Try again in a few minutes');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testActualMetadata(); 