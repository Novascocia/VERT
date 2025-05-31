import axios from "axios";
import pinataSDK from "@pinata/sdk";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Readable } from "stream";
import Replicate from 'replicate';
import { buildPrompt, getRandomTraits } from './buildPrompt';
import { SelectedTraits } from '../types/traits';
import { ethers } from "ethers";
import contractABI from '../abis/Vertical.json';
// import { getTraitsFromTokenId } from "./traitLoader"; // Uncomment if you have this

dotenv.config();

// Validate environment variables
const requiredEnvVars = {
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET: process.env.PINATA_SECRET,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

console.log("🔑 Environment variables loaded successfully");

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_SECRET!,
});

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// Helper: Retry wrapper for Replicate
async function retryReplicate(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      
      // Check if it's an NSFW error
      if (error.message?.includes('NSFW') || error.message?.includes('inappropriate')) {
        console.error("❌ NSFW content detected, retrying with stronger safety prompts...");
        // Could add additional safety prompts here
      }
      
      // Check if it's a timeout
      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        console.warn("⏰ Timeout occurred, retrying...");
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// 1. Generate image with Replicate
async function generateImage(prompt: string, negative_prompt: string): Promise<string> {
  console.log("🧠 Generating image with prompt:", prompt);
  console.log("🚫 Using negative prompt:", negative_prompt);

  try {
    const output = await retryReplicate(async () => {
      return await replicate.run(
        "lucataco/dreamshaper-xl-turbo:0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615",
        {
          input: {
            prompt,
            negative_prompt,
            num_inference_steps: 25,
            guidance_scale: 10,
            scheduler: "K_EULER_ANCESTRAL",
            width: 1024,
            height: 1024
          }
        }
      );
    });

    if (!output || !output[0]) {
      throw new Error("No image URL in Replicate response");
    }

    console.log("🎨 Image generated successfully:", output[0]);
    return output[0];
  } catch (error) {
    console.error("❌ Error generating image with Replicate:", error);
    throw error;
  }
}

// 2. Download image and upload to Pinata
async function uploadToPinata(imageUrl: string): Promise<string> {
  console.log("📥 Downloading image from:", imageUrl);
  
  try {
    // Download image as buffer
    const response = await axios.get(imageUrl, { 
      responseType: "arraybuffer",
      timeout: 30000 // 30 second timeout
    });
    
    const buffer = Buffer.from(response.data, "binary");
    const fileName = `vertical-nft-${Date.now()}.png`;
    console.log("📦 Image downloaded, size:", buffer.length, "bytes");

    // Convert buffer to readable stream
    const stream = Readable.from(buffer);

    // Pin to Pinata
    console.log("📤 Uploading to Pinata...");
    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { 
        name: fileName
      },
      pinataOptions: { 
        cidVersion: 1 
      },
    });

    if (!result.IpfsHash) {
      throw new Error("No IPFS hash returned from Pinata");
    }

    const ipfsUri = `ipfs://${result.IpfsHash}`;
    console.log("✅ Image uploaded to IPFS:", ipfsUri);
    return ipfsUri;
  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error);
    throw error;
  }
}

// 3. Create metadata and upload to Pinata as a folder
async function uploadMetadataFolderToPinata(tokenId: number, imageIpfsUri: string, rarity: string): Promise<string> {
  console.log("📝 Creating metadata for token (folder mode):", tokenId);
  try {
    const metadata = {
      name: `Vertical Project #${tokenId}`,
      description: "An AI-generated Vertical character.",
      image: imageIpfsUri,
      attributes: [
        {
          trait_type: "rarity",
          value: rarity
        }
      ]
    };

    // Write metadata to a temp file
    const tempDir = path.join(__dirname, `../.tmp_metadata_${tokenId}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const filePath = path.join(tempDir, `${tokenId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

    // Prepare FormData for folder upload
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
      filepath: `${tokenId}.json` // This ensures the file is inside the folder root
    });

    // Pinata folder upload endpoint
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const response = await axios.post(url, form, {
      maxBodyLength: Infinity,
      headers: {
        ...form.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY!,
        pinata_secret_api_key: process.env.PINATA_SECRET!,
      },
    });

    if (!response.data.IpfsHash) {
      throw new Error("No IPFS hash returned from Pinata for folder upload");
    }

    // Clean up temp files
    fs.unlinkSync(filePath);
    fs.rmdirSync(tempDir);

    const folderCID = response.data.IpfsHash;
    const ipfsUri = `ipfs://${folderCID}/${tokenId}.json`;
    console.log("✅ Metadata folder uploaded to IPFS:", ipfsUri);
    return ipfsUri;
  } catch (error) {
    console.error("❌ Error uploading metadata folder to Pinata:", error);
    throw error;
  }
}

// MAIN FUNCTION — Call this from backend API
export async function generateAndStoreNFT(
  tokenId: string | number,
  traits: SelectedTraits
) {
  console.log("\n🚀 Starting NFT generation for token:", tokenId);

  try {
    const numericTokenId = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
    if (isNaN(numericTokenId)) {
      throw new Error(`Invalid tokenId: ${tokenId}`);
    }

    // Validate traits
    if (!traits.HeadType || !traits.EyesFace || !traits.ClothingTop || 
        !traits.CharacterColor || !traits.Species || !traits.Background) {
      throw new Error("Incomplete trait set provided");
    }

    // Get prompt from builder
    const { prompt, negative_prompt } = buildPrompt(traits);
    console.log("✅ Prompt passed to Replicate:\n", prompt);

    // Generate image with Replicate
    const rawImageUrl = await generateImage(prompt, negative_prompt);

    // Upload to IPFS
    const ipfsImageUri = await uploadToPinata(rawImageUrl);
    const metadataUri = await uploadMetadataFolderToPinata(numericTokenId, ipfsImageUri, traits.rarity);

    // Set tokenURI on-chain using backend wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x9ede64fe689aa03B049497E2A70676d02f3437E9";
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    
    try {
      console.log(`🔗 Setting TokenURI for token ${numericTokenId}...`);
      const tx = await contract.setTokenURI(numericTokenId, metadataUri);
      await tx.wait();
      console.log(`✅ TokenURI set for token ${numericTokenId}: ${metadataUri}`);
    } catch (error) {
      console.error(`❌ Failed to set TokenURI for token ${numericTokenId}:`, error);
      // Don't throw error - metadata is still available via IPFS
      console.log(`📄 Metadata still available via IPFS: ${metadataUri}`);
    }

    console.log("\n✨ NFT generation completed successfully!");
    console.log("📸 Image URI:", ipfsImageUri);
    console.log("📄 Metadata URI:", metadataUri);

    return {
      image: ipfsImageUri,
      metadata: metadataUri,
      traits,
    };
  } catch (error) {
    console.error("❌ Error in generateAndStoreNFT:", error);
    throw error;
  }
} 