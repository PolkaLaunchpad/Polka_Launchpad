// scripts/create_collection.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // ───────── CONFIG (hard‑coded) ─────────
  const RPC_URL          = process.env.RPC_URL    || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID         = 420420421;
  const PK               = process.env.PRIVATE_KEY;
  const HUB_ADDRESS      = '0xf888d17f319D48B53daFbB734954548832951836'; // HUB CONTRACT IS: 0x785c3994c3a526e0f2458631a40e0fbb70ca104f
  // your four parameters:
  const MINT_PRICE_WND   = "0.01";  // in WND
  const MAX_SUPPLY       = 100n;    // as BigInt
  const ROYALTY_RECEIVER = '0x1fF116257e646b6C0220a049e893e81DE87fc475';
  const ROYALTY_BP       = 250;     // basis points

  if (!PK) {
    console.error("⚠️  please set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  // ───────── SETUP ethers ─────────
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name:    'asset-hub-westend'
  });
  const wallet = new ethers.Wallet(PK, provider);

  // exact ABI fragment for createCollection
  const hubAbi = [
    "function owner() view returns(address)",
    "function createCollection(uint256,uint256,address,uint96) returns (uint256)",
    "event CollectionCreated(uint256 indexed collectionId, address indexed creator, uint256 mintPrice, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBP)"
  ];
  const hub = new ethers.Contract(HUB_ADDRESS, hubAbi, wallet);

  console.log("👤 createCollection with:", wallet.address);
  console.log("👑 hub owner:", await hub.owner());

  // parse mintPrice into wei
  const mintPriceWei = ethers.parseEther(MINT_PRICE_WND);

  // dispatch
  console.log(`🚀 sending createCollection(${MINT_PRICE_WND} WND, ${MAX_SUPPLY}, ${ROYALTY_RECEIVER}, ${ROYALTY_BP})`);
  const tx = await hub.createCollection(
    mintPriceWei,
    MAX_SUPPLY,
    ROYALTY_RECEIVER,
    ROYALTY_BP
  );
  console.log("📝 tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Included in block", receipt.blockNumber);

  // pull the CollectionCreated event
  const ev = receipt.events?.find(e => e.event === "CollectionCreated");
  if (ev && ev.args) {
    console.log("🚀 New collection ID =", ev.args.collectionId.toString());
  } else {
    console.warn("⚠️ CollectionCreated event not found in logs");
  }

  console.log(`🔍 https://assethub-westend.subscan.io/evm/${HUB_ADDRESS}/tx/${tx.hash}`);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
