// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.2/contracts/token/ERC721/ERC721.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.2/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.2/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.2/contracts/access/Ownable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.2/contracts/token/common/ERC2981.sol";

contract PolkaNFTHub is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    ERC2981
{
    struct Collection {
        address creator;
        string  name;
        uint256 mintPrice;
        uint256 maxSupply;
        uint256 minted;
        address royaltyReceiver;
        uint96  royaltyBP;
    }

    uint256 public collectionCount;
    uint256 public globalTokenCounter;

    mapping(uint256 => Collection) public collections;
    mapping(uint256 => uint256) public tokenToCollection;
    mapping(uint256 => string) public tokenNames;

    event CollectionCreated(
        uint256 indexed collectionId,
        address indexed creator,
        string  name,
        uint256 mintPrice,
        uint256 maxSupply,
        address royaltyReceiver,
        uint96  royaltyBP
    );

    event TokenMinted(
        uint256 indexed collectionId,
        uint256 indexed tokenId,
        address to,
        string name,
        string uri
    );

    constructor() ERC721("PolkaHub", "PKH") {
        _setDefaultRoyalty(msg.sender, 500); // 5% default royalty
    }

    function createCollection(
        string calldata name,
        uint256 mintPrice_,
        uint256 maxSupply_,
        address royaltyReceiver_,
        uint96  royaltyBP_
    ) external returns (uint256) {
        uint256 id = collectionCount++;
        collections[id] = Collection({
            creator: msg.sender,
            name: name,
            mintPrice: mintPrice_,
            maxSupply: maxSupply_,
            minted: 0,
            royaltyReceiver: royaltyReceiver_,
            royaltyBP: royaltyBP_
        });

        emit CollectionCreated(id, msg.sender, name, mintPrice_, maxSupply_, royaltyReceiver_, royaltyBP_);
        return id;
    }

    function mint(
        uint256 collectionId,
        address to,
        string calldata name,
        string calldata uri
    ) external payable {
        Collection storage c = collections[collectionId];

        require(msg.sender == c.creator, "Not your collection");
        require(c.minted < c.maxSupply, "Sold out");
        require(msg.value >= c.mintPrice, "Insufficient funds");

        uint256 tokenId = globalTokenCounter++;
        c.minted++;

        tokenToCollection[tokenId] = collectionId;
        tokenNames[tokenId] = name;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _setTokenRoyalty(tokenId, c.royaltyReceiver, c.royaltyBP);

        emit TokenMinted(collectionId, tokenId, to, name, uri);
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────

    function getCollection(uint256 collectionId) external view returns (Collection memory) {
        return collections[collectionId];
    }

    function getTokensInCollection(uint256 collectionId) external view returns (uint256[] memory) {
        uint256 total = totalSupply();
        uint256 count = 0;
        uint256[] memory temp = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (tokenToCollection[tokenId] == collectionId) {
                temp[count++] = tokenId;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = temp[j];
        }
        return result;
    }

    function getTokenName(uint256 tokenId) external view returns (string memory) {
        return tokenNames[tokenId];
    }

    function getCollectionCreator(uint256 collectionId) external view returns (address) {
        return collections[collectionId].creator;
    }

    // ─── Overrides ─────────────────────────────────────────────────────────────

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
