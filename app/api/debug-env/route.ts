import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check critical environment variables (without exposing secrets)
    const envCheck = {
      hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
      hasPinataApiKey: !!process.env.PINATA_API_KEY,
      hasPinataSecret: !!process.env.PINATA_SECRET_API_KEY,
      hasPrivateKey: !!process.env.PRIVATE_KEY,
      hasRpcUrl: !!process.env.RPC_URL,
      hasContractAddress: !!process.env.CONTRACT_ADDRESS,
      replicateTokenLength: process.env.REPLICATE_API_TOKEN?.length || 0,
      pinataApiKeyLength: process.env.PINATA_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      status: 'Environment check complete',
      environment: envCheck,
      allCriticalVarsPresent: envCheck.hasReplicateToken && 
                            envCheck.hasPinataApiKey && 
                            envCheck.hasPinataSecret &&
                            envCheck.hasPrivateKey &&
                            envCheck.hasRpcUrl
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Environment check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 