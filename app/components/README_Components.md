# Component Usage Guide

## ✅ MintLeaderboard Component

The MintLeaderboard component is now fully functional and reads mint data directly from the blockchain.

### Features:
- ✅ Reads mint counts from blockchain events
- ✅ Handles 0 users gracefully with encouraging messaging
- ✅ Real-time updates every 30 seconds
- ✅ Displays total minted count
- ✅ Shows top 10 minters by default (configurable)
- ✅ Proper ranking with tie handling
- ✅ Loading, error, and empty states
- ✅ Refresh button for manual updates

### Usage:
```tsx
import MintLeaderboard from '@/app/components/MintLeaderboard';

// Basic usage
<MintLeaderboard />

// With custom props
<MintLeaderboard 
  maxEntries={5}
  title="🏆 Top Minters"
  contractAddress="0x..."
/>
```

### Props:
- `maxEntries?: number` - Max entries to show (default: 10)
- `title?: string` - Component title (default: "🏆 Mint Leaderboard")
- `contractAddress?: string` - NFT contract address (auto-detected from env)

---

## ✅ StakingTierDisplay Component

The StakingTierDisplay component shows user staking tiers based on VERT staked amount.

### Features:
- ✅ Shows correct tier badge (Gold, Silver, Bronze, or No Tier)
- ✅ Reads staked balance from staking contract
- ✅ Gracefully handles missing contract address
- ✅ Handles disconnected wallet
- ✅ Progress tracking to next tier
- ✅ Loading and error states
- ✅ Responsive design with proper styling

### Tier Logic:
- **Gold**: ≥ 100,000 VERT staked 🥇
- **Silver**: ≥ 50,000 VERT staked 🥈
- **Bronze**: ≥ 10,000 VERT staked 🥉
- **No Tier**: < 10,000 VERT staked ⭐

### Usage:
```tsx
import StakingTierDisplay from '@/app/components/StakingTierDisplay';

// Basic usage (shows "Coming to Mainnet" message)
<StakingTierDisplay />

// With staking contract address (when available)
<StakingTierDisplay 
  stakingContractAddress="0x..."
  className="custom-class"
/>
```

### Props:
- `stakingContractAddress?: string` - Staking contract address (optional)
- `className?: string` - Additional CSS classes

### States:
1. **Disconnected Wallet**: Shows connect prompt
2. **No Contract Address**: Shows "Coming to Mainnet" message  
3. **Loading**: Shows spinner while fetching data
4. **Error**: Shows error with retry button
5. **Success**: Shows tier badge and progress

### Integration Example:
```tsx
// In your main component
export default function MainPage() {
  // When staking contract is deployed, pass the address
  const stakingContractAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT || undefined;
  
  return (
    <div>
      <MintLeaderboard />
      <StakingTierDisplay stakingContractAddress={stakingContractAddress} />
    </div>
  );
}
```

---

## Implementation Notes

### MintLeaderboard:
- Uses `publicClient.getLogs()` to fetch NFTMinted events
- Counts mints per address and ranks them
- Updates automatically every 30 seconds
- Handles blockchain read errors gracefully
- Shows proper empty state for new contracts

### StakingTierDisplay:
- Uses mock ABI that will be replaced with real staking contract ABI
- Gracefully degrades when staking contract isn't available
- Provides clear feedback for all possible states
- Ready for mainnet deployment when staking contract is available

### Future Enhancements:
1. Add Firebase integration to MintLeaderboard for persistent storage
2. Add caching to reduce blockchain calls
3. Add more detailed mint statistics
4. Add notification system for tier upgrades
5. Add historical tier progression tracking 