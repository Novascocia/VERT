# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Frontend Configuration (Base Sepolia Testnet)
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9ede64fe689aa03B049497E2A70676d02f3437E9
NEXT_PUBLIC_VERT_TOKEN_ADDRESS=0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd
NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a
NEXT_PUBLIC_TREASURY_ADDRESS=0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23
```

### Optional Performance Enhancement
```bash
# Alchemy API key for better RPC performance
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key_here
```

### Network Configuration
```bash
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_NETWORK_NAME=base-sepolia
```

### Backend API Configuration
```bash
CONTRACT_ADDRESS=0x9ede64fe689aa03B049497E2A70676d02f3437E9
VERT_TOKEN_ADDRESS=0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd
VIRTUAL_TOKEN_ADDRESS=0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
PINATA_JWT=your_pinata_jwt_here
```

## Current Contract Addresses (Base Sepolia)

- **NFT Contract**: `0x9ede64fe689aa03B049497E2A70676d02f3437E9` (Latest deployed)
- **VERT Token**: `0x7D86001Ce94197d948EF603df04AaB9A2D3010Dd`
- **VIRTUAL Token**: `0x8F8BD1Ea9a8A18737b20cBA1f8577a7A4238580a`
- **Treasury**: `0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23`

## Fallback Behavior

If environment variables are not set, the application will use the hardcoded addresses from `testnet.addresses.json` as fallbacks.

## Verification

You can verify the contract on BaseScan:
https://sepolia.basescan.org/address/0x9ede64fe689aa03B049497E2A70676d02f3437E9 