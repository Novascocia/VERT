"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/app/config/wagmiConfig";
import { VERTICAL_ABI, ERC20_ABI } from "@/app/config/abis";
import { formatEther, parseEther } from "viem";

// Admin wallet address (deployer)
const ADMIN_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployer address

export default function AdminTerminal() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isVisible, setIsVisible] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [monitorData, setMonitorData] = useState<{
    actualBalance: string;
    recordedPool: string;
    unaccounted: string;
    lastCheck: string;
  } | null>(null);
  
  // Admin Control States
  const [virtualPrice, setVirtualPrice] = useState("");
  const [vertPrice, setVertPrice] = useState("");
  const [addPoolAmount, setAddPoolAmount] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);

  // Contract addresses
  const contractAddress = "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
  const vertTokenAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // VIRTUAL token for now

  // Check if connected wallet is admin
  useEffect(() => {
    if (isConnected && address) {
      // For development, you can also check contract owner
      checkIfAdmin();
      loadCurrentPrices();
    } else {
      setIsAdmin(false);
      setIsVisible(false);
    }
  }, [isConnected, address]);

  const checkIfAdmin = async () => {
    try {
      // Method 1: Check if connected address is the contract owner
      const owner = await readContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'owner',
      }) as string;

      const isOwner = owner.toLowerCase() === address?.toLowerCase();
      
      // Method 2: You can also hardcode your deployer address for extra security
      // const isDeployer = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
      
      setIsAdmin(isOwner);
      
      if (isOwner) {
        addTerminalLine("🔑 Admin privileges verified");
        addTerminalLine("Type 'help' for available commands");
      }
    } catch (error) {
      setIsAdmin(false);
      console.error("Failed to check admin status:", error);
    }
  };

  const loadCurrentPrices = async () => {
    try {
      if (!publicClient) return;
      
      const vPrice = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVirtual',
      }) as bigint;
      
      const vertP = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'priceVert',
      }) as bigint;
      
      const paused = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'paused',
      }) as boolean;
      
      setVirtualPrice(formatEther(vPrice));
      setVertPrice(formatEther(vertP));
      setIsPaused(paused);
    } catch (error) {
      console.error("Failed to load current prices:", error);
    }
  };

  const updateVirtualPrice = async () => {
    if (!virtualPrice || !walletClient) return;
    
    try {
      setIsLoading(true);
      addTerminalLine(`🔄 Setting VIRTUAL price to ${virtualPrice}...`);
      
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'setPrices',
        args: [parseEther(virtualPrice), parseEther(vertPrice)],
      });
      
      addTerminalLine(`✅ VIRTUAL price updated! Tx: ${result}`);
      await loadCurrentPrices();
    } catch (error: any) {
      addTerminalLine(`❌ Failed to update VIRTUAL price: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVertPrice = async () => {
    if (!vertPrice || !walletClient) return;
    
    try {
      setIsLoading(true);
      addTerminalLine(`🔄 Setting VERT price to ${vertPrice}...`);
      
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'setPrices',
        args: [parseEther(virtualPrice), parseEther(vertPrice)],
      });
      
      addTerminalLine(`✅ VERT price updated! Tx: ${result}`);
      await loadCurrentPrices();
    } catch (error: any) {
      addTerminalLine(`❌ Failed to update VERT price: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBothPrices = async () => {
    if (!virtualPrice || !vertPrice || !walletClient) return;
    
    try {
      setIsLoading(true);
      addTerminalLine(`🔄 Setting prices: VIRTUAL=${virtualPrice}, VERT=${vertPrice}...`);
      
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'setPrices',
        args: [parseEther(virtualPrice), parseEther(vertPrice)],
      });
      
      addTerminalLine(`✅ Both prices updated! Tx: ${result}`);
      await loadCurrentPrices();
    } catch (error: any) {
      addTerminalLine(`❌ Failed to update prices: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = async () => {
    if (!walletClient) return;
    
    try {
      setIsLoading(true);
      const action = isPaused ? 'unpause' : 'pause';
      addTerminalLine(`🔄 ${isPaused ? 'Unpausing' : 'Pausing'} contract...`);
      
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: action,
      });
      
      addTerminalLine(`✅ Contract ${action}d! Tx: ${result}`);
      await loadCurrentPrices();
    } catch (error: any) {
      addTerminalLine(`❌ Failed to ${isPaused ? 'unpause' : 'pause'}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addToPrizePool = async () => {
    if (!addPoolAmount || !walletClient) return;
    
    try {
      setIsLoading(true);
      addTerminalLine(`🔄 Adding ${addPoolAmount} VERT to prize pool...`);
      
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'addToPrizePool',
        args: [parseEther(addPoolAmount)],
      });
      
      addTerminalLine(`✅ Added to prize pool! Tx: ${result}`);
      setAddPoolAmount("");
      await checkBalances();
    } catch (error: any) {
      addTerminalLine(`❌ Failed to add to prize pool: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTerminalLine = (line: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLines(prev => [...prev, `[${timestamp}] ${line}`]);
  };

  const checkBalances = async () => {
    try {
      addTerminalLine("🔍 Checking balances...");
      
      if (!publicClient) {
        addTerminalLine("❌ No public client available");
        return;
      }

      // Get actual VERT balance of contract
      const actualBalance = await publicClient.readContract({
        address: vertTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [contractAddress as `0x${string}`],
      }) as bigint;

      // Get recorded prize pool
      const recordedPool = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getPrizePoolBalance',
      }) as bigint;

      // Use new contract function to get unaccounted balance
      const unaccountedBalance = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'getUnaccountedBalance',
      }) as bigint;

      const actualFormatted = formatEther(actualBalance);
      const recordedFormatted = formatEther(recordedPool);
      const unaccountedFormatted = formatEther(unaccountedBalance);
      
      addTerminalLine(`📊 Actual VERT Balance: ${actualFormatted}`);
      addTerminalLine(`📊 Recorded Prize Pool: ${recordedFormatted}`);

      if (unaccountedBalance > 0) {
        addTerminalLine(`🚨 UNACCOUNTED: ${unaccountedFormatted} VERT`);
        
        setMonitorData({
          actualBalance: actualFormatted,
          recordedPool: recordedFormatted,
          unaccounted: unaccountedFormatted,
          lastCheck: new Date().toLocaleTimeString()
        });
      } else if (actualBalance < recordedPool) {
        const deficit = recordedPool - actualBalance;
        addTerminalLine(`⚠️ DEFICIT: ${formatEther(deficit)} VERT`);
      } else {
        addTerminalLine("✅ Balances match perfectly");
        setMonitorData({
          actualBalance: actualFormatted,
          recordedPool: recordedFormatted,
          unaccounted: "0",
          lastCheck: new Date().toLocaleTimeString()
        });
      }
    } catch (error: any) {
      addTerminalLine(`❌ Error: ${error.message}`);
    }
  };

  const executeCommand = async (command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    
    switch(cmd) {
      case 'check':
        await checkBalances();
        break;
        
      case 'sync':
        await manualSync();
        break;
        
      case 'status':
        await showStatus();
        break;
        
      case 'help':
        showHelp();
        break;
        
      case 'clear':
        setTerminalLines([]);
        break;
        
      case 'hide':
        setIsVisible(false);
        break;
        
      default:
        addTerminalLine(`❌ Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const showHelp = () => {
    addTerminalLine("🔧 ADMIN TERMINAL COMMANDS:");
    addTerminalLine("  check       - Check prize pool vs actual VERT balance");
    addTerminalLine("  sync        - Manually sync unaccounted VERT tokens");
    addTerminalLine("  status      - Show comprehensive system status");
    addTerminalLine("  clear       - Clear terminal history");
    addTerminalLine("  hide        - Hide admin terminal");
    addTerminalLine("  help        - Show this help message");
    addTerminalLine("");
    addTerminalLine("💡 AUTO-SYNC FEATURE:");
    addTerminalLine("  Users can now send VERT directly to contract address");
    addTerminalLine("  Contract automatically syncs before every mint");
    addTerminalLine("  Use 'sync' command to manually trigger sync");
  };

  const showStatus = async () => {
    try {
      addTerminalLine("📊 System Status:");
      addTerminalLine(`   Admin: ${isAdmin ? '✅' : '❌'}`);
      addTerminalLine(`   Connected: ${isConnected ? '✅' : '❌'}`);
      addTerminalLine(`   Address: ${address || 'None'}`);
      
      if (publicClient) {
        // Get various system stats
        const totalMinted = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getTotalMinted',
        }) as bigint;
        
        const prizePool = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VERTICAL_ABI,
          functionName: 'getPrizePoolBalance',
        }) as bigint;
        
        addTerminalLine(`   Total Minted: ${totalMinted.toString()} NFTs`);
        addTerminalLine(`   Prize Pool: ${formatEther(prizePool)} VERT`);
        addTerminalLine(`   Auto-Sync: 🟢 Active`);
      }
      
      if (monitorData) {
        addTerminalLine(`   Last Check: ${monitorData.lastCheck}`);
        addTerminalLine(`   Unaccounted: ${monitorData.unaccounted} VERT`);
      }
      
    } catch (error) {
      addTerminalLine(`❌ Error getting status: ${error}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentInput.trim()) {
        executeCommand(currentInput);
        setCurrentInput("");
      }
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Keyboard shortcut to toggle admin terminal (Ctrl+`)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`' && isAdmin) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  // Auto-check balances every minute when visible
  useEffect(() => {
    if (isVisible && isAdmin) {
      checkBalances(); // Initial check
      
      const interval = setInterval(() => {
        if (isVisible) {
          checkBalances();
        }
      }, 60000); // Every 60 seconds

      return () => clearInterval(interval);
    }
  }, [isVisible, isAdmin]);

  const manualSync = async () => {
    try {
      if (!walletClient) {
        addTerminalLine("❌ No wallet connected for sync operation");
        return;
      }

      addTerminalLine("🔄 Manually syncing unaccounted tokens...");
      
      // Call the sync function on the contract
      const result = await writeContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: 'syncPrizePool',
        args: [],
      });

      addTerminalLine(`⏳ Transaction submitted: ${result}`);
      addTerminalLine("✅ Manual sync completed! Check transaction status.");
      
      // Refresh balances after sync
      setTimeout(async () => {
        await checkBalances();
      }, 3000);
      
    } catch (error: any) {
      addTerminalLine(`❌ Sync failed: ${error.message}`);
    }
  };

  // Only render if admin and visible
  if (!isAdmin || !isVisible) {
    return (
      <>
        {/* Floating admin indicator when hidden */}
        {isAdmin && !isVisible && (
          <div 
            className="fixed bottom-4 right-4 z-[9998] bg-green-500 text-black px-3 py-1 rounded-full text-xs font-mono cursor-pointer hover:bg-green-400 transition-colors"
            onClick={() => setIsVisible(true)}
            title="Click to show admin terminal (or Ctrl+`)"
          >
            👑 ADMIN
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black border-t-2 border-green-500 h-[32rem] font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-green-500/10 border-b border-green-500/30 px-4 py-2">
        <div className="text-green-400 font-bold">
          👑 ADMIN CONTROL PANEL - Contract: {contractAddress.slice(0,6)}...{contractAddress.slice(-4)}
        </div>
        <div className="flex items-center gap-2">
          {monitorData && (
            <div className="text-xs text-green-300">
              Unaccounted: {monitorData.unaccounted} VERT
            </div>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-green-400 hover:text-green-300 text-lg"
          >
            ×
          </button>
        </div>
      </div>

      {/* Admin GUI Controls */}
      <div className="bg-gray-900 border-b border-green-500/30 p-3 max-h-[12rem] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Price Controls */}
          <div className="space-y-2">
            <h3 className="text-green-400 font-bold text-xs">💰 MINT PRICES</h3>
            
            <div className="space-y-1.5">
              <div>
                <label className="text-green-300 text-xs block mb-1">VIRTUAL Price:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.001"
                    value={virtualPrice}
                    onChange={(e) => setVirtualPrice(e.target.value)}
                    placeholder="0.1"
                    className="flex-1 bg-black border border-green-500/30 text-green-300 px-2 py-1.5 text-xs rounded"
                    disabled={isLoading}
                  />
                  <button
                    onClick={updateVirtualPrice}
                    disabled={isLoading || !virtualPrice}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 text-xs rounded"
                  >
                    Set
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-green-300 text-xs block mb-1">VERT Price:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.001"
                    value={vertPrice}
                    onChange={(e) => setVertPrice(e.target.value)}
                    placeholder="500"
                    className="flex-1 bg-black border border-green-500/30 text-green-300 px-2 py-1.5 text-xs rounded"
                    disabled={isLoading}
                  />
                  <button
                    onClick={updateVertPrice}
                    disabled={isLoading || !vertPrice}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 text-xs rounded"
                  >
                    Set
                  </button>
                </div>
              </div>
              
              <button
                onClick={updateBothPrices}
                disabled={isLoading || !virtualPrice || !vertPrice}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-2 py-1.5 text-xs rounded"
              >
                Update Both Prices
              </button>
            </div>
          </div>

          {/* Contract Controls */}
          <div className="space-y-2">
            <h3 className="text-green-400 font-bold text-xs">⚙️ CONTRACT CONTROLS</h3>
            
            <div className="space-y-1.5">
              <button
                onClick={togglePause}
                disabled={isLoading}
                className={`w-full px-2 py-1.5 text-xs rounded ${
                  isPaused 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-600`}
              >
                {isPaused ? '▶️ Unpause Contract' : '⏸️ Pause Contract'}
              </button>
              
              <button
                onClick={() => checkBalances()}
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-2 py-1.5 text-xs rounded"
              >
                🔄 Check Balances
              </button>
              
              <button
                onClick={manualSync}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-2 py-1.5 text-xs rounded"
              >
                🔗 Manual Sync
              </button>
            </div>
          </div>

          {/* Prize Pool Controls */}
          <div className="space-y-2">
            <h3 className="text-green-400 font-bold text-xs">🏆 PRIZE POOL</h3>
            
            <div className="space-y-1.5">
              <div>
                <label className="text-green-300 text-xs block mb-1">Add VERT to Pool:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.001"
                    value={addPoolAmount}
                    onChange={(e) => setAddPoolAmount(e.target.value)}
                    placeholder="100"
                    className="flex-1 bg-black border border-green-500/30 text-green-300 px-2 py-1.5 text-xs rounded"
                    disabled={isLoading}
                  />
                  <button
                    onClick={addToPrizePool}
                    disabled={isLoading || !addPoolAmount}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 text-xs rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {monitorData && (
                <div className="text-xs space-y-1 bg-black/30 p-2 rounded">
                  <div className="text-green-300">Current Pool: {monitorData.recordedPool} VERT</div>
                  <div className="text-blue-300">Actual Balance: {monitorData.actualBalance} VERT</div>
                  <div className={`${monitorData.unaccounted !== "0" ? 'text-yellow-300' : 'text-green-300'}`}>
                    Unaccounted: {monitorData.unaccounted} VERT
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-2 text-yellow-300 text-xs animate-pulse">⏳ Transaction in progress...</div>
        )}
      </div>

      {/* Terminal Content */}
      <div className="flex flex-col h-[18rem]">
        {/* Output Area */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-3 text-green-300 space-y-0.5 text-xs"
        >
          {terminalLines.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-green-500/30 p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs">admin@vert:~$</span>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-green-300 outline-none border-none text-xs"
              placeholder="Type 'help' for commands..."
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
} 