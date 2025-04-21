// scripts/create_token.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const [ , , name, symbol, decimalsArg, initialSupplyArg, maxSupplyArg ] = process.argv;

  if (!name || !symbol || !decimalsArg || !initialSupplyArg || !maxSupplyArg) {
    console.error("Usage: node create_token.js <name> <symbol> <decimals> <initialSupply> <maxSupply>");
    process.exit(1);
  }

  const RPC_URL  = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID = 420420421;
  const PK       = process.env.PRIVATE_KEY;
  const CONTRACT = '0xcc0927037e6b78cf9e9b647f34a1313252394860';
  const ABI_PATH = './abi/PolkaTokenHub.json';

  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  const decimals = parseInt(decimalsArg);
  const initialSupply = ethers.parseUnits(initialSupplyArg, decimals);
  const maxSupply = ethers.parseUnits(maxSupplyArg, decimals);

  console.log("👤 Creating token with:", wallet.address);
  console.log(`🔧 Params → name: ${name}, symbol: ${symbol}, decimals: ${decimals}, initial: ${initialSupplyArg}, max: ${maxSupplyArg}`);

  try {
    const tx = await hub.createToken(name, symbol, decimals, initialSupply, maxSupply);
    console.log("📝 tx hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Token created in block", receipt.blockNumber);

    const ev = receipt.logs
      .map(log => {
        try {
          return hub.interface.parseLog(log);
        } catch { return null; }
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
