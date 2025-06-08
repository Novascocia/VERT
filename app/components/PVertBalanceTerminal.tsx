'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

// Hardcoded for pVERT phase - TODO: Remove when real VERT launches
const PVERT_ADDRESS = "0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA";

export default function PVertBalanceTerminal() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) {
      setBalance('0');
      return;
    }

    // Validate address format
    if (!address.startsWith('0x') || address.length !== 42) {
      console.warn('Invalid address format:', address);
      setBalance('0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // console.log('Fetching pVERT balance for:', address, 'from contract:', PVERT_ADDRESS);

      // Try with public RPC first, fallback to Alchemy if needed
      let provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      let tokenContract = new ethers.Contract(
        PVERT_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      
      let balance;
      try {
        balance = await tokenContract.balanceOf(address);
        // console.log('✅ Public RPC success - Raw balance:', balance.toString());
      } catch (rpcError) {
        console.warn('❌ Public RPC failed, trying Alchemy:', rpcError.message);
        // Fallback to Alchemy RPC
        provider = new ethers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/YycLI71vlTFTXLNyIZcBGlJLnio_78hy');
        tokenContract = new ethers.Contract(
          PVERT_ADDRESS,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        balance = await tokenContract.balanceOf(address);
        console.log('✅ Alchemy RPC success - Raw balance:', balance.toString());
      }
      
      // Format the balance
      const formattedBalance = ethers.formatEther(balance);
      // console.log('💰 Formatted balance:', formattedBalance);
      setBalance(formattedBalance);
    } catch (err: any) {
      console.error('Error fetching pVERT balance:', err);
      
      // More specific error handling
      if (err.code === 'BAD_DATA' && err.value === '0x') {
        console.warn('Contract returned empty data - possible RPC issue or contract error');
        setError('Contract unavailable');
      } else if (err.code === 'CALL_EXCEPTION') {
        console.warn('Contract call failed - possible network issue');
        setError('Network error');
      } else {
        setError('Failed to fetch balance');
      }
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address]);

  // Auto-refresh balance every 30 seconds 
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const balanceNum = parseFloat(balance);
  const hasBalance = balanceNum > 0;

  return (
    <div className="w-full mx-auto max-w-4xl mb-8">
      <div className="bg-black border-2 border-yellow-500 rounded-lg p-6 font-mono text-sm relative shadow-2xl shadow-yellow-500/20 overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="animate-pulse bg-gradient-to-r from-yellow-500/10 to-orange-500/10 h-full w-full"></div>
        </div>
        
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-yellow-500/5 border border-yellow-500/30 pointer-events-none"></div>
        
        {/* Terminal Header */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-yellow-500/40">
          <div className="text-yellow-400 text-sm font-bold tracking-wider animate-pulse">
            <span className="animate-bounce">⟦</span> pVERT_BALANCE_TRACKER_v1.0 <span className="animate-bounce">⟧</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="text-yellow-400 text-sm">
            {'> wallet_status:'} 
            <span className={`ml-2 font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {isConnected && address ? (
            <>
              {/* Wallet Address */}
              <div className="text-yellow-400 text-sm">
                {'> address:'} <span className="text-white font-mono text-xs">{address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>

              {/* pVERT Balance Display */}
              <div className="border border-yellow-500/30 rounded p-4 bg-yellow-900/10 relative">
                <div className="text-center space-y-3">
                  <div className="text-yellow-300 text-lg font-bold">
                    {'> pVERT_BALANCE:'}
                  </div>
                  
                  {loading ? (
                    <div className="text-yellow-400 animate-pulse">
                      SCANNING_BLOCKCHAIN<span className="animate-ping">...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-400">
                      ERROR: {error}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`text-4xl font-bold font-mono ${hasBalance ? 'text-yellow-300' : 'text-gray-400'}`}>
                        {balanceNum.toLocaleString(undefined, { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2 
                        })}
                      </div>
                      <div className="text-yellow-400 text-sm">
                        pVERT TOKENS
                      </div>
                      
                      {hasBalance && (
                        <div className="mt-3 pt-3 border-t border-yellow-500/30">
                          <div className="text-green-400 text-sm animate-pulse">
                            ✓ REDEEMABLE_FOR: {balanceNum.toLocaleString(undefined, { 
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2 
                            })} VERT
                          </div>
                          <div className="text-green-300 text-xs mt-1">
                            {'> ratio: 1:1 | status: AWAITING_VERT_UNLOCK'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="text-yellow-400 text-xs leading-relaxed space-y-1">
                <div>{'> earn_pvert: mint_nfts_with_virtual_tokens'}</div>
                <div>{'> redeem_ratio: 1_pvert = 1_vert'}</div>
                <div>{'> unlock_date: vert_token_mainnet_launch'}</div>
                {hasBalance && (
                  <div className="text-green-400 mt-2">
                    {'> status: YOU_HAVE_EARNED_EARLY_REWARDS! 🎉'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg mb-2">
                {'> wallet_required'}
              </div>
              <div className="text-gray-400 text-sm">
                {'> connect_wallet_to_view_pvert_balance'}
              </div>
            </div>
          )}
        </div>

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-500/40 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500/40 rounded-full blur-lg animate-pulse delay-300"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-500/40 rounded-full blur-lg animate-pulse delay-700"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500/40 rounded-full blur-lg animate-pulse delay-1000"></div>
      </div>
    </div>
  );
} 