const fetch = require('node-fetch');

async function retriggerTokenMetadata() {
  try {
    console.log('🔄 Re-triggering metadata generation for Token #1...');
    console.log('⏳ Waiting for dev server to be ready...');
    
    // Wait a moment for dev server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📡 Calling backend API...');
    
    const response = await fetch('http://localhost:3000/api/generateAndStoreNFT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: '1' }),
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API successful!');
      console.log('🎨 New image URI:', data.image);
      console.log('📄 New metadata URI:', data.metadata);
      console.log('🎭 Traits:', data.traits);
      
      console.log('\n🎉 Token #1 should now have proper metadata!');
      console.log('📱 Check your wallet and OpenSea - it may take a few minutes to update');
      console.log('🔗 You can also check the metadata directly at:', data.metadata);
      
    } else {
      const error = await response.text();
      console.error('❌ Backend API failed:', response.status, error);
      
      // Try to parse as JSON for better error details
      try {
        const errorData = JSON.parse(error);
        console.error('🔍 Error details:', errorData);
      } catch (e) {
        console.error('🔍 Raw error:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Check if we're in Node.js environment and global fetch is available
if (typeof fetch === 'undefined') {
  console.log('📦 fetch not available, using node-fetch...');
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

retriggerTokenMetadata(); 