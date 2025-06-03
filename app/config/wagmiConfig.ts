import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'

export { base };

// Get Alchemy API key from environment
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

// Minimal connector configuration WITHOUT WalletConnect to prevent auto-popup
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    appName: 'Verticals',
    // WalletConnect Project ID - if users see warnings when connecting,
    // this project needs to be verified at https://cloud.walletconnect.com/
    // The warning appears because this is an unverified WalletConnect project
    projectId: '1209303285d90dccca865a8af6f9c959',
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [base],
  transports: {
    [base.id]: http(
      ALCHEMY_API_KEY 
        ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : 'https://mainnet.base.org'
    ),
  },
  ssr: false,
}); 