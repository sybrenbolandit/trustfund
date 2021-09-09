const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const TrustFundToken = artifacts.require("./TrustFundToken.sol");

contract("TrustFundToken", function(accounts) {
  let creator = accounts[0];
  let tokenReceiver = accounts[1];
  let tokenBalanceReceiver;
  let contractInstance;

  it("Token has given name and symbol", function() {
    return TrustFundToken.deployed().then(function(instance) {
      contractInstance = instance;

      return contractInstance.name();
    }).then(function(result) {
      expect("Trustfund token").to.be.equal(result);

      return contractInstance.symbol();
    }).then(function(result) {
      expect("TFT").to.be.equal(result);
    });
  });

  it("Non minters cannot mint tokens", function() {
    return TrustFundToken.deployed().then(function(instance) {
      contractInstance = instance;

      return contractInstance.mint(tokenReceiver, 1, {from: tokenReceiver});
    }).catch(function(exception) {
      expect("Error, sender is not a minter").to.be.equal(exception.reason);

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(result) {
      expect(web3.utils.toBN(0)).to.be.bignumber.equal(result);
    });
  });

  it("Creator is the initial minter", function() {
    return TrustFundToken.deployed().then(async function(instance) {
      contractInstance = instance;
      tokenBalanceReceiver = await contractInstance.balanceOf(tokenReceiver);
      return contractInstance.mint(tokenReceiver, 2, {from: creator});
    }).then(function(result) {

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(result) {
      expect(web3.utils.toBN(tokenBalanceReceiver.toNumber() + 2)).to.be.bignumber.equal(result);
    });
  });

  it("Non minters cannot transfer minter role", function() {
    return TrustFundToken.deployed().then(function(instance) {
      contractInstance = instance;

      return contractInstance.transferMinterRole(tokenReceiver, {from: tokenReceiver});
    }).catch(function(exception) {
      expect("Error, only minter can transfer minter role").to.be.equal(exception.reason);
    });
  });

  it("Transfer minter role emits an event", function() {
    return TrustFundToken.deployed().then(function(instance) {
      contractInstance = instance;

      return contractInstance.transferMinterRole(tokenReceiver, {from: creator});
    }).then(async function(result) {
      truffleAssert.eventEmitted(result, 'MinterChanged', (event) => {
        return event.from === creator && event.to === tokenReceiver;
      });

      tokenBalanceReceiver = await contractInstance.balanceOf(tokenReceiver);
      return contractInstance.mint(tokenReceiver, 3, {from: tokenReceiver});
    }).then(function(result) {

      return contractInstance.balanceOf(tokenReceiver);
    }).then(function(result) {
      expect(web3.utils.toBN(tokenBalanceReceiver.toNumber() + 3)).to.be.bignumber.equal(result);
    });
  });
});
