// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PolkaNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    ERC2981
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public mintPrice;
    uint256 public maxSupply;

    mapping(address => bool) public minters;
    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256      mintPrice_,
        uint256      maxSupply_,
        address      royaltyReceiver_,
        uint96       royaltyBP_
    ) ERC721(name_, symbol_) Ownable() {
        mintPrice = mintPrice_;
        maxSupply = maxSupply_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBP_);
        minters[msg.sender] = true;
    }

    function safeMint(address to, string memory uri)
        external
        onlyMinter
    {
        uint256 tid = _tokenIdCounter.current();
        require(tid < maxSupply, "Exceeds max supply");
        _tokenIdCounter.increment();
        _safeMint(to, tid);
        _setTokenURI(tid, uri);
    }

    function mint(
        address to,
        uint256 quantity,
        string memory uri
    ) external payable onlyMinter {
        require(quantity > 0, "Quantity must be > 0");
        require(
            _tokenIdCounter.current() + quantity <= maxSupply,
            "Exceeds max supply"
        );
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tid = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tid);
            _setTokenURI(tid, uri);
        }
    }

    function setMinter(address who, bool allowed)
        external
        onlyOwner
    {
        minters[who] = allowed;
    }

    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        payable(owner()).transfer(bal);
    }

    receive() external payable {}
    fallback() external payable {}

    // ── OVERRIDES ────────────────────────────────────────────────────────────

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
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

    /// @notice Support ERC165 for ERC721, Enumerable, URIStorage & Royalties
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721,
            ERC721Enumerable,
            ERC721URIStorage,
            ERC2981
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
