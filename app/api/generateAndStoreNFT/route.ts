import { NextRequest, NextResponse } from "next/server";
import { generateAndStoreNFT } from "@/utils/generateAndStoreNFT";
import { getRandomTraits } from "@/utils/buildPrompt";

export async function POST(request: NextRequest) {
  try {
    console.log("🎲 API Route: generateAndStoreNFT called");
    
    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    console.log("🎲 Generating random traits for token:", tokenId);
    const traits = getRandomTraits();
    console.log("✅ Generated traits:", traits);

    console.log("🚀 Starting NFT generation for token:", tokenId);
    
    // Try to generate NFT with timeout
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('NFT generation timed out after 45 seconds')), 45000);
      });
      
      const generationPromise = generateAndStoreNFT(tokenId, traits);
      
      const result = await Promise.race([generationPromise, timeoutPromise]);

      console.log("✨ NFT generation completed successfully!");
      return NextResponse.json(result);
      
    } catch (timeoutError: any) {
      console.warn("⏰ NFT generation timed out, returning placeholder:", timeoutError.message);
      
      // Return a placeholder NFT that can be updated later
      const placeholderResult = {
        imageUrl: "https://via.placeholder.com/400x400/000000/00ff00?text=VERT+NFT+%23" + tokenId,
        metadata: JSON.stringify({
          name: `Vertical Project #${tokenId}`,
          description: "AI-generated Vertical character (processing...)",
          image: "https://via.placeholder.com/400x400/000000/00ff00?text=VERT+NFT+%23" + tokenId,
          attributes: [
            { trait_type: "Status", value: "Processing" },
            { trait_type: "Rarity", value: traits.rarity }
          ]
        }),
        success: true,
        placeholder: true,
        message: "NFT generated with placeholder - image will be updated shortly"
      };
      
      // Continue generation in background (fire and forget)
      generateAndStoreNFT(tokenId, traits).catch(err => {
        console.error("❌ Background NFT generation failed:", err);
      });
      
      return NextResponse.json(placeholderResult);
    }

  } catch (error: any) {
    console.error("❌ Error in generateAndStoreNFT API:", error);
    
    // Provide better error details
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      details: error.stack?.split('\n').slice(0, 5),
      timestamp: new Date().toISOString(),
      tokenId: request.body || 'unknown'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 