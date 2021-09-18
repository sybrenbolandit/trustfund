// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TrustFundToken is ERC20 {
    address public minter;

    event MinterChanged(address indexed from, address to);

    constructor() payable ERC20("Trustfund token", "TFT") {
        minter = msg.sender;
    }

    function transferMinterRole(address _newMinter) public returns (bool) {
        require(msg.sender == minter, 'Error, only minter can transfer minter role');
        minter = _newMinter;

        emit MinterChanged(msg.sender, _newMinter);
        return true;
    }

    function mint(address _account, uint256 _amount) public {
        require(msg.sender == minter, 'Error, sender is not a minter');
        _mint(_account, _amount);
    }
}
