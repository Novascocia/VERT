import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Testing import chain...");
    
    // Test 1: Import traits data
    console.log("📊 Step 1: Importing traits data...");
    const traitsData = await import("@/traits/verticals_with_charactercolor.json");
    console.log("✅ Traits data imported successfully");
    
    // Test 2: Import buildPrompt module
    console.log("📊 Step 2: Importing buildPrompt module...");
    const buildPromptModule = await import("@/utils/buildPrompt");
    console.log("✅ buildPrompt module imported successfully");
    console.log("Available exports:", Object.keys(buildPromptModule));
    
    // Test 3: Call getRandomTraits
    console.log("📊 Step 3: Testing getRandomTraits...");
    const traits = buildPromptModule.getRandomTraits();
    console.log("✅ Traits generated successfully");
    
    // Test 4: Call buildPrompt
    console.log("📊 Step 4: Testing buildPrompt...");
    const promptResult = buildPromptModule.buildPrompt(traits);
    console.log("✅ Prompt built successfully");
    
    return NextResponse.json({
      success: true,
      message: "All imports working!",
      traitsGenerated: !!traits,
      promptGenerated: !!promptResult
    });
    
  } catch (error: any) {
    console.error("❌ Import test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
} 