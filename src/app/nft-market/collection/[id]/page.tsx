"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, User, Tag, Percent } from "lucide-react"

interface Token {
  id: number
  name: string
  owner: string
  uri: string
  image: string
}

interface Collection {
  id: number
  name: string
  creator: string
  price: string
  currency: string
  minted: number
  maxSupply: number
  royaltyBP: number
  royaltyReceiver: string
  tokens: Token[]
  image: string
}

export default function CollectionPage() {
  const params = useParams()
  const collectionId = params.id as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true)
        const response = await fetch(`/api/collections/${collectionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch collection")
        }

        const data = await response.json()
        setCollection(data.collection)
      } catch (err) {
        console.error("Error fetching collection:", err)
        setError("Failed to load collection. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (collectionId) {
      fetchCollection()
    }
  }, [collectionId])

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
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

  if (error || !collection) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/nft-market" className="flex items-center text-pink-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Link>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || "Collection not found"}</p>
          <Link
            href="/nft-market"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Return to NFT Market
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/nft-market" className="flex items-center text-pink-500 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Collections
      </Link>

      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <img
              src={collection.image || "/placeholder.svg"}
              alt={collection.name}
              className="w-full aspect-square object-cover rounded-xl"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(collection.name)}`
              }}
            />
          </div>

          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-4">{collection.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <User className="w-4 h-4 mr-2" />
                  <span>Creator</span>
                </div>
                <p className="font-medium">{formatAddress(collection.creator)}</p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <Tag className="w-4 h-4 mr-2" />
                  <span>Mint Price</span>
                </div>
                <p className="font-medium">
                  {collection.price} {collection.currency}
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <Percent className="w-4 h-4 mr-2" />
                  <span>Royalty</span>
                </div>
                <p className="font-medium">{collection.royaltyBP / 100}%</p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 10.5V13.5M12 7.5V16.5M17 10.5V13.5M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Supply</span>
                </div>
                <p className="font-medium">
                  {collection.minted}/{collection.maxSupply}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20">
                Mint NFT
              </button>

              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-white/20">
                View on Explorer
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">NFTs in this Collection</h2>

      {collection.tokens.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-xl">
          <p className="text-gray-400">No NFTs found in this collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collection.tokens.map((token) => (
            <div key={token.id} className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden">
              <div className="relative">
                <img
                  src={token.uri || "/placeholder.svg"}
                  alt={token.name}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(token.name)}`
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate mb-1">{token.name}</h3>
                <p className="text-xs text-gray-400 truncate">Owner: {formatAddress(token.owner)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
