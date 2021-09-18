const { balance, time } = require('@openzeppelin/test-helpers');
const chai = require('chai');
const expect = require('chai').expect
const BN = require('bn.js');
const truffleAssert = require("truffle-assertions");
chai.use(require('chai-bn')(BN));

const TrustFund = artifacts.require("./TrustFund.sol");
const TrustFundToken = artifacts.require("./TrustFundToken.sol");

contract("All contracts", function(accounts) {
  let weiToSend = web3.utils.toWei('1', 'ether');
  let beneficiary = accounts[1];
  let tokenInstance;
  let trustFundInstance;
  let balanceTracker;

  beforeEach(async function () {
      tokenInstance = await TrustFundToken.deployed();
  });

  describe("Happy flow", function() {
    it("should pay interest", function() {
        return TrustFund.deployed().then(async function(instance) {
          trustFundInstance = instance;
          balanceTracker = await balance.tracker(beneficiary);

          await trustFundInstance.createTrust(
              beneficiary,
              (await time.latest()).add(time.duration.days(2)),
              {value: weiToSend}
          );
          await trustFundInstance.createTrust(
              beneficiary,
              (await time.latest()).add(time.duration.days(4)),
              {value: weiToSend}
          );
          await time.increase(time.duration.days(4));

          return trustFundInstance.releaseFunds({from: beneficiary});
        }).then(async function(receipt) {
          truffleAssert.eventEmitted(receipt, 'TrustReleased', async (event) => {
            return event.beneficiary === beneficiary
                && event.amount === weiToSend
                && event.interest === 0
                && event.startTime < (await time.latest())
                && event.releaseTime < (await time.latest());
          });

          expect(await balanceTracker.delta()).to.be.bignumber.greaterThan('0');

          return trustFundInstance.trusts(beneficiary, 0);
        }).then(function(result) {
          expect(result.length).to.be.undefined;

          return tokenInstance.balanceOf(beneficiary);
        }).then(async function(tokenBalance) {
          expect(tokenBalance).to.be.bignumber.greaterThan('0');
        });
    });
  });
});
