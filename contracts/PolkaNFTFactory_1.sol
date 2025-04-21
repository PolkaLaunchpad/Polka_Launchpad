// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./PolkaNFT.sol";

contract PolkaNFTFactory {
    address[] public allCollections;
    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress
    );

    /// @notice Anyone can spin up their own PolkaNFT collection
    function createCollection(
        string calldata name,
        string calldata symbol,
        uint256       mintPrice,
        uint256       maxSupply,
        address       royaltyReceiver,
        uint96        royaltyBP
    ) external {
        PolkaNFT nft = new PolkaNFT(
            name,
            symbol,
            mintPrice,
            maxSupply,
            royaltyReceiver,
            royaltyBP
        );

        // Give caller ownership of their new collection
        nft.transferOwnership(msg.sender);

        allCollections.push(address(nft));
        emit CollectionCreated(msg.sender, address(nft));
    }

    /// @notice How many collections have been created
    function totalCollections() external view returns (uint256) {
        return allCollections.length;
    }
}
