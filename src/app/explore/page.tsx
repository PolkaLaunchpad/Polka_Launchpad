"use client"

import { useEffect, useState } from "react"
import FeaturedBidBanner from "../../components/FeaturedBidBanner"
import TokenCard from "../../components/TokenCard"
import { Loader2 } from "lucide-react"

interface Token {
  id: string // Changed to string to match TokenCard interface
  name: string
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  image: string
  totalSupply: string
  maxSupply: string
  creator: string
  decimals: number
}

export default function ExplorePage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true)
        const response = await fetch("/api/tokens")

        if (!response.ok) {
          throw new Error("Failed to fetch tokens")
        }

        const data = await response.json()
        setTokens(data.tokens)
      } catch (err) {
        console.error("Error fetching tokens:", err)
        setError("Failed to load tokens. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FeaturedBidBanner />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Trending Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          )}

          {!loading &&
            tokens.length > 0 &&
            tokens.slice(0, 4).map((token) => <TokenCard key={token.id} token={token} />)}

          {!loading && tokens.length === 0 && !error && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No trending tokens found</p>
            </div>
          )}

          {error && (
            <div className="col-span-full bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">All Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          )}

          {!loading && tokens.length > 0 && tokens.map((token) => <TokenCard key={token.id} token={token} />)}

          {!loading && tokens.length === 0 && !error && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No tokens found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
