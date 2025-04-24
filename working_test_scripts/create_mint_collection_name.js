// scripts/create_named_collection.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const RPC_URL     = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID    = 420420421;
  const PK          = process.env.PRIVATE_KEY;
  const HUB_ADDRESS = '0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d';
  const ABI_PATH    = '../src/lib/abi/PolkaNFTHub3.json';

  const MINT_PRICE_WND   = "0.01";
  const MAX_SUPPLY       = 100n;
  const ROYALTY_RECEIVER = '0x1fF116257e646b6C0220a049e893e81DE87fc475';
  const ROYALTY_BP       = 250;
  const COLLECTION_NAME  = "Test01";

  if (!PK) {
    console.error("⚠️  please set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'asset-hub-westend'
  });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(HUB_ADDRESS, abi, wallet);

  console.log("👤 createCollection with:", wallet.address);
  console.log("👑 hub owner:", await hub.owner());

  const mintPriceWei = ethers.parseEther(MINT_PRICE_WND);

  console.log(`🚀 sending createCollection("${COLLECTION_NAME}", ${MINT_PRICE_WND} WND, ${MAX_SUPPLY}, ${ROYALTY_RECEIVER}, ${ROYALTY_BP})`);
  const tx = await hub.createCollection(
    COLLECTION_NAME,
    mintPriceWei,
    MAX_SUPPLY,
    ROYALTY_RECEIVER,
    ROYALTY_BP
  );

  console.log("📝 tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Included in block", receipt.blockNumber);

  const ev = receipt.events?.find(e => e.event === "CollectionCreated");
  if (ev && ev.args) {
    console.log("🎉 New collection ID =", ev.args.collectionId.toString());
    console.log("🖼️ Name:", COLLECTION_NAME);
  } else {
    console.warn("⚠️ CollectionCreated event not found in logs");
  }

  console.log(`🔍 https://assethub-westend.subscan.io/evm/${HUB_ADDRESS}/tx/${tx.hash}`);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
