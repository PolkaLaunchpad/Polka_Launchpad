"use client"
import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, DollarSign } from "lucide-react"
import Link from "next/link"
import BidModal from "./BidModal"

// Mock featured items - in a real app, these would come from your backend/blockchain
const FEATURED_ITEMS = [
  {
    id: "1",
    type: "token",
    name: "POLKA Token",
    description: "The native token of the Polka Launchpad ecosystem",
    image: "/ethereal-rose.png",
    currentBid: "0.5",
    creator: "0x1234...5678",
    link: "/explore/polka-token",
  },
  {
    id: "2",
    type: "nft",
    name: "Polka Punk #42",
    description: "Limited edition NFT from the Polka Punk collection",
    image: "/vibrant-dot-rebel.png",
    currentBid: "0.8",
    creator: "0xabcd...ef12",
    link: "/nft-market/polka-punk-42",
  },
  {
    id: "3",
    type: "token",
    name: "DOTS Finance",
    description: "DeFi token with staking and yield farming capabilities",
    image: "/abstract-purple-finance.png",
    currentBid: "0.3",
    creator: "0x7890...1234",
    link: "/explore/dots-finance",
  },
]

export default function FeaturedBidBanner() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<(typeof FEATURED_ITEMS)[0] | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURED_ITEMS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleBidClick = (item: (typeof FEATURED_ITEMS)[0]) => {
    setSelectedItem(item)
    setShowBidModal(true)
  }

  const activeItem = FEATURED_ITEMS[activeIndex]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 backdrop-blur-sm border border-pink-500/20">
      {/* Polka dot background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 rounded-full bg-pink-500"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              transform: `scale(${Math.random() * 1 + 0.5})`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center p-6 md:p-8">
        <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-8">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-500">
              Featured {activeItem.type}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{activeItem.name}</h2>
          <p className="text-gray-300 mb-4">{activeItem.description}</p>

          <div className="flex items-center mb-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <DollarSign className="w-4 h-4 text-pink-400 mr-1" />
              <span className="text-sm font-medium">
                Current bid: <span className="text-pink-400">{activeItem.currentBid} WND</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleBidClick(activeItem)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20 flex items-center"
            >
              Place Bid
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <Link
              href={activeItem.link}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-white/20"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl transform rotate-6"></div>
            <img
              src={activeItem.image || "/placeholder.svg"}
              alt={activeItem.name}
              className="relative z-10 w-full h-full object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {FEATURED_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-pink-500 w-6" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {showBidModal && selectedItem && <BidModal item={selectedItem} onClose={() => setShowBidModal(false)} />}
    </div>
  )
}
