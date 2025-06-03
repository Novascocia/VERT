const { ethers } = require('ethers');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://mainnet.base.org';
const CONTRACT_ADDRESS = '0xc03605b09aF6010bb2097d285b9aF4024ecAf098';

// Load ABI
const abiPath = './abis/Vertical.json';
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// Known transaction hashes from previous sessions
const knownTxHashes = [
  '0x8c82261bdf100936c1dc9b1c7fbc7446287e08603f974633df1adcd7a83cb1db', // Token #13 Epic rarity
  '0x0783c89a7cf07b709da7e1eb60785657aaa086828e157d1b53a8f6f5a0ba468f'  // Token #18 Common rarity
];

async function checkSpecificTransactions() {
  console.log("🔍 Checking specific transaction receipts...\n");
  
  for (const txHash of knownTxHashes) {
    console.log(`🔗 Checking transaction: ${txHash}`);
    
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        console.log(`  ❌ Transaction not found\n`);
        continue;
      }
      
      console.log(`  📦 Block: ${receipt.blockNumber}`);
      console.log(`  ⛽ Gas used: ${receipt.gasUsed}`);
      console.log(`  ✅ Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      
      // Parse logs to find NFTMinted events
      const nftMintedEvents = [];
      
      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'NFTMinted') {
              nftMintedEvents.push(parsedLog);
            }
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }
      
      if (nftMintedEvents.length > 0) {
        console.log(`  🎉 Found ${nftMintedEvents.length} NFTMinted event(s):`);
        
        nftMintedEvents.forEach((event, index) => {
          console.log(`\n    📅 Event #${index + 1}:`);
          console.log(`      🆔 Token ID: ${event.args.tokenId}`);
          console.log(`      👤 User: ${event.args.user}`);
          console.log(`      ⭐ Rarity: ${event.args.rarity}`);
          console.log(`      📄 URI at mint: ${event.args.uri}`);
          console.log(`      🏷️  Was placeholder: ${event.args.uri.includes('QmPlaceholder') ? '❌ YES' : '✅ NO'}`);
          
          // Check current tokenURI for comparison
          const tokenId = Number(event.args.tokenId);
          console.log(`\n      🔄 Checking current tokenURI for token ${tokenId}...`);
          
          try {
            const currentURI = contract.tokenURI(tokenId);
            currentURI.then(uri => {
              console.log(`      📄 Current URI: ${uri}`);
              const uriChanged = event.args.uri !== uri;
              console.log(`      🔄 URI changed: ${uriChanged ? '✅ YES' : '❌ NO'}`);
              
              if (uriChanged) {
                console.log(`      ➡️  From: ${event.args.uri}`);
                console.log(`      ➡️  To:   ${uri}`);
              }
            }).catch(err => {
              console.log(`      ❌ Error getting current URI: ${err.message}`);
            });
          } catch (uriError) {
            console.log(`      ❌ Error checking current URI: ${uriError.message}`);
          }
        });
      } else {
        console.log(`  ❌ No NFTMinted events found in this transaction`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
    } catch (error) {
      console.log(`  ❌ Error checking transaction: ${error.message}\n`);
    }
  }
  
  // Also check the working tokens we found
  console.log("🔍 Re-checking the working tokens we found (1 and 8)...\n");
  
  const workingTokens = [1, 8];
  
  for (const tokenId of workingTokens) {
    console.log(`🎯 Token #${tokenId}:`);
    
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      const owner = await contract.ownerOf(tokenId);
      const rarity = await contract.tokenRarity(tokenId);
      const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythical"];
      
      console.log(`  👤 Owner: ${owner}`);
      console.log(`  📄 Current URI: ${tokenURI}`);
      console.log(`  ⭐ Rarity: ${rarityNames[rarity]}`);
      console.log(`  🏷️  Is placeholder: ${tokenURI.includes('QmPlaceholder') ? '❌ YES' : '✅ NO'}`);
      
      // Try to fetch the metadata
      if (!tokenURI.includes('QmPlaceholder')) {
        try {
          const metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
          console.log(`  🌐 Fetching metadata from: ${metadataUrl}`);
          
          const response = await fetch(metadataUrl);
          if (response.ok) {
            const metadata = await response.json();
            console.log(`  📝 Name: ${metadata.name}`);
            console.log(`  🖼️  Image: ${metadata.image}`);
            console.log(`  📊 Attributes: ${metadata.attributes?.length || 0} traits`);
          }
        } catch (fetchError) {
          console.log(`  ❌ Error fetching metadata: ${fetchError.message}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error checking token: ${error.message}\n`);
    }
  }
}

// Run the check
checkSpecificTransactions()
  .then(() => {
    console.log("✅ Transaction analysis completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  }); 