# Environment Setup for Vertical Project

## Frontend Environment Variables (.env.local)

Create a `.env.local` file in the root directory with these values:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc03605b09aF6010bb2097d285b9aF4024ecAf098
NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
NEXT_PUBLIC_VERT_TOKEN_ADDRESS=YOUR_VERT_TOKEN_ADDRESS
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Backend Environment Variables (.env)

Create a `.env` file for backend operations:

```bash
# Contract addresses (MAINNET - CORRECT)
CONTRACT_ADDRESS=0xc03605b09aF6010bb2097d285b9aF4024ecAf098
VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
VERT_TOKEN_ADDRESS=[TO_BE_ANNOUNCED]

# Network configuration
RPC_URL=https://base.gateway.alchemy.com/v2/your_key
PRIVATE_KEY=your_private_key

# API Keys
PINATA_API_KEY=[YOUR_PINATA_API_KEY]
PINATA_SECRET_API_KEY=[YOUR_PINATA_SECRET]
BASESCAN_API_KEY=[YOUR_BASESCAN_API_KEY]
```

## Contract Information

- **NFT Contract**: `0xc03605b09aF6010bb2097d285b9aF4024ecAf098` (Mainnet deployment - CORRECT)
- **VIRTUAL Token**: `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b` 
- **VERT Token**: [TO BE ANNOUNCED BY VIRTUALS PROTOCOL]
- **Network**: Base Mainnet (Chain ID: 8453)

## Verification Links

- **BaseScan Contract**: https://basescan.org/address/0xc03605b09aF6010bb2097d285b9aF4024ecAf098
- **VIRTUAL Token**: https://basescan.org/address/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
- **OpenSea Collection**: [TO BE UPDATED]

## ⚠️ DEPRECATED ADDRESSES (DO NOT USE)

- ~~`0x9ede64fe689aa03B049497E2A70676d02f3437E9`~~ - First deployment (wrong script) 