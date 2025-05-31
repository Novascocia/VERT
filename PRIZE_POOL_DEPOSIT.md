# 💰 Prize Pool Deposit Function

## Overview
The `depositToPrizePool` function allows anyone to contribute VERT tokens to the prize pool, increasing the rewards available for NFT minters.

## Function Signature
```solidity
function depositToPrizePool(uint256 amount) external
```

## Parameters
- `amount`: The amount of VERT tokens to deposit (in wei)

## Events Emitted
```solidity
event PrizePoolFunded(address indexed sender, uint256 amount);
```

## How to Use

### 1. Prerequisites
- Have VERT tokens in your wallet
- Approve the NFT contract to spend your VERT tokens

### 2. Using Hardhat Scripts

#### Simple Deposit Example:
```bash
npx hardhat run scripts/deposit_example.js --network base-sepolia
```

#### Full Test Suite:
```bash
npx hardhat run scripts/test_deposit_to_prize_pool.js --network base-sepolia
```

### 3. Using ethers.js
```javascript
const { ethers } = require("ethers");

// Connect to contracts
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
const vertToken = new ethers.Contract(VERT_ADDRESS, ERC20_ABI, signer);

// Amount to deposit
const amount = ethers.parseEther("100"); // 100 VERT

// Step 1: Approve spending
await vertToken.approve(NFT_ADDRESS, amount);

// Step 2: Deposit to prize pool
const tx = await nftContract.depositToPrizePool(amount);
await tx.wait();

console.log("Deposited to prize pool!");
```

### 4. Contract Addresses

#### Base Sepolia Testnet:
- **NFT Contract**: `0xD77dDA7b71b0fF0D1597dbEDfd11a3aAEd8B74a2`
- **VERT Token**: `0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd`

## Benefits
- **Community Contribution**: Allow users to increase prize pool rewards
- **Gamification**: Larger prize pools attract more minters
- **Transparency**: All deposits are tracked via events
- **No Restrictions**: Anyone can contribute any amount

## Security Features
- ✅ Uses `transferFrom` for secure token transfers
- ✅ Emits events for transparency
- ✅ Updates prize pool atomically
- ✅ No admin privileges required

## Differences from `addToPrizePool`
| Function | Access | Purpose |
|----------|--------|---------|
| `addToPrizePool` | Owner only | Admin funding |
| `depositToPrizePool` | Public | Community contributions |

## Testing
The test script verifies:
- ✅ VERT tokens are transferred correctly
- ✅ Prize pool balance increases by the deposit amount
- ✅ `PrizePoolFunded` event is emitted with correct parameters
- ✅ User's VERT balance decreases by the deposit amount

## Gas Considerations
- **Approval**: ~46,000 gas
- **Deposit**: ~52,000 gas
- **Total**: ~98,000 gas per deposit

## Error Handling
Common errors and solutions:
- `"VERT transfer failed"` → Check approval and balance
- `"insufficient allowance"` → Increase approval amount
- `"transfer amount exceeds balance"` → Deposit less than your balance 