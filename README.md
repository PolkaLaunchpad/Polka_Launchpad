# Polka Launchpad: EVM Contract Driven Dapp on Polkadot Westend Asset Hub

## Overview

Polka Launchpad is a full-stack dApp for creating, managing, and trading ERC-20 tokens and NFT collections on Polkadot's Westend Asset Hub. This project demonstrates how to build and deploy EVM-compatible contracts on Polkadot's parachain infrastructure, showcasing a unique approach to contract factories without relying on CREATE2.


### Key Features

- **Token Creation**: Deploy your own ERC-20 tokens with customizable parameters  
- **NFT Collection Management**: Create and manage NFT collections with royalty support  
- **Token Management**: Mint and burn tokens as the token creator  
- **NFT Minting**: Mint NFTs to collections you own  
- **Trading Interface**: Buy and sell tokens with an intuitive UI  
- **My Creations Dashboard**: View and manage all your created tokens and collections


## Development Experience on Polkadot Westend Asset Hub

### The PolkaVM Difference

Developing on Polkadot's Westend Asset Hub (PolkaVM) presents unique challenges and opportunities compared to traditional EVM chains like Ethereum or Arbitrum:

1. **Existential Deposit (ED)**: PolkaVM requires an existential deposit for contract creation - extending to CREATE and CREATE2, which is not present in Ethereum and makes gas optimization problems very different and in need of a unique evaluation.
2. **CREATE2 Limitations**: The CREATE2 opcode doesn't behave as expected on PolkaVM, breaking deterministic deployment patterns  
3. **Pre-uploaded Code Model**: PolkaVM uses a pre-uploaded code model for contract deployment  
4. **Gas Mechanics**: Different gas pricing and mechanics compared to Ethereum


### Our Factory Hub Workaround

To overcome these challenges, we implemented a "Contract Hub" pattern instead of using traditional CREATE factory patterns:

