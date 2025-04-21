// scripts/view_minted_nft.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const RPC_URL   = process.env.RPC_URL    || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID  = 420420421;
  const PK        = process.env.PRIVATE_KEY;
  const CONTRACT  = '0x51ec89cfee02cbe9fc3e1ca0085445d326151134';
  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet   = new ethers.Wallet(PK, provider);

  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
    "function tokenURI(uint256) view returns (string)"
  ];
  const nft = new ethers.Contract(CONTRACT, abi, provider);

  const owner = wallet.address;
  const balanceRaw = await nft.balanceOf(owner);
  const balance = BigInt(balanceRaw);
  console.log(`📦 ${owner} owns ${balance} token(s)`);

  for (let i = 0n; i < balance; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(owner, i);
    const uri     = await nft.tokenURI(tokenId);
    console.log(`  • #${tokenId.toString()} → ${uri}`);
  }
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
