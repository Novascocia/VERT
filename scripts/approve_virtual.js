import { JsonRpcProvider, Wallet, Contract, parseEther } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const VIRTUAL_TOKEN_ADDRESS = process.env.VIRTUAL_TOKEN_ADDRESS;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!VIRTUAL_TOKEN_ADDRESS || !CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
  console.error('Missing VIRTUAL_TOKEN_ADDRESS, CONTRACT_ADDRESS, PRIVATE_KEY, or RPC_URL in .env');
  process.exit(1);
}

const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const virtualToken = new Contract(VIRTUAL_TOKEN_ADDRESS, abi, wallet);

async function main() {
  try {
    console.log(`Approving ${CONTRACT_ADDRESS} to spend 10 VIRTUAL tokens...`);
    const tx = await virtualToken.approve(CONTRACT_ADDRESS, parseEther("10"));
    console.log('Transaction sent! Hash:', tx.hash);
    await tx.wait();
    console.log('✅ Approval confirmed.');
  } catch (err) {
    console.error('❌ Approval failed:', err);
  }
}

main(); 