\`\`\`solidity
contract PolkaTokenHub {
    // Hub pays its own ED once at deployment
    constructor() {
        // Initialize hub state
    }
    
    // Users interact with factory methods without ED concerns
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals, 
        uint256 initialSupply,
        uint256 maxSupply
    ) external returns (uint256) {
        // Create token without requiring caller to calculate ED
        // Return tokenId that can be used to reference this token
    }
    
    // Token management functions
    function mint(uint256 tokenId, address to, uint256 amount) external {
        // Mint tokens to address
    }
    
    function burn(uint256 tokenId, uint256 amount) external {
        // Burn tokens
    }
}
\`\`\`

This approach offers several advantages and disavantages:

### Disadvantages

- **Monolithic code.** All factory logic (ERC-721, ERC-2981, enumerable, URI storage, etc.) lives in one large contract.  
- **Upgrade rigidity.** You must redeploy the entire hub to change any part of the logic.  
- **Gas overhead.** The hub’s bytecode is much larger than minimal proxies or per-instantiation clones.  
- **Single point of failure.** A bug in the hub contract affects every token and collection it manages.  
- **Limited isolation.** All collections share the same storage space and address namespace, increasing the blast radius of configuration errors.  
- **Reduced composability.** Integrating external tooling or modules often requires hub-level changes rather than per-token upgrades.

### Advantages

- **One-time ED payment.** The hub contract funds its own existential deposit at deployment rather than requiring it per-spawned contract.  
- **Simplified UX.** Callers just invoke `createCollection` or `mint` with normal ETH/token arguments—no existential-deposit math.  
- **Unified interface.** All collections and tokens live behind a single, known address, streamlining discovery and integration.  
- **ED gas savings.** By avoiding a per-contract ED for every new collection or token, gas costs are dramatically reduced, unlocking high-volume deployment use-cases that aren’t economical on normal EVM chains.  
- **Factory extensibility.** New token or collection types can be added via hub upgrades or extensions without redeploying every individual contract.  
- **Simpler tooling.** Indexers, UIs, and analytics only need to watch one hub address instead of an open-ended number of factories.

The key takeaway is that by centralizing existential‐deposit payments in a single hub contract and leveraging PolkaVM’s built-in `new …{ salt: … }` deployment syntax, we shift the balance away from traditional EVM patterns. Avoiding per-instance ED payments—required by normal `CREATE`—dramatically reduces gas fees for mass deployments and opens the door to new factory-centric models. Although our CREATE2 workaround didn’t pan out, PolkaVM’s deterministic addresses (computed from deployer, salt, and pre-registered code hash) remove the need for low-level assembly or byte-order hacks, yielding more robust and predictable deployments.

### 1. Use `new` with `salt:` Instead of Low-Level Opcodes

PolkaVM now lets you write:
```solidity
MyContract instance = new MyContract{ salt: MY_SALT }(/* constructor args */);
```
These key differences in ED handling and address derivation drive new optimization strategies and best practices tailored to Polkadot’s EVM environment.

## Performance & Cost Analysis

### Transaction Costs

| Operation                        | Cost (WND) | Confirmation Time | Notes                       |
|----------------------------------|------------|-------------------|-----------------------------|
| Creating an NFT collection       | 0.0578     | ~1 seconds        | One-time cost per collection|
| Creating ERC-20 token            | 0.0585     | ~1 seconds        | One-time cost per token     |
| Minting an NFT to a collection   | 0.1106     | ~3 seconds        | Cost per NFT                |
| Minting new ERC-20 tokens        | 0.0303     | ~2 seconds        | Cost varies with amount     |
| Burning ERC-20 tokens            | 0.0300     | ~2 seconds        | Cost varies with amount     |

### Performance Observations

- **Transaction Confirmation**: Typically 1–4 seconds, significantly faster than Ethereum mainnet  
- **UI Responsiveness**: Mostly instant, NFTs appear in collections within few seconds of minting  
- **Contract Interactions**: Smooth and reliable with proper error handling  
- **Gas Estimation**: More predictable than Ethereum, less variance during network congestion

### Comparison with Ethereum Mainnet

| Metric                   | Polkadot Westend Asset Hub | Ethereum Mainnet        | Advantage    |
|--------------------------|----------------------------|-------------------------|--------------|
| Transaction Cost         | ~0.03–0.11 WND             | Variable, often >$5–20  | PolkaVM      |
| Confirmation Time        | 1–8 seconds                | 12–60+ seconds          | PolkaVM      |
| Contract Deployment      | Requires ED, no CREATE2    | Supports all opcodes    | Ethereum     |
| Gas Predictability       | Highly predictable         | Variable with load      | PolkaVM      |
| Developer Experience     | Learning curve with ED     | Well-documented         | Ethereum     |

## Technical Implementation

### Contract Architecture

Our solution uses two main hub contracts:

1. **PolkaTokenHub**: Factory for ERC-20 tokens with management functions  
   - Creates tokens with custom parameters  
   - Manages minting and burning  
   - Tracks all created tokens

2. **PolkaNFTHub**: Factory for NFT collections with ERC-721 support  
   - Creates collections with royalty settings  
   - Manages minting NFTs to collections  
   - Implements ERC-2981 for royalties


### Frontend Integration

The frontend is built with Next.js and ethers.js, providing:

- Wallet connection via Web3Modal  
- Token and collection creation forms  
- Management interfaces for token creators  
- Trading interfaces for all users  
- Responsive design for all devices

## Setup and Usage

### Prerequisites

- Node.js 16+  
- Yarn or npm  
- MetaMask or compatible wallet

### Environment Variables

```plaintext
RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io
CONTRACT_ADDRESS=0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d
NEXT_PUBLIC_NFT_HUB_ADDRESS=0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d
TOKEN_CONTRACT=0xcc0927037e6b78cf9e9b647f34a1313252394860
NEXT_PUBLIC_TOKEN_HUB_ADDRESS=0xcc0927037e6b78cf9e9b647f34a1313252394860
```

### Installation

```shell
# Clone the repository
git clone https://github.com/yourusername/polka-launchpad.git
cd polka-launchpad

# Install dependencies
npm install

