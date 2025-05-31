// 🌐 MAINNET WAGMI CONFIGURATION TEMPLATE
// Replace the existing app/config/wagmiConfig.ts with this configuration

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains'; // Change from baseSepolia to base
import { http } from 'wagmi';

// Get Alchemy API key from environment
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

export const wagmiConfig = getDefaultConfig({
  appName: 'Verticals',
  projectId: '1209303285d90dccca865a8af6f9c959', // Same project ID
  chains: [base], // CHANGE: Use base mainnet instead of baseSepolia
  transports: {
    [base.id]: http( // CHANGE: Use base.id (8453) instead of baseSepolia.id (84532)
      ALCHEMY_API_KEY 
        ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` // CHANGE: mainnet URL
        : 'https://mainnet.base.org' // CHANGE: mainnet fallback
    ),
  },
  ssr: false, // Keep same SSR setting
});

// Export base chain for use in components
export { base };

// =============================================================================
// MIGRATION NOTES:
// =============================================================================
// 
// 1. Change all imports from `baseSepolia` to `base`
// 2. Update chain ID references: 84532 → 8453
// 3. Update RPC URLs to mainnet endpoints
// 4. Test with mainnet Alchemy key
// 5. Update any hardcoded testnet references
//
// Files that need updates after changing this:
// - app/page.tsx (chain ID checks, publicClient setup)
// - app/components/MintLeaderboard.tsx (publicClient setup)
// - Any other components using usePublicClient or useWalletClient
//
// ============================================================================= 