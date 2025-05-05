# PolkaVM CREATE2 Workaround

## Problem Statement
On Polkadot’s Westend Asset Hub (PolkaVM), **`CREATE2`** does not behave as on Ethereum and originally could not be used at all—every `CREATE2` attempt reverted. The vanilla `CREATE` opcode _can_ succeed, but only if you supply PolkaVM’s required existential deposit (ED) for the new contract, which is cumbersome to calculate and include on every deploy. This breaks deterministic, salt-based factory flows (e.g. ERC-6551 token-bound accounts) that work seamlessly on Ethereum and Arbitrum.

## Goals
1. **Analyze** the instantiation differences between PolkaVM and Ethereum/EVM-compatible chains.  
2. **Prototype** a workaround that lets you deploy and initialize token-bound account contracts using only `CREATE` + ED or, ideally, the new higher-level pattern.  
3. **Document** both the ad-hoc workaround we first built and the official, recommended PolkaVM pattern.  
4. **Provide** clear code examples, caveats, and migration steps for developers.

## Development Experience
- **On Ethereum / Arbitrum / Sepolia**  
  - Deployed `ERC6551AccountUpgradeable` + `ERC6551RegistryWithPredict` using OpenZeppelin’s `Clones.clone()` (via `CREATE`) and deterministic address prediction.  
  - All `createAccount()` → `account()` flows worked, with easy off-chain address prediction via RLP-nonce.

- **On PolkaVM Westend**  
  - **`CREATE`**: ✅ Works, but only if you include the chain’s existential deposit in `value`; tedious to compute and include for every call.  
  - **`CREATE2`**: ❌ Always reverted—no amount of gas or ED deposit makes it succeed.  
  - Simplest isolated `CREATE2` tests (no proxy) still reverted, proving native lack of support.

## What We Accomplished
- Verified that raw `CREATE` is functional with ED, but that using `CREATE2` directly was impossible.  
- Built a custom RLP-nonce prediction factory in Solidity that ran on EVM but still failed on PolkaVM for `CREATE2`.  [?!?]
- Identified that the root difference lies in PolkaVM’s pre-uploaded code model and salt-handling for deterministic instantiation.

---


## My CREATE ED-Free Factory Workaround

To spare every caller from calculating and attaching PolkaVM’s existential deposit (ED) on each `CREATE`, I consolidated all “clone” logic into a single on-chain hub that pays its own ED once at deployment. Callers simply interact with the hub’s methods—no more `value` juggling.

> **Key snippet** (only the essentials):
> ```solidity
> contract PolkaNFTHub is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ERC2981 {
>     // …hub’s constructor covers its ED…
>     function mint(uint256 collectionId, address to, string calldata uri) external payable {
>         // no ED logic here—hub already funded itself
>         _safeMint(to, globalTokenCounter++);
>         _setTokenURI(globalTokenCounter, uri);
>     }
> }
> ```

### Advantages
- **One-time ED payment.** The hub contract funds its own deposit at deployment.  
- **Simplified UX.** Callers just call `createCollection` or `mint` with normal ETH/token arguments—no ED math.  
- **Unified interface.** All collections/tokens live behind one address.

### Disadvantages
- **Monolithic code.** All factory logic (ERC721, ERC2981, enumerable, URI storage, etc.) lives in one large contract.  
- **Upgrade rigidity.** You must redeploy the hub to change any part of the logic.  
- **Gas overhead.** The hub’s bytecode is much larger than minimal proxies or per-instantiation clones.

---

### PolkaVM Native CREATE2-Style Instantiation

PolkaVM now lets you deploy contracts deterministically using the Solidity `new` syntax with a `salt`:

```solidity
MyContract instance = new MyContract{ salt: MY_SALT }(/* constructor args */);
```

Standard ED handling. Callers attach the usual existential deposit via value.

Deterministic addresses. Computed from deployer, salt and pre-registered code hash—no assembly or byte-order hacks.

Lean transactions. Only the code hash is referenced in the TX payload, not the full creation bytecode.


See More on This Below:

## Official Parity-Recommended Pattern

### 1. Use `new` with `salt:` Instead of Low-Level Opcodes
PolkaVM now lets you write:
```solidity
MyContract instance = new MyContract{ salt: MY_SALT }(/* constructor args */);
```
No manual CREATE2.

No on-chain RLP calculations.

Lower gas & ED requirements, since the code is already registered.

### 2. Pre-Upload Your Bytecode
Register each implementation’s bytecode once (via the system precompile).

Subsequent new instantiations reference only the code hash, not the full .creationCode.

Avoids bundling megabytes into each transaction and respects PolkaVM’s deploy-size limits.

### 3. Drop Runtime Code-Stitching
On Ethereum, some libraries dynamically build creation bytecode off-chain.

On PolkaVM, constructors run directly on-chain; you no longer need to generate bytecode manually.

### 4. Simplify Address Determination
Off-chain: Compute address = hash(deployer, salt, codeHash) if you must predict.

On-chain: new returns the deployed address directly—no prediction required.

## Assembly Caveat (If You Really Must)
Salt endianness: Parity once had a bug reversing salt bytes—check contract-issues#45.

Use code-hash, not .creationCode: In assembly, pass the hash of the pre-uploaded code.

Example:
```bytes32 codeHash = /* your registered code hash */;
assembly {
  let addr := create2(0, add(codeHash, 0), 32, SALT)
  if iszero(extcodesize(addr)) { revert(0, 0) }
}
```

# Migration Checklist
 Replace all Clones.clone() / low-level CREATE2 calls with new Contract{ salt: … }(...).

 Pre-upload your implementation bytecode and record its code hash.

 Remove RLP-nonce prediction helpers—they’re no longer needed.

 Audit any off-chain creation-code assembly and strip it in favor of on-chain constructors.

 Update docs per paritytech/contract-docs#70.

 Sources:
 https://github.com/paritytech/contract-issues/issues/45
 https://github.com/paritytech/contract-docs/issues/70