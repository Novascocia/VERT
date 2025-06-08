const https = require('https');

const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy';
const VIRTUAL_TOKEN = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
const CONTRACT_ADDRESS = '0x1C1b7d15F73f4ab0E3bb95F280fC180B5fC9C2B';
const USER_ADDRESS = '0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca';

// Function selectors
const ALLOWANCE_SELECTOR = '0xdd62ed3e'; // allowance(address,address)
const BALANCE_SELECTOR = '0x70a08231';   // balanceOf(address)

// Helper to pad address to 32 bytes
function padAddress(addr) {
  return addr.slice(2).padStart(64, '0');
}

// Helper to make RPC call
function makeRPCCall(method, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    });
    
    const url = new URL(RPC_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            reject(new Error(result.error.message));
          } else {
            resolve(result.result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔍 CHECKING VIRTUAL TOKEN STATUS');
  console.log('================================');
  console.log('User:', USER_ADDRESS);
  console.log('VIRTUAL Token:', VIRTUAL_TOKEN);
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('');

  try {
    // Check VIRTUAL balance
    const balanceData = BALANCE_SELECTOR + padAddress(USER_ADDRESS);
    const balanceResult = await makeRPCCall('eth_call', [{
      to: VIRTUAL_TOKEN,
      data: balanceData
    }, 'latest']);
    
    const balance = BigInt(balanceResult);
    const balanceFormatted = Number(balance) / 1e18;
    
    console.log('💰 VIRTUAL Balance:', balanceFormatted.toFixed(6), 'VIRTUAL');
    
    // Check allowance
    const allowanceData = ALLOWANCE_SELECTOR + padAddress(USER_ADDRESS) + padAddress(CONTRACT_ADDRESS);
    const allowanceResult = await makeRPCCall('eth_call', [{
      to: VIRTUAL_TOKEN,
      data: allowanceData
    }, 'latest']);
    
    const allowance = BigInt(allowanceResult);
    const allowanceFormatted = Number(allowance) / 1e18;
    
    console.log('✅ VIRTUAL Allowance:', allowanceFormatted.toFixed(6), 'VIRTUAL');
    console.log('');
    
    // Analysis
    const requiredAmount = 0.01;
    console.log('📊 ANALYSIS:');
    console.log('Required for mint:', requiredAmount, 'VIRTUAL');
    console.log('Available balance:', balanceFormatted.toFixed(6), 'VIRTUAL');
    console.log('Available allowance:', allowanceFormatted > 1000000 ? 'MAX (unlimited)' : allowanceFormatted.toFixed(6), 'VIRTUAL');
    console.log('');
    
    if (balanceFormatted < requiredAmount) {
      console.log('❌ ISSUE FOUND: Insufficient VIRTUAL balance!');
      console.log('You need at least', requiredAmount, 'VIRTUAL but only have', balanceFormatted.toFixed(6));
    } else if (allowanceFormatted < requiredAmount) {
      console.log('❌ ISSUE FOUND: Insufficient VIRTUAL allowance!');
      console.log('You need to approve more VIRTUAL tokens for the contract');
    } else {
      console.log('✅ VIRTUAL balance and allowance look sufficient');
      console.log('The allowance error might be coming from somewhere else');
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('1. Try minting in the UI again');
      console.log('2. If it still fails, the issue might be with pVERT prize payouts');
      console.log('3. Or there might be a timing/race condition issue');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error); 