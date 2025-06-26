'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { VERTICAL_ABI, TRANSFER_EVENT_TOPIC } from '@/app/config/abis';
import { getContractAddress, getVirtualTokenAddress, getVertTokenAddress, getAdminAddress, MINT_PRICES } from '@/app/config/contracts';
import { Interface } from 'ethers';
import RarityReveal from '@/app/components/RarityReveal';
import { ERC20_ABI } from '@/app/config/abis';
import { shortAddress } from '@/utils/helpers';
import HowItWorks from '@/app/components/HowItWorks';
import RarityOddsTable from '@/app/components/RarityOddsTable';
import { debugLog, userLog } from '@/utils/debug';

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
import TokenPhaseIndicator from '@/app/components/TokenPhaseIndicator';
import PVertBalanceTerminal from '@/app/components/PVertBalanceTerminal';
import { preventWalletAutoPopup } from '@/app/utils/walletUtils';
import AdminPanel from '@/app/components/AdminPanel';

// Constants
const BASE_SEPOLIA_CHAIN_ID = '0x14A34';
const BASE_SEPOLIA_NETWORK_ID = '84532';
const TOKEN_DECIMALS = 18;
const MAX_UINT256 = maxUint256;

// Add a public RPC/Alchemy key for read-only stats
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';
const PUBLIC_RPC = ALCHEMY_API_KEY
  ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : 'https://mainnet.base.org';

// Contract addresses - Use new configuration system
const contractAddress = getContractAddress();
const vertTokenAddress = getVertTokenAddress();
const virtualTokenAddress = getVirtualTokenAddress();

// Admin wallet address (deployer) - from configuration
const ADMIN_WALLET_ADDRESS = getAdminAddress();

