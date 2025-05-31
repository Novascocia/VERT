// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStakingContract {
    function getStakeDetails(address user) external view returns (uint256 amountStaked, uint256 stakeTimestamp);
}

contract VerticalProjectNFT is ERC721URIStorage, IERC2981, Ownable, Pausable, ReentrancyGuard {
    IERC20 public vertToken;
    IERC20 public virtualToken;
    IStakingContract public stakingContract;

    address public treasury;
    uint256 public nextTokenId;
    uint256 public prizePool;

    uint256 public priceVirtual = 2.5 ether;
    uint256 public priceVert = 1.5 ether;
    uint96 public constant ROYALTY_FEE_BPS = 500; // 5%

    enum Rarity {Common, Rare, Epic, Legendary, Mythical}
    mapping(uint256 => Rarity) public tokenRarity;
    mapping(Rarity => uint256) public prizePercentByRarity;

    // Events
    event NFTMinted(address indexed user, uint256 tokenId, Rarity rarity, string uri);
    event PrizeClaimed(address indexed user, uint256 amount);
    event PrizePoolUpdated(uint256 newTotal);
    event VertTokenUpdated(address newVertToken);
    event VirtualTokenUpdated(address newVirtualToken);

    constructor(
        address _virtualToken,
        address _vertToken,
        address _stakingContract,
        address _treasury
    ) ERC721("Vertical Project", "VERTNFT") {
        require(_virtualToken != address(0), "Virtual token cannot be zero address");
        require(_vertToken != address(0), "VERT token cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");
        
        virtualToken = IERC20(_virtualToken);
        vertToken = IERC20(_vertToken);
        stakingContract = IStakingContract(_stakingContract);
        treasury = _treasury;
        nextTokenId = 1;

        // Initialize default prize percentages
        prizePercentByRarity[Rarity.Rare] = 3;
        prizePercentByRarity[Rarity.Epic] = 7;
        prizePercentByRarity[Rarity.Legendary] = 15;
        prizePercentByRarity[Rarity.Mythical] = 40;
    }

    function mintWithVirtual(string memory tokenURI) external whenNotPaused nonReentrant {
        require(address(virtualToken) != address(0), "Virtual token not set");
        require(virtualToken.transferFrom(msg.sender, treasury, priceVirtual), "VIRTUAL payment failed");
        _mintNFT(msg.sender, tokenURI, false);
    }

    function mintWithVert(string memory tokenURI) external whenNotPaused nonReentrant {
        require(address(vertToken) != address(0), "VERT token not set");
        require(vertToken.transferFrom(msg.sender, address(this), priceVert), "VERT payment failed");

        uint256 toTreasury = (priceVert * 25) / 100;
        uint256 toPrizePool = priceVert - toTreasury;

        require(vertToken.transfer(treasury, toTreasury), "Treasury transfer failed");
        prizePool += toPrizePool;

        _mintNFT(msg.sender, tokenURI, true);
    }

    function _mintNFT(address to, string memory uri, bool isVert) internal {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        Rarity rarity = _assignRarity(tokenId);
        if (rarity == Rarity.Mythical) {
            require(canMintMythical(to), "Not eligible to mint Mythical NFT");
        }
        tokenRarity[tokenId] = rarity;

        // Handle prize payout
        uint256 prize = getPrizeAmount(rarity);
        if (prize > 0 && prize <= prizePool) {
            uint256 toUser = (prize * 95) / 100;
            uint256 toTreasury = prize - toUser;

            prizePool -= prize;

            require(vertToken.transfer(to, toUser), "Prize payout failed");
            require(vertToken.transfer(treasury, toTreasury), "Treasury cut failed");

            emit PrizeClaimed(to, toUser);
            emit PrizePoolUpdated(prizePool);
        }

        emit NFTMinted(to, tokenId, rarity, uri);
        if (isVert) emit PrizePoolUpdated(prizePool);
    }

    function _assignRarity(uint256 tokenId) internal view returns (Rarity) {
        uint256 randomness = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId))) % 10000;

        if (randomness < 7000) return Rarity.Common;        // 70.000%
        if (randomness < 8875) return Rarity.Rare;          // 18.750%
        if (randomness < 9765) return Rarity.Epic;          // 9.000%
        if (randomness < 9950) return Rarity.Legendary;     // 1.875%
        return Rarity.Mythical;                             // 0.375%
    }

    function getPrizeAmount(Rarity rarity) internal view returns (uint256) {
        return (prizePool * prizePercentByRarity[rarity]) / 100;
    }

    function canMintMythical(address user) public view returns (bool) {
        (uint256 amountStaked, uint256 timestamp) = stakingContract.getStakeDetails(user);
        bool eligible = amountStaked >= 10_000 ether && block.timestamp >= timestamp + 14 days;
        return eligible;
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
    }

    function setStakingContract(address addr) external onlyOwner {
        stakingContract = IStakingContract(addr);
    }

    function setTreasury(address addr) external onlyOwner {
        require(addr != address(0), "Treasury cannot be zero address");
        treasury = addr;
    }

    function setPrizePercent(Rarity rarity, uint256 percent) external onlyOwner {
        require(percent <= 100, "Too high");
        prizePercentByRarity[rarity] = percent;
    }

    function getTotalMinted() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function getPrizePoolBalance() external view returns (uint256) {
        return prizePool;
    }

    function isEligibleForMythical(address user) external view returns (bool) {
        return canMintMythical(user);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
} 