require('dotenv').config({ path: '.env.local' });

async function forceRegenerateToken1() {
  console.log('🔄 Force regenerating Token #1 with detailed logging...\n');
  
  try {
    console.log('📡 Calling NFT generation API...');
    
    const response = await fetch('http://localhost:3000/api/generateAndStoreNFT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: '1' }),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NFT generation successful!');
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
      
      // Extract IPFS hashes
      const imageHash = data.image?.replace('ipfs://', '');
      const metadataHash = data.metadata?.replace('ipfs://', '');
      
      if (imageHash && metadataHash) {
        console.log('\n🧪 Testing immediate accessibility...');
        
        // Test metadata access
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
        console.log('📄 Testing metadata:', metadataUrl);
        
        // Wait a moment then test
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const metadataResponse = await fetch(metadataUrl);
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            console.log('✅ Metadata accessible immediately!');
            console.log('📄 Content:', JSON.stringify(metadata, null, 2));
            
            // Test image
            const imageUrl = metadata.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            if (imageUrl) {
              console.log('\n🖼️ Testing image:', imageUrl);
              const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
              if (imageResponse.ok) {
                console.log('✅ Image accessible too!');
                console.log('📏 Size:', imageResponse.headers.get('content-length'));
              } else {
                console.log('❌ Image not accessible:', imageResponse.status);
              }
            }
          } else {
            console.log('❌ Metadata not accessible:', metadataResponse.status);
            
            // Wait longer and try again
            console.log('⏳ Waiting 30 seconds for IPFS propagation...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            const retryResponse = await fetch(metadataUrl);
            if (retryResponse.ok) {
              console.log('✅ Metadata accessible after delay!');
            } else {
              console.log('❌ Still not accessible after 30s:', retryResponse.status);
            }
          }
        } catch (testError) {
          console.log('❌ Accessibility test error:', testError.message);
        }
        
      } else {
        console.log('❌ Missing IPFS hashes in response');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed:', response.status, response.statusText);
      console.log('📄 Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Script error:', error.message);
  }
}

forceRegenerateToken1(); 