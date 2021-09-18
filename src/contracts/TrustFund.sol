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

    TrustFundToken private token;
    uint8 public apy = 10;
    mapping(address => FutureRelease[]) public trusts;

    constructor(TrustFundToken _token) {
        token = _token;
    }

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

                // Release TFT
                uint256 interestPerYear = apy*futureRelease.amount/100;
                uint256 interestPerSecond = interestPerYear/(365.25*24*60*60);
                uint256 depositTime = block.timestamp - futureRelease.startTime;
                uint256 interest = interestPerSecond * depositTime;
                token.mint(msg.sender, interest);

                // Emit event
                emit TrustReleased(msg.sender, futureRelease.amount, interest, futureRelease.startTime, block.timestamp);

                // Reset trust
                delete trusts[msg.sender][i];
            }
        }
    }
}
