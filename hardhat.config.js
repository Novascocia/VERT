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
            runs: 200
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
    // ... other networks ...
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY
    }
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