// Remove the mock implementation and replace with real API call
async function generateAndStoreNFT(tokenId: string) {
  try {
    debugLog.log("🚀 Calling backend to generate NFT for token:", tokenId);
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
    debugLog.log("✨ NFT generated successfully:", data);
    return data;
  } catch (error) {
    userLog.error("❌ Error generating NFT:", error);
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
    debugLog.log('🔍 Getting transaction receipt for hash:', txHash);
    
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
        debugLog.log(`⚠️ Attempt ${retries}/${maxRetries} to get receipt failed:`, receiptError.message);
        
        // Check if this is an RPC connectivity issue vs a transaction failure
        const isRpcError = receiptError.message?.includes('503') || 
                          receiptError.message?.includes('no backend') ||
                          receiptError.message?.includes('HTTP request failed') ||
                          receiptError.message?.includes('network error') ||
                          receiptError.message?.includes('timeout');
        
        if (isRpcError) {
          debugLog.log(`🌐 RPC connectivity issue detected on attempt ${retries}`);
          if (retries >= maxRetries) {
            throw new Error('RPC network issues - Base Sepolia is experiencing connectivity problems. Please try again later.');
          }
          // Longer delay for RPC issues
          await new Promise(resolve => setTimeout(resolve, 5000 * retries));
        } else {
          // This is likely a transaction execution failure
          debugLog.log('❌ Transaction execution failed:', receiptError.message);
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
    
    debugLog.log('📋 Transaction receipt:', {
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
    
    debugLog.log('🔎 Parsing logs from transaction...');
    
    // Parse all events from our contract
    for (const log of receipt.logs) {
      try {
        // Check if this log is from our contract
        if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
          debugLog.log('📝 Found log from our contract:', log);
          
          const decoded = decodeEventLog({
            abi: VERTICAL_ABI,
            data: log.data,
            topics: log.topics,
          });
          
          debugLog.log('🎯 Decoded event:', decoded.eventName, decoded.args);
          
          // Get token ID and rarity from NFTMinted event
          if (decoded.eventName === 'NFTMinted' && decoded.args) {
            const args = decoded.args as any;
            tokenId = args.tokenId.toString();
            rarity = parseRarityEnum(Number(args.rarity));
            debugLog.log('🎨 NFT Minted event found:', { tokenId, rarity });
          }
          
          // Get actual prize amount from PrizeClaimed event
          if (decoded.eventName === 'PrizeClaimed' && decoded.args) {
            const args = decoded.args as any;
            prizeWon = formatEther(args.amount);
            debugLog.log('🏆 Prize Claimed event found:', { prizeWon });
          }
        }
      } catch (e) {
        // Skip logs that can't be decoded
        debugLog.log('ℹ️ Skipping log that could not be decoded:', e);
        continue;
      }
    }
    
    if (!tokenId) {
      debugLog.error('❌ Token ID not found in transaction logs');
      debugLog.log('Available logs:', receipt.logs);
      throw new Error('Token ID not found in transaction receipt');
    }
    
    debugLog.log('✅ Successfully extracted mint details:', { tokenId, rarity, prizeWon });
    
    return {
      tokenId,
      rarity: rarity || 'Common' as Rarity,
      prizeWon
    };
  } catch (error: any) {
    debugLog.error('❌ Error extracting mint details:', error);
    
    // Provide more context for common errors
    if (error.message?.includes('execution reverted')) {
      debugLog.error('🔴 Transaction execution reverted - this indicates the mint transaction itself failed');
      debugLog.error('💡 Common causes:');
      debugLog.error('   - Insufficient token balance');
      debugLog.error('   - Insufficient allowance');
      debugLog.error('   - Contract is paused');
      debugLog.error('   - Invalid parameters');
      debugLog.error('   - Gas limit too low');
    }
    
    throw error;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [prizePool, setPrizePool] = useState('0');
  const [totalMinted, setTotalMinted] = useState('0');
  const [priceVirtual, setPriceVirtual] = useState(MINT_PRICES.virtual);
  const [priceVert, setPriceVert] = useState(MINT_PRICES.vert);
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
  const [mintTransactionLock, setMintTransactionLock] = useState<string | null>(null); // Prevents concurrent transactions
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  
  // Emergency fallback to force mounting if component gets stuck
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      setMounted(true);
    }, 5000); // 5 second emergency timeout
    
    return () => clearTimeout(emergencyTimeout);
  }, []); // Empty dependency array to run only once
  
  // Enhanced network detection with multiple checks
  const isOnBaseMainnet = chainId === 8453 && chain?.id === 8453;
  const networkReady = mounted && isConnected && chainId === 8453 && chain && chain.id === 8453;
  
  const { data: walletClient } = useWalletClient({ chainId: base.id });
  const publicClient = usePublicClient({ chainId: base.id });
  const { disconnect } = useDisconnect();

  // Check if current user is admin
  const isAdmin = address && address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();

  // Enhanced canMint logic with robust network detection
  const canMint = Boolean(
    mounted && 
    isConnected && 
    address && 
    networkReady && 
    isOnBaseMainnet && 
    !isLoading && 
    !mintTransactionLock &&
    publicClient &&
    walletClient
  );

  // Log mounted state changes for debugging
  useEffect(() => {
    if (mounted) {
      debugLog.log('✅ Component mounted successfully');
    }
  }, [mounted]);

  // Enhanced network debugging
  useEffect(() => {
    if (mounted && isConnected) {
      debugLog.log('🔍 Network Info:');
      debugLog.log('Chain ID:', chainId);
      debugLog.log('Expected Chain ID (Base Mainnet):', 8453);
      debugLog.log('isOnBaseMainnet:', isOnBaseMainnet);
      debugLog.log('networkReady:', networkReady);
      
      if (chainId !== 8453) {
        debugLog.warn('⚠️ WARNING: Not connected to Base Mainnet!');
        debugLog.warn('Current network chain ID:', chainId);
      } else {
        debugLog.log('✅ Connected to Base Mainnet successfully');
      }
    }
  }, [mounted, isConnected, chainId]);

  // Verify contract and its interface
  useEffect(() => {
    const verifyContract = async () => {
      if (!publicClient || !mounted) return;
      
      try {
        // Simple contract verification
        const name = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'name',
        });
        debugLog.log('📛 Contract verified:', name);
      } catch (error) {
        debugLog.warn('⚠️ Contract verification failed:', error);
      }
    };
    
    if (mounted && publicClient) {
      verifyContract();
    }
  }, [mounted, publicClient]);

  // Mount component with simple, reliable logic
  useEffect(() => {
    // Simple mounting with single timeout
    const mountTimeout = setTimeout(() => {
      setMounted(true);
    }, 100); // Small delay to avoid hydration race conditions
    
    // Try to prevent wallet auto-popup but don't let it block mounting
    try {
      preventWalletAutoPopup();
    } catch (error) {
      // Ignore errors silently
    }
    
    return () => clearTimeout(mountTimeout);
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
      debugLog.log('❌ Network health check failed:', error.message);
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
      checkNetworkHealth().catch(() => setNetworkStatus('degraded'));
      
      const interval = setInterval(() => {
        checkNetworkHealth().catch(() => {});
      }, 120000); // Check every 2 minutes (less frequent)
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
      debugLog.log('🔄 Fetching mint prices from contract...');
      
      if (!publicClient) {
        debugLog.warn('⚠️ No publicClient available, using fallback prices');
        setPriceVirtual(MINT_PRICES.virtual);
        setPriceVert(MINT_PRICES.vert);
        return;
      }

      debugLog.log('📍 Contract address:', contractAddress);
      debugLog.log('🌐 Using RPC provider:', publicClient.transport?.url || 'unknown');

      const [vPrice, vertPrice] = await Promise.all([
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'priceVirtual',
        }) as Promise<bigint>,
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'priceVert',
        }) as Promise<bigint>
      ]);
      
      const vPriceFormatted = formatEther(vPrice);
      const vertPriceFormatted = formatEther(vertPrice);
      
      debugLog.log('💰 Contract prices:', { 
        virtual: vPriceFormatted, 
        vert: vertPriceFormatted
      });

      // More robust price validation - check for both 0 and very small values
      const virtualPriceIsValid = vPrice > BigInt(0) && vPriceFormatted !== '0.0' && vPriceFormatted !== '0';
      const vertPriceIsValid = vertPrice > BigInt(0) && vertPriceFormatted !== '0.0' && vertPriceFormatted !== '0';
      
      // Set prices with improved fallback logic
      const finalVirtualPrice = virtualPriceIsValid ? vPriceFormatted : MINT_PRICES.virtual;
      const finalVertPrice = vertPriceIsValid ? vertPriceFormatted : MINT_PRICES.vert;
      
      setPriceVirtual(finalVirtualPrice);
      setPriceVert(finalVertPrice);
      
      // Enhanced logging for debugging
      debugLog.log('💰 Final prices set:', { 
        virtual: finalVirtualPrice,
        vert: finalVertPrice,
        usingVirtualFallback: !virtualPriceIsValid,
        usingVertFallback: !vertPriceIsValid
      });

      if (!virtualPriceIsValid || !vertPriceIsValid) {
        debugLog.warn('⚠️ Using fallback prices due to invalid contract values:', {
          contractVirtual: vPriceFormatted,
          contractVert: vertPriceFormatted,
          fallbackVirtual: MINT_PRICES.virtual,
          fallbackVert: MINT_PRICES.vert
        });
      } else {
        debugLog.log('✅ Using contract prices successfully');
      }
      
    } catch (error: any) {
      debugLog.error('❌ Error fetching prices from contract:', {
        message: error.message,
        code: error.code,
        contractAddress,
        fallbackAction: 'Using config fallback values'
      });
      
      // Always ensure prices are set to something valid
      setPriceVirtual(MINT_PRICES.virtual);
      setPriceVert(MINT_PRICES.vert);
      
      debugLog.warn('⚠️ Set fallback prices due to fetch error:', MINT_PRICES);
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
      setIsLoadingStats(true);
      
      // Load stats with timeout
      const loadingTimeout = setTimeout(() => {
        setIsLoadingStats(false);
      }, 10000); // 10 second max timeout
      
      Promise.all([
        fetchPrizePool().catch(() => {}),
        fetchTotalMinted().catch(() => {}),
        fetchMintPrices().catch(() => {}),
        fetchTotalPaidOut().catch(() => {})
      ]).finally(() => {
        clearTimeout(loadingTimeout);
        setIsLoadingStats(false);
      });
    }
  }, [mounted, publicClient]);

  // Dedicated price loading with retry mechanism
  useEffect(() => {
    const loadPrices = async () => {
      if (!mounted || !publicClient) return;
      
      try {
        await fetchMintPrices();
        debugLog.log('✅ Mint prices loaded successfully');
      } catch (error) {
        debugLog.warn('⚠️ Mint price loading failed, using fallbacks');
        setPriceVirtual(MINT_PRICES.virtual);
        setPriceVert(MINT_PRICES.vert);
      }
    };

    if (mounted && publicClient) {
      loadPrices();
    }
  }, [mounted, publicClient]);

  // Check allowances when wallet connects
  useEffect(() => {
    if (mounted && publicClient && address) {
      checkAllowances().catch(() => {
        // Ignore errors silently
      });
    }
  }, [mounted, publicClient, address]);

    // Calculate total pVERT paid out using simple math (much more efficient than event scanning)
  const fetchTotalPaidOut = async () => {
    try {
      if (!publicClient) {
        debugLog.warn('⚠️ No publicClient available for fetchTotalPaidOut');
        setTotalPaidOut('0');
        return;
      }
      
      debugLog.log('🔍 Calculating total pVERT paid out...');
      
      // Get current prize pool balance
      const currentPrizePool = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getPrizePoolBalance',
      }) as bigint;
      
      // Total pVERT injected: Two rounds of 10.5M each = 21M total
      // First round: 10.5M (users won ~10M, ~397K remained)
      // Second round: 10.5M (just injected)
      const TOTAL_INJECTED = 21_000_000; // 21M pVERT total injected across both rounds
      
      // Calculate total paid out: Injected - Current Pool = Paid Out
      const currentPoolEther = parseFloat(formatEther(currentPrizePool));
      const totalPaidOut = Math.max(0, TOTAL_INJECTED - currentPoolEther); // Ensure non-negative
      
      debugLog.log(`💰 Prize pool calculation:`);
      debugLog.log(`   Total injected: ${TOTAL_INJECTED.toLocaleString()} pVERT`);
      debugLog.log(`   Current pool: ${currentPoolEther.toLocaleString()} pVERT`);
      debugLog.log(`   Total paid out: ${totalPaidOut.toLocaleString()} pVERT`);
      
      setTotalPaidOut(totalPaidOut.toString());
      
    } catch (error) {
      debugLog.error('❌ Error calculating total paid out:', error);
      // Fallback: set to 0 instead of crashing
      setTotalPaidOut('0');
      // Don't throw - let other stats load
    }
  };

  const handleMintWithVert = async () => {
    // Declare transactionId outside try block for scope access
    const transactionId = `vert-${Date.now()}-${Math.random()}`;
    
    try {
      // Explicit safeguard
      if (!walletClient?.account?.address) {
        throw new Error('Wallet is not connected');
      }
      
      if (!publicClient) {
        toast.error("Please connect your wallet!");
        return;
      }

      // Network validation
      if (!networkReady || !isOnBaseMainnet) {
        throw new Error('Please switch to Base Mainnet (8453) to mint NFTs');
      }

      // Transaction lock to prevent concurrent mints
      if (mintTransactionLock) {
        throw new Error(`Another mint transaction is in progress (${mintTransactionLock.split('-')[0]}). Please wait for it to complete.`);
      }
      setMintTransactionLock(transactionId);
      debugLog.log('🔒 Transaction locked:', transactionId);

      // Rate limiting - prevent rapid successive mints
      const now = Date.now();
      const timeSinceLastMint = now - lastMintTime;
      const MIN_MINT_INTERVAL = 10000; // 10 seconds minimum between mints
      
      if (timeSinceLastMint < MIN_MINT_INTERVAL && lastMintTime > 0) {
        const remainingTime = Math.ceil((MIN_MINT_INTERVAL - timeSinceLastMint) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before minting again to avoid race conditions.`);
      }
      
      setLastMintTime(now);

      debugLog.log('🚀 Starting VERT mint process...');

      // Enhanced pre-mint validation
      try {
        debugLog.log('🔍 Pre-mint validation starting...');
        
        // First, check RPC health by testing a simple call
        try {
          const blockNumber = await publicClient.getBlockNumber();
          debugLog.log('✅ RPC health check passed, current block:', blockNumber.toString());
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
        
        debugLog.log('💰 User VERT balance:', formatEther(userBalance), 'VERT');
        
        // Get current mint price
        const currentPrice = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'priceVert',
        }) as bigint;
        
        debugLog.log('💸 VERT mint price:', formatEther(currentPrice), 'VERT');
        
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
        
        debugLog.log('✅ Current VERT allowance:', formatEther(currentAllowance), 'VERT');
        
        // Check if allowance is sufficient
        if (currentAllowance < currentPrice) {
          debugLog.log('🔍 VERT allowance insufficient, requesting approval...');
          debugLog.log('🔍 VERT Approval Debug:', {
            spender: contractAddress,
            amount: 'MAX_UINT256', // Approve maximum so user only needs to approve once
            currentAllowance: formatEther(currentAllowance)
          });
          
          // Request approval from user
          toast('Approve VERT token spending (one-time approval)');
          try {
            // Get approval transaction hash
            const approvalTxHash = await writeContract(wagmiConfig, {
              account: walletClient.account.address,
              address: vertTokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [contractAddress as `0x${string}`, MAX_UINT256], // Approve maximum for convenience
            });
            
            debugLog.log('🔄 VERT Approval transaction sent:', approvalTxHash);
            toast('Waiting for VERT approval confirmation...');
            
            // Wait for approval transaction to be confirmed
            const approvalReceipt = await publicClient.waitForTransactionReceipt({
              hash: approvalTxHash,
              confirmations: 1
            });
            
            debugLog.log('✅ VERT Approval transaction confirmed in block:', approvalReceipt.blockNumber);
            toast.success('VERT approved ✅ - No more approvals needed!');
            
            // Refresh allowances after approval
            await checkAllowances();
            debugLog.log('✅ VERT approval completed successfully');
          } catch (approvalError: any) {
            debugLog.error('❌ VERT approval failed:', approvalError);
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
        
        debugLog.log('✅ All pre-mint checks passed');
        
      } catch (validationError: any) {
        debugLog.error('❌ Pre-mint validation failed:', validationError);
        setIsWaitingForTx(false);
        throw new Error('Pre-mint validation failed: ' + validationError.message);
      }

      // Debug contract state right before sending transaction
      debugLog.log('🔧 Final contract state check before transaction:');
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
      debugLog.log('🔍 Final pre-mint validation...');
      
      // Debug RPC endpoint being used
      debugLog.log('🌐 RPC Configuration:', {
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
        
        debugLog.log('💰 Pre-mint validation:', {
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
        debugLog.log('📊 Current total minted:', totalMinted.toString());
        
        // TRY TO SIMULATE THE EXACT CALL TO SEE WHAT FAILS
        debugLog.log('🧪 Attempting to simulate mint call...');
        try {
          const simulateResult = await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: VERTICAL_ABI,
            functionName: 'mintWithVert',
            args: ["ipfs://QmPlaceholder"],
            account: walletClient.account.address,
          });
          debugLog.log('✅ Simulate successful, result:', simulateResult);
        } catch (simulateError: any) {
          debugLog.error('❌ SIMULATE FAILED - This is why the transaction reverts:', simulateError);
          debugLog.error('📋 Simulate error details:', {
            message: simulateError.message,
            cause: simulateError.cause,
            data: simulateError.data
          });
          
          // Try to decode the revert reason if available
          if (simulateError.data) {
            debugLog.log('🔍 Raw error data:', simulateError.data);
          }
          
          setIsWaitingForTx(false);
          throw new Error(`Mint will fail: ${simulateError.message}`);
        }
        
      } catch (validationError: any) {
        debugLog.error('❌ Pre-mint validation failed:', validationError);
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
        debugLog.log('💰 Gas Estimate for VERT mint:', gasEstimate.toString());
        
        // Get gas estimate with buffer
        const gasWithBuffer = (gasEstimate * BigInt(125)) / BigInt(100); // 25% buffer
        
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        debugLog.log('⛽ Current gas price:', formatEther(gasPrice), 'ETH');
        
        const estimatedCost = gasWithBuffer * gasPrice;
        debugLog.log('💰 Estimated transaction cost:', formatEther(estimatedCost), 'ETH');
      } catch (gasError: any) {
        debugLog.error('❌ Gas estimation failed - this suggests the transaction will fail:', gasError);
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

      debugLog.log('📤 Sending mint transaction...');
      
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
        gasWithBuffer = (gasEstimate * BigInt(125)) / BigInt(100); // 25% buffer
        debugLog.log('💰 Final gas with buffer for transaction:', gasWithBuffer.toString());
      } catch (gasEstError: any) {
        debugLog.warn('⚠️ Gas estimation failed, using fallback:', gasEstError.message);
        gasWithBuffer = BigInt(200000); // Safe fallback
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
        debugLog.error('❌ writeContract failed:', writeError);
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
      
      debugLog.log('✅ Transaction sent:', txHash);
      
      // Transaction confirmed, now start processing
      setIsWaitingForTx(false);
      setIsProcessing(true);
      toast.success("Transaction confirmed! Generating NFT...");

      // Wait for transaction confirmation and get mint details
      debugLog.log('⏳ Waiting for transaction receipt...');
      const mintDetails = await getMintDetailsFromTxReceipt(txHash, publicClient);
      debugLog.log('📄 Mint details extracted:', mintDetails);

      // Store the minted token ID
      setMintedTokenId(mintDetails.tokenId);

      // Call backend to generate NFT with actual token ID
      const response = await fetch("/api/generateAndStoreNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId: mintDetails.tokenId }),
      });

      const data = await response.json();
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

      // Release transaction lock on success
      debugLog.log('🔓 Transaction completed successfully, releasing lock:', transactionId);
      setMintTransactionLock(null);

    } catch (error: any) {
      setIsWaitingForTx(false);
      setIsProcessing(false);
      
      // Release transaction lock on error
      debugLog.log('🔓 Transaction failed, releasing lock:', transactionId);
      setMintTransactionLock(null);
      
      debugLog.error("❌ Minting failed:", error);
      
      // More detailed error logging
      if (error?.message?.includes('execution reverted')) {
        debugLog.error('🔴 Contract execution reverted - possible reasons:');
        debugLog.error('- Insufficient VERT balance');
        debugLog.error('- Insufficient allowance');
        debugLog.error('- Contract is paused');
        debugLog.error('- Invalid parameters');
        debugLog.error('- Gas limit too low');
        
        // Check if this is a post-transaction revert (transaction was sent but failed)
        if (error?.message?.includes('Transaction failed: Execution reverted')) {
          debugLog.error('🚨 CRITICAL: Transaction was sent but reverted during execution');
          debugLog.error('🔍 This suggests a race condition or contract state change');
          debugLog.error('💡 Recommended actions:');
          debugLog.error('   1. Wait 30 seconds before trying again');
          debugLog.error('   2. Check if contract was paused');
          debugLog.error('   3. Verify no other transactions are pending');
          debugLog.error('   4. Try refreshing the page');
          
          // Provide user-friendly error message for post-transaction reverts
          setMintError('Transaction sent but failed during execution. This may be due to network congestion or a race condition. Please wait 30 seconds and try again.');
          
          // Run debug check to see what went wrong
          debugLog.log('🚨 POST-FAILURE DEBUG CHECK:');
          await debugContractState();
        }
      } else if (error?.message?.includes('503') || error?.message?.includes('no backend')) {
        debugLog.error('🌐 RPC connectivity issues detected');
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
    // Declare transactionId outside try block for scope access
    const transactionId = `virtual-${Date.now()}-${Math.random()}`;
    
    try {
      // Explicit safeguard
      if (!walletClient?.account?.address) {
        throw new Error('Wallet is not connected');
      }
      
      if (!publicClient) {
        toast.error('Connect your wallet first');
        return;
      }

      // Network validation
      if (!networkReady || !isOnBaseMainnet) {
        throw new Error('Please switch to Base Mainnet (8453) to mint NFTs');
      }

      // Transaction lock to prevent concurrent mints
      if (mintTransactionLock) {
        throw new Error(`Another mint transaction is in progress (${mintTransactionLock.split('-')[0]}). Please wait for it to complete.`);
      }
      setMintTransactionLock(transactionId);
      debugLog.log('🔒 Transaction locked:', transactionId);

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
      
      debugLog.log('🔍 VIRTUAL Mint Details:', {
        price: price.toString(),
        priceFormatted: formatEther(price) + ' VIRTUAL',
        userAddress: walletClient.account.address,
        contractAddress: contractAddress,
        virtualTokenAddress: virtualTokenAddress
      });
      
      // 2. Check allowance
      const allowance = await publicClient.readContract({
        address: virtualTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletClient.account.address, contractAddress as `0x${string}`],
      }) as bigint;
      
      debugLog.log('🔍 VIRTUAL Allowance Check:', {
        allowance: allowance.toString(),
        allowanceFormatted: formatEther(allowance) + ' VIRTUAL',
        price: price.toString(),
        priceFormatted: formatEther(price) + ' VIRTUAL',
        needsApproval: allowance < price
      });
      
      // 3. Approve if needed
      if (allowance < price) {
        debugLog.log('🔍 VIRTUAL Approval Debug:', {
          spender: contractAddress,
          amount: 'MAX_UINT256', // Approve maximum so user only needs to approve once
          requiredPrice: price.toString(),
          allowance: allowance.toString()
        });
        toast('Approve VIRTUAL token spending (one-time approval)');
        
        // Get approval transaction hash
        const approvalTxHash = await writeContract(wagmiConfig, {
          account: walletClient.account.address,
          address: virtualTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, MAX_UINT256], // Approve maximum for convenience
        });
        
        debugLog.log('🔄 Approval transaction sent:', approvalTxHash);
        toast('Waiting for approval confirmation...');
        
        // Wait for approval transaction to be confirmed
        const approvalReceipt = await publicClient.waitForTransactionReceipt({
          hash: approvalTxHash,
          confirmations: 1
        });
        
        debugLog.log('✅ Approval transaction confirmed in block:', approvalReceipt.blockNumber);
        toast.success('VIRTUAL approved ✅ - No more approvals needed!');
        
        // Refresh allowances to verify approval worked
        await checkAllowances();
        debugLog.log('🔄 Allowances refreshed after approval');
        
        // EXTENDED wait for blockchain state to propagate across all RPC nodes
        debugLog.log('⏳ Waiting for approval to propagate across network...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased from 1s to 3s
        
        // Multiple verification attempts to ensure approval is recognized
        let verificationAttempts = 0;
        let verifyAllowance = BigInt(0);
        const maxVerificationAttempts = 3;
        
        while (verificationAttempts < maxVerificationAttempts) {
          verifyAllowance = await publicClient.readContract({
            address: virtualTokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [walletClient.account.address, contractAddress as `0x${string}`],
          }) as bigint;
          
          debugLog.log(`🔍 Allowance verification attempt ${verificationAttempts + 1}:`, {
            allowance: verifyAllowance.toString(),
            sufficient: verifyAllowance >= price,
            isMaxUint: verifyAllowance.toString() === MAX_UINT256.toString()
          });
          
          if (verifyAllowance >= price) {
            debugLog.log('✅ Allowance verification successful');
            break;
          }
          
          verificationAttempts++;
          if (verificationAttempts < maxVerificationAttempts) {
            debugLog.log(`⏳ Allowance not yet sufficient, waiting 2s before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (verifyAllowance < price) {
          throw new Error(`Approval verification failed after ${maxVerificationAttempts} attempts. Please try again.`);
        }
      }

      // 4. pVERT approval is NOT needed - users receive prizes, they don't spend pVERT
      debugLog.log('ℹ️ pVERT approval skipped - users receive prizes, no spending required');
      
      // Check if any pending transactions could affect allowance
      const pendingNonce = await publicClient.getTransactionCount({
        address: walletClient.account.address,
        blockTag: 'pending'
      });
      const latestNonce = await publicClient.getTransactionCount({
        address: walletClient.account.address,
        blockTag: 'latest'
      });
      
      if (pendingNonce > latestNonce) {
        debugLog.log('⚠️ WARNING: Pending transactions detected!', {
          pending: pendingNonce,
          latest: latestNonce,
          difference: pendingNonce - latestNonce
        });
        
        // Add extra delay if transactions are pending to avoid nonce conflicts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 5. Mint NFT
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
        debugLog.log('🔍 Gas Estimate for VIRTUAL mint:', gasEstimate.toString());
        
        // Add 25% buffer for safety
        gasWithBuffer = (gasEstimate * BigInt(125)) / BigInt(100);
        debugLog.log('🛡️ Gas with 25% buffer:', gasWithBuffer.toString());
        
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        debugLog.log('⛽ Current gas price:', formatEther(gasPrice), 'ETH');
        
        const estimatedCost = gasWithBuffer * gasPrice;
        debugLog.log('💰 Estimated transaction cost:', formatEther(estimatedCost), 'ETH');
        debugLog.log('💰 Estimated transaction cost (USD ~$2500/ETH):', '$' + (Number(formatEther(estimatedCost)) * 2500).toFixed(4));
      } catch (gasError: any) {
        // Handle specific pVERT restrictions during gas estimation
        if (gasError.message?.includes('pVERT: transfers disabled between users')) {
          debugLog.log('ℹ️ Gas estimation skipped due to pVERT restrictions (transaction will still work)');
        } else {
          debugLog.error('❌ Gas estimation failed - using fallback gas limit:', gasError);
        }
        // gasWithBuffer already set to fallback value
      }

      // Final allowance check right before minting
      const finalAllowance = await publicClient.readContract({
        address: virtualTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletClient.account.address, contractAddress as `0x${string}`],
      }) as bigint;
      
      // Also check user's VIRTUAL balance
      const virtualBalance = await publicClient.readContract({
        address: virtualTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletClient.account.address],
      }) as bigint;

      // Get nonce to track transaction ordering
      const currentNonce = await publicClient.getTransactionCount({
        address: walletClient.account.address,
        blockTag: 'pending'
      });
      
      debugLog.log('🔍 Final VIRTUAL allowance check before mint:', {
        allowance: finalAllowance.toString(),
        allowanceFormatted: formatEther(finalAllowance) + ' VIRTUAL',
        price: price.toString(),
        priceFormatted: formatEther(price) + ' VIRTUAL',
        sufficient: finalAllowance >= price,
        virtualBalance: formatEther(virtualBalance) + ' VIRTUAL',
        balanceSufficient: virtualBalance >= price,
        nonce: currentNonce,
        transactionId: transactionId
      });
      
      // If allowance suddenly became insufficient, re-approve
      if (finalAllowance < price) {
        debugLog.log('⚠️ Allowance became insufficient - re-approving...');
        toast('Re-approving VIRTUAL tokens...');
        
        const emergencyApprovalTxHash = await writeContract(wagmiConfig, {
          account: walletClient.account.address,
          address: virtualTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, MAX_UINT256],
        });
        
        debugLog.log('🔄 Emergency approval transaction sent:', emergencyApprovalTxHash);
        
        const emergencyApprovalReceipt = await publicClient.waitForTransactionReceipt({
          hash: emergencyApprovalTxHash,
          confirmations: 1
        });
        
        debugLog.log('✅ Emergency approval confirmed in block:', emergencyApprovalReceipt.blockNumber);
        toast.success('VIRTUAL re-approved ✅');
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
        debugLog.error('❌ writeContract failed:', writeError);
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
      
      debugLog.log('✅ Transaction sent:', txHash);
      
      // Transaction confirmed, now start processing
      setIsWaitingForTx(false);
      setIsProcessing(true);
      toast.success('Transaction confirmed! Generating NFT...');

      // Wait for transaction confirmation and get mint details
      const mintDetails = await getMintDetailsFromTxReceipt(txHash, publicClient);

      // Store the minted token ID
      setMintedTokenId(mintDetails.tokenId);
      
      // Refresh allowances after successful mint to prevent state issues on next mint
      debugLog.log('🔄 Refreshing allowances after successful VIRTUAL mint...');
      await checkAllowances();

      // Call backend to generate NFT with actual token ID
      const response = await fetch("/api/generateAndStoreNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId: mintDetails.tokenId }),
      });

      const data = await response.json();
      setGeneratedImage(data.imageUrl || data.image);
      setGeneratedMetadata(data.metadata);
      
      // Instead of using raw API response, fetch from contract metadata
      debugLog.log('🔗 [VIRTUAL] Fetching final image URL from contract metadata...');
      
      let finalImageUrl = data.imageUrl || data.image; // Fallback to API response
      
      try {
        // Get the metadata URI from contract 
        const metadataUri = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'tokenURI',
          args: [BigInt(mintDetails.tokenId)],
        }) as string;
        
        debugLog.log('📄 [VIRTUAL] Contract metadata URI:', metadataUri);
        
        if (metadataUri && metadataUri !== 'ipfs://QmPlaceholder') {
          // Fetch metadata from IPFS
          const metadataHash = metadataUri.replace('ipfs://', '');
          const metadataUrl = `https://ipfs.io/ipfs/${metadataHash}`;
          
          debugLog.log('🌐 [VIRTUAL] Fetching metadata from:', metadataUrl);
          
          const metadataResponse = await fetch(metadataUrl, {
            signal: AbortSignal.timeout(15000) // 15 second timeout
          });
          
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            if (metadata.image) {
              finalImageUrl = metadata.image;
              debugLog.log('✅ [VIRTUAL] Got image URL from metadata:', finalImageUrl);
            }
          } else {
            debugLog.warn('⚠️ [VIRTUAL] Metadata not yet available, using API fallback');
          }
        }
      } catch (metadataError) {
        debugLog.warn('⚠️ [VIRTUAL] Could not fetch metadata, using API fallback:', metadataError);
      }

      // Use the actual rarity and prize from the blockchain events
      const rarity = mintDetails.rarity;
      const prizeWon = mintDetails.prizeWon;
      
      // Set minted NFT data for reveal
      setMintedNFT({
        imageUrl: finalImageUrl,
        rarity: rarity,
        prizeWon: prizeWon,
      });

      // Store for persistent display
      setLastMintedRarity(rarity);
      setLastMintedPrize(prizeWon);

      // Test image availability before showing it and ending processing
      const testImageAvailability = async (imageUrl: string): Promise<boolean> => {
        const hash = imageUrl.replace('ipfs://', '');
        const testSources = [
          `/api/image-proxy/${hash}`,
          `https://ipfs.io/ipfs/${hash}`,
          `https://nftstorage.link/ipfs/${hash}`
        ];
        
        for (const source of testSources) {
          try {
            const response = await fetch(source, { 
              method: 'HEAD', 
              signal: AbortSignal.timeout(5000) 
            });
            if (response.ok) {
              debugLog.log(`✅ [VIRTUAL] Image confirmed available at: ${source}`);
              return true;
            }
          } catch (error) {
            // Try next source
            continue;
          }
        }
        return false;
      };

      // Wait for image to be ready before ending processing
      const waitForImage = async () => {
        let attempts = 0;
        const maxAttempts = 10; // Try for up to 50 seconds (5s * 10)
        
        while (attempts < maxAttempts) {
          const isAvailable = await testImageAvailability(finalImageUrl);
          if (isAvailable) {
            // Only end processing and show image when it's actually ready
            setIsProcessing(false);
            setMintedNFTImageUrl(finalImageUrl);
            debugLog.log('✅ [VIRTUAL] Image confirmed ready and now displaying');
            return;
          }
          
          attempts++;
          debugLog.log(`🔄 [VIRTUAL] Image not ready yet, attempt ${attempts}/${maxAttempts}, waiting 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between attempts
        }
        
        // If still not available after all attempts, show it anyway (fallback)
        debugLog.warn('⚠️ [VIRTUAL] Image still not ready after 50s, showing anyway');
        setIsProcessing(false);
        setMintedNFTImageUrl(finalImageUrl);
      };
      
      // Start background image availability testing (keeps orange spinner until ready)
      waitForImage();
      
      toast.success("NFT minted successfully!");
      
      // Re-fetch stats after mint
      await fetchPrizePool();
      await fetchTotalMinted();
      await fetchMintPrices();
      await fetchTotalPaidOut();
      
      // Release transaction lock on success
      debugLog.log('🔓 Transaction completed successfully, releasing lock:', transactionId);
      setMintTransactionLock(null);
      
    } catch (error: any) {
      setIsWaitingForTx(false);
      setIsProcessing(false);
      
      // Release transaction lock on error
      debugLog.log('🔓 Transaction failed, releasing lock:', transactionId);
      setMintTransactionLock(null);
      
      debugLog.error('Minting failed:', error);
      // Remove error toasts - terminal handles error display
      // Re-throw so MintTerminal can handle it
      throw error;
    }
  };

  // Add debugging function to check contract state
  const debugContractState = async () => {
    if (!publicClient || !address) {
      debugLog.log('❌ Cannot debug - missing publicClient or address');
      return;
    }

    try {
      debugLog.log('🔍 DEBUGGING CONTRACT STATE:');
      
      // Check if contract is paused
      const isPaused = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'paused',
      }) as boolean;
      debugLog.log(`⏸️ Contract paused: ${isPaused}`);
      
      // Check user VERT balance
      const vertBalance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;
      debugLog.log(`💰 VERT balance: ${formatEther(vertBalance)}`);
      
      // Check VERT allowance
      const vertAllowance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, contractAddress as `0x${string}`],
      }) as bigint;
      debugLog.log(`✅ VERT allowance: ${formatEther(vertAllowance)}`);
      
      // Check mint price
      const mintPrice = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVert',
      }) as bigint;
      debugLog.log(`💸 Mint price: ${formatEther(mintPrice)}`);
      
      // Check total minted
      const totalMinted = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getTotalMinted',
      }) as bigint;
      debugLog.log(`📊 Total minted: ${totalMinted.toString()}`);
      
      // Check if there are any pending transactions
      const nonce = await publicClient.getTransactionCount({
        address: address,
        blockTag: 'pending'
      });
      const latestNonce = await publicClient.getTransactionCount({
        address: address,
        blockTag: 'latest'
      });
      debugLog.log(`🔢 Pending nonce: ${nonce}, Latest nonce: ${latestNonce}`);
      if (nonce > latestNonce) {
        debugLog.log(`⚠️ WARNING: ${nonce - latestNonce} pending transactions detected!`);
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
        debugLog.log('✅ Simulation still passes - this is very strange!');
        
        // Verify function selector
        debugLog.log('🔍 Checking function selector...');
        const functionData = encodeFunctionData({
          abi: VERTICAL_ABI,
          functionName: 'mintWithVert',
          args: ["ipfs://QmPlaceholder"]
        });
        debugLog.log('📄 Function data:', functionData);
        debugLog.log('🎯 Function selector:', functionData.slice(0, 10));
        
      } catch (simError: any) {
        debugLog.log('❌ Simulation now fails:', simError.message);
        return simError.message;
      }
      
    } catch (error: any) {
      debugLog.error('❌ Debug failed:', error);
    }
  };

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
            {/* Navigation Buttons on Left - Original Desktop Layout */}
            <nav className="flex gap-4 items-center">
              <a href="https://vertical-3.gitbook.io/vertical/" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm">VERT Litepaper</a>
              <a href="https://app.virtuals.io/geneses/6048" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm">VERT Token</a>
              <a href="https://opensea.io/collection/vertical-project-nft" target="_blank" rel="noopener noreferrer" className="btn-header-green text-sm flex items-center justify-center w-10 h-10 p-2">
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

        {/* Token Phase Indicator */}
        <TokenPhaseIndicator nftContractAddress={contractAddress} />

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
                isOnBaseMainnet={isOnBaseMainnet}
                networkReady={networkReady}
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

        {/* pVERT Balance Terminal */}
        <PVertBalanceTerminal />

        {/* Rarity Odds Table, Live Mint Feed, How It Works (below main flow) */}
        <div className="mt-12">
          <RarityOddsTable />
          <MintLeaderboard />
          {/* <LiveMintFeed /> */}
          <HowItWorks />
        </div>
        
        {/* Admin Button - Bottom Right Corner (Only visible to admin) */}
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-colors z-50 font-mono text-sm"
            title="Admin Panel"
          >
            🔧 ADMIN
          </button>
        )}
      </div>
      
      {/* Admin Panel Modal */}
      <AdminPanel
        contractAddress={contractAddress}
        isVisible={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </>
  );
} 