const { balance, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const TrustFund = artifacts.require("./TrustFund.sol");

contract("TrustFund", function(accounts) {
  let weiToSend = web3.utils.toWei('1', 'ether');
  let beneficiary = accounts[1];
  let trustFundInstance;

  it("Funds cannot be released before release time", function() {
    return TrustFund.deployed().then(async function(instance) {
      trustFundInstance = instance;
      const balanceTracker = await balance.tracker(beneficiary);

      trustFundInstance.createTrust(
        beneficiary,
        (await time.latest()).add(time.duration.days(1)),
        { value: weiToSend }
      );

      trustFundInstance.releaseFund(beneficiary);
      expect(await balanceTracker.delta()).to.be.bignumber.equal('0');
    });
  });

  it("Funds can be released after release time", function() {
    return TrustFund.deployed().then(async function(instance) {
      trustFundInstance = instance;
      const balanceTracker = await balance.tracker(beneficiary);

      trustFundInstance.createTrust(
        beneficiary,
        await time.latest(),
        { value: weiToSend }
      );

      await trustFundInstance.releaseFund(beneficiary);
      expect(await balanceTracker.delta()).to.be.bignumber.equal(weiToSend);
    });
  });
});
