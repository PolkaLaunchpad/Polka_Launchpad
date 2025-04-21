// scripts/query_tokens.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// ───── Config ─────
const RPC_URL     = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
const CHAIN_ID    = 420420421;
const PK          = process.env.PRIVATE_KEY;
const CONTRACT    = '0xcc0927037e6b78cf9e9b647f34a1313252394860'; // Your PolkaTokenHub address
const ABI_PATH    = './abi/PolkaTokenHub.json';

async function main() {
  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet   = new ethers.Wallet(PK, provider);
  const hub      = new ethers.Contract(CONTRACT, abi, wallet);

  const tokens = await hub.getAllTokens();
  console.log(`📦 Found ${tokens.length} tokens\n`);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    console.log(`— Token #${i}`);
    console.log(`  Name:         ${t.name}`);
    console.log(`  Symbol:       ${t.symbol}`);
    console.log(`  Decimals:     ${t.decimals}`);
    console.log(`  TotalSupply:  ${ethers.formatUnits(t.totalSupply, t.decimals)}`);
    console.log(`  MaxSupply:    ${ethers.formatUnits(t.maxSupply, t.decimals)}`);
    console.log(`  Creator:      ${t.creator}`);
    console.log('');
  }
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
