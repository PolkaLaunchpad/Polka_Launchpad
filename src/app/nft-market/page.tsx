import FeaturedBidBanner from "../../components/FeaturedBidBanner"
import NFTCard from "../../components/NFTCard"

// Mock NFT data - in a real app, this would come from your API/blockchain
const NFTS = [
  {
    id: "polka-punk-42",
    name: "Polka Punk #42",
    collection: "Polka Punks",
    price: 0.45,
    currency: "ETH",
    image: "/vibrant-dot-rebel.png",
    creator: "0xabcd...ef12",
    likes: 24,
  },
  {
    id: "cosmic-dot-7",
    name: "Cosmic Dot #7",
    collection: "Cosmic Dots",
    price: 0.2,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=cosmic%20space%20pink%20nft",
    creator: "0x7890...1234",
    likes: 18,
  },
  {
    id: "polka-ape-13",
    name: "Polka Ape #13",
    collection: "Polka Apes",
    price: 1.2,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=pink%20ape%20nft",
    creator: "0x1234...5678",
    likes: 42,
  },
  {
    id: "dot-landscape-5",
    name: "Dot Landscape #5",
    collection: "Dot Landscapes",
    price: 0.35,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=abstract%20landscape%20with%20dots%20nft",
    creator: "0xdef0...9876",
    likes: 15,
  },
  {
    id: "polka-cat-21",
    name: "Polka Cat #21",
    collection: "Polka Cats",
    price: 0.15,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=cute%20cat%20with%20polkadots%20nft",
    creator: "0x5678...90ab",
    likes: 31,
  },
  {
    id: "abstract-dots-9",
    name: "Abstract Dots #9",
    collection: "Abstract Dots",
    price: 0.28,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=abstract%20art%20with%20pink%20dots%20nft",
    creator: "0x2345...67cd",
    likes: 27,
  },
  {
    id: "pixel-polka-3",
    name: "Pixel Polka #3",
    collection: "Pixel Polkas",
    price: 0.18,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=pixel%20art%20with%20polkadots%20nft",
    creator: "0x3456...78ef",
    likes: 19,
  },
  {
    id: "dot-robot-11",
    name: "Dot Robot #11",
    collection: "Dot Robots",
    price: 0.55,
    currency: "ETH",
    image: "/placeholder.svg?height=400&width=400&query=robot%20with%20polkadots%20nft",
    creator: "0x4567...89fg",
    likes: 36,
  },
]

export default function NFTMarketPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FeaturedBidBanner />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {NFTS.slice(0, 4).map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">All NFTs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {NFTS.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </div>
    </main>
  )
}
