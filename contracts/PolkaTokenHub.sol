// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract PolkaTokenHub {
    struct Token {
        string  name;
        string  symbol;
        uint8   decimals;
        uint256 totalSupply;
        uint256 maxSupply;
        address creator;
    }

    uint256 public tokenCount;
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => mapping(address => uint256)) public balances;
    mapping(uint256 => mapping(address => mapping(address => uint256))) public allowances;

    event TokenCreated(
        uint256 indexed tokenId,
        string  name,
        string  symbol,
        uint256 initialSupply,
        uint256 maxSupply,
        address indexed creator
    );

    event Transfer(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount);
    event Approval(uint256 indexed tokenId, address indexed owner, address indexed spender, uint256 amount);

    modifier onlyCreator(uint256 tokenId) {
        require(tokens[tokenId].creator == msg.sender, "Not creator");
        _;
    }

    function createToken(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxSupply
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(initialSupply <= maxSupply, "Initial > max");

        uint256 tokenId = tokenCount++;
        tokens[tokenId] = Token({
            name: name,
            symbol: symbol,
            decimals: decimals,
            totalSupply: initialSupply,
            maxSupply: maxSupply,
            creator: msg.sender
        });

        balances[tokenId][msg.sender] = initialSupply;

        emit TokenCreated(tokenId, name, symbol, initialSupply, maxSupply, msg.sender);
        emit Transfer(tokenId, address(0), msg.sender, initialSupply);

        return tokenId;
    }

    function mint(uint256 tokenId, address to, uint256 amount) external onlyCreator(tokenId) {
        Token storage t = tokens[tokenId];
        require(t.totalSupply + amount <= t.maxSupply, "Exceeds maxSupply");
        t.totalSupply += amount;
        balances[tokenId][to] += amount;
        emit Transfer(tokenId, address(0), to, amount);
    }

    function burn(uint256 tokenId, uint256 amount) external {
        require(balances[tokenId][msg.sender] >= amount, "Insufficient");
        balances[tokenId][msg.sender] -= amount;
        tokens[tokenId].totalSupply -= amount;
        emit Transfer(tokenId, msg.sender, address(0), amount);
    }

    function transfer(uint256 tokenId, address to, uint256 amount) external {
        require(balances[tokenId][msg.sender] >= amount, "Insufficient");
        balances[tokenId][msg.sender] -= amount;
        balances[tokenId][to] += amount;
        emit Transfer(tokenId, msg.sender, to, amount);
    }

    function approve(uint256 tokenId, address spender, uint256 amount) external {
        allowances[tokenId][msg.sender][spender] = amount;
        emit Approval(tokenId, msg.sender, spender, amount);
    }

    function transferFrom(uint256 tokenId, address from, address to, uint256 amount) external {
        require(balances[tokenId][from] >= amount, "Insufficient");
        require(allowances[tokenId][from][msg.sender] >= amount, "Not allowed");
        allowances[tokenId][from][msg.sender] -= amount;
        balances[tokenId][from] -= amount;
        balances[tokenId][to] += amount;
        emit Transfer(tokenId, from, to, amount);
    }

    // ─── Views ─────────────────────────────────────────────
    function balanceOf(uint256 tokenId, address owner) external view returns (uint256) {
        return balances[tokenId][owner];
    }

    function allowanceOf(uint256 tokenId, address owner, address spender) external view returns (uint256) {
        return allowances[tokenId][owner][spender];
    }

    function getAllTokens() external view returns (Token[] memory) {
        Token[] memory result = new Token[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            result[i] = tokens[i];
        }
        return result;
    }

    function getToken(uint256 tokenId) external view returns (Token memory) {
        return tokens[tokenId];
    }
}
