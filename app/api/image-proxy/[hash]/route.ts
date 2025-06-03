import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const { hash } = params;
  
  if (!hash) {
    return new NextResponse('Missing IPFS hash', { status: 400 });
  }
  
  // Try multiple IPFS gateways for reliability
  const gateways = [
    `https://ipfs.io/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://ipfs.filebase.io/ipfs/${hash}`
  ];
  
  // Try each gateway until one works
  for (const gateway of gateways) {
    try {
      console.log(`🔍 Trying IPFS gateway: ${gateway}`);
      
      const response = await fetch(gateway, {
        headers: {
          'User-Agent': 'VerticalNFT-Bot/1.0',
        },
        // 10 second timeout per gateway
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        console.log(`✅ Successfully fetched from: ${gateway}`);
        
        // Get the content type from the original response
        const contentType = response.headers.get('content-type') || 'image/png';
        
        // Stream the image data
        const imageData = await response.arrayBuffer();
        
        return new NextResponse(imageData, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'X-IPFS-Gateway': gateway,
          },
        });
      }
      
      console.log(`❌ Gateway failed with status: ${response.status} - ${gateway}`);
    } catch (error) {
      console.log(`❌ Gateway error: ${error} - ${gateway}`);
      continue; // Try next gateway
    }
  }
  
  // If all gateways fail, return an error
  console.error(`❌ All IPFS gateways failed for hash: ${hash}`);
  return new NextResponse('Image not found on IPFS', { 
    status: 404,
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache failures for 5 minutes
    }
  });
} 