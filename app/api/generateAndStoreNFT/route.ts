import { NextRequest, NextResponse } from "next/server";
import { generateAndStoreNFT } from "@/utils/generateAndStoreNFT";
import { getRandomTraits } from "@/utils/buildPrompt";

export async function POST(request: NextRequest) {
  try {
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
    const result = await generateAndStoreNFT(tokenId, traits);

    console.log("✨ NFT generation completed successfully!");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error in generateAndStoreNFT API:", error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack?.split('\n').slice(0, 5)
      },
      { status: 500 }
    );
  }
} 