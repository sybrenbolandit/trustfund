// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./TrustFundToken.sol";

contract TrustFund {

    event TrustCreated(address indexed creator, address beneficiary, uint256 amount, uint256 releaseTime);
    event TrustReleased(address indexed beneficiary, uint256 amount, uint256 interest, uint256 startTime, uint256 releaseTime);

    struct FutureRelease {
        uint256 amount;
        uint256 startTime;
        uint256 releaseTime;
    }

    mapping(address => FutureRelease[]) public trusts;

    function createTrust(address payable _beneficiary, uint256 _releaseTime) public payable {
        require(_releaseTime >= block.timestamp, 'Release time cannot be in the past');

        trusts[_beneficiary].push(FutureRelease(msg.value, block.timestamp, _releaseTime));
        emit TrustCreated(msg.sender, _beneficiary, msg.value, _releaseTime);
    }

    function releaseFunds() public {
        for (uint i = 0; i < trusts[msg.sender].length; i++) {
            FutureRelease memory futureRelease = trusts[msg.sender][i];

            if (futureRelease.releaseTime <= block.timestamp) {
                // Release principal
                msg.sender.transfer(futureRelease.amount);

                // Emit event
                emit TrustReleased(msg.sender, futureRelease.amount, 0, futureRelease.startTime, block.timestamp);

                // Reset trust
                delete trusts[msg.sender][i];
            }
        }
    }
}
