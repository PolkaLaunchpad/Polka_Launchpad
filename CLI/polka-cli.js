require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const RPC_URL     = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
const CHAIN_ID    = 420420421;
const PK          = process.env.PRIVATE_KEY;
const CONTRACT    = '0xcc0927037e6b78cf9e9b647f34a1313252394860';
const ABI_PATH    = path.join(__dirname, '../abi/PolkaTokenHub.json');

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

async function createToken(name, symbol, decimals, initial, max) {
  const initialSupply = ethers.parseUnits(initial, decimals);
  const maxSupply     = ethers.parseUnits(max, decimals);

  console.log(`🚀 Creating ${name} (${symbol}) with ${initial}/${max} supply`);
  const tx = await hub.createToken(name, symbol, decimals, initialSupply, maxSupply);
  const receipt = await tx.wait();
  console.log("✅ Token created in block", receipt.blockNumber);
  console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
}

async function queryTokens() {
  const tokens = await hub.getAllTokens();
  console.log(`📦 Found ${tokens.length} tokens\n`);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    console.log(`— Token #${i}`);
    console.log(`  Name:     ${t.name}`);
    console.log(`  Symbol:   ${t.symbol}`);
    console.log(`  Decimals: ${t.decimals}`);
    console.log(`  Supply:   ${ethers.formatUnits(t.totalSupply, t.decimals)}/${ethers.formatUnits(t.maxSupply, t.decimals)}`);
    console.log(`  Creator:  ${t.creator}\n`);
  }
}

async function mint(tokenId, to, amount) {
  const decimals = (await hub.getToken(tokenId)).decimals;
  const amt = ethers.parseUnits(amount, decimals);
  const tx = await hub.mint(tokenId, to, amt);
  const receipt = await tx.wait();
  console.log(`✅ Minted ${amount} to ${to} (block ${receipt.blockNumber})`);
}

async function burn(tokenId, amount) {
  const decimals = (await hub.getToken(tokenId)).decimals;
  const amt = ethers.parseUnits(amount, decimals);
  const tx = await hub.burn(tokenId, amt);
  const receipt = await tx.wait();
  console.log(`🔥 Burned ${amount} tokens (block ${receipt.blockNumber})`);
}

async function main() {
  const [ , , cmd, ...args ] = process.argv;

  switch (cmd) {
    case 'create':
      await createToken(...args);
      break;
    case 'query':
      await queryTokens();
      break;
    case 'mint':
      await mint(...args);
      break;
    case 'burn':
      await burn(...args);
      break;
    default:
      console.log(`❓ Unknown command: ${cmd}`);
      console.log(`Usage:
  node polka-cli.js create <name> <symbol> <decimals> <initial> <max>
  node polka-cli.js query
  node polka-cli.js mint <tokenId> <to> <amount>
  node polka-cli.js burn <tokenId> <amount>`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error("❌ Fatal:", err);
    process.exit(1);
  });
}

module.exports = {
  createToken,
  queryTokens,
  mint,
  burn
};
