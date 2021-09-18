const chai = require('chai');
const expect = require('chai').expect
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));

const truffleAssert = require('truffle-assertions');
const TrustFundToken = artifacts.require("./TrustFundToken.sol");

contract("TrustFundToken", function(accounts) {
  let creator = accounts[0];
  let tokenReceiver = accounts[1];
  let contractInstance;

  it("Token has given name and symbol", function() {
    return TrustFundToken.new().then(function(instance) {
      contractInstance = instance;

      return contractInstance.name();
    }).then(function(name) {
      expect(name).to.be.equal("Trustfund token");

      return contractInstance.symbol();
    }).then(function(symbol) {
      expect(symbol).to.be.equal("TFT");
    });
  });

  it("Non minters cannot mint tokens", function() {
    return TrustFundToken.new().then(function(instance) {
      contractInstance = instance;

      return contractInstance.mint(tokenReceiver, 1, {from: tokenReceiver});
    }).catch(function(exception) {
      expect(exception.reason).to.be.equal("Error, sender is not a minter");

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(balance) {
      expect(balance).to.be.a.bignumber.that.is.zero;
    });
  });

  it("Creator is the initial minter", function() {
    return TrustFundToken.new().then(function(instance) {
      contractInstance = instance;

      return contractInstance.mint(tokenReceiver, 2, {from: creator});
    }).then(function(result) {

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(balance) {
      expect(balance).to.be.a.bignumber.that.equal(new BN('2'));
    });
  });

  it("Non minters cannot transfer minter role", function() {
    return TrustFundToken.new().then(function(instance) {
      contractInstance = instance;

      return contractInstance.transferMinterRole(tokenReceiver, {from: tokenReceiver});
    }).catch(function(exception) {
      expect("Error, only minter can transfer minter role").to.be.equal(exception.reason);
    });
  });

  it("Transfer minter role emits an event", function() {
    return TrustFundToken.new().then(function(instance) {
      contractInstance = instance;

      return contractInstance.transferMinterRole(tokenReceiver, {from: creator});
    }).then(function(transferResult) {
      truffleAssert.eventEmitted(transferResult, 'MinterChanged', (event) => {
        return event.from === creator && event.to === tokenReceiver;
      });

      return contractInstance.mint(tokenReceiver, 3, {from: tokenReceiver});
    }).then(function(result) {

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(balance) {
      expect(balance).to.be.a.bignumber.that.equal(new BN('3'));
    });
  });
});
