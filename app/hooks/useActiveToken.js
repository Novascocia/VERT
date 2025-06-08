import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Token addresses - Base mainnet
const PVERT_ADDRESS = "0x62C250355F0Ac01F4413b7d9c483428bEEf3E7dA"; // Deployed pVERT contract
const REAL_VERT_ADDRESS = ""; // Set your real VERT contract address when deployed

const useActiveToken = (nftContractAddress) => {
  const [activeToken, setActiveToken] = useState(null);
  const [tokenPhase, setTokenPhase] = useState('unknown'); // 'pvert', 'vert', or 'unknown'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkActiveToken = async () => {
      if (!nftContractAddress) return;

      try {
        // Only set loading to true if we don't have activeToken yet (initial load)
        if (!activeToken) {
          setLoading(true);
        }
        
        // Get provider - use public RPC for reading
        const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
        
        // Get NFT contract
        const nftContract = new ethers.Contract(
          nftContractAddress,
          ['function vertToken() view returns (address)'],
          provider
        );

        // Get current VERT token address
        const currentVertToken = await nftContract.vertToken();
        
        // Determine which phase we're in
        let phase = 'unknown';
        let tokenInfo = null;

        if (currentVertToken.toLowerCase() === PVERT_ADDRESS.toLowerCase()) {
          phase = 'pvert';
          tokenInfo = {
            address: currentVertToken,
            symbol: 'pVERT',
            name: 'Placeholder VERT',
            isPlaceholder: true
          };
        } else if (currentVertToken.toLowerCase() === REAL_VERT_ADDRESS.toLowerCase()) {
          phase = 'vert';
          tokenInfo = {
            address: currentVertToken,
            symbol: 'VERT',
            name: 'VERT Token',
            isPlaceholder: false
          };
        } else {
          // Unknown token address
          try {
            const tokenContract = new ethers.Contract(
              currentVertToken,
              [
                'function symbol() view returns (string)',
                'function name() view returns (string)'
              ],
              provider
            );
            
            const [symbol, name] = await Promise.all([
              tokenContract.symbol(),
              tokenContract.name()
            ]);
            
            tokenInfo = {
              address: currentVertToken,
              symbol,
              name,
              isPlaceholder: symbol === 'pVERT'
            };
            
            phase = tokenInfo.isPlaceholder ? 'pvert' : 'vert';
          } catch (err) {
            console.error('Error fetching token info:', err);
            tokenInfo = {
              address: currentVertToken,
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              isPlaceholder: false
            };
          }
        }

        setActiveToken(tokenInfo);
        setTokenPhase(phase);
        setError(null);
      } catch (err) {
        console.error('Error checking active token:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkActiveToken();
    
    // Check every 2 minutes for token switches (less disruptive)
    const interval = setInterval(checkActiveToken, 120000);
    
    return () => clearInterval(interval);
  }, [nftContractAddress]);

  return {
    activeToken,
    tokenPhase,
    loading,
    error,
    isPvertPhase: tokenPhase === 'pvert',
    isVertPhase: tokenPhase === 'vert',
    isUnknown: tokenPhase === 'unknown'
  };
};

export default useActiveToken; 