// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SIPToken is ERC20 {
    constructor() ERC20("SIP Investment Token", "SIP") {
        // Mint 10 billion tokens to deployer
        _mint(msg.sender, 10000000000 * 10**18);
    }
}

//0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7