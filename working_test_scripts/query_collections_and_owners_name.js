require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// ───── Setup ─────
const RPC_URL     = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
const CHAIN_ID    = 420420421;
const PK          = process.env.PRIVATE_KEY;
const CONTRACT    = '0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d'; // Updated contract address
const ABI_PATH    = 'PolkaNFTHub3.json'; // ABI for contract with named collections/NFTs

async function main() {
  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'asset-hub-westend'
  });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  const collectionCount = Number(await hub.collectionCount());
  console.log(`📦 Found ${collectionCount} collections\n`);

  for (let i = 0; i < collectionCount; i++) {
    const c = await hub.getCollection(i);
    console.log(`— Collection #${i} (${c.name})`);
    console.log(`  Creator:  ${c.creator}`);
    console.log(`  Price:    ${ethers.formatEther(c.mintPrice)} WND`);
    console.log(`  Supply:   ${c.minted}/${c.maxSupply}`);
    console.log(`  Royalty:  ${c.royaltyBP} BP to ${c.royaltyReceiver}`);

    const tokenIds = await hub.getTokensInCollection(i);
    console.log(`  Tokens:`);

    for (const tokenId of tokenIds) {
      const owner = await hub.ownerOf(tokenId);
      const name  = await hub.getTokenName(tokenId);
      const uri   = await hub.tokenURI(tokenId);
      console.log(`   - tokenId ${tokenId} "${name}" → ${owner}`);
      console.log(`     ↳ URI: ${uri}`);
    }

    console.log('');
  }
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
