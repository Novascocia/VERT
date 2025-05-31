import { useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { writeContract } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmiConfig';
import { approveIfNeeded } from '../utils/approveIfNeeded';
import { VERTICAL_NFT_CONTRACT, VERT_TOKEN_ADDRESS, VIRTUAL_TOKEN_ADDRESS } from '../config/contracts';
import { ERC20_ABI, VERTICAL_ABI } from '../config/abis';
import type { WalletClient, PublicClient } from 'viem';

interface MintButtonProps {
  mintType: 'vert' | 'virtual';
  walletClient: WalletClient;
  publicClient: PublicClient;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function MintButton({ mintType, walletClient, publicClient, onSuccess, onError }: MintButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<{approval?: string, mint?: string}>({});
  const [mintTxHash, setMintTxHash] = useState<string | undefined>();

  const { isLoading: isMintLoading } = useWaitForTransactionReceipt({
    hash: mintTxHash as `0x${string}` | undefined,
  });

  const handleMint = async () => {
    // Explicit safeguard
    if (!walletClient?.account?.address) {
      throw new Error('Wallet is not connected');
    }

    setLoading(true);
    setError(null);
    setTxDetails({});
    
    try {
      const tokenAddress = mintType === 'vert' ? VERT_TOKEN_ADDRESS : VIRTUAL_TOKEN_ADDRESS;
      const requiredAmount = parseEther(mintType === 'vert' ? '100' : '2.5'); // 100 VERT or 2.5 VIRTUAL

      // Check and approve if needed
      const approvalTxHash = await approveIfNeeded(
        walletClient,
        publicClient,
        tokenAddress,
        VERTICAL_NFT_CONTRACT,
        requiredAmount
      );

      if (approvalTxHash) {
        setTxDetails(prev => ({...prev, approval: approvalTxHash}));
      }

      // Call mint function
      const mintTxHash = await writeContract(wagmiConfig, {
        account: walletClient.account.address,
        address: VERTICAL_NFT_CONTRACT as `0x${string}`,
        abi: VERTICAL_ABI,
        functionName: mintType === 'vert' ? 'mintWithVert' : 'mintWithVirtual',
        args: ['ipfs://QmPlaceholder'],
      });

      setMintTxHash(mintTxHash);
      setTxDetails(prev => ({...prev, mint: mintTxHash}));
      onSuccess?.();
    } catch (err) {
      console.error('Mint error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      onError?.(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleMint}
        disabled={loading || isMintLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Minting...' : `Mint with ${mintType === 'vert' ? 'VERT' : 'VIRTUAL'}`}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {txDetails.approval && (
        <p className="mt-2">
          Approval tx: <a 
            href={`https://sepolia.basescan.org/tx/${txDetails.approval}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-vert-primary hover:underline"
          >
            {txDetails.approval}
          </a>
        </p>
      )}
      {txDetails.mint && (
        <p className="mt-2">
          Mint tx: <a 
            href={`https://sepolia.basescan.org/tx/${txDetails.mint}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-vert-primary hover:underline"
          >
            {txDetails.mint}
          </a>
        </p>
      )}
    </div>
  );
} 