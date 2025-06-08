import React from 'react';
import useActiveToken from '../hooks/useActiveToken';

const TokenPhaseIndicator = ({ nftContractAddress, className = "" }) => {
  const { activeToken, tokenPhase, loading, error, isPvertPhase, isVertPhase } = useActiveToken(nftContractAddress);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">Checking token phase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 rounded-full bg-red-500"></div>
        <span className="text-sm text-red-600">Error: {error}</span>
      </div>
    );
  }

  if (!activeToken) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
        <span className="text-sm text-gray-600">Token not set</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {isPvertPhase && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-yellow-800">Early Launch Phase</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  pVERT Rewards
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                Mint with VIRTUAL to earn <strong>pVERT tokens</strong> that will be redeemable 1:1 for real VERT when it launches!
              </p>
            </div>
          </div>
        </div>
      )}

      {isVertPhase && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-green-800">VERT Token Live</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Real VERT Rewards
                </span>
              </div>
              <p className="text-sm text-green-700">
                Mint with VIRTUAL or VERT to earn <strong>real VERT tokens</strong> from the growing prize pool!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
        <span>Active Token: {activeToken.symbol}</span>
        <span>•</span>
        <span title={activeToken.address} className="font-mono">
          {activeToken.address.slice(0, 6)}...{activeToken.address.slice(-4)}
        </span>
      </div>
    </div>
  );
};

// Prize display component that adapts to current token phase
export const PrizeDisplay = ({ amount, nftContractAddress }) => {
  const { activeToken, isPvertPhase } = useActiveToken(nftContractAddress);

  if (!activeToken || !amount) return null;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-green-400">
        {amount} {activeToken.symbol}
      </span>
      {isPvertPhase && (
        <div className="flex flex-col">
          <span className="text-xs text-yellow-600 font-medium">
            → Redeemable for VERT
          </span>
        </div>
      )}
    </div>
  );
};

// Balance display component
export const TokenBalance = ({ userAddress, nftContractAddress }) => {
  const { activeToken, isPvertPhase } = useActiveToken(nftContractAddress);
  const [balance, setBalance] = React.useState('0');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!activeToken || !userAddress) return;

      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider();
        const tokenContract = new ethers.Contract(
          activeToken.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        
        const balance = await tokenContract.balanceOf(userAddress);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [activeToken, userAddress]);

  if (!activeToken) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Your {activeToken.symbol}</span>
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        ) : (
          <span className="font-bold">{parseFloat(balance).toFixed(2)}</span>
        )}
      </div>
      {isPvertPhase && parseFloat(balance) > 0 && (
        <div className="mt-1 text-xs text-yellow-600">
          Redeemable for {parseFloat(balance).toFixed(2)} VERT when live
        </div>
      )}
    </div>
  );
};

export default TokenPhaseIndicator; 