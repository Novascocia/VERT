const { ethers } = require('ethers');

// Function signatures
const functions = [
  'mintWithVirtual(string)',
  'mintWithVert(string)', 
  'transferFrom(address,address,uint256)',
  'approve(address,uint256)'
];

console.log('🔍 FUNCTION SELECTOR VERIFICATION');
console.log('================================');

functions.forEach(sig => {
  const selector = ethers.id(sig).slice(0, 10);
  console.log(`${sig}: ${selector}`);
});

console.log('');
console.log('Transaction data from error: 0xb2da2715...');
console.log('Does 0xb2da2715 match mintWithVirtual?', ethers.id('mintWithVirtual(string)').slice(0, 10) === '0xb2da2715' ? '✅ YES' : '❌ NO'); 