'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { VERTICAL_ABI, TRANSFER_EVENT_TOPIC } from '@/app/config/abis';
import { Interface } from 'ethers';
import RarityReveal from '@/app/components/RarityReveal';
import { ERC20_ABI } from '@/app/config/abis';
import { shortAddress } from '@/utils/helpers';
import HowItWorks from '@/app/components/HowItWorks';
import RarityOddsTable from '@/app/components/RarityOddsTable';
import AdminTerminal from '@/app/components/AdminTerminal';

import LiveMintFeed from '@/app/components/LiveMintFeed';
import StatBubble from '@/app/components/StatBubble';
import GraffitiWallTag from '@/app/components/GraffitiWallTag';
import GraffitiBillboard from '@/app/components/GraffitiBillboard';
import PriceTooltip from '@/app/components/PriceTooltip';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import MintTerminal from '@/app/components/MintTerminal';
import MintFeedPanel from '@/app/components/MintFeedPanel';
import { useAccount, useWalletClient, usePublicClient, useChainId, useDisconnect } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '@/app/config/wagmiConfig';
import { base } from 'wagmi/chains';
import { formatEther, maxUint256, decodeEventLog, encodeFunctionData } from 'viem';
import MintLeaderboard from '@/app/components/MintLeaderboard';
import PrizePoolTerminal from '@/app/components/PrizePoolTerminal';
import StatsTerminal from '@/app/components/StatsTerminal';
import { preventWalletAutoPopup } from '@/app/utils/walletUtils';

// Constants
const BASE_SEPOLIA_CHAIN_ID = '0x14A34';
const BASE_SEPOLIA_NETWORK_ID = '84532';
const TOKEN_DECIMALS = 18;
const MAX_UINT256 = maxUint256;

// Add a public RPC/Alchemy key for read-only stats
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';
const PUBLIC_RPC = ALCHEMY_API_KEY
  ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : 'https://sepolia.base.org';

// Contract addresses
const contractAddress = "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
const vertTokenAddress = process.env.NEXT_PUBLIC_VERT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
const virtualTokenAddress = process.env.NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS || '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';

// Remove the mock implementation and replace with real API call
async function generateAndStoreNFT(tokenId: string) {
  try {
    console.log("🚀 Calling backend to generate NFT for token:", tokenId);
    const response = await fetch('/api/generateAndStoreNFT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✨ NFT generated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error generating NFT:", error);
    throw error;
  }
}

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';

// Utility to parse rarity enum from contract
function parseRarityEnum(value: number): 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' {
  switch (value) {
    case 0: return 'Common';
    case 1: return 'Rare';
    case 2: return 'Epic';
    case 3: return 'Legendary';
    case 4: return 'Mythical';
    default: return 'Common';
  }
}

// Utility to fetch prize amount from contract
async function fetchPrizeAmount(contract: any, rarityValue: number) {
  const percent = await contract.prizePercentByRarity(rarityValue);
  const pool = await contract.getPrizePoolBalance();
  const poolVert = Number(formatEther(pool));
  // Calculate the prize (same as contract logic, but in VERT)
  return (poolVert * Number(percent)) / 100;
}

// Helper to convert ipfs:// to https://ipfs.io/ipfs/
function ipfsToHttp(ipfsUrl: string) {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
}

