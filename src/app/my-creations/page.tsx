"use client"

import { useState, useEffect } from "react"
import { ethers, BrowserProvider } from "ethers"
import Web3Modal from "web3modal"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Coins, ImageIcon, ExternalLink, AlertCircle } from "lucide-react"
import PolkaTokenHubABI from "@/lib/abi/PolkaTokenHub.json"
import PolkaNFTHubABI from "@/lib/abi/PolkaNFTHub3.json"

const TOKEN_HUB_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_HUB_ADDRESS || "0xcc0927037e6b78cf9e9b647f34a1313252394860"
const NFT_HUB_ADDRESS = process.env.NEXT_PUBLIC_NFT_HUB_ADDRESS || "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"

interface Token {
  id: number
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  creator: string
}

interface Collection {
  id: number
  name: string
  creator: string
  mintPrice: string
  minted: number
  maxSupply: number
  royaltyBP: number
  royaltyReceiver: string
}

export default function MyCreationsPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myTokens, setMyTokens] = useState<Token[]>([])
  const [myCollections, setMyCollections] = useState<Collection[]>([])

  // Initialize Web3Modal on mount
  useEffect(() => {
    const modal = new Web3Modal({ cacheProvider: true })
    if (modal.cachedProvider) {
      connectWallet()
    }
  }, [])

  // Connect user's wallet
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal()
      const instance = await web3Modal.connect()
      const web3Provider = new BrowserProvider(instance)
      setProvider(web3Provider)
      const userSigner = await web3Provider.getSigner()
      const addr = await userSigner.getAddress()
      setAccount(addr)

      // Load user's creations once connected
      loadUserCreations(web3Provider, addr)
    } catch (err) {
      console.error("Wallet connection failed", err)
      setError("Failed to connect wallet.")
    }
  }

  // Load user's tokens and collections
  const loadUserCreations = async (provider: BrowserProvider, address: string) => {
    setLoading(true)
    setError(null)
    try {
      // Load tokens
      const tokenHub = new ethers.Contract(TOKEN_HUB_ADDRESS, PolkaTokenHubABI, provider)
      const nftHub = new ethers.Contract(NFT_HUB_ADDRESS, PolkaNFTHubABI, provider)

      // Get all tokens
      const allTokens = await tokenHub.getAllTokens()

      // Filter tokens created by the user
      const userTokens = allTokens
        .map((token: any, index: number) => ({
          id: index,
          name: token.name,
          symbol: token.symbol,
          decimals: Number(token.decimals),
          totalSupply: ethers.formatUnits(token.totalSupply.toString(), Number(token.decimals)),
          maxSupply: ethers.formatUnits(token.maxSupply.toString(), Number(token.decimals)),
          creator: token.creator,
        }))
        .filter((token: Token) => token.creator.toLowerCase() === address.toLowerCase())

      setMyTokens(userTokens)

      // Get collection count
      const collectionCount = await nftHub.collectionCount()

      // Get all collections
      const userCollections = []
      for (let i = 0; i < Number(collectionCount); i++) {
        try {
          const collection = await nftHub.getCollection(i)
          if (collection.creator.toLowerCase() === address.toLowerCase()) {
            userCollections.push({
              id: i,
              name: collection.name,
              creator: collection.creator,
              mintPrice: ethers.formatEther(collection.mintPrice.toString()),
              minted: Number(collection.minted),
              maxSupply: Number(collection.maxSupply),
              royaltyBP: Number(collection.royaltyBP),
              royaltyReceiver: collection.royaltyReceiver,
            })
          }
        } catch (err) {
          console.error(`Error fetching collection ${i}:`, err)
        }
      }

      setMyCollections(userCollections)
    } catch (err) {
      console.error("Error loading creations:", err)
      setError("Failed to load your creations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Creations</h1>

      {!account ? (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-8 text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to view your creations</p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-4 mb-6">
            <p className="text-gray-300">
              Connected: <span className="text-pink-500 font-medium">{formatAddress(account)}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="tokens" className="text-sm">
                  <Coins className="w-4 h-4 mr-2" />
                  My Tokens
                </TabsTrigger>
                <TabsTrigger value="collections" className="text-sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  My NFT Collections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tokens">
                {myTokens.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 mb-4">You haven't created any tokens yet</p>
                    <Link
                      href="/create"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
                    >
                      Create a Token
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTokens.map((token) => (
                      <Link
                        key={token.id}
                        href={`/explore/${token.id}`}
                        className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-pink-500/10 p-4 hover:border-pink-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/5 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <Coins className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <h3 className="font-bold">{token.name}</h3>
                            <p className="text-xs text-gray-400">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <span>Total Supply:</span>
                            <span>{Number(token.totalSupply).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Supply:</span>
                            <span>{Number(token.maxSupply).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Decimals:</span>
                            <span>{token.decimals}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <div className="flex items-center text-xs text-pink-500">
                            View Details
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collections">
                {myCollections.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 mb-4">You haven't created any NFT collections yet</p>
                    <Link
                      href="/create"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
                    >
                      Create a Collection
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCollections.map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/my-creations/collection/${collection.id}`}
                        className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-pink-500/10 p-4 hover:border-pink-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/5 hover:-translate-y-1"
                      >
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <ImageIcon className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <h3 className="font-bold">{collection.name}</h3>
                            <p className="text-xs text-gray-400">Collection #{collection.id}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <span>Mint Price:</span>
                            <span>{collection.mintPrice} WND</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Minted:</span>
                            <span>
                              {collection.minted} / {collection.maxSupply}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Royalty:</span>
                            <span>{(collection.royaltyBP / 100).toFixed(2)}%</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <div className="flex items-center text-xs text-pink-500">
                            Manage Collection
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </main>
  )
}
