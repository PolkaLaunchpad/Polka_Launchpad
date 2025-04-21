// view_token_uri.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // ─── CONFIG ─────────────────────────────────────────
  const RPC     = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN   = { chainId: 420420421, name: 'asset-hub-westend' };
  const CONTRACT= '0x51ec89cfee02cbe9fc3e1ca0085445d326151134';
  const provider = new ethers.JsonRpcProvider(RPC, CHAIN);

  // ─── ATTACH ABI & CONTRACT ──────────────────────────
  const abi = [ "function tokenURI(uint256) view returns (string)" ];
  const nft = new ethers.Contract(CONTRACT, abi, provider);

  // ─── READ TOKEN URI ──────────────────────────────────
  const uri = await nft.tokenURI(0);
  console.log("tokenURI(0) =", uri);
}

main().catch(console.error);
