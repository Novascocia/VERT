import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const { tokenId } = params;
  const { searchParams } = new URL(request.url);
  
  const imageUrl = searchParams.get('image') || '';
  const rarity = searchParams.get('rarity') || 'Vertical';
  const prize = searchParams.get('prize') || '0';
  
  // Extract IPFS hash from the image URL
  let ipfsHash = '';
  if (imageUrl.includes('ipfs://')) {
    ipfsHash = imageUrl.replace('ipfs://', '');
  } else if (imageUrl.includes('/ipfs/')) {
    ipfsHash = imageUrl.split('/ipfs/')[1];
  }
  
  // Use our own image proxy endpoint for better Twitter compatibility
  const proxyImageUrl = `${new URL(request.url).origin}/api/image-proxy/${ipfsHash}`;
  
  const title = `Vertical NFT #${tokenId} - ${rarity}`;
  const description = `Just minted a ${rarity} NFT on Vertical! ${prize !== '0' ? `Won ${prize} VERT! 🎉` : ''} #vertnft`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  
  <!-- Essential Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@VerticalOnBase">
  <meta name="twitter:creator" content="@VerticalOnBase">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${proxyImageUrl}">
  <meta name="twitter:image:alt" content="Vertical NFT #${tokenId} - ${rarity} rarity">
  <meta name="twitter:image:width" content="1024">
  <meta name="twitter:image:height" content="1024">
  
  <!-- Open Graph meta tags for other platforms -->
  <meta property="og:url" content="${request.url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${proxyImageUrl}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">
  <meta property="og:image:type" content="image/png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Vertical Project">
  
  <!-- Additional meta tags for better compatibility -->
  <meta name="description" content="${description}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Redirect to main site after a delay -->
  <meta http-equiv="refresh" content="5;url=/">
  
  <style>
    body {
      background: #000;
      color: #4ade80;
      font-family: 'Courier New', monospace;
      text-align: center;
      padding: 2rem;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    img {
      max-width: 400px;
      width: 100%;
      height: auto;
      border: 2px solid #4ade80;
      border-radius: 8px;
      margin: 1rem 0;
    }
    .info {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
    .redirect {
      margin-top: 2rem;
      font-size: 0.9rem;
      opacity: 0.7;
    }
    @media (max-width: 600px) {
      body { padding: 1rem; }
      h1 { font-size: 1.5rem; }
      img { max-width: 300px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Vertical NFT #${tokenId}</h1>
    <div class="info">Rarity: <strong>${rarity}</strong></div>
    ${prize !== '0' ? `<div class="info">Prize Won: <strong>${prize} VERT! 🎉</strong></div>` : ''}
    <img src="${proxyImageUrl}" alt="Vertical NFT #${tokenId} - ${rarity}" loading="eager" />
    <div class="redirect">
      <p>🔄 Redirecting to Vertical Project in 5 seconds...</p>
      <p><a href="/" style="color: #4ade80;">Click here if not redirected</a></p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
} 