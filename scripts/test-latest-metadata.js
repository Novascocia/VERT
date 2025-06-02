// Test the latest metadata hash from dev logs
const latestMetadataHash = 'QmXzqhCJNLv2ebVaYjfHQeBkr9Gc8StoUD4mkuotP8Ux4e/1.json';
const latestImageHash = 'bafybeigg4bbyhs2rwreayu5vgbdgolvr2kg3mdayurcvyh54ckid4c223a';

const gateways = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

async function testLatestNFT() {
  console.log('🧪 Testing LATEST NFT metadata and image accessibility...\n');
  
  console.log('📄 Metadata Hash:', latestMetadataHash);
  console.log('🖼️ Image Hash:', latestImageHash);
  console.log('');
  
  // Test metadata
  for (let i = 0; i < gateways.length; i++) {
    const gateway = gateways[i];
    const metadataUrl = gateway + latestMetadataHash;
    
    try {
      console.log(`${i + 1}. Testing metadata: ${gateway}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(metadataUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const metadata = await response.json();
        console.log('✅ METADATA SUCCESS!');
        console.log('📄 URL:', metadataUrl);
        console.log('🎭 Content:', JSON.stringify(metadata, null, 2));
        
        // Test image if metadata works
        if (metadata.image) {
          const imageUrl = metadata.image.replace('ipfs://', gateway);
          console.log('\n🖼️ Testing image:', imageUrl);
          
          try {
            const imgController = new AbortController();
            const imgTimeoutId = setTimeout(() => imgController.abort(), 15000);
            
            const imgResponse = await fetch(imageUrl, { 
              method: 'HEAD',
              signal: imgController.signal 
            });
            
            clearTimeout(imgTimeoutId);
            
            if (imgResponse.ok) {
              console.log('✅ IMAGE SUCCESS!');
              console.log('📏 Content-Length:', imgResponse.headers.get('content-length'));
            } else {
              console.log('❌ Image failed:', imgResponse.status);
            }
          } catch (e) {
            console.log('❌ Image error:', e.message);
          }
        }
        
        return true;
        
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Timeout (15s)');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
    console.log('');
  }
  
  // Test direct Pinata gateway with potential authentication
  console.log('🔐 Testing Pinata gateway (may need authentication)...');
  
  try {
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${latestMetadataHash}`;
    const response = await fetch(pinataUrl);
    
    if (response.ok) {
      const metadata = await response.json();
      console.log('✅ PINATA GATEWAY SUCCESS!');
      console.log('📄 Content:', JSON.stringify(metadata, null, 2));
      return true;
    } else {
      console.log(`❌ Pinata gateway failed: ${response.status}`);
    }
  } catch (e) {
    console.log('❌ Pinata error:', e.message);
  }
  
  console.log('\n🚨 Latest NFT not accessible through any gateway!');
  return false;
}

testLatestNFT(); 