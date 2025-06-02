// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VerticalProjectNFT is ERC721URIStorage, IERC2981, Ownable, Pausable, ReentrancyGuard {
    // Packed storage variables
    uint96 public constant ROYALTY_FEE_BPS = 500; // 5%
    uint256 public priceVirtual = 2.5 ether;
    uint256 public priceVert = 1.5 ether;
    uint256 public nextTokenId;
    uint256 public prizePool;

    IERC20 public vertToken;
    IERC20 public virtualToken;
    address public treasury;

    enum Rarity {Common, Rare, Epic, Legendary, Mythical}
    mapping(uint256 => Rarity) public tokenRarity;
    mapping(Rarity => uint256) public prizePercentByRarity;

    // Events
    event NFTMinted(address indexed user, uint256 tokenId, Rarity rarity, string uri);
    event PrizeClaimed(address indexed user, uint256 amount);
    event PrizePoolUpdated(uint256 newTotal);
    event VertTokenUpdated(address newVertToken);
    event VirtualTokenUpdated(address newVirtualToken);
    event PricesUpdated(uint256 newVirtualPrice, uint256 newVertPrice);
    event TreasuryUpdated(address newTreasury);
    event PrizePercentUpdated(Rarity rarity, uint256 newPercent);
    event PrizePoolSynced(uint256 syncedAmount, address triggeredBy);
    event AutoSyncFailed(string reason);

    constructor(
        address _virtualToken,
        address _vertToken,
        address _treasury
    ) ERC721("Vertical Project", "VERTNFT") {
        require(_virtualToken != address(0), "Virtual token cannot be zero address");
        require(_vertToken != address(0), "VERT token cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");
        
        virtualToken = IERC20(_virtualToken);
        vertToken = IERC20(_vertToken);
        treasury = _treasury;
        nextTokenId = 1;

        // Initialize default prize percentages
        prizePercentByRarity[Rarity.Rare] = 3;
        prizePercentByRarity[Rarity.Epic] = 7;
        prizePercentByRarity[Rarity.Legendary] = 15;
        prizePercentByRarity[Rarity.Mythical] = 40;
    }

    // Allow the contract owner to set the token URI after minting
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    function mintWithVirtual(string memory tokenURI) external whenNotPaused nonReentrant {
        // Auto-sync any unaccounted VERT tokens before minting
        _autoSyncPrizePool();
        
        IERC20 virtualTokenCache = virtualToken;
        uint256 priceVirtualCache = priceVirtual;
        
        require(address(virtualTokenCache) != address(0), "Virtual token not set");
        require(virtualTokenCache.transferFrom(msg.sender, treasury, priceVirtualCache), "VIRTUAL payment failed");
        
        // VIRTUAL mints don't add to prize pool, so use current pool for calculations
        _mintNFT(msg.sender, tokenURI, prizePool);
    }

    function mintWithVert(string memory tokenURI) external whenNotPaused nonReentrant {
        // Auto-sync any unaccounted VERT tokens before minting
        _autoSyncPrizePool();
        
        IERC20 vertTokenCache = vertToken;
        uint256 priceVertCache = priceVert;
        
        require(address(vertTokenCache) != address(0), "VERT token not set");
        require(vertTokenCache.transferFrom(msg.sender, address(this), priceVertCache), "VERT payment failed");

        // FIXED: Calculate prize from CURRENT pool BEFORE updating it
        uint256 currentPrizePool = prizePool;
        
        // Update prize pool for future calculations
        uint256 toTreasury = (priceVertCache * 25) / 100;
        uint256 toPrizePool = priceVertCache - toTreasury;
        
        require(vertTokenCache.transfer(treasury, toTreasury), "Treasury transfer failed");
        prizePool += toPrizePool;

        // Mint NFT using the ORIGINAL prize pool amount
        _mintNFT(msg.sender, tokenURI, currentPrizePool);
        
        // Emit prize pool update after mint
        emit PrizePoolUpdated(prizePool);
    }

    function _mintNFT(address to, string memory uri, uint256 prizePoolForCalculation) internal {
        uint256 currentTokenId = nextTokenId;
        
        _safeMint(to, currentTokenId);
        _setTokenURI(currentTokenId, uri);

        Rarity rarity = _assignRarity(currentTokenId);
        tokenRarity[currentTokenId] = rarity;

        // Calculate prize from the provided prize pool amount (not current storage)
        uint256 prize = _getPrizeAmount(rarity, prizePoolForCalculation);
        
        if (prize > 0 && prize <= prizePool) {
            uint256 toUser = (prize * 95) / 100;
            uint256 toTreasuryPrize = prize - toUser;

            // Deduct from actual prize pool
            prizePool -= prize;

            require(vertToken.transfer(to, toUser), "Prize payout failed");
            require(vertToken.transfer(treasury, toTreasuryPrize), "Treasury cut failed");

            emit PrizeClaimed(to, toUser);
            emit PrizePoolUpdated(prizePool);
        }

        nextTokenId = currentTokenId + 1;
        emit NFTMinted(to, currentTokenId, rarity, uri);
    }

    function _assignRarity(uint256 tokenId) internal view returns (Rarity) {
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            tokenId,
            msg.sender // Add sender for additional entropy
        ))) % 10000;

        if (randomness < 7000) return Rarity.Common;        // 70.000%
        else if (randomness < 8875) return Rarity.Rare;     // 18.750%
        else if (randomness < 9765) return Rarity.Epic;     // 9.000%
        else if (randomness < 9950) return Rarity.Legendary;// 1.875%
        else return Rarity.Mythical;                        // 0.375%
    }

    // Public function for external prize calculation (uses current pool)
    function getPrizeAmount(Rarity rarity) external view returns (uint256) {
        return _getPrizeAmount(rarity, prizePool);
    }

    // Internal function that accepts a specific prize pool amount
    function _getPrizeAmount(Rarity rarity, uint256 poolAmount) internal view returns (uint256) {
        uint256 percent = prizePercentByRarity[rarity];
        return (poolAmount * percent) / 100;
    }

    function claimPrize(address to, uint256 amount) external onlyOwner {
        require(amount <= prizePool, "Insufficient prize pool");
        prizePool -= amount;
        require(vertToken.transfer(to, amount), "Prize transfer failed");
        emit PrizeClaimed(to, amount);
    }

    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address, uint256) {
        return (treasury, (salePrice * ROYALTY_FEE_BPS) / 10000);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    function setVertToken(address _vertToken) external onlyOwner {
        require(_vertToken != address(0), "VERT token cannot be zero address");
        vertToken = IERC20(_vertToken);
        emit VertTokenUpdated(_vertToken);
    }

    function setVirtualToken(address _virtualToken) external onlyOwner {
        require(_virtualToken != address(0), "Virtual token cannot be zero address");
        virtualToken = IERC20(_virtualToken);
        emit VirtualTokenUpdated(_virtualToken);
    }

    function setPrices(uint256 newVirtualPrice, uint256 newVertPrice) external onlyOwner {
        priceVirtual = newVirtualPrice;
        priceVert = newVertPrice;
        emit PricesUpdated(newVirtualPrice, newVertPrice);
    }

    function setTreasury(address addr) external onlyOwner {
        require(addr != address(0), "Treasury cannot be zero address");
        treasury = addr;
        emit TreasuryUpdated(addr);
    }

    function setPrizePercent(Rarity rarity, uint256 percent) external onlyOwner {
        require(percent <= 100, "Too high");
        prizePercentByRarity[rarity] = percent;
        emit PrizePercentUpdated(rarity, percent);
    }

    function getTotalMinted() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function getPrizePoolBalance() external view returns (uint256) {
        return prizePool;
    }

    function addToPrizePool(uint256 amount) external onlyOwner {
        require(vertToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        prizePool += amount;
        emit PrizePoolUpdated(prizePool);
    }

    // Emergency function to migrate prize pool to new contract
    function migratePrizePool(address newContract, uint256 amount) external onlyOwner {
        require(amount <= prizePool, "Insufficient prize pool");
        require(newContract != address(0), "Invalid contract address");
        prizePool -= amount;
        require(vertToken.transfer(newContract, amount), "Migration transfer failed");
        emit PrizePoolUpdated(prizePool);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @dev Internal auto-sync function that safely checks for unaccounted VERT tokens
     * Uses try/catch to ensure mint operations never fail due to sync issues
     */
    function _autoSyncPrizePool() internal {
        try this._syncPrizePoolInternal() {
            // Auto-sync succeeded silently
        } catch Error(string memory reason) {
            // Log the failure but don't revert the main transaction
            emit AutoSyncFailed(reason);
        } catch {
            // Catch any other failures
            emit AutoSyncFailed("Unknown sync error");
        }
    }

    /**
     * @dev Internal sync implementation that can be called via try/catch
     * This is external so it can be called via this.functionName() for try/catch
     */
    function _syncPrizePoolInternal() external {
        require(msg.sender == address(this), "Internal function only");
        
        uint256 actualBalance = vertToken.balanceOf(address(this));
        uint256 recordedPool = prizePool;
        
        if (actualBalance > recordedPool) {
            uint256 unaccountedAmount = actualBalance - recordedPool;
            prizePool = actualBalance;
            emit PrizePoolSynced(unaccountedAmount, tx.origin);
            emit PrizePoolUpdated(actualBalance);
        }
    }

    /**
     * @dev Manual sync function for admin use - can be called by anyone but primarily for admin
     * Returns the amount that was synced
     */
    function syncPrizePool() external returns (uint256) {
        uint256 actualBalance = vertToken.balanceOf(address(this));
        uint256 recordedPool = prizePool;
        
        if (actualBalance > recordedPool) {
            uint256 unaccountedAmount = actualBalance - recordedPool;
            prizePool = actualBalance;
            emit PrizePoolSynced(unaccountedAmount, msg.sender);
            emit PrizePoolUpdated(actualBalance);
            return unaccountedAmount;
        }
        
        return 0;
    }

    /**
     * @dev View function to check if there are unaccounted tokens
     * Useful for frontend monitoring
     */
    function getUnaccountedBalance() external view returns (uint256) {
        uint256 actualBalance = vertToken.balanceOf(address(this));
        uint256 recordedPool = prizePool;
        
        if (actualBalance > recordedPool) {
            return actualBalance - recordedPool;
        }
        
        return 0;
    }
} 