// Helper to extract token ID from transaction receipt
async function getMintDetailsFromTxReceipt(txHash: string, publicClient: any) {
  try {
    console.log('🔍 Getting transaction receipt for hash:', txHash);
    
    // Add retry logic for getting transaction receipt with better error handling
    let receipt;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        receipt = await waitForTransactionReceipt(wagmiConfig, { 
          hash: txHash as `0x${string}`,
          timeout: 60000 // 60 second timeout
        });
        break;
      } catch (receiptError: any) {
        retries++;
        console.log(`⚠️ Attempt ${retries}/${maxRetries} to get receipt failed:`, receiptError.message);
        
        // Check if this is an RPC connectivity issue vs a transaction failure
        const isRpcError = receiptError.message?.includes('503') || 
                          receiptError.message?.includes('no backend') ||
                          receiptError.message?.includes('HTTP request failed') ||
                          receiptError.message?.includes('network error') ||
                          receiptError.message?.includes('timeout');
        
        if (isRpcError) {
          console.log(`🌐 RPC connectivity issue detected on attempt ${retries}`);
          if (retries >= maxRetries) {
            throw new Error('RPC network issues - Base Sepolia is experiencing connectivity problems. Please try again later.');
          }
          // Longer delay for RPC issues
          await new Promise(resolve => setTimeout(resolve, 5000 * retries));
        } else {
          // This is likely a transaction execution failure
          console.log('❌ Transaction execution failed:', receiptError.message);
          if (retries >= maxRetries) {
            throw new Error(`Transaction failed: ${receiptError.message}`);
          }
          // Shorter delay for transaction failures
          await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        }
      }
    }
    
    if (!receipt) {
      throw new Error('Failed to obtain transaction receipt after multiple attempts');
    }
    
    console.log('📋 Transaction receipt:', {
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber.toString(),
      logsCount: receipt.logs.length
    });

    // Check if transaction failed
    if (receipt.status === 'reverted') {
      throw new Error('Transaction was reverted by the contract');
    }
    
    let tokenId: string | null = null;
    let rarity: Rarity | null = null;
    let prizeWon = '0';
    
    console.log('🔎 Parsing logs from transaction...');
    
    // Parse all events from our contract
    for (const log of receipt.logs) {
      try {
        // Check if this log is from our contract
        if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
          console.log('📝 Found log from our contract:', log);
          
          const decoded = decodeEventLog({
            abi: VERTICAL_ABI,
            data: log.data,
            topics: log.topics,
          });
          
          console.log('🎯 Decoded event:', decoded.eventName, decoded.args);
          
          // Get token ID and rarity from NFTMinted event
          if (decoded.eventName === 'NFTMinted' && decoded.args) {
            const args = decoded.args as any;
            tokenId = args.tokenId.toString();
            rarity = parseRarityEnum(Number(args.rarity));
            console.log('🎨 NFT Minted event found:', { tokenId, rarity });
          }
          
          // Get actual prize amount from PrizeClaimed event
          if (decoded.eventName === 'PrizeClaimed' && decoded.args) {
            const args = decoded.args as any;
            prizeWon = formatEther(args.amount);
            console.log('🏆 Prize Claimed event found:', { prizeWon });
          }
        }
      } catch (e) {
        // Skip logs that can't be decoded
        console.log('ℹ️ Skipping log that could not be decoded:', e);
        continue;
      }
    }
    
    if (!tokenId) {
      console.error('❌ Token ID not found in transaction logs');
      console.log('Available logs:', receipt.logs);
      throw new Error('Token ID not found in transaction receipt');
    }
    
    console.log('✅ Successfully extracted mint details:', { tokenId, rarity, prizeWon });
    
    return {
      tokenId,
      rarity: rarity || 'Common' as Rarity,
      prizeWon
    };
  } catch (error: any) {
    console.error('❌ Error extracting mint details:', error);
    
    // Provide more context for common errors
    if (error.message?.includes('execution reverted')) {
      console.error('🔴 Transaction execution reverted - this indicates the mint transaction itself failed');
      console.error('💡 Common causes:');
      console.error('   - Insufficient token balance');
      console.error('   - Insufficient allowance');
      console.error('   - Contract is paused');
      console.error('   - Invalid parameters');
      console.error('   - Gas limit too low');
    }
    
    throw error;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [prizePool, setPrizePool] = useState('0');
  const [totalMinted, setTotalMinted] = useState('0');
  const [priceVirtual, setPriceVirtual] = useState('0');
  const [priceVert, setPriceVert] = useState('0');
  const [mintedNFT, setMintedNFT] = useState<{
    imageUrl: string;
    rarity: Rarity;
    prizeWon?: string;
  } | null>(null);
  const activeToasts = useRef<Set<string>>(new Set());
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [mintedNFTImageUrl, setMintedNFTImageUrl] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedMetadata, setGeneratedMetadata] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [lastMintedRarity, setLastMintedRarity] = useState<Rarity | null>(null);
  const [lastMintedPrize, setLastMintedPrize] = useState<string | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [virtualAllowance, setVirtualAllowance] = useState<bigint>(BigInt(0));
  const [vertAllowance, setVertAllowance] = useState<bigint>(BigInt(0));
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [totalPaidOut, setTotalPaidOut] = useState('0');
  const [networkStatus, setNetworkStatus] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastMintTime, setLastMintTime] = useState<number>(0);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isOnBaseMainnet = chainId === 8453;
  const { data: walletClient } = useWalletClient({ chainId: base.id });
  const publicClient = usePublicClient({ chainId: base.id });
  const [mounted, setMounted] = useState(false);
  const { disconnect } = useDisconnect();

  // Log mounted state changes for debugging
  useEffect(() => {
    console.log('✅ Component mounted state changed:', mounted);
    if (mounted) {
      console.log('🎯 UI should now render!');
    }
  }, [mounted]);

  // Debug network connection
  useEffect(() => {
    if (mounted && isConnected) {
      console.log('🔍 Network Debug Info:');
      console.log('Current Chain ID:', chainId);
      console.log('Expected Chain ID (Base Mainnet):', 8453);
      console.log('Is on Base Mainnet:', chainId === 8453);
      console.log('Contract Address:', contractAddress);
      
      if (chainId !== 8453) {
        console.warn('⚠️ WARNING: You are not connected to Base Mainnet!');
        console.warn('Current network chain ID:', chainId);
        console.warn('Please switch to Base Mainnet (chain ID: 8453) for Phase 1 launch');
      }
    }
  }, [mounted, isConnected, chainId]);

  // Verify contract and its interface
  useEffect(() => {
    const verifyContract = async () => {
      if (!publicClient || !mounted) return;
      
      try {
        console.log('🔍 Verifying contract interface...');
        
        // Check if contract exists
        const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
        console.log('📝 Contract bytecode length:', code?.length || 0);
        
        // Test standard ERC-721 functions
        try {
          const name = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: VERTICAL_ABI,
            functionName: 'name',
          });
          console.log('📛 Contract name:', name);
        } catch (e) {
          console.warn('⚠️ Could not read contract name:', e);
        }
        
        try {
          const symbol = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: VERTICAL_ABI,
            functionName: 'symbol',
          });
          console.log('🔖 Contract symbol:', symbol);
        } catch (e) {
          console.warn('⚠️ Could not read contract symbol:', e);
        }
        
        // Test supportsInterface for ERC-721
        try {
          const supportsERC721 = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: VERTICAL_ABI,
            functionName: 'supportsInterface',
            args: ['0x80ac58cd'], // ERC-721 interface ID
          });
          console.log('🎨 Supports ERC-721:', supportsERC721);
        } catch (e) {
          console.warn('⚠️ Could not check ERC-721 support:', e);
        }
        
      } catch (error) {
        console.error('❌ Contract verification failed:', error);
      }
    };
    
    if (mounted && publicClient) {
      // Make contract verification non-blocking
      verifyContract().catch(err => {
        console.warn('Contract verification failed:', err);
      });
    }
  }, [mounted, publicClient]);

  // Clear any stale WalletConnect sessions on mount
  useEffect(() => {
    console.log('🚀 Component mounting...');
    
    // Prevent WalletConnect auto-popup immediately
    preventWalletAutoPopup();
    
    // Delay mounting to prevent hydration setState issues
    const mountTimeout = setTimeout(() => {
      setMounted(true);
    }, 100); // Small delay to avoid hydration race conditions
    
    // Fallback timeout to ensure UI renders in development
    const fallbackTimeout = setTimeout(() => {
      if (!mounted) {
        console.log('🚨 Fallback: Setting mounted to true after timeout');
        setMounted(true);
      }
    }, 2000); // 2 second fallback
    
    return () => {
      clearTimeout(mountTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Check RPC network health
  const checkNetworkHealth = async () => {
    if (!publicClient) return;
    
    try {
      const startTime = Date.now();
      await publicClient.getBlockNumber();
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 2000) {
        setNetworkStatus('healthy');
      } else if (responseTime < 5000) {
        setNetworkStatus('degraded');
      } else {
        setNetworkStatus('unhealthy');
      }
    } catch (error: any) {
      console.log('❌ Network health check failed:', error.message);
      if (error.message?.includes('503') || error.message?.includes('no backend')) {
        setNetworkStatus('unhealthy');
      } else {
        setNetworkStatus('degraded');
      }
    }
  };

  // Check network health periodically
  useEffect(() => {
    if (mounted && publicClient) {
      // Make network health check non-blocking
      checkNetworkHealth().catch(err => {
        console.warn('Initial network health check failed:', err);
        setNetworkStatus('degraded');
      });
      
      const interval = setInterval(() => {
        checkNetworkHealth().catch(err => {
          console.warn('Periodic network health check failed:', err);
        });
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [mounted, publicClient]);

  const fetchContractData = async () => {
    // This function is now obsolete and can be removed if not used elsewhere
  };

  // Fetch contract stats (now supports read-only mode)
  const fetchPrizePool = async () => {
    try {
      if (!publicClient) return;
      const pool = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getPrizePoolBalance',
      }) as bigint;
      setPrizePool(formatEther(pool));
    } catch (error) {
      // ignore
    }
  };

  const fetchTotalMinted = async () => {
    try {
      if (!publicClient) return;
      const minted = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getTotalMinted',
      }) as bigint;
      setTotalMinted(minted.toString());
    } catch (error) {
      // ignore
    }
  };

  const fetchMintPrices = async () => {
    try {
      if (!publicClient) return;
      const vPrice = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVirtual',
      }) as bigint;
      const vertPrice = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVert',
      }) as bigint;
      setPriceVirtual(formatEther(vPrice));
      setPriceVert(formatEther(vertPrice));
    } catch (error) {
      // ignore
    }
  };

  // Check user's token allowances
  const checkAllowances = async () => {
    if (!publicClient || !address) return;
    
    try {
      const vAllowance = await publicClient.readContract({
        address: virtualTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, contractAddress as `0x${string}`],
      }) as bigint;
      
      const vertAllowance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, contractAddress as `0x${string}`],
      }) as bigint;
      
      setVirtualAllowance(vAllowance);
      setVertAllowance(vertAllowance);
    } catch (error) {
      // Ignore errors
    }
  };

  // Initial data loading
  useEffect(() => {
    if (mounted && publicClient) {
      console.log('🔄 Initial data loading started...');
      setIsLoadingStats(true);
      
      Promise.all([
        checkNetworkHealth(),
        fetchContractData().catch(err => console.warn('Failed to fetch contract data:', err)),
        fetchPrizePool().catch(err => console.warn('Failed to fetch prize pool:', err)),
        fetchTotalMinted().catch(err => console.warn('Failed to fetch total minted:', err)),
        fetchMintPrices().catch(err => console.warn('Failed to fetch mint prices:', err)),
        fetchTotalPaidOut().catch(err => console.warn('Failed to fetch total paid out:', err))
      ]).then(() => {
        setIsLoadingStats(false);
        console.log('✅ All stats loaded successfully');
      }).catch(err => {
        console.error('❌ Error during initial data loading:', err);
        setIsLoadingStats(false);
      });
    }
  }, [mounted, publicClient]);

  // Check allowances when wallet connects
  useEffect(() => {
    if (mounted && publicClient && address) {
      checkAllowances();
    }
  }, [mounted, publicClient, address]);

  // Fetch total VERT paid out from prize claims
  const fetchTotalPaidOut = async () => {
    try {
      if (!publicClient) return;
      
      console.log('🔍 Fetching total VERT paid out from prize claims...');
      
      // Get current block number
      let currentBlock: bigint;
      try {
        currentBlock = await publicClient.getBlockNumber();
        console.log(`📊 Current block: ${currentBlock.toString()}`);
      } catch (e) {
        console.warn('Could not get current block, setting total paid out to 0');
        setTotalPaidOut('0');
        return;
      }
      
      // Alchemy allows max 500 blocks per query, so we'll use 400 to be safe
      const BLOCK_RANGE = 400;
      const MAX_QUERIES = 10; // Limit to prevent excessive API calls
      
      let totalPaid = BigInt(0);
      let totalEvents = 0;
      
      // Start from recent blocks and work backwards
      let toBlock = currentBlock;
      let queriesRun = 0;
      
      console.log(`📊 Querying in ${BLOCK_RANGE} block chunks, max ${MAX_QUERIES} queries`);
      
      while (queriesRun < MAX_QUERIES) {
        const fromBlock = toBlock - BigInt(BLOCK_RANGE) + BigInt(1);
        
        if (fromBlock < BigInt(0)) {
          console.log('📊 Reached genesis block, stopping');
          break;
        }
        
        console.log(`📊 Query ${queriesRun + 1}: Blocks ${fromBlock.toString()} to ${toBlock.toString()}`);
        
        try {
          const prizeClaimedEvents = await publicClient.getLogs({
            address: contractAddress as `0x${string}`,
            event: {
              type: 'event',
              name: 'PrizeClaimed',
              inputs: [
                { type: 'address', name: 'user', indexed: true },
                { type: 'uint256', name: 'amount', indexed: false }
              ]
            },
            fromBlock: fromBlock,
            toBlock: toBlock
          });
          
          console.log(`📄 Found ${prizeClaimedEvents.length} prize events in this range`);
          totalEvents += prizeClaimedEvents.length;
          
          // Sum all prize amounts from this chunk
          for (const event of prizeClaimedEvents) {
            try {
              const decoded = decodeEventLog({
                abi: VERTICAL_ABI,
                data: event.data,
                topics: event.topics,
              });
              
              if (decoded.eventName === 'PrizeClaimed' && decoded.args) {
                const args = decoded.args as any;
                totalPaid += args.amount;
                console.log(`💰 Prize claim: ${formatEther(args.amount)} VERT to ${args.user}`);
              }
            } catch (e) {
              console.warn('⚠️ Could not decode prize event:', e);
            }
          }
          
        } catch (queryError: any) {
          // Don't log the full error which contains the API key in the URL
          const sanitizedMessage = queryError.message?.replace(/\/v2\/[^\/\s]+/g, '/v2/[HIDDEN]') || 'Unknown error';
          console.warn(`⚠️ Query failed for blocks ${fromBlock.toString()}-${toBlock.toString()}:`, sanitizedMessage);
          // Continue with next range instead of failing completely
        }
        
        // Move to next range
        toBlock = fromBlock - BigInt(1);
        queriesRun++;
      }
      
      const totalPaidFormatted = formatEther(totalPaid);
      console.log(`✅ Total VERT paid out: ${totalPaidFormatted} VERT (from ${totalEvents} events across ${queriesRun} queries)`);
      setTotalPaidOut(totalPaidFormatted);
      
    } catch (error) {
      console.error('❌ Error fetching total paid out:', error);
      // Fallback: set to 0 instead of crashing
      setTotalPaidOut('0');
    }
  };

  const handleMintWithVert = async () => {
    try {
      // Explicit safeguard
      if (!walletClient?.account?.address) {
        throw new Error('Wallet is not connected');
      }
      
      if (!publicClient) {
        toast.error("Please connect your wallet!");
        return;
      }

      // Rate limiting - prevent rapid successive mints
      const now = Date.now();
      const timeSinceLastMint = now - lastMintTime;
      const MIN_MINT_INTERVAL = 10000; // 10 seconds minimum between mints
      
      if (timeSinceLastMint < MIN_MINT_INTERVAL && lastMintTime > 0) {
        const remainingTime = Math.ceil((MIN_MINT_INTERVAL - timeSinceLastMint) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before minting again to avoid race conditions.`);
      }
      
      setLastMintTime(now);

      console.log('🚀 Starting VERT mint process...');

      // Enhanced pre-mint validation
      try {
        console.log('🔍 Pre-mint validation starting...');
        
        // First, check RPC health by testing a simple call
        try {
          const blockNumber = await publicClient.getBlockNumber();
          console.log('✅ RPC health check passed, current block:', blockNumber.toString());
        } catch (rpcError: any) {
          if (rpcError.message?.includes('503') || rpcError.message?.includes('no backend')) {
            throw new Error('Network connectivity issues detected. Base Sepolia RPC is experiencing problems. Please try again later.');
          }
          throw new Error('RPC connection failed: ' + rpcError.message);
        }
        
        // Check wallet balance
        const userBalance = await publicClient.readContract({
          address: vertTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletClient.account.address],
        }) as bigint;
        
        console.log('💰 User VERT balance:', formatEther(userBalance), 'VERT');
        
        // Get current mint price
        const currentPrice = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'priceVert',
        }) as bigint;
        
        console.log('💸 VERT mint price:', formatEther(currentPrice), 'VERT');
        
        // Check if user has enough balance
        if (userBalance < currentPrice) {
          throw new Error(`Insufficient VERT balance. Need ${formatEther(currentPrice)} VERT, have ${formatEther(userBalance)} VERT`);
        }

        // Check allowance
        const currentAllowance = await publicClient.readContract({
          address: vertTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [walletClient.account.address, contractAddress as `0x${string}`],
        }) as bigint;
        
        console.log('✅ Current VERT allowance:', formatEther(currentAllowance), 'VERT');
        
        // Check if allowance is sufficient
        if (currentAllowance < currentPrice) {
          console.log('🔍 VERT allowance insufficient, requesting approval...');
          console.log('🔍 VERT Approval Debug:', {
            spender: contractAddress,
            amount: 'MAX_UINT256', // Approve maximum so user only needs to approve once
            currentAllowance: formatEther(currentAllowance)
          });
          
          // Request approval from user
          toast('Approve VERT token spending (one-time approval)');
          try {
            await writeContract(wagmiConfig, {
              account: walletClient.account.address,
              address: vertTokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [contractAddress as `0x${string}`, MAX_UINT256], // Approve maximum for convenience
            });
            toast.success('VERT approved ✅ - No more approvals needed!');
            
            // Refresh allowances after approval
            await checkAllowances();
            console.log('✅ VERT approval completed successfully');
          } catch (approvalError: any) {
            console.error('❌ VERT approval failed:', approvalError);
            setIsWaitingForTx(false);
            
            if (approvalError.message?.includes('User rejected') || approvalError.code === 4001) {
              throw new Error('VERT approval cancelled by user');
            } else {
              throw new Error('VERT approval failed: ' + approvalError.message);
            }
          }
        }
        
        // Check if contract is paused
        const isPaused = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'paused',
        }) as boolean;
        
        if (isPaused) {
          throw new Error('Contract is currently paused');
        }
        
        console.log('✅ All pre-mint checks passed');
        
      } catch (validationError: any) {
        console.error('❌ Pre-mint validation failed:', validationError);
        setIsWaitingForTx(false);
        throw new Error('Pre-mint validation failed: ' + validationError.message);
      }

      // Debug contract state right before sending transaction
      console.log('🔧 Final contract state check before transaction:');
      await debugContractState();

      // Set waiting state BEFORE sending transaction
      setIsWaitingForTx(true);
      setMintedNFT(null); // Clear any previous mint
      setGeneratedImage(null);
      setMintedNFTImageUrl(null);
      // Clear previous mint info
      setLastMintedRarity(null);
      setLastMintedPrize(null);
      setMintedTokenId(null);

      // 5. Mint NFT with VERT
      toast("Confirm transaction in wallet");
      
      // Add comprehensive debugging right before minting
      console.log('🔍 Final pre-mint validation...');
      
      // Debug RPC endpoint being used
      console.log('🌐 RPC Configuration:', {
        alchemyKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY ? 'SET' : 'NOT SET',
        chainId: publicClient?.chain?.id,
        chainName: publicClient?.chain?.name
      });
      
      try {
        // Double-check balance
        const currentBalance = await publicClient.readContract({
          address: vertTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletClient.account.address],
        }) as bigint;
        
        // Double-check allowance
        const currentAllowance = await publicClient.readContract({
          address: vertTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [walletClient.account.address, contractAddress as `0x${string}`],
        }) as bigint;
        
        // Check current VERT price (might have changed)
        const currentVertPrice = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'priceVert',
        }) as bigint;
        
        console.log('💰 Pre-mint validation:', {
          userBalance: formatEther(currentBalance),
          requiredAmount: formatEther(currentVertPrice),
          hasEnoughBalance: currentBalance >= currentVertPrice,
          currentAllowance: formatEther(currentAllowance),
          hasEnoughAllowance: currentAllowance >= currentVertPrice,
          currentVertPrice: formatEther(currentVertPrice),
          userAddress: walletClient.account.address,
          contractAddress: contractAddress,
          vertTokenAddress: vertTokenAddress
        });
        
        // Check if balances/allowances are sufficient
        if (currentBalance < currentVertPrice) {
          throw new Error(`Insufficient VERT balance: ${formatEther(currentBalance)} < ${formatEther(currentVertPrice)}`);
        }
        
        if (currentAllowance < currentVertPrice) {
          throw new Error(`Insufficient allowance: ${formatEther(currentAllowance)} < ${formatEther(currentVertPrice)}`);
        }
        
        // Check if we can read total minted (contract health check)
        const totalMinted = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getTotalMinted',
        }) as bigint;
        console.log('📊 Current total minted:', totalMinted.toString());
        
        // TRY TO SIMULATE THE EXACT CALL TO SEE WHAT FAILS
        console.log('🧪 Attempting to simulate mint call...');
        try {
          const simulateResult = await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: VERTICAL_ABI,
            functionName: 'mintWithVert',
            args: ["ipfs://QmPlaceholder"],
            account: walletClient.account.address,
          });
          console.log('✅ Simulate successful, result:', simulateResult);
        } catch (simulateError: any) {
          console.error('❌ SIMULATE FAILED - This is why the transaction reverts:', simulateError);
          console.error('📋 Simulate error details:', {
            message: simulateError.message,
            cause: simulateError.cause,
            data: simulateError.data
          });
          
          // Try to decode the revert reason if available
          if (simulateError.data) {
            console.log('🔍 Raw error data:', simulateError.data);
          }
          
          setIsWaitingForTx(false);
          throw new Error(`Mint will fail: ${simulateError.message}`);
        }
        
      } catch (validationError: any) {
        console.error('❌ Pre-mint validation failed:', validationError);
        setIsWaitingForTx(false);
        throw new Error('Pre-mint validation failed: ' + validationError.message);
      }
      
      // Debug gas estimation
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmPlaceholder"],
          account: walletClient.account.address,
        });
        console.log('💰 Gas Estimate for VERT mint:', gasEstimate.toString());
        
        // Add extra buffer for auto-sync functionality (30k gas)
        const gasWithBuffer = (gasEstimate * BigInt(140)) / BigInt(100); // 40% buffer for auto-sync
        
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        console.log('⛽ Current gas price:', formatEther(gasPrice), 'ETH');
        
        const estimatedCost = gasWithBuffer * gasPrice;
        console.log('💰 Estimated transaction cost:', formatEther(estimatedCost), 'ETH');
      } catch (gasError: any) {
        console.error('❌ Gas estimation failed - this suggests the transaction will fail:', gasError);
        setIsWaitingForTx(false);
        
        // Provide detailed error message based on the gas estimation failure
        let errorMessage = 'Transaction will likely fail';
        if (gasError.message?.includes('execution reverted')) {
          errorMessage = 'Contract call will revert - check your VERT balance and allowance';
        } else if (gasError.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fees';
        } else if (gasError.message?.includes('paused')) {
          errorMessage = 'Contract is currently paused';
        }
        
        throw new Error(errorMessage + ' - ' + gasError.message);
      }

      console.log('📤 Sending mint transaction...');
      
      // Get gas estimate with buffer for transaction
      let gasWithBuffer: bigint;
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmPlaceholder"],
          account: walletClient.account.address,
        });
        gasWithBuffer = (gasEstimate * BigInt(140)) / BigInt(100); // 40% buffer for auto-sync
        console.log('💰 Final gas with buffer for transaction:', gasWithBuffer.toString());
      } catch (gasEstError: any) {
        console.warn('⚠️ Gas estimation failed, using fallback:', gasEstError.message);
        gasWithBuffer = BigInt(250000); // Higher fallback for auto-sync
      }
      
      let txHash;
      try {
        txHash = await writeContract(wagmiConfig, {
          account: walletClient.account.address,
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmPlaceholder"],
          gas: gasWithBuffer, // Use buffered gas estimate
        });
      } catch (writeError: any) {
        console.error('❌ writeContract failed:', writeError);
        setIsWaitingForTx(false);
        
        // Handle specific contract execution errors
        if (writeError.message?.includes('execution reverted')) {
          throw new Error('Mint transaction failed: Contract execution reverted. Please check your VERT balance and allowance.');
        } else if (writeError.message?.includes('User rejected') || writeError.code === 4001) {
          throw new Error('Transaction cancelled by user');
        } else if (writeError.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction');
        } else if (writeError.message?.includes('503') || writeError.message?.includes('no backend')) {
          throw new Error('Network connectivity issues. Base Sepolia RPC is experiencing problems. Please try again later.');
        } else {
          throw new Error('Transaction failed: ' + writeError.message);
        }
      }
      
      console.log('✅ Transaction sent:', txHash);
      
      // Transaction confirmed, now start processing
      setIsWaitingForTx(false);
      setIsProcessing(true);
      toast.success("Transaction confirmed! Generating NFT...");

      // Wait for transaction confirmation and get mint details
      console.log('⏳ Waiting for transaction receipt...');
      const mintDetails = await getMintDetailsFromTxReceipt(txHash, publicClient);
      console.log('📄 Mint details extracted:', mintDetails);

      // Store the minted token ID
      setMintedTokenId(mintDetails.tokenId);

      // Call backend to generate NFT with actual token ID
      console.log("🚀 Calling NFT generation API for token:", mintDetails.tokenId);
      const response = await fetch("/api/generateAndStoreNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId: mintDetails.tokenId }),
      });

      console.log("📡 API Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
        console.error("❌ NFT Generation API failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`NFT Generation failed: ${errorData.error || response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log("✅ NFT Generation API success:", data);
      
      setGeneratedImage(data.imageUrl || data.image);
      setGeneratedMetadata(data.metadata);
      setMintedNFTImageUrl(data.imageUrl || data.image);

      // Use the actual rarity and prize from the blockchain events
      const rarity = mintDetails.rarity;
      const prizeWon = mintDetails.prizeWon;
      
      // Set minted NFT data for reveal
      setMintedNFT({
        imageUrl: data.imageUrl || data.image,
        rarity: rarity,
        prizeWon: prizeWon,
      });

      // Store for persistent display
      setLastMintedRarity(rarity);
      setLastMintedPrize(prizeWon);

      setIsProcessing(false);
      toast.success("NFT minted successfully!");

      // Re-fetch stats after mint
      await fetchPrizePool();
      await fetchTotalMinted();
      await fetchMintPrices();
      await fetchTotalPaidOut();

    } catch (error: any) {
      setIsWaitingForTx(false);
      setIsProcessing(false);
      console.error("❌ Minting failed:", error);
      
      // More detailed error logging
      if (error?.message?.includes('execution reverted')) {
        console.error('🔴 Contract execution reverted - possible reasons:');
        console.error('- Insufficient VERT balance');
        console.error('- Insufficient allowance');
        console.error('- Contract is paused');
        console.error('- Invalid parameters');
        console.error('- Gas limit too low');
        
        // Check if this is a post-transaction revert (transaction was sent but failed)
        if (error?.message?.includes('Transaction failed: Execution reverted')) {
          console.error('🚨 CRITICAL: Transaction was sent but reverted during execution');
          console.error('🔍 This suggests a race condition or contract state change');
          console.error('💡 Recommended actions:');
          console.error('   1. Wait 30 seconds before trying again');
          console.error('   2. Check if contract was paused');
          console.error('   3. Verify no other transactions are pending');
          console.error('   4. Try refreshing the page');
          
          // Provide user-friendly error message for post-transaction reverts
          setMintError('Transaction sent but failed during execution. This may be due to network congestion or a race condition. Please wait 30 seconds and try again.');
          
          // Run debug check to see what went wrong
          console.log('🚨 POST-FAILURE DEBUG CHECK:');
          await debugContractState();
        }
      } else if (error?.message?.includes('503') || error?.message?.includes('no backend')) {
        console.error('🌐 RPC connectivity issues detected');
        setMintError('Network connectivity issues. Base Sepolia RPC is experiencing problems. Please try again later.');
      }
      
      setMintStatus("error");
      setMintError(error.message);
      // Remove error toasts - terminal handles error display
      // Re-throw so MintTerminal can handle it
      throw error;
    }
  };

  const handleMintWithVirtual = async () => {
    try {
      // Explicit safeguard
      if (!walletClient?.account?.address) {
        throw new Error('Wallet is not connected');
      }
      
      if (!publicClient) {
        toast.error('Connect your wallet first');
        return;
      }

      // Rate limiting - prevent rapid successive mints
      const now = Date.now();
      const timeSinceLastMint = now - lastMintTime;
      const MIN_MINT_INTERVAL = 10000; // 10 seconds minimum between mints
      
      if (timeSinceLastMint < MIN_MINT_INTERVAL && lastMintTime > 0) {
        const remainingTime = Math.ceil((MIN_MINT_INTERVAL - timeSinceLastMint) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before minting again to avoid race conditions.`);
      }
      
      setLastMintTime(now);

      setIsWaitingForTx(true);
      setMintedNFT(null);
      setGeneratedImage(null);
      setMintedNFTImageUrl(null);
      // Clear previous mint info
      setLastMintedRarity(null);
      setLastMintedPrize(null);
      setMintedTokenId(null);
      
      // 1. Get price
      const price = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVirtual',
      }) as bigint;
      
      // 2. Check allowance
      const allowance = await publicClient.readContract({
        address: virtualTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletClient.account.address, contractAddress as `0x${string}`],
      }) as bigint;
      
      // 3. Approve if needed
      if (allowance < price) {
        console.log('🔍 VIRTUAL Approval Debug:', {
          spender: contractAddress,
          amount: 'MAX_UINT256', // Approve maximum so user only needs to approve once
          requiredPrice: price.toString(),
          allowance: allowance.toString()
        });
        toast('Approve VIRTUAL token spending (one-time approval)');
        await writeContract(wagmiConfig, {
          account: walletClient.account.address,
          address: virtualTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, MAX_UINT256], // Approve maximum for convenience
        });
        toast.success('VIRTUAL approved ✅ - No more approvals needed!');
        // Refresh allowances
        await checkAllowances();
      }
      
      // 4. Mint NFT
      toast('Confirm transaction in wallet');
      
      // Debug gas estimation
      let gasWithBuffer: bigint = BigInt(200000); // Fallback gas limit
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVirtual',
          args: ['ipfs://QmPlaceholder'],
          account: walletClient.account.address,
        });
        console.log('🔍 Gas Estimate for VIRTUAL mint:', gasEstimate.toString());
        
        // Add 40% buffer for auto-sync functionality
        gasWithBuffer = (gasEstimate * BigInt(140)) / BigInt(100);
        console.log('🛡️ Gas with 40% buffer:', gasWithBuffer.toString());
        
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        console.log('⛽ Current gas price:', formatEther(gasPrice), 'ETH');
        
        const estimatedCost = gasWithBuffer * gasPrice;
        console.log('💰 Estimated transaction cost:', formatEther(estimatedCost), 'ETH');
        console.log('💰 Estimated transaction cost (USD ~$2500/ETH):', '$' + (Number(formatEther(estimatedCost)) * 2500).toFixed(4));
      } catch (gasError: any) {
        console.error('❌ Gas estimation failed - using fallback gas limit:', gasError);
        gasWithBuffer = BigInt(250000); // Higher fallback for auto-sync
      }

      let txHash;
      try {
        txHash = await writeContract(wagmiConfig, {
          account: walletClient.account.address,
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVirtual',
          args: ['ipfs://QmPlaceholder'],
          gas: gasWithBuffer, // Use buffered gas estimate
        });
      } catch (writeError: any) {
        console.error('❌ writeContract failed:', writeError);
        setIsWaitingForTx(false);
        
        // Handle specific contract execution errors
        if (writeError.message?.includes('execution reverted')) {
          throw new Error('Mint transaction failed: Contract execution reverted. Please check your VIRTUAL balance and allowance.');
        } else if (writeError.message?.includes('User rejected') || writeError.code === 4001) {
          throw new Error('Transaction cancelled by user');
        } else if (writeError.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction');
        } else if (writeError.message?.includes('503') || writeError.message?.includes('no backend')) {
          throw new Error('Network connectivity issues. Base Sepolia RPC is experiencing problems. Please try again later.');
        } else {
          throw new Error('Transaction failed: ' + writeError.message);
        }
      }
      
      console.log('✅ Transaction sent:', txHash);
      
      // Transaction confirmed, now start processing
      setIsWaitingForTx(false);
      setIsProcessing(true);
      toast.success('Transaction confirmed! Generating NFT...');

      // Wait for transaction confirmation and get mint details
      const mintDetails = await getMintDetailsFromTxReceipt(txHash, publicClient);

      // Store the minted token ID
      setMintedTokenId(mintDetails.tokenId);

      // Call backend to generate NFT with actual token ID
      console.log("🚀 Calling NFT generation API for token:", mintDetails.tokenId);
      const response = await fetch("/api/generateAndStoreNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId: mintDetails.tokenId }),
      });

      console.log("📡 API Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
        console.error("❌ NFT Generation API failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`NFT Generation failed: ${errorData.error || response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log("✅ NFT Generation API success:", data);
      
      setGeneratedImage(data.imageUrl || data.image);
      setGeneratedMetadata(data.metadata);
      setMintedNFTImageUrl(data.imageUrl || data.image);

      // Use the actual rarity and prize from the blockchain events
      const rarity = mintDetails.rarity;
      const prizeWon = mintDetails.prizeWon;
      
      // Set minted NFT data for reveal
      setMintedNFT({
        imageUrl: data.imageUrl || data.image,
        rarity: rarity,
        prizeWon: prizeWon,
      });

      // Store for persistent display
      setLastMintedRarity(rarity);
      setLastMintedPrize(prizeWon);

      setIsProcessing(false);
      toast.success("NFT minted successfully!");
      
      // Re-fetch stats after mint
      await fetchPrizePool();
      await fetchTotalMinted();
      await fetchMintPrices();
      await fetchTotalPaidOut();
      
    } catch (error: any) {
      setIsWaitingForTx(false);
      setIsProcessing(false);
      console.error('Minting failed:', error);
      // Remove error toasts - terminal handles error display
      // Re-throw so MintTerminal can handle it
      throw error;
    }
  };

  // Add debugging function to check contract state
  const debugContractState = async () => {
    if (!publicClient || !address) {
      console.log('❌ Cannot debug - missing publicClient or address');
      return;
    }

    try {
      console.log('🔍 DEBUGGING CONTRACT STATE:');
      
      // Check if contract is paused
      const isPaused = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'paused',
      }) as boolean;
      console.log(`⏸️ Contract paused: ${isPaused}`);
      
      // Check user VERT balance
      const vertBalance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;
      console.log(`💰 VERT balance: ${formatEther(vertBalance)}`);
      
      // Check VERT allowance
      const vertAllowance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, contractAddress as `0x${string}`],
      }) as bigint;
      console.log(`✅ VERT allowance: ${formatEther(vertAllowance)}`);
      
      // Check mint price
      const mintPrice = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVert',
      }) as bigint;
      console.log(`💸 Mint price: ${formatEther(mintPrice)}`);
      
      // Check total minted
      const totalMinted = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getTotalMinted',
      }) as bigint;
      console.log(`📊 Total minted: ${totalMinted.toString()}`);
      
      // Check if there are any pending transactions
      const nonce = await publicClient.getTransactionCount({
        address: address,
        blockTag: 'pending'
      });
      const latestNonce = await publicClient.getTransactionCount({
        address: address,
        blockTag: 'latest'
      });
      console.log(`🔢 Pending nonce: ${nonce}, Latest nonce: ${latestNonce}`);
      if (nonce > latestNonce) {
        console.log(`⚠️ WARNING: ${nonce - latestNonce} pending transactions detected!`);
      }
      
      // Try to simulate a mint to see if it would fail
      try {
        const simulateResult = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmDebugTest"],
          account: address,
        });
        console.log('✅ Simulation still passes - this is very strange!');
        
        // Verify function selector
        console.log('🔍 Checking function selector...');
        const functionData = encodeFunctionData({
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmPlaceholder"]
        });
        console.log('📄 Function data:', functionData);
        console.log('🎯 Function selector:', functionData.slice(0, 10));
        
      } catch (simError: any) {
        console.log('❌ Simulation now fails:', simError.message);
        return simError.message;
      }
      
    } catch (error: any) {
      console.error('❌ Debug failed:', error);
    }
  };

  const canMint = Boolean(mounted && isConnected && address && isOnBaseMainnet && !isLoading);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-black border border-green-500 text-green-400',
            style: {
              background: '#000000',
              color: '#4ade80',
              border: '1px solid #22c55e',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              maxWidth: '300px',
            },
            duration: 2000, // Shorter duration for less intrusion
            success: {
              style: {
                color: '#4ade80',
                border: '1px solid #22c55e',
              },
            },
            error: {
              style: {
                color: '#ef4444',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
        {/* Header */}
        <div className="z-50 relative">
          <header className="relative flex justify-between items-center mb-8">
            {/* Navigation Buttons on Left */}
            <nav className="flex gap-4 items-center">
              <a href="https://vertical-3.gitbook.io/vertical/" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm">VERT Litepaper</a>
              <a href="#" className="btn-header-green text-sm">VERT Token</a>
              <a href="https://opensea.io/collection/vertical-project" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm flex items-center justify-center w-10 h-10 p-2">
                <img src="/opensea_logo.webp" alt="OpenSea" className="w-full h-full object-contain filter invert" />
              </a>
              <a href="https://x.com/VerticalOnBase" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm flex items-center justify-center w-10 h-10 p-2">
                <img src="/x_logo.webp" alt="X" className="w-full h-full object-contain filter invert" />
              </a>
              {/* Telegram Group: Vertical By Virtuals */}
              <a href="https://t.me/+BzqPgp2oxe0wNGI5" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm flex items-center justify-center w-10 h-10 p-2">
                <img src="/telegram_logo.webp" alt="Telegram" className="w-full h-full object-contain filter invert" />
              </a>
            </nav>
            {/* Connect Button on Right */}
            <div className="flex gap-2 items-center">
              {/* Network Status Indicator */}
              {networkStatus !== 'healthy' && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                  networkStatus === 'degraded' 
                    ? 'text-yellow-400 border-yellow-400 bg-yellow-400/10' 
                    : 'text-red-400 border-red-400 bg-red-400/10'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    networkStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  {networkStatus === 'degraded' ? 'Network Slow' : 'Network Issues'}
                </div>
              )}
              <CustomConnectButton />
            </div>
          </header>
        </div>
        {/* Hero - ASCII Art Header */}
        <section className="text-center mb-6">
          <div className="font-mono text-green-400 text-xs md:text-sm lg:text-base mb-4 leading-tight overflow-x-auto">
            <pre className="inline-block text-left whitespace-pre ascii-container">
<span className="ascii-line ascii-line-6">██╗   ██╗███████╗██████╗ ████████╗██╗ ██████╗ █████╗ ██╗     </span>
<span className="ascii-line ascii-line-5">██║   ██║██╔════╝██╔══██╗╚══██╔══╝██║██╔════╝██╔══██╗██║     </span>
<span className="ascii-line ascii-line-4">██║   ██║█████╗  ██████╔╝   ██║   ██║██║     ███████║██║     </span>
<span className="ascii-line ascii-line-3">╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║   ██║██║     ██╔══██║██║     </span>
<span className="ascii-line ascii-line-2"> ╚████╔╝ ███████╗██║  ██║   ██║   ██║╚██████╗██║  ██║███████╗</span>
<span className="ascii-line ascii-line-1">  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝</span>
            </pre>
          </div>
          <div className="text-green-300 font-mono text-lg md:text-xl font-bold tracking-wider pulse-text">
            MINT → WIN → PROFIT
          </div>
        </section>

        {/* Terminal Stats Section - Side by Side */}
        <section className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Prize Pool Terminal - Left Side */}
            <div className="flex-1">
              <PrizePoolTerminal prizePoolAmount={prizePool} />
            </div>
            
            {/* Stats Terminal - Right Side */}
            <div className="flex-1">
              <StatsTerminal vertStaked="0" totalMinted={totalMinted} totalPaidOut={totalPaidOut} />
            </div>
          </div>
        </section>

        {/* Mint Section - Side by Side Layout */}
        <section className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mint Terminal - Left Side */}
            <div className="flex-1">
              <MintTerminal
                onMintWithVirtual={handleMintWithVirtual}
                onMintWithVert={handleMintWithVert}
                isProcessing={isProcessing}
                isWaitingForTx={isWaitingForTx}
                canMint={canMint}
                priceVirtual={priceVirtual}
                priceVert={priceVert}
                mintError={mintError}
                mintedNFTImageUrl={mintedNFTImageUrl}
              />
            </div>
            
            {/* Mint Feed Panel - Right Side */}
            <div className="flex-1">
              <MintFeedPanel
                isProcessing={isProcessing}
                isWaitingForTx={isWaitingForTx}
                mintedNFT={mintedNFT}
                lastMintedRarity={lastMintedRarity}
                lastMintedPrize={lastMintedPrize}
                mintedNFTImageUrl={mintedNFTImageUrl}
                mintedTokenId={mintedTokenId}
              />
            </div>
          </div>
        </section>

        {/* Rarity Odds Table, Live Mint Feed, How It Works (below main flow) */}
        <div className="mt-12">
          <RarityOddsTable />
          <MintLeaderboard />
          {/* <LiveMintFeed /> */}
          <HowItWorks />
        </div>
      </div>
      
      {/* Admin Terminal (only shows for contract owner) */}
      <AdminTerminal />
    </>
  );
} 