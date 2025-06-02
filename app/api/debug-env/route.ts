import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables needed for NFT generation including setTokenURI
    const envCheck = {
      hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
      hasPinataApiKey: !!process.env.PINATA_API_KEY,
      hasPinataSecret: !!process.env.PINATA_SECRET,
      hasPrivateKey: !!process.env.PRIVATE_KEY,
      hasRpcUrl: !!process.env.RPC_URL,
      hasContractAddress: !!process.env.CONTRACT_ADDRESS,
      replicateTokenLength: process.env.REPLICATE_API_TOKEN?.length || 0,
      pinataApiKeyLength: process.env.PINATA_API_KEY?.length || 0,
      pinataSecretLength: process.env.PINATA_SECRET?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    const hasHardcodedFallbacks = {
      rpcUrl: 'https://mainnet.base.org',
      contractAddress: '0xc03605b09aF6010bb2097d285b9aF4024ecAf098'
    };

    return NextResponse.json({
      status: 'Environment check complete',
      environment: envCheck,
      fallbacks: hasHardcodedFallbacks,
      criticalMissing: !envCheck.hasPrivateKey ? ['PRIVATE_KEY'] : [],
      allCriticalVarsPresent: envCheck.hasReplicateToken && 
                            envCheck.hasPinataApiKey && 
                            envCheck.hasPinataSecret &&
                            envCheck.hasPrivateKey,
      message: envCheck.hasPrivateKey 
        ? "✅ All variables present - setTokenURI will work" 
        : "❌ Missing PRIVATE_KEY - setTokenURI will fail (NFTs won't update from placeholder)"
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Environment check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 