// IMPROVED RANDOMNESS PROPOSAL
// Add this to the contract to improve rarity distribution

function _determineRarity() private view returns (Rarity) {
    // Use multiple sources of entropy
    uint256 randomValue = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,           // NEW: More random than difficulty
        msg.sender,
        nextTokenId,
        tx.gasprice,                // NEW: Varies per transaction
        block.coinbase,             // NEW: Changes per block
        gasleft(),                  // NEW: Varies during execution
        blockhash(block.number - 1) // NEW: Previous block hash
    ))) % 10000;

    if (randomValue < 5000) return Rarity.Common;     // 50%
    if (randomValue < 8000) return Rarity.Rare;       // 30%
    if (randomValue < 9500) return Rarity.Epic;       // 15%
    if (randomValue < 9900) return Rarity.Legendary;  // 4%
    return Rarity.Mythical;                           // 1%
}

// ALTERNATIVE: Chainlink VRF (More Complex but Perfect Randomness)
// Would need to import Chainlink contracts and implement VRF callbacks 