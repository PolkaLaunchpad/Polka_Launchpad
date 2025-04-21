// scripts/mint_via_ethers.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // ───────── CONFIG ─────────
  const RPC_URL    = process.env.RPC_URL    || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID   = 420420421;
  const PK         = process.env.PRIVATE_KEY;
  const CONTRACT   = '0x51ec89cfee02cbe9fc3e1ca0085445d326151134';
  const IPFS_HASH  = process.env.IPFS_HASH;
  if (!PK || !IPFS_HASH) {
    console.error("⚠️  please set PRIVATE_KEY and IPFS_HASH in .env");
    process.exit(1);
  }
  const URI = `https://gateway.pinata.cloud/ipfs/${IPFS_HASH}`;

  // ───────── SETUP ──────────
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet   = new ethers.Wallet(PK, provider);

  const abi = [
    "function owner() view returns(address)",
    "function nextTokenId() view returns(uint256)",
    "function mintPrice() view returns(uint256)",
    "function mint(uint256,string) payable"
  ];
  const nft = new ethers.Contract(CONTRACT, abi, wallet);

  console.log("👤 Minting with:", wallet.address);
  console.log("👑 Contract owner:", await nft.owner());

  // (info only)
  const nextIdRaw = await nft.nextTokenId();
  const nextId    = BigInt(nextIdRaw);              
  console.log("▶️ nextTokenId (info):", nextId.toString());

  const mintPriceRaw = await nft.mintPrice();
  const mintPriceWei = BigInt(mintPriceRaw);        
  const balanceWei   = BigInt(await provider.getBalance(wallet.address));
  console.log("💰 mintPrice:", ethers.formatEther(mintPriceWei), "WND each");
  console.log("⛽ WND balance:", ethers.formatEther(balanceWei));

  if (balanceWei < mintPriceWei) {
    console.warn("⚠️  Low balance for fees/mint, top up via faucet.");
  }

  // ───────── SEND TX ─────────
  console.log(`🚀 mint(1, "${URI}") → sending…`);
  const tx = await nft.mint(1, URI, {
    value: mintPriceWei
  });

  console.log("📝 tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Included in block", receipt.blockNumber);
  console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
