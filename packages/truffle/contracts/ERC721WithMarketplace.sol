// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTWithMarketplace is ERC721URIStorage, Ownable {
    uint256 public nftPrice; // Price for buying an NFT
    string public baseTokenURI; // Base URI for token metadata

    event NFTMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);
    event NFTBought(address indexed buyer, uint256 indexed tokenId);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        nftPrice = 100;
        baseTokenURI = "";
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseTokenURI = newBaseURI;
    }

    function mintNFT(address to, uint256 tokenId, string memory tokenURI) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(to, tokenId, tokenURI);
    }

    function buyNFT(uint256 tokenId) public payable {
        require(msg.value == nftPrice, "Incorrect value sent.");

        // uint256 tokenId = _tokenIdCounter.current();
        _transfer(address(this), msg.sender, tokenId);

        emit NFTBought(msg.sender, tokenId);

        // Transfer the received funds to the contract owner
        payable(ownerOf(tokenId)).transfer(msg.value);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setNFTPrice(uint256 newPrice) public onlyOwner {
        nftPrice = newPrice;
    }
}
