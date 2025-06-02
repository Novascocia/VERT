const fetch = require('node-fetch');

async function updateTokenMetadata(tokenId) {
  try {
    console.log(`🔄 Updating metadata for Token #${tokenId}...`);
    
    const response = await fetch('http://localhost:3000/api/generateAndStoreNFT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: tokenId.toString() }),
    });
    
    console.log(`📡 Response status for Token #${tokenId}:`, response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Token #${tokenId} updated successfully!`);
      console.log(`🎨 New image URI:`, data.image);
      console.log(`📄 New metadata URI:`, data.metadata);
      console.log(`🎭 New traits:`, JSON.stringify(data.traits, null, 2));
      
      return {
        success: true,
        tokenId,
        data
      };
    } else {
      const error = await response.text();
      console.error(`❌ Failed to update Token #${tokenId}:`, error);
      return {
        success: false,
        tokenId,
        error
      };
    }
    
  } catch (error) {
    console.error(`❌ Error updating Token #${tokenId}:`, error.message);
    return {
      success: false,
      tokenId,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Starting metadata update for Tokens #6 and #7...\n');
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/generateAndStoreNFT', {
      method: 'OPTIONS'
    });
    console.log('✅ Development server is accessible\n');
  } catch (error) {
    console.error('❌ Development server not accessible. Please run "npm run dev" first.');
    process.exit(1);
  }
  
  const results = [];
  
  // Update Token #6
  console.log('🎯 Updating Token #6...');
  const result6 = await updateTokenMetadata(6);
  results.push(result6);
  
  console.log('\n⏳ Waiting 3 seconds before next update...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Update Token #7
  console.log('🎯 Updating Token #7...');
  const result7 = await updateTokenMetadata(7);
  results.push(result7);
  
  // Summary
  console.log('\n📊 Update Summary:');
  console.log('===================');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Token #${result.tokenId}: Successfully updated`);
    } else {
      console.log(`❌ Token #${result.tokenId}: Failed - ${result.error}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n🎉 ${successful}/${results.length} tokens updated successfully!`);
  
  if (successful > 0) {
    console.log('\n📱 Next Steps:');
    console.log('• Wait 5-10 minutes for IPFS propagation');
    console.log('• Check OpenSea for updated metadata');
    console.log('• Use "force refresh" on OpenSea if needed');
    console.log('• Metadata should also update in wallets within 30 minutes');
  }
}

main().catch(console.error); 