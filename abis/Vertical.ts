import { Interface } from "ethers";
import { id } from "ethers";
import VerticalJson from "./Vertical.json";

// Enhanced ABI that includes both our custom functions and standard ERC-721 interface
// This helps MetaMask properly identify the contract standard
export const VERTICAL_ABI = [
  ...VerticalJson.abi,
  // Ensure these standard ERC-721 functions are explicitly included
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol", 
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_interfaceId", "type": "bytes4"}],
    "name": "supportsInterface",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// Keccak256(topic0) for Transfer(address,address,uint256)
export const TRANSFER_EVENT_TOPIC = id("Transfer(address,address,uint256)");

// ERC-721 functions
export const VERTICAL_ABI_FULL = [
  "function mintWithVirtual(string memory uri) public",
  "function mintWithVert(string memory uri) public",
  "function getPrizePoolBalance() public view returns (uint256)",
  "function getTotalMinted() public view returns (uint256)",
  "function priceVirtual() public view returns (uint256)",
  "function priceVert() public view returns (uint256)",
  "function paused() public view returns (bool)",
  "function owner() public view returns (address)",
  
  // ERC-721 events
  "event Transfer(address indexed from, address indexed to, uint256 tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
]; 