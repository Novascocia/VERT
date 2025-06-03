require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { ethers } = require('hardhat');

async function checkRarityDistribution() {
  console.log('🔍 Checking Rarity Distribution on Fixed Contract');
  console.log('='.repeat(60));
  
  const contractAddress = '0xA35Ff1a9aC137F92914bE0b16764B28AF7437c7d';
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  
  const abi = [
    'function getTotalMinted() view returns (uint256)',
    'function getTokenRarity(uint256) view returns (uint8)'
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    const totalMinted = await contract.getTotalMinted();
    const totalMintedNum = Number(totalMinted);
    console.log('📊 Total Minted:', totalMintedNum);
    
    const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
    const counts = [0, 0, 0, 0, 0];
    
    console.log('\n🎲 Individual Token Rarities:');
    for (let i = 1; i <= totalMintedNum; i++) {
      try {
        const rarity = await contract.getTokenRarity(i);
        const rarityName = rarities[rarity];
        console.log(`  Token #${i}: ${rarityName}`);
        counts[rarity]++;
      } catch (e) {
        console.log(`  Token #${i}: Error reading rarity -`, e.message);
      }
    }
    
    console.log('\n📈 Distribution Summary:');
    console.log(`  Common: ${counts[0]} (${((counts[0]/totalMintedNum)*100).toFixed(1)}%)`);
    console.log(`  Rare: ${counts[1]} (${((counts[1]/totalMintedNum)*100).toFixed(1)}%)`);
    console.log(`  Epic: ${counts[2]} (${((counts[2]/totalMintedNum)*100).toFixed(1)}%)`);
    console.log(`  Legendary: ${counts[3]} (${((counts[3]/totalMintedNum)*100).toFixed(1)}%)`);
    console.log(`  Mythical: ${counts[4]} (${((counts[4]/totalMintedNum)*100).toFixed(1)}%)`);
    
    console.log('\n🎯 Expected vs Actual (CORRECT EXPECTATIONS):');
    const expected = [70, 18.75, 9, 1.875, 0.375];
    for (let i = 0; i < 5; i++) {
      const actual = ((counts[i]/totalMintedNum)*100).toFixed(1);
      console.log(`  ${rarities[i]}: Expected ${expected[i]}%, Actual ${actual}%`);
    }
    
    console.log('\n❌ OLD CONTRACT PERCENTAGES (COMPARISON):');
    const oldContractExpected = [50, 30, 15, 4, 1];
    for (let i = 0; i < 5; i++) {
      const actual = ((counts[i]/totalMintedNum)*100).toFixed(1);
      console.log(`  ${rarities[i]}: Old gave ${oldContractExpected[i]}%, New gives ${expected[i]}%`);
    }
    
    // Check for patterns in recent mints
    if (totalMintedNum >= 3) {
      console.log('\n🔍 Recent Mint Pattern Analysis:');
      const recentStart = Math.max(1, totalMintedNum - 4);
      for (let i = recentStart; i <= totalMintedNum; i++) {
        try {
          const rarity = await contract.getTokenRarity(i);
          console.log(`  Token #${i}: ${rarities[rarity]}`);
        } catch (e) {
          console.log(`  Token #${i}: Error reading rarity`);
        }
      }
    }
    
    // Enhanced analysis
    console.log('\n🚨 IMPROVEMENT ANALYSIS:');
    console.log(`  Current Rare Rate: ${((counts[1]/totalMintedNum)*100).toFixed(1)}%`);
    console.log(`  New Target: 18.75% (vs old 30%)`);
    console.log(`  Expected Improvement: 37.5% fewer rares`);
    
    console.log(`\n  Current Common Rate: ${((counts[0]/totalMintedNum)*100).toFixed(1)}%`);
    console.log(`  New Target: 70% (vs old 50%)`);
    console.log(`  Expected Improvement: 40% more commons`);
    
    if (totalMintedNum === 0) {
      console.log('\n✅ Contract deployed successfully - ready for testing!');
      console.log('💡 Mint a few NFTs to verify the new rarity distribution is working correctly.');
    } else if (counts[1] / totalMintedNum < 0.25) {
      console.log('\n✅ Rarity distribution appears improved!');
    }
    
  } catch (error) {
    console.error('❌ Error checking rarity distribution:', error);
  }
}

checkRarityDistribution().catch(console.error); 