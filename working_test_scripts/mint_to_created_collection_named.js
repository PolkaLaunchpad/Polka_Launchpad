// scripts/mint_named_nft.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const [ , , collectionIdArg, to, name, ipfsHash ] = process.argv;
  if (!collectionIdArg || !to || !name || !ipfsHash) {
    console.error("Usage: node mint_named_nft.js <collectionId> <to> <name> <ipfsHash>");
    process.exit(1);
  }

  const RPC_URL  = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID = 420420421;
  const PK       = process.env.PRIVATE_KEY;
  const CONTRACT = '0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d';
  const ABI_PATH = './abi/PolkaNFTHub3.json';

  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const collectionId = BigInt(collectionIdArg);
  const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  const abi = JSON.parse(fs.readFileSync(ABI_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'asset-hub-westend'
  });
  const wallet = new ethers.Wallet(PK, provider);
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  console.log("👤 minting with:", wallet.address);
  console.log("👑 hub owner:", await hub.owner());

  // fetch the collection's parameters
  const col = await hub.getCollection(collectionId);
  const mintPriceWei = BigInt(col.mintPrice);
  console.log(`▶️ collection #${collectionId} mintPrice =`, ethers.formatEther(mintPriceWei), "WND");

  const balance = BigInt(await provider.getBalance(wallet.address));
  console.log("⛽ your WND balance:", ethers.formatEther(balance));
  if (balance < mintPriceWei) {
    console.warn("⚠️ Low balance—top up via faucet");
    process.exit(1);
  }

  console.log(`🚀 mint(${collectionId}, "${to}", "${name}", "${uri}") → sending…`);
  const tx = await hub.mint(collectionId, to, name, uri, { value: mintPriceWei });
  console.log("📝 tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Minted in block", receipt.blockNumber);
  console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
