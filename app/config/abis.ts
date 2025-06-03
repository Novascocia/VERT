import { id } from 'ethers';
import VerticalABI from '../../artifacts/contracts/VerticalProjectNFT_WithManualSync_Fixed.sol/VerticalProjectNFT_WithManualSync_Fixed.json';

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'bool' }
    ]
  }
];

// Use the complete ABI from the compiled manual sync contract
export const VERTICAL_ABI = VerticalABI.abi;

// Export specific function signatures for easy reference
export const FUNCTIONS = {
  // Core functions
  mintWithVirtual: 'mintWithVirtual(string)',
  mintWithVert: 'mintWithVert(string)',
  getTotalMinted: 'getTotalMinted()',
  getTokenRarity: 'getTokenRarity(uint256)',
  tokenURI: 'tokenURI(uint256)',
  
  // Admin functions
  setTokenURI: 'setTokenURI(uint256,string)',
  syncPrizePool: 'syncPrizePool()',
  getUnaccountedBalance: 'getUnaccountedBalance()',
  getPrizePoolBalance: 'getPrizePoolBalance()',
  
  // Token functions
  virtualToken: 'virtualToken()',
  vertToken: 'vertToken()',
  treasury: 'treasury()',
  
  // Rarity and prize functions
  claimPrize: 'claimPrize(uint256)',
  prizePercentByRarity: 'prizePercentByRarity(uint8)',
  
  // ERC721 functions
  ownerOf: 'ownerOf(uint256)',
  balanceOf: 'balanceOf(address)',
  approve: 'approve(address,uint256)',
  getApproved: 'getApproved(uint256)',
  isApprovedForAll: 'isApprovedForAll(address,address)',
  safeTransferFrom: 'safeTransferFrom(address,address,uint256)',
  transferFrom: 'transferFrom(address,address,uint256)',
  setApprovalForAll: 'setApprovalForAll(address,bool)'
};

// Events
export const EVENTS = {
  NFTMinted: 'NFTMinted',
  PrizeClaimed: 'PrizeClaimed',
  PrizePoolUpdated: 'PrizePoolUpdated',
  PrizePoolFunded: 'PrizePoolFunded',
  PrizePoolSynced: 'PrizePoolSynced',
  Transfer: 'Transfer',
  Approval: 'Approval',
  ApprovalForAll: 'ApprovalForAll'
};

// Contract interface types
export enum Rarity {
  Common = 0,
  Rare = 1,
  Epic = 2,
  Legendary = 3,
  Mythical = 4
}

export const RARITY_NAMES = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];

export const RARITY_PERCENTAGES = {
  [Rarity.Common]: 70.000,
  [Rarity.Rare]: 18.750,
  [Rarity.Epic]: 9.000,
  [Rarity.Legendary]: 1.875,
  [Rarity.Mythical]: 0.375
};

export default VERTICAL_ABI;

// Keccak256(topic0) for Transfer(address,address,uint256)
export const TRANSFER_EVENT_TOPIC = id("Transfer(address,address,uint256)"); 