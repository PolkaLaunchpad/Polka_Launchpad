"use client"

import { useState } from "react"
import { ArrowUpRight, Users, Tag } from "lucide-react"
import Link from "next/link"

interface CollectionCardProps {
  collection: {
    id: number
    name: string
    creator: string
    price: string
    currency: string
    minted: number
    maxSupply: number
    image: string
  }
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Link
      href={`/nft-market/collection/${collection.id}`}
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
          <img
            src={collection.image || "/placeholder.svg"}
            alt={collection.name}
            className="w-full aspect-square object-cover"
          />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="p-4 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Mint Price</span>
                <div className="flex items-center text-xs text-pink-500">
                  View Collection
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-lg font-bold">
                  {collection.price} {collection.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold truncate mb-1">{collection.name}</h3>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              <span>By {formatAddress(collection.creator)}</span>
            </div>

            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span>
                {collection.minted}/{collection.maxSupply}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
