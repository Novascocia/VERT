// Test multiple IPFS gateways for Token #1 metadata
const metadataHash = 'QmRxTmphrgjMfvqVptgiNvx78ufkmUxGJ7KbkTVw1N2ccN/1.json';

const gateways = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.filebase.io/ipfs/'
];

async function testGateways() {
  console.log('🧪 Testing IPFS gateways for metadata accessibility...\n');
  
  for (let i = 0; i < gateways.length; i++) {
    const gateway = gateways[i];
    const url = gateway + metadataHash;
    
    try {
      console.log(`${i + 1}. Testing: ${gateway}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const metadata = await response.json();
        console.log('✅ SUCCESS! Metadata found:');
        console.log('📄 URL:', url);
        console.log('🎭 Content:', JSON.stringify(metadata, null, 2));
        
        // Test image accessibility too
        if (metadata.image) {
          const imageUrl = metadata.image.replace('ipfs://', gateway);
          console.log('\n🖼️ Testing image:', imageUrl);
          
          try {
            const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
            if (imgResponse.ok) {
              console.log('✅ Image accessible!');
            } else {
              console.log('❌ Image not accessible:', imgResponse.status);
            }
          } catch (e) {
            console.log('❌ Image test failed:', e.message);
          }
        }
        
        return; // Stop testing once we find a working gateway
        
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Timeout (10s)');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🚨 Metadata not accessible through any gateway!');
  console.log('💡 This suggests the IPFS upload may have failed or is still propagating.');
}

testGateways(); 