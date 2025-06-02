const { ethers } = require('ethers');
const contractABI = require('../abis/Vertical.json');
require('dotenv').config({ path: '.env.local' });

async function checkNFTStatus() {
  try {
    console.log('🔍 Checking Token #1 status...\n');
    
    // Connect to contract (read-only)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://mainnet.base.org');
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
    
    console.log('📝 Contract Address:', contractAddress);
    
    // 1. Check if token exists and get owner
    try {
      const owner = await contract.ownerOf(1);
      console.log('👤 Token #1 Owner:', owner);
    } catch (e) {
      console.error('❌ Token #1 does not exist yet!');
      return;
    }
    
    // 2. Get current tokenURI from contract
    const tokenURI = await contract.tokenURI(1);
    console.log('📄 Contract tokenURI:', tokenURI);
    
    if (tokenURI === 'ipfs://QmPlaceholder') {
      console.log('🚨 Contract still has placeholder URI! Need to fix this.');
      return;
    }
    
    // 3. Convert IPFS URI to HTTP gateway
    const httpURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    console.log('🌐 HTTP Gateway URL:', httpURI);
    
    // 4. Test IPFS accessibility
    console.log('\n🧪 Testing IPFS accessibility...');
    try {
      const response = await fetch(httpURI);
      if (response.ok) {
        const metadata = await response.json();
        console.log('✅ IPFS metadata accessible!');
        console.log('🎭 Metadata content:');
        console.log(JSON.stringify(metadata, null, 2));
        
        // Test image accessibility
        if (metadata.image) {
          const imageHttpURI = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
          console.log('\n🖼️ Image HTTP URL:', imageHttpURI);
          
          try {
            const imageResponse = await fetch(imageHttpURI);
            if (imageResponse.ok) {
              console.log('✅ Image accessible! Size:', imageResponse.headers.get('content-length'), 'bytes');
            } else {
              console.log('❌ Image not accessible:', imageResponse.status);
            }
          } catch (imgErr) {
            console.log('❌ Image fetch failed:', imgErr.message);
          }
        }
        
      } else {
        console.log('❌ IPFS metadata not accessible:', response.status);
      }
    } catch (fetchErr) {
      console.log('❌ IPFS fetch failed:', fetchErr.message);
    }
    
    // 5. Provide OpenSea URLs and refresh instructions
    console.log('\n🌊 OpenSea URLs:');
    const openseaURL = `https://opensea.io/assets/base/${contractAddress}/1`;
    console.log('🔗 NFT Page:', openseaURL);
    console.log('🔄 Force Refresh:', `${openseaURL}?force_update=true`);
    
    console.log('\n📱 Wallet Troubleshooting:');
    console.log('• Try refreshing/pulling down in your wallet app');
    console.log('• Some wallets take 30+ minutes to update');
    console.log('• MetaMask: Go to NFTs tab and pull to refresh');
    
    console.log('\n⏰ Patience Tips:');
    console.log('• IPFS can be slow (10-30 minutes normal)');
    console.log('• OpenSea caches metadata aggressively');
    console.log('• Try the force refresh URL above');
    console.log('• Clear browser cache if needed');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

checkNFTStatus(); 