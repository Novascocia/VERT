export const CONTRACTS = {
  // Mainnet addresses
  MAINNET: {
    CONTRACT_ADDRESS: '0xA35Ff1a9aC137F92914bE0b16764B28AF7437c7d', // NEW Fixed contract
    VIRTUAL_TOKEN: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    VERT_TOKEN: '0x0000000000000000000000000000000000000000', // Phase 1: Zero address
    TREASURY: '0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23',
    ADMIN: '0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca'
  },
  
  // Testnet addresses (keeping for reference)
  TESTNET: {
    CONTRACT_ADDRESS: '0xB1E0fB284dE7cc242EBB95653845BDB18B045BF2', // Old contract
    VIRTUAL_TOKEN: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    VERT_TOKEN: '0x0000000000000000000000000000000000000000',
    TREASURY: '0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23',
    ADMIN: '0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca'
  }
};

// Use environment variable or default to mainnet
export const getCurrentContracts = () => {
  const isMainnet = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_MAINNET === 'true';
  return isMainnet ? CONTRACTS.MAINNET : CONTRACTS.MAINNET; // Always use mainnet for now
};

// Helper functions
export const getContractAddress = () => getCurrentContracts().CONTRACT_ADDRESS;
export const getVirtualTokenAddress = () => getCurrentContracts().VIRTUAL_TOKEN;
export const getVertTokenAddress = () => getCurrentContracts().VERT_TOKEN;
export const getTreasuryAddress = () => getCurrentContracts().TREASURY;
export const getAdminAddress = () => getCurrentContracts().ADMIN;

// Chain configuration
export const CHAIN_CONFIG = {
  chainId: 8453, // Base Mainnet
  chainName: 'Base Mainnet',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org'
};

export const CONTRACT_FUNCTIONS = {
  // User Functions
  mintWithVirtual: 'mintWithVirtual',
  mintWithVert: 'mintWithVert',
  getTotalMinted: 'getTotalMinted',
  getPrizePoolBalance: 'getPrizePoolBalance',

  // Admin Functions
  setVertToken: 'setVertToken',
  setVirtualToken: 'setVirtualToken',
  setPrices: 'setPrices',
  setPriceVirtual: 'setPriceVirtual',
  setPriceVert: 'setPriceVert',
  setTreasury: 'setTreasury',
  setPrizePercent: 'setPrizePercent',
  claimPrize: 'claimPrize',
  pause: 'pause',
  unpause: 'unpause',
  syncPrizePool: 'syncPrizePool',
  getUnaccountedBalance: 'getUnaccountedBalance'
};

export const RARITY_NAMES = {
  0: 'Common',
  1: 'Rare',
  2: 'Epic',
  3: 'Legendary',
  4: 'Mythical'
};

export const PRIZE_PERCENTAGES = {
  Common: 0,
  Rare: 3,
  Epic: 7,
  Legendary: 15,
  Mythical: 40
};

export const MINT_PRICES = {
  virtual: '0.01',
  vert: '500'
};

export const VERTICAL_NFT_CONTRACT = "0xB1E0fB284dE7cc242EBB95653845BDB18B045BF2";
export const VERT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const VIRTUAL_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; 