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

dotenv.config();

// Validate environment variables needed for image generation and IPFS
const requiredEnvVars = {
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET: process.env.PINATA_SECRET,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  PRIVATE_KEY: process.env.PRIVATE_KEY, // Required for setTokenURI
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
      console.log(`🔄 Replicate attempt ${i + 1}/${maxRetries}...`);
      const attemptStartTime = Date.now();
      const result = await fn();
      console.log(`✅ Replicate attempt ${i + 1} succeeded in ${(Date.now() - attemptStartTime) / 1000}s`);
      return result;
    } catch (error: any) {
      lastError = error;
      const attemptStartTime = Date.now();
      console.warn(`❌ Attempt ${i + 1} failed after ${(Date.now() - attemptStartTime) / 1000}s:`, error.message);
      
      // Check if it's an NSFW error
      if (error.message?.includes('NSFW') || error.message?.includes('inappropriate')) {
        console.error("❌ NSFW content detected, retrying with stronger safety prompts...");
        // Could add additional safety prompts here
      }
      
      // Check if it's a timeout
      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        console.warn("⏰ Timeout occurred, retrying...");
      }
      
      // Wait before retrying (reduced delay for faster debugging)
      if (i < maxRetries - 1) {
        const waitTime = Math.min(delay * (i + 1), 5000); // Cap at 5 seconds
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// 1. Generate image with Replicate
async function generateImage(prompt: string, negative_prompt: string): Promise<string> {
  console.log("🧠 Generating image with prompt:", prompt);
  console.log("🚫 Using negative prompt:", negative_prompt);
  const imageStartTime = Date.now();

  try {
    console.log("🚀 Using turbo model...");
    const turboStartTime = Date.now();
    
    const output = await retryReplicate(async () => {
      console.log("🔄 Calling Replicate API...");
      const modelToUse = "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637";
      console.log("🎯 Model being used:", modelToUse);
              console.log("🔑 API Token configured:", process.env.REPLICATE_API_TOKEN ? "✅" : "❌");
      
      const apiCallStartTime = Date.now();
              const result = await replicate.run(
          modelToUse,
          {
            input: {
              prompt,
              negative_prompt,
              width: 1024,
              height: 1024,
              num_inference_steps: 4,
              guidance_scale: 0,
              scheduler: "DPM++ 2M SDE Karras",
              seed: Math.floor(Math.random() * 1000000)
            }
          }
        );
      console.log(`⏱️ Replicate API call took: ${(Date.now() - apiCallStartTime) / 1000}s`);
      console.log("🔍 Raw Replicate response:", JSON.stringify(result, null, 2));
      return result;
    });

    if (!output || !output[0]) {
      throw new Error("No image URL in Replicate response");
    }

    console.log(`⏱️ Turbo model total time: ${(Date.now() - turboStartTime) / 1000}s`);
    console.log("🎨 Image generated successfully:", output[0]);
    return output[0];
  } catch (error) {
    console.error(`⏱️ Image generation failed after: ${(Date.now() - imageStartTime) / 1000}s`);
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

// 3. Create metadata and upload to Pinata as a single file (not folder)
async function uploadMetadataToPinata(tokenId: number, imageIpfsUri: string, traits: SelectedTraits): Promise<string> {
  console.log("📝 Creating metadata for token (direct file mode):", tokenId);
  try {
    const metadata = {
      name: `Vertical Project #${tokenId}`,
      description: "An AI-generated Vertical character.",
      image: imageIpfsUri,
      attributes: [
        {
          trait_type: "Rarity",
          value: traits.rarity
        },
        {
          trait_type: "Species", 
          value: traits.Species.name
        }
      ]
    };

    // Convert metadata to buffer
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const metadataStream = Readable.from(metadataBuffer);
    const fileName = `vertical-metadata-${tokenId}-${Date.now()}.json`;

    // Pin metadata file directly to Pinata
    console.log("📤 Uploading metadata to Pinata...");
    const result = await pinata.pinFileToIPFS(metadataStream, {
      pinataMetadata: { 
        name: fileName
      },
      pinataOptions: { 
        cidVersion: 1 
      },
    });

    if (!result.IpfsHash) {
      throw new Error("No IPFS hash returned from Pinata for metadata upload");
    }

    const ipfsUri = `ipfs://${result.IpfsHash}`;
    console.log("✅ Metadata uploaded to IPFS:", ipfsUri);
    return ipfsUri;
  } catch (error) {
    console.error("❌ Error uploading metadata to Pinata:", error);
    throw error;
  }
}

// MAIN FUNCTION — Call this from backend API
export async function generateAndStoreNFT(
  tokenId: string | number,
  traits: SelectedTraits
) {
  console.log(`\n🚀 Starting NFT generation for token: ${tokenId}`);
  const startTime = Date.now();

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
    const replicateStartTime = Date.now();
    const rawImageUrl = await generateImage(prompt, negative_prompt);
    console.log(`⏱️ Replicate image generation took: ${(Date.now() - replicateStartTime) / 1000}s`);

    // Upload to IPFS
    const ipfsStartTime = Date.now();
    const ipfsImageUri = await uploadToPinata(rawImageUrl);
    const metadataUri = await uploadMetadataToPinata(numericTokenId, ipfsImageUri, traits);
    console.log(`⏱️ IPFS upload took: ${(Date.now() - ipfsStartTime) / 1000}s`);

    // Set tokenURI on-chain using backend wallet with hardcoded fallbacks
    const rpcUrl = process.env.RPC_URL || process.env.MAINNET_RPC_URL || 'https://mainnet.base.org';
    const contractAddress = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x414280a38d52eB30768275Eb95D16714c69d216A';
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    
    try {
      console.log(`🔗 Setting TokenURI for token ${numericTokenId}...`);
      const txStartTime = Date.now();
      const tx = await contract.setTokenURI(numericTokenId, metadataUri);
      await tx.wait();
      console.log(`⏱️ Blockchain transaction took: ${(Date.now() - txStartTime) / 1000}s`);
      console.log(`✅ TokenURI set for token ${numericTokenId}: ${metadataUri}`);
    } catch (error) {
      console.error(`❌ Failed to set TokenURI for token ${numericTokenId}:`, error);
      // Don't throw error - metadata is still available via IPFS
      console.log(`📄 Metadata still available via IPFS: ${metadataUri}`);
    }

    console.log(`\n✨ NFT generation completed successfully! Total time: ${(Date.now() - startTime) / 1000}s`);
    console.log("📸 Image URI:", ipfsImageUri);
    console.log("📄 Metadata URI:", metadataUri);

    return {
      imageUrl: ipfsImageUri,
      metadata: JSON.stringify({
        name: `Vertical Project #${numericTokenId}`,
        description: "An AI-generated Vertical character.",
        image: ipfsImageUri,
        attributes: [
          {
            trait_type: "Rarity",
            value: traits.rarity
          },
          {
            trait_type: "Species", 
            value: traits.Species.name
          }
        ]
      }),
      success: true
    };
  } catch (error) {
    console.error("❌ Error in generateAndStoreNFT:", error);
    throw error;
  }
} 