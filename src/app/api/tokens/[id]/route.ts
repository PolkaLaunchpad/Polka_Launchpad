import { ethers } from "ethers"
import { NextResponse } from "next/server"
import PolkaTokenHubABI from "../../../../lib/abi/PolkaTokenHub.json"

// Environment variables
const RPC_URL = process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io"
const CONTRACT = process.env.TOKEN_CONTRACT || "0xcc0927037e6b78cf9e9b647f34a1313252394860" // PolkaTokenHub address
const CHAIN_ID = 420420421

// Generate mock trading history for a token
function generateTradingHistory(token: any) {
  const history = []
  const currentPrice = token.price
  const volatility = 0.05 // 5% daily volatility

  // Generate 30 days of history
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Calculate a random price movement based on volatility
    const priceChange = (Math.random() * 2 - 1) * volatility
    const dayPrice = currentPrice * (1 + priceChange * (i / 30))

    // Random volume between 50% and 150% of average daily volume
    const volume = token.volume24h * (0.5 + Math.random())

    history.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(dayPrice.toFixed(4)),
      volume: Math.floor(volume),
    })
  }

  return history
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const tokenId = Number.parseInt(params.id)

    if (isNaN(tokenId)) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 })
    }

    // Connect to the blockchain and fetch real data
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL, {
        chainId: CHAIN_ID,
        name: "asset-hub-westend",
      })

      // Test the connection
      await provider.getBlockNumber()

      const contract = new ethers.Contract(CONTRACT, PolkaTokenHubABI, provider)

      // Get token details
      const token = await contract.getToken(tokenId)

      // Log the raw token data for debugging
      console.log(
        `Raw token #${tokenId} data:`,
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
        console.error(`Error formatting token #${tokenId}:`, error)
      }

      // Generate market data
      const price = Math.random() * 10 + 0.001
      const change24h = (Math.random() * 30 - 15).toFixed(2)
      const marketCap = Math.floor(Number.parseFloat(totalSupply) * price)
      const volume24h = Math.floor(marketCap * (Math.random() * 0.19 + 0.01))

      const tokenData = {
        id: tokenId.toString(),
        name: token.name || `Token #${tokenId}`,
        symbol: token.symbol || `TKN${tokenId}`,
        decimals,
        totalSupply,
        maxSupply,
        creator: token.creator || "0x0000000000000000000000000000000000000000",
        price,
        change24h: Number.parseFloat(change24h),
        volume24h,
        marketCap,
        image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent((token.name || `Token #${tokenId}`) + " token")}`,
      }

      // Generate trading history
      const tradingHistory = generateTradingHistory(tokenData)

      return NextResponse.json({
        token: {
          ...tokenData,
          tradingHistory,
        },
      })
    } catch (error) {
      console.error("Error fetching token from blockchain:", error)
      return NextResponse.json({ error: "Failed to fetch token data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in token API route:", error)
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 })
  }
}
