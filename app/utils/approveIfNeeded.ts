import { parseEther } from 'viem';
import { ERC20_ABI } from '../config/abis';
import { writeContract } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmiConfig';
import type { WalletClient, PublicClient } from 'viem';

/**
 * Checks allowance and approves MaxUint256 if needed.
 * @param walletClient Connected wallet client
 * @param publicClient Public client for reading
 * @param tokenAddress ERC20 token address
 * @param spenderAddress Spender address (NFT contract)
 * @param requiredAmount Amount required for the operation
 * @returns Promise<string | null> transaction hash if approval was sent, null if not needed
 */
export async function approveIfNeeded(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenAddress: string,
  spenderAddress: string,
  requiredAmount: bigint
): Promise<string | null> {
  // Explicit safeguard
  if (!walletClient?.account?.address) {
    throw new Error('Wallet is not connected');
  }

  const userAddress = walletClient.account.address;

  // Read current allowance
  const currentAllowance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress, spenderAddress as `0x${string}`],
  }) as bigint;

  // If allowance is sufficient, return null
  if (currentAllowance && currentAllowance >= requiredAmount) {
    return null;
  }

  // Send approval transaction
  const txHash = await writeContract(wagmiConfig, {
    account: walletClient.account.address,
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spenderAddress as `0x${string}`, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
  });

  return txHash;
} 