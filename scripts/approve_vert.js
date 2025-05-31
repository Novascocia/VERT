import { JsonRpcProvider, Wallet, Contract, parseEther } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const VERT_TOKEN_ADDRESS = process.env.VERT_TOKEN_ADDRESS;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!VERT_TOKEN_ADDRESS || !CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
  console.error('Missing VERT_TOKEN_ADDRESS, CONTRACT_ADDRESS, PRIVATE_KEY, or RPC_URL in .env');
  process.exit(1);
}

const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const vertToken = new Contract(VERT_TOKEN_ADDRESS, abi, wallet);

async function main() {
  try {
    console.log(`Approving ${CONTRACT_ADDRESS} to spend 10 VERT tokens...`);
    const tx = await vertToken.approve(CONTRACT_ADDRESS, parseEther("10"));
    console.log('Transaction sent! Hash:', tx.hash);
    await tx.wait();
    console.log('✅ Approval confirmed.');
  } catch (err) {
    console.error('❌ Approval failed:', err);
  }
}

main(); 