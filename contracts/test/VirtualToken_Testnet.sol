// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VirtualToken_Testnet is ERC20 {
    constructor() ERC20("VIRTUAL Token (Test)", "VIRTUAL") {
        _mint(msg.sender, 1_000_000 ether);
    }
} 