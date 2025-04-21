// scripts/mint_collection.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const [ , , collectionIdArg, to, ipfsHash ] = process.argv;
  if (!collectionIdArg || !to || !ipfsHash) {
    console.error("Usage: node mint_collection.js <collectionId> <to> <ipfsHash>"); // 0 0x1fF116257e646b6C0220a049e893e81DE87fc475 QmTD69tvYd87cVAwaZAUBnK2JRFEYWZ13PZW1PwBBCNyRy
    process.exit(1);
  }

  const RPC_URL     = process.env.RPC_URL    || 'https://westend-asset-hub-eth-rpc.polkadot.io';
  const CHAIN_ID    = 420420421;
  const PK          = process.env.PRIVATE_KEY;
  const CONTRACT    = '0xf888d17f319d48b53dafbb734954548832951836';
  if (!PK) {
    console.error("⚠️  Set PRIVATE_KEY in your .env");
    process.exit(1);
  }

  const collectionId = BigInt(collectionIdArg);
  const uri          = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'asset-hub-westend' });
  const wallet   = new ethers.Wallet(PK, provider);

  const abi = [
    "function collections(uint256) view returns (address,uint256,uint256,uint256,address,uint96)",
    "function owner() view returns (address)",
    "function mint(uint256,address,string) payable"
  ];
  const hub = new ethers.Contract(CONTRACT, abi, wallet);

  console.log("👤 minting with:", wallet.address);
  console.log("👑 hub owner:", await hub.owner());

  // fetch that collection's parameters
  const col = await hub.collections(collectionId);
  const mintPriceWei = BigInt(col[1]);
  console.log(`▶️ collection #${collectionId} mintPrice =`, ethers.formatEther(mintPriceWei), "WND");

  // check your balance
  const balWei = BigInt(await provider.getBalance(wallet.address));
  console.log("⛽ your WND balance:", ethers.formatEther(balWei));
  if (balWei < mintPriceWei) {
    console.warn("⚠️ Low balance—please top up via faucet");
  }

  // send the mint tx
  console.log(`🚀 mint(${collectionId}, ${to}, uri) → sending…`);
  const tx = await hub.mint(collectionId, to, uri, { value: mintPriceWei });
  console.log("📝 tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Minted in block", receipt.blockNumber);
  console.log(`🔍 https://assethub-westend.subscan.io/evm/${CONTRACT}/tx/${tx.hash}`);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
