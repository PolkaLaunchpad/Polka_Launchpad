const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const [
    , ,
    name,
    symbol,
    decimalsArg,
    initialSupplyArg,
    maxSupplyArg,
    pkArg
  ] = process.argv;

  if (![name, symbol, decimalsArg, initialSupplyArg, maxSupplyArg, pkArg].every(x => x)) {
    console.error(
      "Usage: node create_erc20.js <name> <symbol> <decimals> <initialSupply> <maxSupply> <private_key_or_env_var_name>"
    );
    process.exit(1);
  }

  // now this WILL pick up PRIVATE_KEY from ../.env
  let candidate = process.env[pkArg] || pkArg;

  if (candidate.startsWith('0x')) candidate = candidate.slice(2);
  if (!/^[0-9a-fA-F]{64}$/.test(candidate)) {
    console.error(
      "⚠️  Invalid private key. Make sure you either:\n" +
      "   • Passed a raw 0x-prefixed 64-hex-char key, or\n" +
      "   • Passed the name of an env-var (e.g. MY_KEY) whose value is a valid 0x-hex-key\n" +
      `   You passed: "${pkArg}" → "${candidate}"`
    );
    process.exit(1);
  }
  const PK = '0x' + candidate;

  const RPC_URL  = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID = 420420421;
  const CONTRACT = '0xcc0927037e6b78cf9e9b647f34a1313252394860';
  const ABI_PATH = '../src/lib/abi/PolkaTokenHub.json';

  const abi = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'asset-hub-westend'
  });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  const decimals      = parseInt(decimalsArg, 10);
  const initialSupply = ethers.parseUnits(initialSupplyArg, decimals);
  const maxSupply     = ethers.parseUnits(maxSupplyArg, decimals);

  console.log("👤 Creating token with:", wallet.address);
  console.log(
    `🔧 Params → name: ${name}, symbol: ${symbol}, decimals: ${decimals}, ` +
    `initial: ${initialSupplyArg}, max: ${maxSupplyArg}`
  );

  try {
    const tx = await hub.createToken(name, symbol, decimals, initialSupply, maxSupply);
    console.log("📝 tx hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Token created in block", receipt.blockNumber);

    const ev = receipt.logs
      .map(log => {
        try { return hub.interface.parseLog(log); }
        catch { return null; }
      })
      .find(parsed => parsed && parsed.name === "TokenCreated");

    if (ev) {
      console.log(`🎉 Created token ID #${ev.args.tokenId} by ${ev.args.creator}`);
    } else {
      console.warn("⚠️  No TokenCreated event found in logs — check manually.");
    }

    console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
  } catch (err) {
    console.error("❌ Failed to create token:", err.message || err);
  }
}

main();
