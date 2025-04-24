require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// ───── Setup ─────
const RPC_URL  = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
const CHAIN_ID = 420420421;
const PK       = process.env.PRIVATE_KEY;
const CONTRACT = '0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d';
const ABI_PATH = 'PolkaNFTHub3.json';

async function main() {
  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi      = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet   = new ethers.Wallet(PK, provider);
  const hub      = new ethers.Contract(CONTRACT, abi, wallet);

  // Only collection #0
  const collectionIndex = 0;
  console.log(`🔍 Querying NFTs in collection #${collectionIndex}\n`);

  // Fetch all token IDs in collection 0
  const tokenIds = await hub.getTokensInCollection(collectionIndex);
  if (tokenIds.length === 0) {
    console.log('No tokens found in collection #0');
    return;
  }

  // For each token, fetch owner, name, and URI
  for (const tokenId of tokenIds) {
    const [owner, name, uri] = await Promise.all([
      hub.ownerOf(tokenId),
      hub.getTokenName(tokenId),
      hub.tokenURI(tokenId)
    ]);

    console.log(`— tokenId ${tokenId}`);
    console.log(`    Owner: ${owner}`);
    console.log(`    Name:  "${name}"`);
    console.log(`    URI:   ${uri}\n`);
  }
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
