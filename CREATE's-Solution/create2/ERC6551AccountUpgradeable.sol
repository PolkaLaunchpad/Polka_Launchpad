// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

interface IERC6551Account {
    function token()
        external view returns (uint256 chainId, address tokenContract, uint256 tokenId);
    function state() external view returns (uint256);
    receive() external payable;
}
interface IERC6551Executable {
    function execute(address to,uint256 value,bytes calldata data,uint8 op)
        external payable returns (bytes memory);
}

/// @notice Storage‐driven Token‐Bound Account
contract ERC6551AccountUpgradeable is IERC6551Account, IERC6551Executable, IERC1271 {
    address public registry;
    address public implementation;
    uint256 public chainId;
    address public tokenContract;
    uint256 public tokenId;
    uint256 public stateCounter;
    bool    private initialized;

    modifier onlyOnce() {
        require(!initialized, "Already init");
        _;
    }

    function initialize(
        address _registry,
        address _implementation,
        uint256 _chainId,
        address _tokenContract,
        uint256 _tokenId
    ) external onlyOnce {
        registry       = _registry;
        implementation = _implementation;
        chainId        = _chainId;
        tokenContract  = _tokenContract;
        tokenId        = _tokenId;
        initialized    = true;
    }

    function token()
        external view override
        returns (uint256, address, uint256)
    {
        return (chainId, tokenContract, tokenId);
    }

    function state() external view override returns (uint256) {
        return stateCounter;
    }

    function execute(
        address to, uint256 value, bytes calldata data, uint8 operation
    ) external payable override returns (bytes memory) {
        require(operation == 0, "Only CALL");
        address owner_ = IERC721(tokenContract).ownerOf(tokenId);
        require(msg.sender == owner_, "Not owner");
        stateCounter++;
        (bool ok, bytes memory ret) = to.call{value:value}(data);
        require(ok, "Exec failed");
        return ret;
    }

    function isValidSignature(bytes32 hash, bytes memory signature)
        external view override returns (bytes4)
    {
        // NFT owner is the only valid signer
        address owner_ = IERC721(tokenContract).ownerOf(tokenId);
        bool valid = IERC1271(owner_).isValidSignature(hash, signature)
                     == IERC1271.isValidSignature.selector;
        return valid ? IERC1271.isValidSignature.selector : bytes4(0);
    }

    receive() external payable {}
}
