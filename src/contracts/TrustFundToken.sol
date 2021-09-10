// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TrustFundToken is ERC20 {
    address public minter;

    event MinterChanged(address indexed from, address to);

    constructor() payable ERC20("Trustfund token", "TFT") {
        minter = msg.sender;
    }

    function transferMinterRole(address newMinter) public returns (bool) {
        require(msg.sender == minter, 'Error, only minter can transfer minter role');
        minter = newMinter;

        emit MinterChanged(msg.sender, newMinter);
        return true;
    }

    function mint(address account, uint256 amount) public {
        require(msg.sender == minter, 'Error, sender is not a minter');
        _mint(account, amount);
    }
}
