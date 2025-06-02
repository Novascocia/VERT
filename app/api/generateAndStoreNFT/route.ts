import { NextRequest, NextResponse } from "next/server";
// Temporarily removed this import to test: import { generateAndStoreNFT } from "@/utils/generateAndStoreNFT";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 NFT Generation API called - debugging version");
    
    const body = await request.json();
    const { tokenId } = body;
    console.log("📝 Request payload:", { tokenId });

    if (!tokenId) {
      console.error("❌ Missing tokenId in request");
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Test import before using
    console.log("🔍 Testing buildPrompt import...");
    try {
      const { getRandomTraits } = await import("@/utils/buildPrompt");
      console.log("✅ buildPrompt import successful");
      
      console.log("🎲 Generating random traits for token:", tokenId);
      const traits = getRandomTraits();
      console.log("✅ Generated traits:", traits);

      // Now test generateAndStoreNFT import
      console.log("🔍 Testing generateAndStoreNFT import...");
      const { generateAndStoreNFT } = await import("@/utils/generateAndStoreNFT");
      console.log("✅ generateAndStoreNFT import successful");

      console.log("🚀 Starting NFT generation for token:", tokenId);
      const result = await generateAndStoreNFT(tokenId, traits);

      console.log("✨ NFT generation completed successfully!");
      return NextResponse.json(result);
    } catch (importError: any) {
      console.error("❌ Import or generation error:", importError);
      throw new Error(`Import/generation error: ${importError.message}`);
    }

  } catch (error: any) {
    console.error("❌ Error in generateAndStoreNFT API:", error);
    
    // Extract more helpful error details
    let errorDetails: {
      message: string;
      type: string;
      stack: string[];
      solution?: string;
    } = {
      message: error.message || 'Unknown error occurred',
      type: error.constructor.name,
      stack: error.stack?.split('\n').slice(0, 5) || [],
    };
    
    // Check for specific error types
    if (error.message?.includes('environment variable')) {
      errorDetails.type = 'Environment Configuration Error';
      errorDetails.solution = 'Please ensure all required environment variables are set in Vercel dashboard';
    } else if (error.message?.includes('Replicate')) {
      errorDetails.type = 'AI Image Generation Error';
      errorDetails.solution = 'Replicate API issue - may be temporary';
    } else if (error.message?.includes('Pinata')) {
      errorDetails.type = 'IPFS Upload Error';
      errorDetails.solution = 'Pinata/IPFS service issue';
    } else if (error.message?.includes('traits') || error.message?.includes('Import/trait')) {
      errorDetails.type = 'Trait Generation Error';
      errorDetails.solution = 'Issue with trait data or generation logic';
    } else if (error.message?.includes('Cannot find module') || error.message?.includes('import')) {
      errorDetails.type = 'Module Import Error';
      errorDetails.solution = 'Missing dependency or incorrect import path';
    }
    
    console.error("📋 Detailed error info:", errorDetails);
    
    return NextResponse.json(
      { 
        error: errorDetails.message,
        type: errorDetails.type,
        solution: errorDetails.solution,
        details: errorDetails.stack
      },
      { status: 500 }
    );
  }
} 