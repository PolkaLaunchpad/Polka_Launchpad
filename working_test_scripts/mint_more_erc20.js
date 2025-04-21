// scripts/mint_token.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const [ , , tokenIdArg, to, amountArg ] = process.argv;
  if (!tokenIdArg || !to || !amountArg) {
    console.error("Usage: node mint_token.js <tokenId> <to> <amount>");
    process.exit(1);
  }

  const tokenId = BigInt(tokenIdArg);
  const amount = BigInt(amountArg);

  const RPC_URL = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID = 420420421;
  const PK = process.env.PRIVATE_KEY;
  const CONTRACT = '0xcc0927037e6b78cf9e9b647f34a1313252394860';
  const ABI_PATH = './abi/PolkaTokenHub.json';

  if (!PK) {
    console.error("⚠️ Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  try {
    const tx = await hub.mint(tokenId, to, amount);
    console.log("📝 tx hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Minted in block", receipt.blockNumber);
    console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
  } catch (err) {
    console.error("❌ Mint failed:", err.message || err);
  }
}

main();
