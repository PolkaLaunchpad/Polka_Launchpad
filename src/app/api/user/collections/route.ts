import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaNFTHubABI from "../../../../lib/abi/PolkaNFTHub3.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.CONTRACT_ADDRESS || "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"
const CHAIN_ID = 420420421

export async function GET(request: Request) {
  // Get the wallet address from the query parameters
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL, {
      chainId: CHAIN_ID,
      name: "asset-hub-westend",
    })

    const contract = new ethers.Contract(CONTRACT, PolkaNFTHubABI, provider)

    // Get collection count
    let collectionCount
    try {
      collectionCount = Number(await contract.collectionCount())
    } catch (countError) {
      console.error("Error fetching collection count:", countError)
      return NextResponse.json({ collections: [] })
    }

    // Fetch collections created by the user
    const userCollections = []

    for (let i = 0; i < collectionCount; i++) {
      try {
        const collection = await contract.getCollection(i)

        // Check if the collection creator matches the requested address
        if (collection.creator.toLowerCase() === address.toLowerCase()) {
          userCollections.push({
            id: i,
            name: collection.name,
            creator: collection.creator,
            price: ethers.formatEther(collection.mintPrice),
            currency: "WND",
            minted: Number(collection.minted),
            maxSupply: Number(collection.maxSupply),
            royaltyBP: Number(collection.royaltyBP),
            royaltyReceiver: collection.royaltyReceiver,
            image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(collection.name)}`,
          })
        }
      } catch (collectionError) {
        console.error(`Error fetching collection ${i}:`, collectionError)
        // Skip this collection if there's an error
        continue
      }
    }

    return NextResponse.json({ collections: userCollections })
  } catch (error) {
    console.error("Error in user collections API route:", error)
    return NextResponse.json({ collections: [] })
  }
}
