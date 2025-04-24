// src/components/NFTMinter.tsx
"use client"

import { useState, useEffect } from "react"
import { ethers, BrowserProvider } from "ethers"
import Web3Modal from "web3modal"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import PolkaNFTHubABI from "@/lib/abi/PolkaNFTHub3.json"

const HUB_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_HUB_ADDRESS ||
  "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"

export default function NFTMinter() {
  // form inputs
  const [name, setName] = useState("")                    // COLLECTION_NAME
  const [mintPrice, setMintPrice] = useState("0.01")       // MINT_PRICE_WND
  const [maxSupply, setMaxSupply] = useState("100")        // MAX_SUPPLY
  const [royaltyReceiver, setRoyaltyReceiver] = useState("") // ROYALTY_RECEIVER
  const [royaltyBP, setRoyaltyBP] = useState("250")        // ROYALTY_BP

  // wallet & UI state
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null)
  const [walletMessage, setWalletMessage] = useState(
    "Connect your wallet to create a collection"
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    txHash: string
    collectionId?: string
  } | null>(null)

  // instantiate Web3Modal once
  useEffect(() => {
    setWeb3Modal(new Web3Modal({ cacheProvider: true }))
  }, [])

  // auto-reconnect if cached
  useEffect(() => {
    if (web3Modal?.cachedProvider) connectWallet()
  }, [web3Modal])

  async function connectWallet() {
    try {
      if (!web3Modal) return
      const instance = await web3Modal.connect()
      const web3Provider = new BrowserProvider(instance)
      setProvider(web3Provider)

      const signer = await web3Provider.getSigner()
      const addr = await signer.getAddress()
      setAccount(addr)
      setRoyaltyReceiver(addr) // default royalty receiver → you

      setWalletMessage("")
    } catch (err) {
      console.error("Wallet connect error:", err)
      setWalletMessage("Failed to connect wallet")
    }
  }

  async function disconnectWallet() {
    if (!web3Modal) return
    await web3Modal.clearCachedProvider()
    setAccount(null)
    setProvider(null)
    setWalletMessage("Connect your wallet to create a collection")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!provider) {
      setError("Please connect your wallet first.")
      return
    }

    if (!name || !mintPrice || !maxSupply || !royaltyReceiver || !royaltyBP) {
      setError("All fields are required.")
      return
    }

    try {
      setIsSubmitting(true)
      const signer = await provider.getSigner()
      const hub = new ethers.Contract(HUB_ADDRESS, PolkaNFTHubABI, signer)

      // parse to the same types your script uses
      const mintPriceWei = ethers.parseEther(mintPrice)         // parse 0.01 → Wei
      const maxSupplyInt = ethers.parseUnits(maxSupply, 0)     // parse "100" → 100n
      const royaltyBPInt  = parseInt(royaltyBP, 10)            // e.g. 250

      console.log("👤 createCollection with:", await signer.getAddress())
      console.log("👑 hub owner:", await hub.owner())

      console.log(
        `🚀 sending createCollection("${name}", ${mintPrice} WND, ${maxSupply}, ${royaltyReceiver}, ${royaltyBP})`
      )
      const tx = await hub.createCollection(
        name,
        mintPriceWei,
        maxSupplyInt,
        royaltyReceiver,
        royaltyBPInt
      )
      setSuccess({ txHash: tx.hash })

      const receipt = await tx.wait()
      console.log("✅ Included in block", receipt.blockNumber)

      // pull the CollectionCreated event
      const ev = receipt.events?.find((e) => e.event === "CollectionCreated")
      if (ev?.args) {
        setSuccess({
          txHash: tx.hash,
          collectionId: ev.args.collectionId.toString(),
        })
      } else {
        console.warn("⚠️ CollectionCreated event not found in logs")
      }
    } catch (err: any) {
      console.error("❌ Failed to create collection:", err)
      setError(err.message || "Failed to create collection")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-6">Create Your NFT Collection</h3>

      {!account ? (
        // 1) Connect wallet
        <div className="space-y-4 text-center">
          <p className="text-gray-400">{walletMessage}</p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full"
          >
            Connect Wallet
          </button>
        </div>
      ) : success ? (
        // 2) Success state
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Collection Created!</h4>
          <p className="text-gray-400 mb-2">
            Tx Hash:{" "}
            <a
              href={`https://assethub-westend.subscan.io/evm/${HUB_ADDRESS}/tx/${success.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {success.txHash.slice(0, 8)}…{success.txHash.slice(-6)}
            </a>
          </p>
          {success.collectionId && (
            <p className="text-gray-400 mb-4">
              Collection ID: <strong>{success.collectionId}</strong>
            </p>
          )}
          <button
            onClick={() => {
              setSuccess(null)
              setName("")
              setMintPrice("0.01")
              setMaxSupply("100")
              setRoyaltyBP("250")
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Create Another
          </button>
        </div>
      ) : (
        // 3) The form
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Collection Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="Test01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mint Price (WND)
            </label>
            <input
              type="text"
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Max Supply
            </label>
            <input
              type="number"
              min="1"
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Royalty Receiver
            </label>
            <input
              value={royaltyReceiver}
              onChange={(e) => setRoyaltyReceiver(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="0x1fF116257e646b6C0220a049e893e81DE87fc475"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Royalty (bps)
            </label>
            <input
              type="number"
              min="0"
              max="10000"
              value={royaltyBP}
              onChange={(e) => setRoyaltyBP(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="250"
              required
            />
            <p className="text-xs text-gray-500 mt-1">100 bps = 1%</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={disconnectWallet}
              className="text-sm text-gray-400 hover:underline"
            >
              Disconnect Wallet
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center ${
                isSubmitting
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Collection"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
