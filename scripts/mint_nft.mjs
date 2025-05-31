import { JsonRpcProvider, Wallet, Contract } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

console.log("🔧 Starting mint script...");
console.log("Using contract address:", process.env.CONTRACT_ADDRESS);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!CONTRACT_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
  console.error('Missing CONTRACT_ADDRESS, RPC_URL, or PRIVATE_KEY in .env');
  process.exit(1);
}

const abiPath = 'artifacts/contracts/test/VerticalProjectNFT_Testnet.sol/VerticalProjectNFT.json';
console.log("Using ABI path:", abiPath);
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const contract = new Contract(CONTRACT_ADDRESS, abi, wallet);

const metadataURI = process.argv[2] || 'ipfs://QmYourMetadataCID';
console.log("Calling mintWithVert with URI:", metadataURI);

async function main() {
  try {
    console.log("Sending transaction...");
    const tx = await contract.mintWithVert(metadataURI);
    console.log('Transaction sent! Hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block', receipt.blockNumber);
    const event = receipt.logs && receipt.logs.find(e => e.fragment && e.fragment.name === 'NFTMinted');
    if (event && event.args && event.args.tokenId) {
      console.log('Minted tokenId:', event.args.tokenId.toString());
    }
  } catch (err) {
    console.error("❌ Mint failed:", err);
    if (err.error && err.error.message) {
      console.error('Revert reason:', err.error.message);
    } else {
      console.error('Error:', err.message || err);
    }
  }
}

main(); 