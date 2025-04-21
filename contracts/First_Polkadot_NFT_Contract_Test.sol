// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BasicMinter is ERC721Enumerable, Ownable {
    uint256 public mintPrice   = 0.01 ether;
    uint256 public maxSupply   = 10000;
    uint256 public nextTokenId = 0;

    mapping(uint256 => string) private _tokenURIs;
    event Mint(address indexed minter, uint256 tokenId, string uri);

    // No args needed for Ownable()
    constructor()
      ERC721("ArbitrumNFT", "ARBFT")
      Ownable()
    {}

    function mint(uint256 quantity, string calldata uri) external payable {
        require(quantity > 0 && quantity <= 20,           "Bad quantity");
        require(nextTokenId + quantity <= maxSupply,      "Exceeds supply");
        require(msg.value >= mintPrice * quantity,        "Insufficient ETH");

        for (uint i; i < quantity; i++) {
            uint tid = nextTokenId++;
            _safeMint(msg.sender, tid);
            _tokenURIs[tid] = uri;
            emit Mint(msg.sender, tid, uri);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length != 0, "Nonexistent token");
        return uri;
    }

    function withdraw() external onlyOwner {
        uint bal = address(this).balance;
        require(bal > 0, "No funds");
        payable(owner()).transfer(bal);
    }

    receive() external payable {}
    fallback() external payable {}
}
