// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

contract VerticalProjectNFT_WithManualSync_Fixed is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable, IERC2981 {
    enum Rarity { Common, Rare, Epic, Legendary, Mythical }

    IERC20 public virtualToken;
    IERC20 public vertToken;
    
    uint256 public priceVirtual = 100000 * 10**18;
    uint256 public priceVert = 10000 * 10**18;
    
    uint256 public nextTokenId = 1;
    uint256 public prizePool;
    address public treasury;

    mapping(uint256 => Rarity) public tokenRarity;
    mapping(Rarity => uint256) public prizePercentByRarity;

    event NFTMinted(address indexed user, uint256 indexed tokenId, Rarity rarity, string tokenURI);
    event PrizeClaimed(address indexed user, uint256 indexed tokenId, Rarity rarity, uint256 amount);
    event PrizePoolUpdated(uint256 newBalance);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event PrizePoolSynced(uint256 syncedAmount, uint256 newTotal);
    event VertTokenUpdated(address indexed newToken);
    event VirtualTokenUpdated(address indexed newToken);
    event TreasuryUpdated(address indexed newTreasury);
    event PricesUpdated(uint256 newVirtualPrice, uint256 newVertPrice);
    event PrizePercentUpdated(Rarity rarity, uint256 percent);

    constructor(
        address _virtualToken,
        address _vertToken,
        address _treasury
    ) ERC721("Vertical Project NFT", "VERT") {
        virtualToken = IERC20(_virtualToken);
        vertToken = IERC20(_vertToken);
        treasury = _treasury;

        // CORRECTED: Prize percentages for when rare+ NFTs are claimed
        prizePercentByRarity[Rarity.Rare] = 5;       // 5% of prize pool
        prizePercentByRarity[Rarity.Epic] = 10;      // 10% of prize pool
        prizePercentByRarity[Rarity.Legendary] = 25; // 25% of prize pool
        prizePercentByRarity[Rarity.Mythical] = 40;  // 40% of prize pool
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, _tokenURI);
    }

    function mintWithVirtual(string memory _tokenURI) external whenNotPaused nonReentrant {
        IERC20 virtualTokenCache = virtualToken;
        uint256 priceVirtualCache = priceVirtual;
        
        require(address(virtualTokenCache) != address(0), "Virtual token not set");
        require(virtualTokenCache.transferFrom(msg.sender, treasury, priceVirtualCache), "VIRTUAL payment failed");
        _mintNFT(msg.sender, _tokenURI, false);
    }

    function mintWithVert(string memory _tokenURI) external whenNotPaused nonReentrant {
        IERC20 vertTokenCache = vertToken;
        uint256 priceVertCache = priceVert;
        
        require(address(vertTokenCache) != address(0), "VERT token not set");
        require(vertTokenCache.transferFrom(msg.sender, address(this), priceVertCache), "VERT payment failed");

        uint256 toTreasury = (priceVertCache * 25) / 100;
        uint256 toPrizePool = priceVertCache - toTreasury;

        require(vertTokenCache.transfer(treasury, toTreasury), "Treasury transfer failed");
        prizePool += toPrizePool;

        _mintNFT(msg.sender, _tokenURI, true);
    }

    function _mintNFT(address user, string memory _tokenURI, bool addsToPrizePool) private {
        uint256 tokenId = nextTokenId++;
        _mint(user, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        Rarity rarity = _determineRarity();
        tokenRarity[tokenId] = rarity;

        emit NFTMinted(user, tokenId, rarity, _tokenURI);

        if (rarity != Rarity.Common && addsToPrizePool && prizePool > 0) {
            uint256 prizePercent = prizePercentByRarity[rarity];
            if (prizePercent > 0) {
                uint256 prizeAmount = (prizePool * prizePercent) / 100;
                if (prizeAmount > 0 && prizeAmount <= prizePool) {
                    prizePool -= prizeAmount;
                    require(vertToken.transfer(user, prizeAmount), "Prize transfer failed");
                    emit PrizeClaimed(user, tokenId, rarity, prizeAmount);
                }
            }
        }
    }

    // FIXED: Correct rarity percentages + improved randomness
    function _determineRarity() private view returns (Rarity) {
        // IMPROVED RANDOMNESS: Multiple entropy sources
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,           // More random than block.difficulty (EIP-4399)
            msg.sender,
            nextTokenId,
            tx.gasprice,                // Varies per transaction
            gasleft(),                  // Changes during execution
            blockhash(block.number - 1), // Previous block hash
            address(this).balance       // Contract ETH balance (if any)
        ))) % 10000;

        // CORRECTED PERCENTAGES to match your intended distribution:
        if (randomValue < 7000) return Rarity.Common;     // 70.000% (0-6999)
        if (randomValue < 8875) return Rarity.Rare;       // 18.750% (7000-8874)  
        if (randomValue < 9775) return Rarity.Epic;       // 9.000%  (8875-9774)
        if (randomValue < 9963) return Rarity.Legendary;  // 1.875%  (9775-9962)
        return Rarity.Mythical;                           // 0.375%  (9963-9999)
    }

    function claimPrize(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        Rarity rarity = tokenRarity[tokenId];
        require(rarity != Rarity.Common, "Common tokens have no prize");

        uint256 prizePercent = prizePercentByRarity[rarity];
        require(prizePercent > 0, "No prize for this rarity");

        uint256 prizeAmount = (prizePool * prizePercent) / 100;
        require(prizeAmount > 0 && prizeAmount <= prizePool, "Invalid prize amount");

        prizePool -= prizeAmount;
        require(vertToken.transfer(msg.sender, prizeAmount), "Prize transfer failed");

        emit PrizeClaimed(msg.sender, tokenId, rarity, prizeAmount);
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

    function setPriceVirtual(uint256 newPrice) external onlyOwner {
        priceVirtual = newPrice;
        emit PricesUpdated(newPrice, priceVert);
    }

    function setPriceVert(uint256 newPrice) external onlyOwner {
        priceVert = newPrice;
        emit PricesUpdated(priceVirtual, newPrice);
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

    function depositToPrizePool(uint256 amount) external {
        require(amount > 0, "Cannot deposit zero");
        require(vertToken.transferFrom(msg.sender, address(this), amount), "VERT transfer failed");
        prizePool += amount;
        emit PrizePoolFunded(msg.sender, amount);
    }

    function syncPrizePool() external onlyOwner {
        uint256 contractBalance = vertToken.balanceOf(address(this));
        
        require(contractBalance >= prizePool, "Contract balance less than tracked prize pool");
        
        uint256 unaccountedBalance = contractBalance - prizePool;
        
        if (unaccountedBalance > 0) {
            prizePool += unaccountedBalance;
            emit PrizePoolSynced(unaccountedBalance, prizePool);
        }
    }

    function getUnaccountedBalance() external view returns (uint256) {
        uint256 contractBalance = vertToken.balanceOf(address(this));
        if (contractBalance >= prizePool) {
            return contractBalance - prizePool;
        }
        return 0;
    }

    function getTokenRarity(uint256 tokenId) external view returns (Rarity) {
        require(_exists(tokenId), "Token does not exist");
        return tokenRarity[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * 250) / 10000; // 2.5%
        return (treasury, royaltyAmount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
} 