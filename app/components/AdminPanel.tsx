'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, usePublicClient } from 'wagmi';
import { writeContract } from '@wagmi/core';
import { wagmiConfig } from '@/app/config/wagmiConfig';
import { formatEther, parseEther } from 'viem';
import { VERTICAL_ABI } from '@/app/config/abis';

interface AdminPanelProps {
  contractAddress: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function AdminPanel({ contractAddress, isVisible, onClose }: AdminPanelProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  // State for admin data
  const [adminData, setAdminData] = useState({
    prizePool: '0',
    totalMinted: '0',
    priceVirtual: '0',
    priceVert: '0',
    unaccountedBalance: '0',
    contractBalance: '0'
  });
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [newVirtualPrice, setNewVirtualPrice] = useState('');
  const [newVertPrice, setNewVertPrice] = useState('');

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!publicClient || !address) return;
    
    setLoading(true);
    try {
      // Fetch basic contract data first (these should always work)
      const [prizePool, totalMinted, priceVirtual, priceVert] = await Promise.all([
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getPrizePoolBalance',
        }) as Promise<bigint>,
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getTotalMinted',
        }) as Promise<bigint>,
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

      // Try to get unaccounted balance separately (may revert in Phase 1)
      let unaccountedBalance = BigInt(0);
      try {
        unaccountedBalance = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getUnaccountedBalance',
        }) as bigint;
      } catch (error) {
        console.log('⚠️ getUnaccountedBalance reverted (expected in Phase 1 - VERT token is zero address)');
        // Default to 0 for Phase 1
        unaccountedBalance = BigInt(0);
      }

      setAdminData({
        prizePool: formatEther(prizePool),
        totalMinted: totalMinted.toString(),
        priceVirtual: formatEther(priceVirtual),
        priceVert: formatEther(priceVert),
        unaccountedBalance: formatEther(unaccountedBalance),
        contractBalance: '0' // We'll update this if needed
      });

      // Set form defaults to current prices
      setNewVirtualPrice(formatEther(priceVirtual));
      setNewVertPrice(formatEther(priceVert));
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when panel opens
  useEffect(() => {
    if (isVisible && publicClient && address) {
      fetchAdminData();
    }
  }, [isVisible, publicClient, address]);

  // Handle price update
  const handleUpdatePrices = async () => {
    if (!newVirtualPrice || !newVertPrice) {
      alert('Please enter both prices');
      return;
    }

    setActionLoading(true);
    try {
      const virtualPriceWei = parseEther(newVirtualPrice);
      const vertPriceWei = parseEther(newVertPrice);

      const txHash = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'setPrices',
        args: [virtualPriceWei, vertPriceWei],
      });

      console.log('✅ Prices updated, tx:', txHash);
      alert('Prices updated successfully!');
      
      // Refresh data
      await fetchAdminData();
    } catch (error: any) {
      console.error('❌ Price update failed:', error);
      alert('Price update failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle manual sync
  const handleSyncPrizePool = async () => {
    if (parseFloat(adminData.unaccountedBalance) === 0) {
      alert('No unaccounted VERT tokens to sync');
      return;
    }

    if (!confirm(`Sync ${adminData.unaccountedBalance} VERT to prize pool?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const txHash = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'syncPrizePool',
      });

      console.log('✅ Prize pool synced, tx:', txHash);
      alert('Prize pool synced successfully!');
      
      // Refresh data
      await fetchAdminData();
    } catch (error: any) {
      console.error('❌ Sync failed:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle pause/unpause
  const handlePauseToggle = async (pause: boolean) => {
    if (!confirm(`${pause ? 'Pause' : 'Unpause'} the contract?`)) return;

    setActionLoading(true);
    try {
      const txHash = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: pause ? 'pause' : 'unpause',
      });

      console.log(`✅ Contract ${pause ? 'paused' : 'unpaused'}, tx:`, txHash);
      alert(`Contract ${pause ? 'paused' : 'unpaused'} successfully!`);
    } catch (error: any) {
      console.error(`❌ ${pause ? 'Pause' : 'Unpause'} failed:`, error);
      alert(`${pause ? 'Pause' : 'Unpause'} failed: ` + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono text-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-green-500/40">
            <h2 className="text-green-400 text-lg font-bold">🔧 ADMIN PANEL</h2>
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-300 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center text-green-400 py-8">
              <div className="animate-spin text-2xl mb-2">⟳</div>
              <div>Loading admin data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contract Stats */}
              <div className="border border-green-500/30 rounded p-4">
                <h3 className="text-green-400 font-bold mb-3">📊 CONTRACT STATS</h3>
                <div className="grid grid-cols-2 gap-4 text-green-300">
                  <div>
                    <div className="text-xs text-green-500">Total Minted:</div>
                    <div className="font-bold">{adminData.totalMinted}</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-500">Prize Pool:</div>
                    <div className="font-bold">{parseFloat(adminData.prizePool).toFixed(2)} VERT</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-500">VIRTUAL Price:</div>
                    <div className="font-bold">{adminData.priceVirtual} VIRTUAL</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-500">VERT Price:</div>
                    <div className="font-bold">{adminData.priceVert} VERT</div>
                  </div>
                </div>
              </div>

              {/* Manual Sync Section */}
              <div className="border border-green-500/30 rounded p-4">
                <h3 className="text-green-400 font-bold mb-3">🔄 MANUAL SYNC</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-green-500">Unaccounted VERT:</div>
                    <div className="font-bold text-green-300">
                      {parseFloat(adminData.unaccountedBalance).toFixed(6)} VERT
                    </div>
                  </div>
                  
                  {parseFloat(adminData.unaccountedBalance) === 0 && (
                    <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-400/30 p-2 rounded">
                      ℹ️ Phase 1: VERT token disabled, manual sync not needed
                    </div>
                  )}
                  
                  <button
                    onClick={handleSyncPrizePool}
                    disabled={actionLoading || parseFloat(adminData.unaccountedBalance) === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    {actionLoading ? 'Syncing...' : 'Sync Prize Pool'}
                  </button>
                  <div className="text-xs text-green-400">
                    Syncs VERT tokens sent directly to contract into prize pool
                  </div>
                </div>
              </div>

              {/* Price Management */}
              <div className="border border-green-500/30 rounded p-4">
                <h3 className="text-green-400 font-bold mb-3">💰 PRICE MANAGEMENT</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-green-500 mb-1">VIRTUAL Price:</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newVirtualPrice}
                      onChange={(e) => setNewVirtualPrice(e.target.value)}
                      className="w-full bg-black border border-green-500/50 text-green-300 p-2 rounded font-mono"
                      placeholder="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-500 mb-1">VERT Price:</label>
                    <input
                      type="number"
                      step="1"
                      value={newVertPrice}
                      onChange={(e) => setNewVertPrice(e.target.value)}
                      className="w-full bg-black border border-green-500/50 text-green-300 p-2 rounded font-mono"
                      placeholder="500"
                    />
                  </div>
                  <button
                    onClick={handleUpdatePrices}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    {actionLoading ? 'Updating...' : 'Update Prices'}
                  </button>
                </div>
              </div>

              {/* Emergency Controls */}
              <div className="border border-red-500/30 rounded p-4">
                <h3 className="text-red-400 font-bold mb-3">🚨 EMERGENCY CONTROLS</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePauseToggle(true)}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Pause Contract
                  </button>
                  <button
                    onClick={() => handlePauseToggle(false)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Unpause Contract
                  </button>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh Data'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 