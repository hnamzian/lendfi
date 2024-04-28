const nft = artifacts.require('NFTWithMarketplace');

module.exports = function (deployer) {
  const tokenName = "LendFiToken"
  const tokenSymbol = "LNF"
  deployer.deploy(nft, tokenName, tokenSymbol);
};