"use client"

import type React from "react"

import { useState } from "react"
import { ArrowUpRight, Heart } from "lucide-react"
import Link from "next/link"

interface NFTCardProps {
  nft: {
    id: string
    name: string
    collection: string
    price: number
    currency: string
    image: string
    creator: string
    likes: number
  }
}

export default function NFTCard({ nft }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(nft.likes)

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <Link
      href={`/nft-market/${nft.id}`}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden transition-all duration-300 ${
          isHovered ? "shadow-lg shadow-pink-500/10 transform -translate-y-1" : ""
        }`}
      >
        <div className="relative">
          <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full aspect-square object-cover" />

          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:bg-pink-500/30"
          >
            <Heart className={`w-4 h-4 ${liked ? "text-pink-500 fill-pink-500" : "text-white"}`} />
          </button>

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="p-4 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Price</span>
                <div className="flex items-center text-xs text-pink-500">
                  View Details
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-lg font-bold">
                  {nft.price} {nft.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold truncate">{nft.name}</h3>
            <div className="flex items-center text-xs text-gray-400">
              <Heart className="w-3 h-3 mr-1" />
              {likeCount}
            </div>
          </div>
          <p className="text-xs text-gray-400 truncate">{nft.collection}</p>
        </div>
      </div>
    </Link>
  )
}
