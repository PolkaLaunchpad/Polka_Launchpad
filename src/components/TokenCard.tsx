"use client"

import { useState } from "react"
import { ArrowUpRight, Star, BarChart3 } from "lucide-react"
import Link from "next/link"

interface TokenCardProps {
  token: {
    id: string
    name: string
    symbol: string
    price: number
    change24h: number
    volume24h: number
    marketCap: number
    image: string
  }
}

export default function TokenCard({ token }: TokenCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  return (
    <Link
      href={`/explore/${token.id}`}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 to-black rounded-xl border border-pink-500/10 p-4 transition-all duration-300 ${
          isHovered ? "border-pink-500/30 shadow-lg shadow-pink-500/5 transform -translate-y-1" : ""
        }`}
      >
        <div className="flex items-center mb-3">
          <div className="relative">
            <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-10 h-10 rounded-full" />
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="font-bold">{token.name}</h3>
            <p className="text-xs text-gray-400">{token.symbol}</p>
          </div>
          <div className="ml-auto">
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

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold">{formatPrice(token.price)}</p>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Vol: {formatNumber(token.volume24h)}
            </div>
          </div>

          <div
            className={`flex items-center text-xs font-medium text-pink-500 transition-all duration-300 ${
              isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
            }`}
          >
            View Details
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
