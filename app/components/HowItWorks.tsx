import React from 'react';

const steps = [
  { icon: '🔗', title: 'connect_wallet', desc: 'establish secure connection to begin minting process' },
  { icon: '🪙', title: 'select_token', desc: 'choose vert (cheaper) or virtual tokens for payment' },
  { icon: '🎲', title: 'execute_mint', desc: 'rng determines rarity traits and potential prize triggers' },
  { icon: '🎨', title: 'nft_generation', desc: 'unique vertical created and stored on ipfs network' },
  { icon: '🏆', title: 'prize_distribution', desc: 'rare mints trigger instant vert payouts from pool' },
];

export default function HowItWorks() {
  return (
    <div className="w-full mx-auto max-w-4xl mt-8">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── PROTOCOL_DOCUMENTATION_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10">
          
          {/* How It Works Section */}
          <div className="space-y-3">
            <div className="text-green-400 text-center">
              {'> process_overview:'}
            </div>
            
            <div className="space-y-4">
              {/* Steps */}
              {steps.map((step, index) => (
                <div key={index} className="border border-green-500/30 rounded p-4 bg-green-900/10">
                  <div className="flex items-start gap-4">
                    {/* Step number and icon */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="text-green-400 text-xs">
                        [{(index + 1).toString().padStart(2, '0')}]
                      </div>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    
                    {/* Step content */}
                    <div className="flex-1">
                      <div className="text-green-300 font-bold text-sm mb-1">
                        {'> '}{step.title}
                      </div>
                      <div className="text-gray-300 text-xs">
                        {'│ '}{step.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contract Information Terminal */}
            <div className="border border-green-500/30 rounded p-4 bg-black/50 mt-4">
              <div className="text-green-400 text-xs mb-3">
                {'> contract_addresses:'}
              </div>
              <div className="text-green-300 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">nft_contract:</span>
                  <span className="text-white">0x46aA53a47fB31E6A2FC80F405A94b3732BC05039</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">virtual_token:</span>
                  <span className="text-white">0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">vert_token:</span>
                  <span className="text-yellow-400">coming_soon_phase_2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">treasury:</span>
                  <span className="text-white">0x6e176D974Ed81b08bf8069c7Bf6A5b6267C4AA23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">network:</span>
                  <span className="text-cyan-400">base_mainnet_8453</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">metadata_storage:</span>
                  <span className="text-purple-400">ipfs_decentralized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
      </div>
    </div>
  );
} 