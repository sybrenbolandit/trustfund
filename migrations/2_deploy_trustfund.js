const TrustFundToken = artifacts.require("./TrustFundToken.sol");
const TrustFund = artifacts.require("./TrustFund.sol");

module.exports = async function(deployer) {
  // Deploy token contract
  await deployer.deploy(TrustFundToken);

  // Deploy trustfund contract
  await deployer.deploy(TrustFund);
};
