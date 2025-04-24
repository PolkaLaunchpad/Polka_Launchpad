import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaNFTHubABI from "../../../../lib/abi/PolkaNFTHub3.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.CONTRACT_ADDRESS || "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"
const CHAIN_ID = 420420421

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = Number.parseInt(params.id)

    if (isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL, {
      chainId: CHAIN_ID,
      name: "asset-hub-westend",
    })

    const contract = new ethers.Contract(CONTRACT, PolkaNFTHubABI, provider)

    // Get collection details
    const collection = await contract.getCollection(collectionId)

    // Get tokens in collection
    const tokenIds = await contract.getTokensInCollection(collectionId)

    // Fetch details for each token
    const tokens = []

    for (const tokenId of tokenIds) {
      try {
        const owner = await contract.ownerOf(tokenId)
        const name = await contract.getTokenName(tokenId)
        const uri = await contract.tokenURI(tokenId)

        tokens.push({
          id: Number(tokenId),
          name,
          owner,
          uri,
          // Use the actual URI for the image
          image: uri,
        })
      } catch (err) {
        console.error(`Error fetching token ${tokenId}:`, err)
      }
    }

    // Format collection data
    const collectionData = {
      id: collectionId,
      name: collection.name,
      creator: collection.creator,
      price: ethers.formatEther(collection.mintPrice),
      currency: "WND",
      minted: Number(collection.minted),
      maxSupply: Number(collection.maxSupply),
      royaltyBP: Number(collection.royaltyBP),
      royaltyReceiver: collection.royaltyReceiver,
      tokens,
      // Use the first token's URI as the collection image if available
      image:
        tokens.length > 0
          ? tokens[0].uri
          : `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(collection.name)}`,
    }

    return NextResponse.json({ collection: collectionData })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 })
  }
}
