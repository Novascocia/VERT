import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'wagmi';

export { baseSepolia, base };

// Get Alchemy API key from environment
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

export const wagmiConfig = getDefaultConfig({
  appName: 'Verticals',
  projectId: '1209303285d90dccca865a8af6f9c959',
  chains: [baseSepolia], // For mainnet launch, change to: [base]
  transports: {
    [baseSepolia.id]: http(
      ALCHEMY_API_KEY 
        ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : 'https://sepolia.base.org'
    ),
  },
  ssr: false, // Disable SSR to prevent hydration issues and auto-popup
}); 