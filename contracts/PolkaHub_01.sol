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
        uint256 mintPrice;
        uint256 maxSupply;
        uint256 minted;
        address royaltyReceiver;
        uint96  royaltyBP;
    }

    Collection[] public collections;
    uint256     public globalTokenCounter;

    event CollectionCreated(
        uint256 indexed collectionId,
        address indexed creator,
        uint256 mintPrice,
        uint256 maxSupply,
        address royaltyReceiver,
        uint96  royaltyBP
    );
    event TokenMinted(
        uint256 indexed collectionId,
        uint256 indexed tokenId,
        address to,
        string uri
    );

    constructor() ERC721("PolkaHub", "PKH") {
        // Optional hub‑default royalty
        _setDefaultRoyalty(msg.sender, 500);
    }

    /// @notice Register a new “sub‑collection”
    function createCollection(
        uint256 mintPrice_,
        uint256 maxSupply_,
        address royaltyReceiver_,
        uint96  royaltyBP_
    ) external returns (uint256)
    {
        collections.push(Collection({
            creator:         msg.sender,
            mintPrice:       mintPrice_,
            maxSupply:       maxSupply_,
            minted:          0,
            royaltyReceiver: royaltyReceiver_,
            royaltyBP:       royaltyBP_
        }));

        uint256 id = collections.length - 1;
        emit CollectionCreated(
            id,
            msg.sender,
            mintPrice_,
            maxSupply_,
            royaltyReceiver_,
            royaltyBP_
        );
        return id;
    }

    /// @notice Mint a token in your collection
    function mint(
        uint256 collectionId,
        address to,
        string calldata uri
    ) external payable {
        Collection storage c = collections[collectionId];

        require(msg.sender == c.creator,  "Not your collection");
        require(c.minted < c.maxSupply,   "Sold out");
        require(msg.value >= c.mintPrice, "Insufficient funds");

        uint256 tokenId = globalTokenCounter++;
        c.minted += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _setTokenRoyalty(tokenId, c.royaltyReceiver, c.royaltyBP);

        emit TokenMinted(collectionId, tokenId, to, uri);
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

    /// @notice Now includes ERC721URIStorage in the override list
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
