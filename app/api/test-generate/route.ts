import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Testing generateAndStoreNFT import...");
    
    // Test the specific import that's failing
    console.log("📊 Step 1: Testing generateAndStoreNFT import...");
    const generateModule = await import("@/utils/generateAndStoreNFT");
    console.log("✅ generateAndStoreNFT imported successfully");
    console.log("Available exports:", Object.keys(generateModule));
    
    return NextResponse.json({
      success: true,
      message: "generateAndStoreNFT import works!",
      exports: Object.keys(generateModule)
    });
    
  } catch (error: any) {
    console.error("❌ generateAndStoreNFT import test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 10)
    }, { status: 500 });
  }
} 