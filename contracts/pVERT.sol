// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title pVERT - Placeholder VERT Token
 * @dev Temporary token used for early reward payouts before real VERT is live
 * - Fixed supply (no minting after deployment)
 * - Transfers disabled between users
 * - Only owner can distribute tokens
 * - Users will later burn pVERT 1:1 for real VERT via claim contract
 */
contract pVERT is ERC20, Ownable {
    // Total fixed supply
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Events
    event TransfersEnabled(bool enabled);
    event RewardDistributed(address indexed to, uint256 amount);
    
    // Control transfers - initially disabled for users
    bool public transfersEnabled = false;
    
    constructor(address _teamWallet) ERC20("Placeholder VERT", "pVERT") {
        require(_teamWallet != address(0), "Team wallet cannot be zero address");
        
        // Mint entire supply to team wallet for distribution
        _mint(_teamWallet, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Override _beforeTokenTransfer to control transfers
     * Allow transfers only:
     * - From the owner (for distribution)
     * - To address(0) (for burning in future claim contract)
     * - If explicitly enabled by owner
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Allow minting (from == address(0))
        if (from == address(0)) {
            return;
        }
        
        // Allow burning (to == address(0))
        if (to == address(0)) {
            return;
        }
        
        // Allow owner to send tokens (for prize distribution)
        if (from == owner()) {
            return;
        }
        
        // Allow transfers if explicitly enabled
        if (transfersEnabled) {
            return;
        }
        
        // Otherwise, block transfers between users
        revert("pVERT: transfers disabled between users");
    }
    
    /**
     * @dev Owner can enable transfers (use carefully - mainly for testing)
     */
    function setTransfersEnabled(bool _enabled) external onlyOwner {
        transfersEnabled = _enabled;
        emit TransfersEnabled(_enabled);
    }
    
    /**
     * @dev Convenience function for owner to distribute rewards
     * Emits event for tracking reward distributions
     */
    function distributeReward(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot distribute to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(owner()) >= amount, "Insufficient balance for distribution");
        
        _transfer(owner(), to, amount);
        emit RewardDistributed(to, amount);
    }
    
    /**
     * @dev Batch distribute rewards (gas efficient for multiple payouts)
     */
    function batchDistributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(recipients[i] != address(0), "Cannot distribute to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            totalAmount += amounts[i];
        }
        
        require(balanceOf(owner()) >= totalAmount, "Insufficient balance for distribution");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(owner(), recipients[i], amounts[i]);
            emit RewardDistributed(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Get total amount of pVERT distributed (total supply minus owner balance)
     */
    function getTotalDistributed() external view returns (uint256) {
        return TOTAL_SUPPLY - balanceOf(owner());
    }
    
    /**
     * @dev Emergency function to recover any tokens accidentally sent to this contract
     */
    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot recover pVERT tokens");
        IERC20(token).transfer(owner(), amount);
    }
} 