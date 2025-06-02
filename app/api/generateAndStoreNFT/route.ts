import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 NFT Generation API called - SIMPLIFIED TEST VERSION");
    
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

    // Test environment variables
    console.log("🔍 Testing environment variables...");
    const envVars = {
      PINATA_API_KEY: !!process.env.PINATA_API_KEY,
      PINATA_SECRET: !!process.env.PINATA_SECRET,
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
      RPC_URL: !!process.env.RPC_URL,
      PRIVATE_KEY: !!process.env.PRIVATE_KEY,
      CONTRACT_ADDRESS: !!process.env.CONTRACT_ADDRESS,
    };
    console.log("✅ Environment variables status:", envVars);

    // Test buildPrompt import
    console.log("🔍 Testing buildPrompt import...");
    const { getRandomTraits } = await import("@/utils/buildPrompt");
    console.log("✅ buildPrompt import successful");
    
    const traits = getRandomTraits();
    console.log("✅ Generated traits for token", tokenId);

    // Return success for now without actually generating
    return NextResponse.json({
      success: true,
      message: "NFT generation simulation successful",
      tokenId,
      hasEnvironmentVars: envVars,
      traitsGenerated: !!traits
    });

  } catch (error: any) {
    console.error("❌ Error in simplified NFT API:", error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Unknown error',
        stack: error.stack?.split('\n').slice(0, 3) || []
      },
      { status: 500 }
    );
  }
} 