require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { ethers } = require('hardhat');

async function debugUserBalance() {
  console.log('🔍 Debugging User Wallet Status');
  console.log('='.repeat(60));
  
  // Contract addresses
  const contractAddress = '0xA35Ff1a9aC137F92914bE0b16764B28AF7437c7d'; // New fixed contract
  const virtualTokenAddress = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
  const vertTokenAddress = '0x0000000000000000000000000000000000000000'; // Phase 1
  
  // User wallet from error logs
  const userAddress = '0x6Aa64D30778ada26363311A8848686A906FE8DAA';
  
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  
  // ABIs
  const erc20ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address,address) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];
  
  const contractABI = [
    'function priceVirtual() view returns (uint256)',
    'function priceVert() view returns (uint256)',
    'function paused() view returns (bool)'
  ];
  
  try {
    console.log('👤 User Address:', userAddress);
    console.log('📋 Contract Address:', contractAddress);
    console.log('🪙 VIRTUAL Token:', virtualTokenAddress);
    
    // Create contract instances
    const virtualToken = new ethers.Contract(virtualTokenAddress, erc20ABI, provider);
    const nftContract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Get current mint prices
    const priceVirtual = await nftContract.priceVirtual();
    const priceVert = await nftContract.priceVert();
    
    console.log('\n💰 Current Mint Prices:');
    console.log(`  VIRTUAL: ${ethers.formatEther(priceVirtual)} VIRTUAL`);
    console.log(`  VERT: ${ethers.formatEther(priceVert)} VERT`);
    
    // Check if contract is paused
    const isPaused = await nftContract.paused();
    console.log(`  Contract Paused: ${isPaused}`);
    
    // Get user's VIRTUAL balance
    const virtualBalance = await virtualToken.balanceOf(userAddress);
    console.log('\n🏦 User Token Balances:');
    console.log(`  VIRTUAL Balance: ${ethers.formatEther(virtualBalance)} VIRTUAL`);
    
    // Get allowances
    const virtualAllowance = await virtualToken.allowance(userAddress, contractAddress);
    console.log('\n✅ Token Allowances:');
    console.log(`  VIRTUAL Allowance: ${ethers.formatEther(virtualAllowance)} VIRTUAL`);
    
    // Check if user has enough balance and allowance
    console.log('\n🔍 Analysis:');
    const hasEnoughBalance = virtualBalance >= priceVirtual;
    const hasEnoughAllowance = virtualAllowance >= priceVirtual;
    
    console.log(`  Has enough VIRTUAL balance: ${hasEnoughBalance}`);
    console.log(`  Has enough VIRTUAL allowance: ${hasEnoughAllowance}`);
    
    if (!hasEnoughBalance) {
      const needed = priceVirtual - virtualBalance;
      console.log(`  ❌ Need ${ethers.formatEther(needed)} more VIRTUAL tokens`);
    }
    
    if (!hasEnoughAllowance) {
      const needed = priceVirtual - virtualAllowance;
      console.log(`  ❌ Need to approve ${ethers.formatEther(needed)} more VIRTUAL tokens`);
    }
    
    if (hasEnoughBalance && hasEnoughAllowance && !isPaused) {
      console.log('  ✅ Everything looks good - minting should work!');
    }
    
    // ETH balance for gas
    const ethBalance = await provider.getBalance(userAddress);
    console.log(`\n⛽ ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
    
    if (ethBalance < ethers.parseEther('0.001')) {
      console.log('  ⚠️ Low ETH balance - may not have enough for gas');
    }
    
  } catch (error) {
    console.error('❌ Error checking user balance:', error.message);
  }
}

debugUserBalance().catch(console.error); 