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
  const terminalRef = useRef<HTMLDivElement>(null);

  // Contract addresses
  const contractAddress = "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
  const vertTokenAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"; // VIRTUAL token for now

  // Check if connected wallet is admin
  useEffect(() => {
    if (isConnected && address) {
      // For development, you can also check contract owner
      checkIfAdmin();
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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black border-t-2 border-green-500 h-80 font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-green-500/10 border-b border-green-500/30 px-4 py-2">
        <div className="text-green-400 font-bold">
          👑 ADMIN TERMINAL - Prize Pool Monitor
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

      {/* Terminal Content */}
      <div className="flex flex-col h-full">
        {/* Output Area */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 text-green-300 space-y-1"
        >
          {terminalLines.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-green-500/30 p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400">admin@vert:~$</span>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-green-300 outline-none border-none"
              placeholder="Type 'help' for commands..."
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
} 