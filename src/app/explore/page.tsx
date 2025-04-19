import FeaturedBidBanner from "../../components/FeaturedBidBanner"
import TokenCard from "../../components/TokenCard"

// Mock token data - in a real app, this would come from your API/blockchain
const TOKENS = [
  {
    id: "polka-token",
    name: "Polka Token",
    symbol: "POLKA",
    price: 0.0458,
    change24h: 12.5,
    volume24h: 1250000,
    marketCap: 4500000,
    image: "/abstract-pink-token.png",
  },
  {
    id: "dots-finance",
    name: "DOTS Finance",
    symbol: "DOTS",
    price: 1.24,
    change24h: -3.2,
    volume24h: 8750000,
    marketCap: 12500000,
    image: "/abstract-purple-finance.png",
  },
  {
    id: "polka-swap",
    name: "PolkaSwap",
    symbol: "PSWAP",
    price: 0.0089,
    change24h: 5.7,
    volume24h: 450000,
    marketCap: 890000,
    image: "/placeholder.svg?height=100&width=100&query=pink%20swap%20token%20logo",
  },
  {
    id: "dot-chain",
    name: "DOT Chain",
    symbol: "DOTC",
    price: 3.45,
    change24h: 0.8,
    volume24h: 3400000,
    marketCap: 34000000,
    image: "/placeholder.svg?height=100&width=100&query=dot%20chain%20token%20logo",
  },
  {
    id: "polka-dao",
    name: "PolkaDAO",
    symbol: "PDAO",
    price: 0.567,
    change24h: 8.9,
    volume24h: 2300000,
    marketCap: 5670000,
    image: "/placeholder.svg?height=100&width=100&query=dao%20token%20logo%20pink",
  },
  {
    id: "meta-dots",
    name: "Meta Dots",
    symbol: "MDOTS",
    price: 0.0023,
    change24h: -1.4,
    volume24h: 120000,
    marketCap: 230000,
    image: "/placeholder.svg?height=100&width=100&query=meta%20token%20logo%20purple",
  },
  {
    id: "polka-defi",
    name: "Polka DeFi",
    symbol: "PDEFI",
    price: 0.789,
    change24h: 15.3,
    volume24h: 4500000,
    marketCap: 7890000,
    image: "/placeholder.svg?height=100&width=100&query=defi%20token%20logo%20pink",
  },
  {
    id: "dot-finance",
    name: "DOT Finance",
    symbol: "DOTFI",
    price: 2.34,
    change24h: -0.5,
    volume24h: 6700000,
    marketCap: 23400000,
    image: "/placeholder.svg?height=100&width=100&query=finance%20token%20logo%20purple",
  },
]

export default function ExplorePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FeaturedBidBanner />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Trending Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TOKENS.slice(0, 4).map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">More Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TOKENS.slice(4, 8).map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">All Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TOKENS.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      </div>
    </main>
  )
}
