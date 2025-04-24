"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import PriceChart from "../../../components/PriceChart"
import TradeModal from "../../../components/TradeModal"

interface TradingHistoryItem {
  date: string
  price: number
  volume: number
}

interface Token {
  id: string // Changed to string to match TokenCard interface
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  creator: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  image: string
  tradingHistory: TradingHistoryItem[]
}

export default function TokenDetailPage() {
  const params = useParams()
  const tokenId = params.id as string

  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const response = await fetch(`/api/tokens/${tokenId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch token")
        }

        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error("Error fetching token:", err)
        setError("Failed to load token. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (tokenId) {
      fetchToken()
    }
  }, [tokenId])

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const handleBuy = () => {
    setTradeType("buy")
    setShowTradeModal(true)
  }

  const handleSell = () => {
    setTradeType("sell")
    setShowTradeModal(true)
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      </main>
    )
  }

  if (error || !token) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/explore" className="flex items-center text-pink-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tokens
        </Link>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || "Token not found"}</p>
          <Link
            href="/explore"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Return to Explore
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/explore" className="flex items-center text-pink-500 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tokens
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
            <div className="flex items-center mb-6">
              <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h1 className="text-2xl font-bold">{token.name}</h1>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">{token.symbol}</span>
                  <div
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      token.change24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold mb-2">{formatPrice(token.price)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleBuy}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20"
              >
                Buy {token.symbol}
              </button>
              <button
                onClick={handleSell}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20"
              >
                Sell {token.symbol}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Market Cap</span>
                <span className="font-medium">{formatNumber(token.marketCap)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">24h Volume</span>
                <span className="font-medium">{formatNumber(token.volume24h)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Supply</span>
                <span className="font-medium">{Number.parseFloat(token.totalSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Max Supply</span>
                <span className="font-medium">{Number.parseFloat(token.maxSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Decimals</span>
                <span className="font-medium">{token.decimals}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Creator</span>
                <span className="font-medium">{formatAddress(token.creator)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart and Trading History */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Price Chart</h2>
              <div className="flex space-x-2">
                <button className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-500 px-3 py-1 rounded-md text-xs">
                  24H
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">7D</button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">1M</button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">ALL</button>
              </div>
            </div>

            <div className="h-80">
              <PriceChart data={token.tradingHistory} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6">
            <h2 className="text-xl font-bold mb-6">Trading History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left pb-4">Date</th>
                    <th className="text-right pb-4">Price</th>
                    <th className="text-right pb-4">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {token.tradingHistory.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="py-3">{item.date}</td>
                      <td className="text-right py-3">{formatPrice(item.price)}</td>
                      <td className="text-right py-3">{formatNumber(item.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showTradeModal && token && (
        <TradeModal token={token} type={tradeType} onClose={() => setShowTradeModal(false)} />
      )}
    </main>
  )
}
