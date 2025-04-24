import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaTokenHubABI from "../../../lib/abi/PolkaTokenHub.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.TOKEN_CONTRACT || "0xcc0927037e6b78cf9e9b647f34a1313252394860" // PolkaTokenHub address
const CHAIN_ID = 420420421

// Helper function to safely convert BigInt to string
function formatBigInt(value: any): string {
  if (typeof value === "bigint") {
    return value.toString()
  }
  return String(value || "0")
}

// Helper function to ensure all BigInt values in an object are converted to strings
function sanitizeForJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === "bigint") {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForJSON(item))
  }

  if (typeof obj === "object") {
    const result: any = {}
    for (const key in obj) {
      result[key] = sanitizeForJSON(obj[key])
    }
    return result
  }

  return obj
}

// Generate market data for tokens
function generateMarketData(token: any) {
  // Generate a random price between 0.001 and 10
  const price = Math.random() * 10 + 0.001

  // Generate a random 24h change between -15% and +15%
  const change24h = (Math.random() * 30 - 15).toFixed(2)

  // Calculate market cap based on total supply and price
  const totalSupplyNum = Number.parseFloat(token.totalSupply || "0")
  const marketCap = Math.floor(totalSupplyNum * price)

  // Generate a random 24h volume between 1% and 20% of market cap
  const volume24h = Math.floor(marketCap * (Math.random() * 0.19 + 0.01))

  return {
    price,
    change24h: Number.parseFloat(change24h),
    volume24h,
    marketCap,
  }
}

export async function GET() {
  try {
    // Connect to the blockchain and fetch real data
    const provider = new ethers.JsonRpcProvider(RPC_URL, {
      chainId: CHAIN_ID,
      name: "asset-hub-westend",
    })

    // Test the connection first
    try {
      await provider.getBlockNumber()
    } catch (connectionError) {
      console.error("Failed to connect to blockchain:", connectionError)
      return NextResponse.json({ tokens: [] })
    }

    const contract = new ethers.Contract(CONTRACT, PolkaTokenHubABI, provider)

    // Get all tokens
    let tokenData
    try {
      tokenData = await contract.getAllTokens()
      console.log(
        "Raw token data:",
        JSON.stringify(tokenData, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
      )
    } catch (tokenError) {
      console.error("Error fetching tokens:", tokenError)
      return NextResponse.json({ tokens: [] })
    }

    // Format token data
    const tokens = tokenData.map((token: any, index: number) => {
      // Log the individual token for debugging
      console.log(
        `Processing token #${index}:`,
        JSON.stringify(token, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
      )

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
        console.error(`Error formatting token #${index}:`, error)
      }

      // Generate market data for this token
      const marketData = generateMarketData({
        totalSupply,
      })

      return {
        id: index.toString(),
        name: token.name || `Token #${index}`,
        symbol: token.symbol || `TKN${index}`,
        decimals,
        totalSupply,
        maxSupply,
        creator: token.creator || "0x0000000000000000000000000000000000000000",
        // Add market data
        price: marketData.price,
        change24h: marketData.change24h,
        volume24h: marketData.volume24h,
        marketCap: marketData.marketCap,
        // Generate a placeholder image based on the token name
        image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent((token.name || `Token #${index}`) + " token")}`,
      }
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error("Error in tokens API route:", error)
    return NextResponse.json({ tokens: [] })
  }
}
