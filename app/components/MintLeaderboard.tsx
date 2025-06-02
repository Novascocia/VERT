'use client';

import React, { useState, useEffect } from 'react';
import { formatEther, decodeEventLog } from 'viem';
import { usePublicClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { VERTICAL_ABI } from '@/app/config/abis';

interface MintLeaderboardProps {
  maxEntries?: number;
  title?: string;
  contractAddress?: string;
}

interface MintEntry {
  address: string;
  mintCount: number;
  rank: number;
}

export default function MintLeaderboard({ 
  maxEntries = 10, 
  title = "🏆 Mint Leaderboard",
  contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc03605b09aF6010bb2097d285b9aF4024ecAf098'
}: MintLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<MintEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMinted, setTotalMinted] = useState('0');
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const publicClient = usePublicClient({ chainId: base.id });

  const fetchLeaderboardData = async () => {
    // Stop trying if we've had too many consecutive failures (RPC is down)
    if (consecutiveFailures >= 3) {
      console.log('🛑 Stopping leaderboard fetching due to persistent RPC failures');
      setError('Network temporarily unavailable');
      return;
    }

    try {
      if (!publicClient) {
        throw new Error('No public client available');
      }

      setError(null);
      setIsLoading(true);

      // Get total minted count
      const totalMintedBig = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getTotalMinted',
      }) as bigint;
      
      const totalMintedNumber = Number(totalMintedBig);
      setTotalMinted(totalMintedNumber.toString());

      if (totalMintedNumber === 0) {
        setLeaderboard([]);
        setConsecutiveFailures(0); // Reset on successful call
        setIsLoading(false);
        return;
      }

      // Get current block number for chunked queries
      let currentBlock: bigint;
      try {
        currentBlock = await publicClient.getBlockNumber();
        console.log(`📊 MintLeaderboard: Current block: ${currentBlock.toString()}`);
      } catch (e) {
        console.warn('Could not get current block for leaderboard, skipping');
        setError('Network temporarily unavailable');
        return;
      }
      
      // Alchemy allows max 500 blocks per query, so we'll use 400 to be safe
      const BLOCK_RANGE = 400;
      const MAX_QUERIES = 8; // Limit queries for leaderboard (less than main stats)
      
      let allMintEvents: any[] = [];
      
      // Start from recent blocks and work backwards
      let toBlock = currentBlock;
      let queriesRun = 0;
      
      console.log(`📊 MintLeaderboard: Querying in ${BLOCK_RANGE} block chunks, max ${MAX_QUERIES} queries`);
      
      while (queriesRun < MAX_QUERIES) {
        const fromBlock = toBlock - BigInt(BLOCK_RANGE) + BigInt(1);
        
        if (fromBlock < BigInt(0)) {
          console.log('📊 Reached genesis block, stopping leaderboard query');
          break;
        }
        
        console.log(`📊 MintLeaderboard Query ${queriesRun + 1}: Blocks ${fromBlock.toString()} to ${toBlock.toString()}`);
        
        try {
          const mintEvents = await publicClient.getLogs({
            address: contractAddress as `0x${string}`,
            event: {
              type: 'event',
              name: 'NFTMinted',
              inputs: [
                { type: 'address', name: 'user', indexed: true },
                { type: 'uint256', name: 'tokenId', indexed: false },
                { type: 'uint8', name: 'rarity', indexed: false },
                { type: 'string', name: 'uri', indexed: false }
              ]
            },
            fromBlock: fromBlock,
            toBlock: toBlock
          });
          
          console.log(`📄 MintLeaderboard: Found ${mintEvents.length} mint events in this range`);
          allMintEvents = allMintEvents.concat(mintEvents);
          
        } catch (queryError: any) {
          // Sanitize error message to hide API key
          const sanitizedMessage = queryError.message?.replace(/\/v2\/[^\/\s]+/g, '/v2/[HIDDEN]') || 'Unknown error';
          console.warn(`⚠️ MintLeaderboard query failed for blocks ${fromBlock.toString()}-${toBlock.toString()}:`, sanitizedMessage);
          // Continue with next range instead of failing completely
        }
        
        // Move to next range
        toBlock = fromBlock - BigInt(1);
        queriesRun++;
      }

      // Count mints per address
      const mintCounts: { [address: string]: number } = {};
      
      for (const event of allMintEvents) {
        const userAddress = event.topics[1]; // indexed user address
        if (userAddress) {
          // Convert from bytes32 to address
          const address = `0x${userAddress.slice(-40)}`;
          mintCounts[address] = (mintCounts[address] || 0) + 1;
        }
      }

      // Convert to array and sort by mint count
      const sortedEntries = Object.entries(mintCounts)
        .map(([address, count]) => ({ address, mintCount: count, rank: 0 }))
        .sort((a, b) => b.mintCount - a.mintCount)
        .slice(0, maxEntries);

      // Assign ranks (handle ties)
      let currentRank = 1;
      for (let i = 0; i < sortedEntries.length; i++) {
        if (i > 0 && sortedEntries[i].mintCount < sortedEntries[i - 1].mintCount) {
          currentRank = i + 1;
        }
        sortedEntries[i].rank = currentRank;
      }

      // Only update leaderboard if we have data - preserve existing data during failures
      if (sortedEntries.length > 0) {
        setLeaderboard(sortedEntries);
        console.log(`✅ MintLeaderboard: Updated with ${sortedEntries.length} entries from ${allMintEvents.length} total events`);
      }
      
      // Reset failure counter on successful fetch
      setConsecutiveFailures(0);

    } catch (err: any) {
      // Sanitize error message to hide API key from console logs
      const sanitizedMessage = err.message?.replace(/\/v2\/[^\/\s]+/g, '/v2/[HIDDEN]') || 'Unknown error';
      console.error('Error fetching leaderboard data:', sanitizedMessage);
      
      // Check if it's a network/RPC error (503, timeout, etc.)
      const isNetworkError = err.message?.includes('503') || 
                            err.message?.includes('Service Unavailable') || 
                            err.message?.includes('no backend is currently healthy') ||
                            err.message?.includes('timeout') ||
                            err.message?.includes('Failed to fetch') ||
                            err.message?.includes('block range');
      
      if (isNetworkError) {
        const newFailureCount = consecutiveFailures + 1;
        setConsecutiveFailures(newFailureCount);
        setError('Network temporarily unavailable');
        console.log(`🔥 RPC failure #${newFailureCount}/3 - ${newFailureCount >= 3 ? 'stopping polling' : 'will retry'}`);
      } else {
        setError('Failed to load leaderboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    
    // Only start polling if we haven't had persistent failures - check every 5 minutes instead of 30 seconds
    let interval: NodeJS.Timeout | null = null;
    
    if (consecutiveFailures < 3) {
      interval = setInterval(() => {
        if (consecutiveFailures < 3) {
          fetchLeaderboardData();
        }
      }, 3600000); // 1 hour = 3,600,000ms (was 5 minutes)
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [contractAddress, publicClient, consecutiveFailures]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="w-full mx-auto max-w-4xl mt-8">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── MINT_LEADERBOARD_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10">
          
          {/* Leaderboard Section */}
          {leaderboard.length > 0 && (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-2 text-green-300 text-sm font-bold mb-3">
                <div>RANK</div>
                <div>ADDRESS</div>
                <div>MINTS</div>
                <div>STATUS</div>
              </div>
              
              {/* Leaderboard Entries */}
              {leaderboard.map((entry, index) => (
                <div key={entry.address} className="grid grid-cols-4 gap-2 text-sm items-center py-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{getRankEmoji(entry.rank)}</span>
                    <span className={`font-bold ${getRankColor(entry.rank)}`}>
                      #{entry.rank}
                    </span>
                  </div>
                  
                  <div className="text-white font-mono text-xs">
                    {formatAddress(entry.address)}
                  </div>
                  
                  <div className="text-white font-bold">
                    {entry.mintCount}
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded border ${
                    entry.rank === 1 ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20' :
                    entry.rank === 2 ? 'border-gray-400 text-gray-400 bg-gray-900/20' :
                    entry.rank === 3 ? 'border-amber-400 text-amber-400 bg-amber-900/20' :
                    'border-blue-400 text-blue-400 bg-blue-900/20'
                  }`}>
                    {entry.rank <= 3 ? 'podium' : 'active'}
                  </div>
                </div>
              ))}
              
              {/* Footer info */}
              {leaderboard.length >= maxEntries && (
                <div className="text-green-500/70 text-xs text-center mt-3">
                  {'> showing_top_'}{maxEntries} {'| updates_hourly'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
      </div>
    </div>
  );
} 