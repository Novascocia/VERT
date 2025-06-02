import { id } from 'ethers';
import VerticalABI from '../../abis/Vertical.json';

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

// Use the complete ABI from the compiled contract
export const VERTICAL_ABI = VerticalABI.abi;

// Keccak256(topic0) for Transfer(address,address,uint256)
export const TRANSFER_EVENT_TOPIC = id("Transfer(address,address,uint256)"); 