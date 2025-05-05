"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Flame, AlertCircle, Check } from "lucide-react"
import PriceChart from "../../../components/PriceChart"
import TradeModal from "../../../components/TradeModal"
import { ethers, BrowserProvider } from "ethers"
import Web3Modal from "web3modal"
import PolkaTokenHubABI from "@/lib/abi/PolkaTokenHub.json"

const TOKEN_HUB_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_HUB_ADDRESS || "0xcc0927037e6b78cf9e9b647f34a1313252394860"

interface TradingHistoryItem {
  date: string
  price: number
  volume: number
}

interface Token {
  id: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  creator: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  image: string
  tradingHistory: TradingHistoryItem[]
}

export default function TokenDetailPage() {
  const params = useParams()
  const tokenId = params.id as string

  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")

  // Wallet connection state
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Token management state
  const [showMintForm, setShowMintForm] = useState(false)
  const [showBurnForm, setShowBurnForm] = useState(false)
  const [mintTo, setMintTo] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<"mint" | "burn" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Web3Modal
    const web3Modal = new Web3Modal({ cacheProvider: true })
    if (web3Modal.cachedProvider) {
      connectWallet()
    }

    // Fetch token data
    fetchToken()
  }, [tokenId])

  // Connect wallet
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal()
      const instance = await web3Modal.connect()
      const web3Provider = new BrowserProvider(instance)
      setProvider(web3Provider)
      const userSigner = await web3Provider.getSigner()
      setSigner(userSigner)
      const addr = await userSigner.getAddress()
      setAccount(addr)
    } catch (err) {
      console.error("Failed to connect wallet:", err)
    }
  }

  // Fetch token data
  const fetchToken = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tokens/${tokenId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch token")
      }

      const data = await response.json()
      setToken(data.token)

      // Check if connected wallet is the token creator
      if (account && data.token.creator) {
        setIsOwner(account.toLowerCase() === data.token.creator.toLowerCase())
      }
    } catch (err) {
      console.error("Error fetching token:", err)
      setError("Failed to load token. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Check ownership when account changes
  useEffect(() => {
    if (account && token?.creator) {
      setIsOwner(account.toLowerCase() === token.creator.toLowerCase())
    } else {
      setIsOwner(false)
    }
  }, [account, token])

  // Handle minting tokens
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setActionSuccess(null)
    setTxHash(null)

    if (!signer || !token) {
      setActionError("Please connect your wallet first.")
      return
    }

    if (!mintTo || !mintAmount) {
      setActionError("Recipient address and amount are required.")
      return
    }

    try {
      setIsProcessing(true)
      const hub = new ethers.Contract(TOKEN_HUB_ADDRESS, PolkaTokenHubABI, signer)

      // Convert amount to token units with proper decimals
      const amount = ethers.parseUnits(mintAmount, token.decimals)

      console.log(`Minting ${mintAmount} ${token.symbol} to ${mintTo}`)
      const tx = await hub.mint(tokenId, mintTo, amount)

      console.log("Transaction hash:", tx.hash)
      setTxHash(tx.hash)

      const receipt = await tx.wait()
      console.log("Minted in block", receipt.blockNumber)

      setActionSuccess("mint")

      // Reset form after success
      setTimeout(() => {
        setMintTo("")
        setMintAmount("")
        setShowMintForm(false)
        setActionSuccess(null)
        setTxHash(null)
        // Refresh token data
        fetchToken()
      }, 3000)
    } catch (err: any) {
      console.error("Mint failed:", err)
      setActionError(err.message || "Failed to mint tokens.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle burning tokens
  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setActionSuccess(null)
    setTxHash(null)

    if (!signer || !token) {
      setActionError("Please connect your wallet first.")
      return
    }

    if (!burnAmount) {
      setActionError("Burn amount is required.")
      return
    }

    try {
      setIsProcessing(true)
      const hub = new ethers.Contract(TOKEN_HUB_ADDRESS, PolkaTokenHubABI, signer)

      // Convert amount to token units with proper decimals
      const amount = ethers.parseUnits(burnAmount, token.decimals)

      console.log(`Burning ${burnAmount} ${token.symbol}`)
      const tx = await hub.burn(tokenId, amount)

      console.log("Transaction hash:", tx.hash)
      setTxHash(tx.hash)

      const receipt = await tx.wait()
      console.log("Burned in block", receipt.blockNumber)

      setActionSuccess("burn")

      // Reset form after success
      setTimeout(() => {
        setBurnAmount("")
        setShowBurnForm(false)
        setActionSuccess(null)
        setTxHash(null)
        // Refresh token data
        fetchToken()
      }, 3000)
    } catch (err: any) {
      console.error("Burn failed:", err)
      setActionError(err.message || "Failed to burn tokens.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

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

  const handleBuy = () => {
    setTradeType("buy")
    setShowTradeModal(true)
  }

  const handleSell = () => {
    setTradeType("sell")
    setShowTradeModal(true)
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

  if (error || !token) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/explore" className="flex items-center text-pink-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tokens
        </Link>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || "Token not found"}</p>
          <Link
            href="/explore"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Return to Explore
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/explore" className="flex items-center text-pink-500 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tokens
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
            <div className="flex items-center mb-6">
              <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h1 className="text-2xl font-bold">{token.name}</h1>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">{token.symbol}</span>
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
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold mb-2">{formatPrice(token.price)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleBuy}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20"
              >
                Buy {token.symbol}
              </button>
              <button
                onClick={handleSell}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20"
              >
                Sell {token.symbol}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Market Cap</span>
                <span className="font-medium">{formatNumber(token.marketCap)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">24h Volume</span>
                <span className="font-medium">{formatNumber(token.volume24h)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Supply</span>
                <span className="font-medium">{Number.parseFloat(token.totalSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Max Supply</span>
                <span className="font-medium">{Number.parseFloat(token.maxSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Decimals</span>
                <span className="font-medium">{token.decimals}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Creator</span>
                <span className="font-medium">{formatAddress(token.creator)}</span>
              </div>
            </div>

            {/* Token Management Section - Only visible to token owner */}
            {isOwner && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-bold mb-4">Token Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowMintForm(!showMintForm)
                      setShowBurnForm(false)
                    }}
                    className="flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Mint Tokens
                  </button>
                  <button
                    onClick={() => {
                      setShowBurnForm(!showBurnForm)
                      setShowMintForm(false)
                    }}
                    className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Burn Tokens
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mint Form - Only visible to token owner */}
          {isOwner && showMintForm && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Mint New Tokens</h3>

              {actionSuccess === "mint" ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Tokens Minted Successfully!</h4>
                  {txHash && (
                    <p className="text-gray-400 mb-4">
                      <a
                        href={`https://assethub-westend.subscan.io/evm/${TOKEN_HUB_ADDRESS}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View on Explorer
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleMint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Address</label>
                    <input
                      type="text"
                      value={mintTo}
                      onChange={(e) => setMintTo(e.target.value)}
                      placeholder="0x..."
                      className="block w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount ({token.symbol})</label>
                    <input
                      type="text"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      placeholder="100"
                      className="block w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
                      required
                    />
                  </div>

                  {actionError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{actionError}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                        isProcessing
                          ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Mint Tokens"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Burn Form - Only visible to token owner */}
          {isOwner && showBurnForm && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Burn Tokens</h3>

              {actionSuccess === "burn" ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Tokens Burned Successfully!</h4>
                  {txHash && (
                    <p className="text-gray-400 mb-4">
                      <a
                        href={`https://assethub-westend.subscan.io/evm/${TOKEN_HUB_ADDRESS}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View on Explorer
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleBurn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount to Burn ({token.symbol})
                    </label>
                    <input
                      type="text"
                      value={burnAmount}
                      onChange={(e) => setBurnAmount(e.target.value)}
                      placeholder="100"
                      className="block w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                      required
                    />
                  </div>

                  {actionError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{actionError}</p>
                    </div>
                  )}

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-2">
                    <p className="text-sm text-red-400">
                      Warning: This action is irreversible. Burned tokens cannot be recovered.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                        isProcessing
                          ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Burn Tokens"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Price Chart and Trading History */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Price Chart</h2>
              <div className="flex space-x-2">
                <button className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-500 px-3 py-1 rounded-md text-xs">
                  24H
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">7D</button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">1M</button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-xs">ALL</button>
              </div>
            </div>

            <div className="h-80">
              <PriceChart data={token.tradingHistory} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6">
            <h2 className="text-xl font-bold mb-6">Trading History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left pb-4">Date</th>
                    <th className="text-right pb-4">Price</th>
                    <th className="text-right pb-4">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {token.tradingHistory.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="py-3">{item.date}</td>
                      <td className="text-right py-3">{formatPrice(item.price)}</td>
                      <td className="text-right py-3">{formatNumber(item.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showTradeModal && token && (
        <TradeModal token={token} type={tradeType} onClose={() => setShowTradeModal(false)} />
      )}
    </main>
  )
}
