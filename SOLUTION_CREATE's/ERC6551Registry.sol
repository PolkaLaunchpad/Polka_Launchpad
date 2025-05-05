// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IERC6551Registry.sol";
import "./ERC6551AccountUpgradeable.sol";

contract ERC6551Registry is IERC6551Registry {
    using Clones for address;

    /// @notice The implementation for all cloned accounts
    address public immutable accountImplementation;

    constructor(address _implementation) {
        require(_implementation != address(0), "Zero implementation");
        accountImplementation = _implementation;
    }

    /// @inheritdoc IERC6551Registry
    function createAccount(
        address,           // ignored, we always use accountImplementation
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) 
        external 
        override 
        returns (address account) 
    {
        // deterministically deploy (or fetch existing) clone
        address payable clone = payable(
          accountImplementation.cloneDeterministic(salt)
        );
        account = clone; // match interface

        // if not yet initialized, do it now
        if (clone.code.length == 0) {
            ERC6551AccountUpgradeable(clone).initialize(
                address(this),
                accountImplementation,
                chainId,
                tokenContract,
                tokenId
            );
            emit ERC6551AccountCreated(
                clone,
                accountImplementation,
                salt,
                chainId,
                tokenContract,
                tokenId
            );
        }
    }

    /// @inheritdoc IERC6551Registry
    function account(
        address,    // ignored
        bytes32 salt,
        uint256,    // ignored
        address,    // ignored
        uint256     // ignored
    ) 
        external 
        view 
        override 
        returns (address predicted) 
    {
        // predictDeterministicAddress takes (bytes32 salt, address deployer)
        predicted = accountImplementation.predictDeterministicAddress(
            salt,
            address(this)
        );
    }
}
