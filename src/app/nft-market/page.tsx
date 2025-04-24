"use client"

import { useEffect, useState } from "react"
import FeaturedBidBanner from "../../components/FeaturedBidBanner"
import CollectionCard from "../../components/CollectionCard"
import { Loader2 } from "lucide-react"

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
  image: string
}

export default function NFTMarketPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true)
        const response = await fetch("/api/collections")

        if (!response.ok) {
          throw new Error("Failed to fetch collections")
        }

        const data = await response.json()
        setCollections(data.collections)
      } catch (err) {
        console.error("Error fetching collections:", err)
        setError("Failed to load collections. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FeaturedBidBanner />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading &&
            collections.length > 0 &&
            collections.slice(0, 4).map((collection) => <CollectionCard key={collection.id} collection={collection} />)}

          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          )}

          {!loading && collections.length === 0 && !error && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No featured collections found</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">All Collections</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading &&
            collections.length > 0 &&
            collections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}

          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          )}

          {!loading && collections.length === 0 && !error && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No collections found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
