import { id } from 'ethers';

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

export const VERTICAL_ABI = [
  // Mint functions
  {
    type: 'function',
    name: 'mintWithVert',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenURI', type: 'string' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'mintWithVirtual',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenURI', type: 'string' }
    ],
    outputs: []
  },
  
  // View functions
  {
    type: 'function',
    name: 'getTotalMinted',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getPrizePoolBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'address' }
    ]
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'priceVirtual',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'priceVert',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  },
  
  // ERC-721 standard functions (MISSING - ADDING NOW)
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'string' }
    ]
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'string' }
    ]
  },
  
  {
    type: 'function',
    name: 'supportsInterface',
    stateMutability: 'view',
    inputs: [
      { name: 'interfaceId', type: 'bytes4' }
    ],
    outputs: [
      { name: '', type: 'bool' }
    ]
  },
  
  // Auto-sync functions (NEW)
  {
    type: 'function',
    name: 'syncPrizePool',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getUnaccountedBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },

  // Admin functions (MISSING - ADDING NOW)
  {
    type: 'function',
    name: 'setPrices',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'newVirtualPrice', type: 'uint256' },
      { name: 'newVertPrice', type: 'uint256' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'pause',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'unpause',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },

  // Prize pool management functions
  {
    type: 'function',
    name: 'addToPrizePool',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'depositToPrizePool',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },

  // Events
  {
    type: 'event',
    name: 'NFTMinted',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'rarity', type: 'uint8', indexed: false },
      { name: 'uri', type: 'string', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'PrizeClaimed',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'PrizePoolUpdated',
    inputs: [
      { name: 'newTotal', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'PrizePoolSynced',
    inputs: [
      { name: 'syncedAmount', type: 'uint256', indexed: false },
      { name: 'triggeredBy', type: 'address', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'AutoSyncFailed',
    inputs: [
      { name: 'reason', type: 'string', indexed: false }
    ]
  }
];

// Keccak256(topic0) for Transfer(address,address,uint256)
export const TRANSFER_EVENT_TOPIC = id("Transfer(address,address,uint256)"); 