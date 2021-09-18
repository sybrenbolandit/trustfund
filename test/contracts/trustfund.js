const { balance, time } = require('@openzeppelin/test-helpers');
const chai = require('chai');
const expect = require('chai').expect
const BN = require('bn.js');
const truffleAssert = require("truffle-assertions");
chai.use(require('chai-bn')(BN));

const TrustFund = artifacts.require("./TrustFund.sol");

contract("TrustFund", function(accounts) {
  let weiToSend = web3.utils.toWei('1', 'ether');
  let beneficiary = accounts[1];
  let trustFundInstance;
  let balanceTracker;

  describe("Create a trust", function() {
    it("should not create a trust in the past", function() {
      return TrustFund.new().then(async function(instance) {
        trustFundInstance = instance;

        return trustFundInstance.createTrust(
            beneficiary,
            (await time.latest()).sub(time.duration.days(1)),
            { value: weiToSend }
        );
      }).catch(function(exception) {
        expect(exception.reason).to.be.equal("Release time cannot be in the past");
      });
    });

    it("should create a trust", function() {
      return TrustFund.new().then(async function(instance) {
        trustFundInstance = instance;

        return trustFundInstance.createTrust(
            beneficiary,
            (await time.latest()).add(time.duration.days(1)),
            { value: weiToSend }
        );
      }).then(function(createResult) {
        truffleAssert.eventEmitted(createResult, 'TrustCreated', async (event) => {
          return event.creator === accounts[0]
              && event.beneficiary === beneficiary
              && event.amount === weiToSend;
        });

        return trustFundInstance.trusts(beneficiary, 0);
      }).then(function(result) {
        expect(result.amount).to.be.a.bignumber.that.equals(weiToSend);
      });
    });
  });

  describe("Release funds", function() {
    it("should only release trusts of the sender", function() {
      return TrustFund.new().then(async function(instance) {
        trustFundInstance = instance;
        balanceTracker = await balance.tracker(beneficiary);

        await trustFundInstance.createTrust(
            accounts[3],
            (await time.latest()).add(time.duration.seconds(0.01)),
            { value: weiToSend }
        );

        trustFundInstance.releaseFunds({from: beneficiary});
        expect(await balanceTracker.delta()).to.be.bignumber.equal('0');
      });
    });

    it("should only release trusts after the release time", function() {
      return TrustFund.new().then(async function(instance) {
        trustFundInstance = instance;
        balanceTracker = await balance.tracker(beneficiary);

        await trustFundInstance.createTrust(
            beneficiary,
            (await time.latest()).add(time.duration.days(1)),
            { value: weiToSend }
        );

        trustFundInstance.releaseFunds({from: beneficiary});
        expect(await balanceTracker.delta()).to.be.bignumber.equal('0');
      });
    });

    it("should release funds", function() {
        return TrustFund.new().then(async function(instance) {
          trustFundInstance = instance;
          balanceTracker = await balance.tracker(beneficiary);

          await trustFundInstance.createTrust(
            beneficiary,
              (await time.latest()).add(time.duration.seconds(0.01)),
            { value: weiToSend }
          );

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
        });
    });

    it("should release all funds", function() {
      return TrustFund.new().then(async function (instance) {
        trustFundInstance = instance;
        balanceTracker = await balance.tracker(beneficiary);

        await trustFundInstance.createTrust(
            beneficiary,
            (await time.latest()).add(time.duration.seconds(0.01)),
            {value: weiToSend}
        );
        await trustFundInstance.createTrust(
            beneficiary,
            (await time.latest()).add(time.duration.seconds(0.01)),
            {value: weiToSend}
        );

        return trustFundInstance.releaseFunds({from: beneficiary});
      }).then(async function (result) {
        expect(await balanceTracker.delta()).to.be.bignumber.greaterThan(weiToSend);
      });
    });
  });
});
