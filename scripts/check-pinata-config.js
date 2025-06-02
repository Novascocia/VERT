require('dotenv').config({ path: '.env.local' });

async function checkPinataConfig() {
  console.log('🔍 Checking Pinata configuration...\n');
  
  // Check environment variables
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecret = process.env.PINATA_SECRET;
  const pinataJWT = process.env.PINATA_JWT;
  
  console.log('📋 Environment Variables:');
  console.log('PINATA_API_KEY:', pinataApiKey ? '✅ Set (' + pinataApiKey.substring(0, 8) + '...)' : '❌ Not set');
  console.log('PINATA_SECRET:', pinataSecret ? '✅ Set (' + pinataSecret.substring(0, 8) + '...)' : '❌ Not set');
  console.log('PINATA_JWT:', pinataJWT ? '✅ Set (' + pinataJWT.substring(0, 20) + '...)' : '❌ Not set');
  console.log('');
  
  // Test Pinata connection with API Key method
  if (pinataApiKey && pinataSecret) {
    console.log('🧪 Testing API Key + Secret method...');
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecret,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Key method works!', data);
      } else {
        console.log('❌ API Key method failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ API Key method error:', error.message);
    }
    console.log('');
  }
  
  // Test Pinata connection with JWT method
  if (pinataJWT) {
    console.log('🧪 Testing JWT Bearer method...');
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ JWT method works!', data);
      } else {
        console.log('❌ JWT method failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ JWT method error:', error.message);
    }
    console.log('');
  }
  
  // Test pinning to IPFS with current configuration
  console.log('🧪 Testing actual file pinning...');
  
  if (pinataApiKey && pinataSecret) {
    try {
      const testData = JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        message: "Test metadata for Vertical NFT debugging"
      });
      
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', Buffer.from(testData), {
        filepath: 'test.json',
        contentType: 'application/json'
      });
      
      const axios = require('axios');
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
        maxBodyLength: Infinity,
        headers: {
          ...form.getHeaders(),
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecret,
        },
      });
      
      if (response.data.IpfsHash) {
        console.log('✅ Test file pinned successfully!');
        console.log('📄 IPFS Hash:', response.data.IpfsHash);
        console.log('🔗 IPFS URL:', `ipfs://${response.data.IpfsHash}`);
        
        // Test if it's accessible
        const testUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log('🧪 Testing accessibility:', testUrl);
        
        const testResponse = await fetch(testUrl);
        if (testResponse.ok) {
          const testContent = await testResponse.json();
          console.log('✅ File is accessible via Pinata gateway!');
          console.log('📄 Content:', testContent);
        } else {
          console.log('❌ File not accessible via gateway:', testResponse.status);
        }
        
      } else {
        console.log('❌ No IPFS hash returned from pinning test');
      }
      
    } catch (error) {
      console.log('❌ Pinning test failed:', error.message);
    }
  }
}

checkPinataConfig(); 