# Start development server
npm run dev
```


### Connecting to Westend Asset Hub

1. Add Westend Asset Hub to MetaMask:  
   - **Network Name**: Westend Asset Hub  
   - **RPC URL**: https://westend-asset-hub-eth-rpc.polkadot.io  
   - **Chain ID**: 420420421  
   - **Currency Symbol**: WND  

2. Get testnet WND from the faucet (link to faucet)  
3. Connect your wallet to the dApp


### Creating a Token

1. Navigate to the **Create** page  
2. Select **Create Token (ERC-20)**  
3. Fill in token details:  
   - Name  
   - Symbol  
   - Decimals  
   - Initial Supply  
   - Max Supply  

4. Click **Create Token**  
5. Confirm the transaction in your wallet


### Creating an NFT Collection

1. Navigate to the **Create** page  
2. Select **Create NFT Collection**  
3. Fill in collection details:  
   - Name  
   - Mint Price  
   - Max Supply  
   - Royalty Receiver  
   - Royalty Percentage  

4. Click **Create Collection**  
5. Confirm the transaction in your wallet

## Results

### NFT Contract:
NFT Collection Creation:
| Gas Fee (WND) |
| ------------: |
|         0.043 |
|         0.043 |
|         0.158 |
|         0.158 |
|         0.158 |
Average: 0.112

Minting to Collection:
|       Gas Fee (WND) |
| ------------------: |
|              0.0742 |
|              0.0742 |
|               0.294 |
|               0.296 |
|               0.296 |
|               0.296 |
Average: 0.2217

### Token Contract:
Create Token:
|       Gas Fee (WND) |
| ------------------: |
|              0.0572 |
|              0.0572 |
|              0.0338 |
|              0.0338 |
|              0.1500 |
|              0.1500 |
|              0.1500 |
**Average:** 0.0903

Mint/Burn Token:
|       Gas Fee (WND) |
| ------------------: |
|              0.0213 |
|              0.0237 |
|              0.0237 |
|              0.0213 |
|              0.0813 |
|              0.0843 |
|              0.0843 |
**Average:** 0.0486

need to optimise then compare to same txn's using CREATE

## Lessons Learned & Best Practices

### Working with PolkaVM

1. **Existential Deposit Management**:  
   - Use hub contracts to abstract away ED requirements from users  
   - Calculate ED correctly when deploying new contracts  

2. **CREATE2 Alternatives**:  
   - Use the hub pattern for deterministic references  
   - If using newer PolkaVM versions, leverage the `new Contract{ salt: MY_SALT }()` syntax  

3. **Gas Optimization**:  
   - Pre-upload bytecode when possible  
   - Avoid complex on-chain calculations  
   - Batch operations when appropriate  

4. **Error Handling**:  
   - Implement robust error handling for contract interactions  
   - Provide clear error messages to users

## Future Improvements

1. **Upgradeable Contracts**: Implement proxy patterns for upgradeable hubs  
2. **Batch Operations**: Add support for batch minting and transfers  
3. **Advanced Analytics**: Implement token and collection analytics  
4. **Governance Features**: Add DAO-like governance for token communities  
5. **Cross-Chain Integration**: Explore bridging to other Polkadot parachains  
6. **IPFS Metadata Flexibility**: Modify the NFT contract to accept IPFS metadata URLs that contain images (not strictly require direct IPFS image URLs)  
7. **Multi-Token Purchases**: Allow NFT collections to be purchased with any ERC-20 token as the payment currency  
8. **UI Trading Actions**: Add “purchase”, “sell”, and “burn” implementations into the UI for both ERC-20 tokens and NFTs  
9. **Developer CLI**: Finish a CLI tool for developers that supports all core operations (create, mint, burn, trade) plus mass NFT minting from a CSV/JSON/TXT list of IPFS images & metadata  
10. **Featured Listings**: Add the ability for creators to pay to have their token or collection featured in the marketplace  
11. **Real-Time Market Data**: Replace placeholder token stats with live data: 24 h volume, market cap, displayed price, price chart, and trading history  
12. **Generalized Marketplace**: Refactor the marketplace to support arbitrary token and NFT contracts, not just the built-in hubs  



ERC-721: NFT and NFT Collection 'Minter' Contract:
0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d

ERC-20: Coin 'Minter' Contract:
0xcc0927037e6b78cf9e9b647f34a1313252394860

TODO:
Move to Production Build and make further MVP advancements from there.


Modify NFT contact to be compatible with IPFS metadata URL's containing images, and not strictly require IPFS image URL's.
Allow NFT collections to be created with any ERC20 token as the purchasing currency.
ADD CREATE IMPLEMENTATIONS FOR:
- Add purchase, sell, burn implementation into UI for Tokens and NFT's
- Finish CLI for dev's to do all operations above + mass NFT mint from a CSV/JSON/TXT of IPFS Images & Metadata
- Add ability to pay for your token/collection to be 'featured'
- Replace Placeholder token data with real:
24h Volume
Market Cap
Displayed Price
Price Chart
Trading History

Make marketplace more general? Not just for my specific contracts?


ERC20 contract:
0xcc0927037e6b78cf9e9b647f34a1313252394860

ERC721 contract:
0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d

# Development Experience

We kind of felt like PolkaVM wasn’t “just another EVM” – we found ourselves often researching underlying mechanics, evaluating and sometimes rethinking traditional practises, a specific case being how we do things once we hit that existential‐deposit requirement and the odd CREATE2 behavior.

ED headaches
We thought having users pay WND up front for every little contract would be a drag, so we built a single “hub” that covers its own ED and then spawns tokens or collections on demand. We noticed it cut per-instance costs way down and made the front end feel a bit simpler.

Salted deployments
We discovered that the usual CREATE2 tricks didn’t behave the way we expected under Westend’s executor. Instead of wading through low-level assembly, we just leaned into the native

```solidity
new MyContract{ salt: … }(...)
```
syntax – which, oddly enough, felt more reliable once we got over the surprise.

Toolchain quirks
We grabbed Hardhat + Ethers.js for our main tests, bounced over to Remix for those “oh snap” moments, and hooked SubQuery + Cursor into a CI script to watch our on-chain stuff on Westend. We ran some quick scripts to gauge gas (around 0.03–0.11 WND per op) and then tweaked a few things based on what felt worth the effort.

UX surprises
We thought Web3Modal + Next.js + Ethers.js would cover us, but the real challenge was wrapping clear error messages around ED failures and smoothing out mint/burn flows so nobody has to do any math in their head.

All told, we felt like we turned a bunch of PolkaVM quirks into… well, features? Or at least less painful hurdles. Building the hub pattern definitely taught us to work with PolkaVM’s oddities instead of fighting them.