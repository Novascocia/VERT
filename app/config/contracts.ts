export const CONTRACT_ADDRESSES = {
  mainnet: {
    nft: '0xB1E0fB284dE7cc242EBB95653845BDB18B045BF2',
    vertToken: '0x0000000000000000000000000000000000000000',
    virtualToken: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    treasury: '0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23'
  },
  testnet: {
    nft: '0x9114420a6e77E41784590a9D2eE66AE3751F434c',
    vertToken: '0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd',
    virtualToken: '0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a',
    treasury: '0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23'
  }
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