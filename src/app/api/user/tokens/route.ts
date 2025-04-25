import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaTokenHubABI from "../../../../lib/abi/PolkaTokenHub.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.TOKEN_CONTRACT || "0xcc0927037e6b78cf9e9b647f34a1313252394860" // PolkaTokenHub address
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

    const contract = new ethers.Contract(CONTRACT, PolkaTokenHubABI, provider)

    // Get all tokens
    let tokenData
    try {
      tokenData = await contract.getAllTokens()
    } catch (tokenError) {
      console.error("Error fetching tokens:", tokenError)
      return NextResponse.json({ tokens: [] })
    }

    // Filter tokens created by the user
    const userTokens = []

    for (let i = 0; i < tokenData.length; i++) {
      const token = tokenData[i]

      // Check if the token creator matches the requested address
      if (token.creator.toLowerCase() === address.toLowerCase()) {
        // Default values
        let totalSupply = "0"
        let maxSupply = "0"
        let decimals = 18

        try {
          // Safely get decimals
          decimals = token.decimals !== undefined && token.decimals !== null ? Number(token.decimals) : 18

          // Safely format totalSupply
          if (token.totalSupply !== undefined && token.totalSupply !== null) {
            totalSupply = ethers.formatUnits(token.totalSupply.toString(), decimals)
          }

          // Safely format maxSupply
          if (token.maxSupply !== undefined && token.maxSupply !== null) {
            maxSupply = ethers.formatUnits(token.maxSupply.toString(), decimals)
          }
        } catch (error) {
          console.error(`Error formatting token #${i}:`, error)
        }

        userTokens.push({
          id: i.toString(),
          name: token.name || `Token #${i}`,
          symbol: token.symbol || `TKN${i}`,
          decimals,
          totalSupply,
          maxSupply,
          creator: token.creator,
          image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent((token.name || `Token #${i}`) + " token")}`,
        })
      }
    }

    return NextResponse.json({ tokens: userTokens })
  } catch (error) {
    console.error("Error in user tokens API route:", error)
    return NextResponse.json({ tokens: [] })
  }
}
