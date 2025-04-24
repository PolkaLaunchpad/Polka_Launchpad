import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaNFTHubABI from "../../../lib/abi/PolkaNFTHub3.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.CONTRACT_ADDRESS || "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"
const CHAIN_ID = 420420421

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL, {
      chainId: CHAIN_ID,
      name: "asset-hub-westend",
    })

    const contract = new ethers.Contract(CONTRACT, PolkaNFTHubABI, provider)

    // Get collection count
    const collectionCount = Number(await contract.collectionCount())

    // Fetch all collections
    const collections = []

    for (let i = 0; i < collectionCount; i++) {
      const collection = await contract.getCollection(i)

      // Try to get the first token in the collection for the thumbnail
      let thumbnailUri = null
      try {
        const tokenIds = await contract.getTokensInCollection(i)
        if (tokenIds.length > 0) {
          const firstTokenId = tokenIds[0]
          const uri = await contract.tokenURI(firstTokenId)
          thumbnailUri = uri
        }
      } catch (err) {
        console.error(`Error fetching thumbnail for collection ${i}:`, err)
      }

      // Format collection data
      collections.push({
        id: i,
        name: collection.name,
        creator: collection.creator,
        price: ethers.formatEther(collection.mintPrice),
        currency: "WND",
        minted: Number(collection.minted),
        maxSupply: Number(collection.maxSupply),
        royaltyBP: Number(collection.royaltyBP),
        royaltyReceiver: collection.royaltyReceiver,
        thumbnailUri: thumbnailUri,
        // Fallback to placeholder if no thumbnail URI
        image: thumbnailUri || `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(collection.name)}`,
      })
    }

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}
