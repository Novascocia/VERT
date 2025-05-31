import React from 'react';

const placeholderFeed = [
  {
    imageUrl: '/placeholder-nft.svg',
    rarity: 'Epic',
    prize: '3.2',
    wallet: '0x1234...abcd',
  },
  {
    imageUrl: '/placeholder-nft.svg',
    rarity: 'Rare',
    prize: '1.4',
    wallet: '0x5678...ef90',
  },
  {
    imageUrl: '/placeholder-nft.svg',
    rarity: 'Common',
    prize: '0',
    wallet: '0x9abc...1234',
  },
];

const rarityColors: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
  Mythical: 'text-pink-400',
};

export default function LiveMintFeed() {
  return (
    <div className="card-cel max-w-xl mx-auto mt-8 mb-8">
      <h2 className="heading-comic text-2xl mb-4 text-center">Recent Mints</h2>
      <div className="space-y-4">
        {placeholderFeed.map((mint, i) => (
          <div key={i} className="flex items-center gap-4 bg-vert-gray rounded-lg p-2 border border-black">
            <img src={mint.imageUrl} alt="NFT" className="w-14 h-14 rounded shadow-cel" />
            <div className="flex-1">
              <div className={`font-comic text-lg ${rarityColors[mint.rarity]}`}>{mint.rarity}</div>
              <div className="text-sm text-gray-300">{mint.wallet}</div>
              {Number(mint.prize) > 0 && (
                <div className="text-vert-accent font-bold animate-bounce">🎉 Congrats! Won {mint.prize} VERT!</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 