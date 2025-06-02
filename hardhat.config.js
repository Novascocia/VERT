require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');
require('@typechain/hardhat');

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          },
          viaIR: true
        }
      },
      { version: "0.8.28" }
    ]
  },
  networks: {
    base_sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto",
      gasMultiplier: 1.2
    },
    base_mainnet: {
      url: process.env.MAINNET_RPC_URL || process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto",
      gasMultiplier: 1.1,
      chainId: 8453
    },
    // ... other networks ...
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
        }
      }
    ]
  },
  typechain: {
    outDir: 'app/typechain-types',
    target: 'ethers-v6'
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21,
    showMethodSig: true,
    showTimeSpent: true,
  }
}; 