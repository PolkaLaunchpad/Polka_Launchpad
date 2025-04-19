import Link from "next/link"
import { ArrowRight, Sparkles, Coins, ImageIcon } from "lucide-react"

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Polka dot background pattern */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 rounded-full bg-pink-500"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.2 + 0.05,
                transform: `scale(${Math.random() * 1 + 0.5})`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                Multichain Launchpad
              </span>
              <br />
              for Coins & NFTs
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Launch, trade, and discover the next generation of tokens and digital collectibles on the Polkadot
              ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/explore"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20 flex items-center"
              >
                Explore Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/create"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 border border-white/20"
              >
                Create Your Own
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Launch Your Project on Polkadot</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Whether you're creating a new token or an NFT collection, our platform provides all the tools you need to
              succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 transition-all duration-300 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Token Launchpad</h3>
              <p className="text-gray-400 mb-4">
                Create and launch your own ERC-20 tokens with customizable parameters and instant trading capabilities.
              </p>
              <Link href="/explore" className="text-pink-500 font-medium flex items-center text-sm hover:text-pink-400">
                Explore Tokens
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 transition-all duration-300 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">NFT Marketplace</h3>
              <p className="text-gray-400 mb-4">
                Mint, buy, sell, and trade unique digital collectibles as ERC-721 or ERC-1155 tokens with royalty
                support.
              </p>
              <Link
                href="/nft-market"
                className="text-pink-500 font-medium flex items-center text-sm hover:text-pink-400"
              >
                Explore NFTs
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 transition-all duration-300 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Featured Listings</h3>
              <p className="text-gray-400 mb-4">
                Boost visibility for your project by bidding for a featured spot on our explore pages and gain more
                exposure.
              </p>
              <Link href="/create" className="text-pink-500 font-medium flex items-center text-sm hover:text-pink-400">
                Get Featured
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-pink-500/10 to-purple-600/10 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Project?</h2>
              <p className="text-gray-300 mb-8">
                Join thousands of creators and projects already using Polka Launchpad to bring their ideas to life.
              </p>
              <Link
                href="/create"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20 inline-flex items-center"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
