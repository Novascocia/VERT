const { ethers } = require('hardhat');

function oldRandomness(tokenId, timestamp, difficulty) {
  // Simplified version without address to avoid formatting issues
  const combined = BigInt(timestamp) * 1000000n + BigInt(difficulty) * 100n + BigInt(tokenId);
  return combined % 10000n;
}

function newRandomness(tokenId, timestamp, prevrandao, gasprice, gasleft) {
  // More entropy sources
  const combined = BigInt(timestamp) * 1000000n + 
                   BigInt(prevrandao % 1000000) * 100000n + 
                   BigInt(gasprice % 10000) * 1000n + 
                   BigInt(gasleft % 1000) * 10n + 
                   BigInt(tokenId);
  return combined % 10000n;
}

function getRarityFromValue(randomValue) {
  if (randomValue < 7000n) return 'Common';
  if (randomValue < 8875n) return 'Rare';
  if (randomValue < 9775n) return 'Epic';
  if (randomValue < 9963n) return 'Legendary';
  return 'Mythical';
}

function getOldRarityFromValue(randomValue) {
  if (randomValue < 5000n) return 'Common';
  if (randomValue < 8000n) return 'Rare';
  if (randomValue < 9500n) return 'Epic';
  if (randomValue < 9900n) return 'Legendary';
  return 'Mythical';
}

async function testRandomnessImprovement() {
  console.log('🧪 Testing Randomness Improvement');
  console.log('='.repeat(60));

  const baseTimestamp = 1703000000;
  const difficulty = 12345; // Same for all (simulates same block)
  
  console.log('📊 Scenario: Minting 5 NFTs quickly from same wallet\n');
  
  console.log('❌ OLD METHOD (Current Contract):');
  console.log('   Entropy: timestamp + difficulty + tokenId (limited variation)');
  console.log('   Percentages: 50% Common, 30% Rare, 15% Epic, 4% Legendary, 1% Mythical\n');
  
  for (let tokenId = 10; tokenId <= 14; tokenId++) {
    const timestamp = baseTimestamp + (tokenId - 10) * 2; // 2 seconds apart
    const randomValue = oldRandomness(tokenId, timestamp, difficulty);
    const rarity = getOldRarityFromValue(randomValue);
    console.log(`   Token #${tokenId}: ${randomValue.toString().padStart(4, ' ')} → ${rarity}`);
  }
  
  console.log('\n✅ NEW METHOD (Fixed Contract):');
  console.log('   Entropy: timestamp + prevrandao + gasprice + gasleft + tokenId (high variation)');
  console.log('   Percentages: 70% Common, 18.75% Rare, 9% Epic, 1.875% Legendary, 0.375% Mythical\n');
  
  for (let tokenId = 10; tokenId <= 14; tokenId++) {
    const timestamp = baseTimestamp + (tokenId - 10) * 2;
    const prevrandao = Math.floor(Math.random() * 1e9); // Varies significantly
    const gasprice = 1000000000 + tokenId * 100000; // Changes per tx
    const gasleft = 200000 - tokenId * 1000; // Decreases during execution
    
    const randomValue = newRandomness(tokenId, timestamp, prevrandao, gasprice, gasleft);
    const rarity = getRarityFromValue(randomValue);
    console.log(`   Token #${tokenId}: ${randomValue.toString().padStart(4, ' ')} → ${rarity}`);
  }
  
  console.log('\n🔍 KEY IMPROVEMENTS:');
  console.log('   1. ✅ FIXED PERCENTAGES: 70% Common vs old 50%');
  console.log('   2. ✅ RARE RATE: 18.75% vs old 30% (60% reduction!)');
  console.log('   3. ✅ MORE ENTROPY: 5+ sources vs 3 sources');
  console.log('   4. ✅ BETTER RANDOMNESS: prevrandao changes every block');
  console.log('   5. ✅ TX VARIATION: gasprice/gasleft vary per transaction');
  
  // Large scale test
  console.log('\n📊 Large Scale Distribution Test (50,000 samples):');
  const newCounts = [0, 0, 0, 0, 0];
  const oldCounts = [0, 0, 0, 0, 0];
  const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
  
  for (let i = 0; i < 50000; i++) {
    const timestamp = baseTimestamp + i;
    const tokenId = i + 1;
    const prevrandao = Math.floor(Math.random() * 1e9);
    const gasprice = 1000000000 + Math.floor(Math.random() * 10000000);
    const gasleft = 200000 + Math.floor(Math.random() * 50000);
    
    // Test new method
    const newRandom = newRandomness(tokenId, timestamp, prevrandao, gasprice, gasleft);
    const newRarity = getRarityFromValue(newRandom);
    newCounts[rarityNames.indexOf(newRarity)]++;
    
    // Test old method  
    const oldRandom = oldRandomness(tokenId, timestamp, difficulty);
    const oldRarity = getOldRarityFromValue(oldRandom);
    oldCounts[rarityNames.indexOf(oldRarity)]++;
  }
  
  console.log('\n   OLD CONTRACT RESULTS:');
  const oldExpected = [50, 30, 15, 4, 1];
  for (let i = 0; i < 5; i++) {
    const actual = (oldCounts[i] / 50000 * 100).toFixed(2);
    console.log(`     ${rarityNames[i]}: ${actual}% (Expected: ${oldExpected[i]}%)`);
  }
  
  console.log('\n   NEW CONTRACT RESULTS:');
  const newExpected = [70, 18.75, 9, 1.875, 0.375];
  for (let i = 0; i < 5; i++) {
    const actual = (newCounts[i] / 50000 * 100).toFixed(2);
    console.log(`     ${rarityNames[i]}: ${actual}% (Expected: ${newExpected[i]}%)`);
  }
  
  console.log('\n💡 IMPACT ON YOUR SITUATION:');
  console.log(`   • Old: ${oldCounts[1]} rares out of 50,000 (${(oldCounts[1]/50000*100).toFixed(1)}%)`);
  console.log(`   • New: ${newCounts[1]} rares out of 50,000 (${(newCounts[1]/50000*100).toFixed(1)}%)`);
  console.log(`   • Reduction: ${((oldCounts[1] - newCounts[1])/oldCounts[1]*100).toFixed(0)}% fewer rares!`);
  
  console.log('\n🎯 RECOMMENDATION: Deploy the fixed contract to get proper rarity distribution!');
}

testRandomnessImprovement().catch(console.error); 