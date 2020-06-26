pragma solidity ^0.5.0;

contract TrustFund {

  struct Future {
    uint256 amount;
    uint256 releaseTime;
  }
  mapping(address => Future[]) public trusts;

  function createTrust(address payable _beneficiary, uint256 _releaseTime) public payable {
    trusts[_beneficiary].push(Future(msg.value, _releaseTime));
  }

  function releaseFund(address payable beneficiary) public {
    for(uint i = 0; i < trusts[beneficiary].length; i++) {
      if(trusts[beneficiary][i].releaseTime <= block.timestamp) {
        beneficiary.transfer(trusts[beneficiary][i].amount);
        delete trusts[beneficiary][i];
      }
    }
  }
}
