const TrustFundToken = artifacts.require("./TrustFundToken.sol");
const TrustFund = artifacts.require("./TrustFund.sol");

module.exports = async function(deployer) {
  // Deploy token contract
  await deployer.deploy(TrustFundToken);
  const token = await TrustFundToken.deployed();

  // Deploy trustfund contract
  await deployer.deploy(TrustFund, token.address);
  const trustFund = await TrustFund.deployed();

  // Delegate minter role to trust fund contract
  await token.transferMinterRole(trustFund.address);
};
