const NFT = artifacts.require('NFTWithMarketplace');
const Lending = artifacts.require('Lending');
const ethers = require("ethers")

const tokenURIs = [
  "QmX2mW6WjxvGKgLjsnB7xR2TSG2ZaZTyU6WcXG8zxK5z3m",
  "QmZ4g5Nm3h2JFkS2PTc7PrQtxvcJ3Bj5HTcFvYySDbQTF7",
  "QmR3XeDk5K2DJ2gWx9TwgFxzUyJ1fYT6EZvGb5LhQ7YHg2",
  "QmY9T6Z4G3MjP3g4xjR1Q3Zkz5P5vQkTLQZ4q7Xf5t3Qd2",
  "QmNkL2bV7dWwZx2QqR5xP8jC7X1j5G9Y9Tx1T3X4p7Kx3w",
  "QmQ6G1T2f3RgW4T7S9T6V7zQ1xS2fGx9Q1T3F5bV9Q9pT3",
  "QmR2Z1vT6P3H7L9x5V7W2X6cQ5Z3vQ9J7S6xT7bP1Q7d5",
  "QmT5Z7Q6D3x2G9Y4H7R5fV9X2b3Q8J5C6Z1X2T3vS4b5L",
  "QmX3W4H5T2P1B6V8J9Z6G3Y7xS2H5bQ7V4gP5J3L6vY3Q",
  "QmV1X2D3J4L5P6Z7S8T9X0A1B2C3D4E5F6G7H8I9J0K1"
]

module.exports = function (deployer, network, accounts) {
  const tokenName = "LendFiToken"
  const tokenSymbol = "LNF"

  deployer.then(async () => {
    console.log("Deploying Contract NFTWithMarketplace")
    const nft = await deployer.deploy(NFT, tokenName, tokenSymbol)

    for (let i = 0; i < tokenURIs.length; i++) {
      await nft.mintNFT(nft.address, i, tokenURIs[i])
    }

    console.log("Deploying Contract Lending")
    const lending = await deployer.deploy(Lending, nft.address)

    await lending.send(ethers.BigNumber.from("1000000000000000000"))
  })

};