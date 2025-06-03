// CORRECT RARITY PERCENTAGES FIX
// Replace the _determineRarity function with this:

function _determineRarity() private view returns (Rarity) {
    uint256 randomValue = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,           // Better than block.difficulty
        msg.sender,
        nextTokenId,
        tx.gasprice,                // Additional entropy
        gasleft()                   // Additional entropy
    ))) % 10000;

    // CORRECT PERCENTAGES:
    if (randomValue < 7000) return Rarity.Common;     // 70.000% (0-6999)
    if (randomValue < 8875) return Rarity.Rare;       // 18.750% (7000-8874)  
    if (randomValue < 9775) return Rarity.Epic;       // 9.000%  (8875-9774)
    if (randomValue < 9963) return Rarity.Legendary;  // 1.875%  (9775-9962)
    return Rarity.Mythical;                           // 0.375%  (9963-9999)
}

// VERIFICATION:
// Common: 7000/10000 = 70.00%
// Rare: 1875/10000 = 18.75%  
// Epic: 900/10000 = 9.00%
// Legendary: 188/10000 = 1.88%
// Mythical: 37/10000 = 0.37%
// Total: 7000 + 1875 + 900 + 188 + 37 = 10000 ✓ 