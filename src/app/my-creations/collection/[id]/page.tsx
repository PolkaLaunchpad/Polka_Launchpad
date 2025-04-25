"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ethers, BrowserProvider } from "ethers"
import Web3Modal from "web3modal"
import {
  ArrowLeft,
  Loader2,
  User,
  Tag,
  Percent,
  Plus,
  AlertCircle,
  Check,
} from "lucide-react"
import PolkaNFTHubABI from "@/lib/abi/PolkaNFTHub3.json"

const NFT_HUB_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_HUB_ADDRESS ||
  "0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d"

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
  mintPrice: string
  minted: number
  maxSupply: number
  royaltyBP: number
  royaltyReceiver: string
  tokens: Token[]
}

export default function ManageCollectionPage() {
  const { id: collectionId } = useParams() as { id: string }
  const router = useRouter()

  // --- Wallet + State ---
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // --- Mint form state ---
  const [showMintForm, setShowMintForm] = useState(false)
  const [mintTo, setMintTo] = useState("")
  const [nftName, setNftName] = useState("")
  const [nftUri, setNftUri] = useState("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState<{
    txHash: string
    tokenId?: string
  } | null>(null)

  // --- Helpers ---
  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`

  // --- Load / Connect wallet ---
  useEffect(() => {
    const modal = new Web3Modal({ cacheProvider: true })
    if (modal.cachedProvider) connectWallet()
    else loadCollectionData(null)
  }, [])

  async function connectWallet() {
    try {
      const modal = new Web3Modal()
      const inst = await modal.connect()
      const web3p = new BrowserProvider(inst)
      setProvider(web3p)
      const s = await web3p.getSigner()
      setSigner(s)
      const addr = await s.getAddress()
      setAccount(addr)

      loadCollectionData(web3p, addr)
    } catch (err) {
      console.error(err)
      setError("Failed to connect wallet.")
      loadCollectionData(null)
    }
  }

  async function loadCollectionData(
    readProv: BrowserProvider | null,
    userAddr?: string
  ) {
    setLoading(true)
    setError(null)
    try {
      const rpc = new ethers.JsonRpcProvider(
        "https://westend-asset-hub-eth-rpc.polkadot.io",
        { chainId: 420420421, name: "asset-hub-westend" }
      )
      const readOnly = readProv || rpc
      const hub = new ethers.Contract(
        NFT_HUB_ADDRESS,
        PolkaNFTHubABI,
        readOnly
      )
      const col = await hub.getCollection(BigInt(collectionId))
      if (userAddr) {
        setIsOwner(col.creator.toLowerCase() === userAddr.toLowerCase())
      }

      const tokenIds: bigint[] = await hub.getTokensInCollection(
        BigInt(collectionId)
      )
      const tokens: Token[] = []
      for (const tId of tokenIds) {
        const owner = await hub.ownerOf(tId)
        const name = await hub.getTokenName(tId)
        const uri = await hub.tokenURI(tId)
        tokens.push({
          id: Number(tId),
          name,
          owner,
          uri,
          image: uri,
        })
      }

      setCollection({
        id: Number(collectionId),
        name: col.name,
        creator: col.creator,
        mintPrice: ethers.formatEther(col.mintPrice),
        minted: Number(col.minted),
        maxSupply: Number(col.maxSupply),
        royaltyBP: Number(col.royaltyBP),
        royaltyReceiver: col.royaltyReceiver,
        tokens,
      })
    } catch (err) {
      console.error(err)
      setError("Failed to load collection data.")
    } finally {
      setLoading(false)
    }
  }

  // --- Mint handler updated to match mint_named_nft.js ---
  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault()
    setMintError(null)
    setMintSuccess(null)

    if (!signer || !collection) {
      setMintError("Please connect your wallet first.")
      return
    }
    if (!mintTo || !nftName || !nftUri) {
      setMintError("All fields are required.")
      return
    }

    try {
      setIsMinting(true)
      const hub = new ethers.Contract(
        NFT_HUB_ADDRESS,
        PolkaNFTHubABI,
        signer
      )

      // fetch on-chain mintPrice
      const col = await hub.getCollection(BigInt(collection.id))
      const mintPriceWei: bigint = BigInt(col.mintPrice)

      // call mint(collectionId, to, name, uri) payable
      const tx = await hub.mint(
        BigInt(collection.id),
        mintTo,
        nftName,
        nftUri,
        { value: mintPriceWei }
      )
      setMintSuccess({ txHash: tx.hash })

      const receipt = await tx.wait()

      // parse TokenMinted event to get tokenId
      const ev = receipt.events?.find((e) => e.event === "TokenMinted")
      if (ev?.args) {
        setMintSuccess({
          txHash: tx.hash,
          tokenId: ev.args.tokenId.toString(),
        })
      }
    } catch (err: any) {
      console.error(err)
      setMintError(err.message || "Failed to mint NFT.")
    } finally {
      setIsMinting(false)
      // reload and reset form after a short delay
      setTimeout(() => {
        if (provider && account) loadCollectionData(provider, account)
        setShowMintForm(false)
        setMintTo("")
        setNftName("")
        setNftUri("")
        setMintSuccess(null)
      }, 3000)
    }
  }

  // --- UI states ---
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
        <Link href="/my-creations" className="flex items-center text-pink-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Creations
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error || "Collection not found"}</p>
          <Link
            href="/my-creations"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Return to My Creations
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/my-creations" className="flex items-center text-pink-500 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Creations
      </Link>

      {/* Collection Header */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-600/10 aspect-square rounded-xl flex items-center justify-center">
              <div className="text-6xl font-bold text-pink-500/30">
                {collection.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {isOwner && (
                <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-1 rounded-full">
                  Owner
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <User className="w-4 h-4 mr-2" />
                  Creator
                </div>
                <p className="font-medium">{formatAddress(collection.creator)}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <Tag className="w-4 h-4 mr-2" />
                  Mint Price
                </div>
                <p className="font-medium">{collection.mintPrice} WND</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <Percent className="w-4 h-4 mr-2" />
                  Royalty
                </div>
                <p className="font-medium">
                  {collection.royaltyBP / 100}%
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 10.5V13.5M12 7.5V16.5M17 10.5V13.5M6 20H18C19.1046 20 20 19.1046 20 
                      18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 
                      20 6 20Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Supply
                </div>
                <p className="font-medium">
                  {collection.minted}/{collection.maxSupply}
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowMintForm((f) => !f)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Mint New NFT
                </button>
                <Link
                  href={`/nft-market/collection/${collection.id}`}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full border border-white/20 text-sm"
                >
                  View Public Page
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mint Form */}
      {showMintForm && isOwner && (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Mint New NFT</h2>

          {mintSuccess ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">
                NFT Minted!
              </h4>
              <p className="text-gray-400 mb-2">
                Tx:{" "}
                <a
                  href={`https://assethub-westend.subscan.io/evm/${NFT_HUB_ADDRESS}/tx/${mintSuccess.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {mintSuccess.txHash.slice(0, 8)}…{mintSuccess.txHash.slice(-6)}
                </a>
              </p>
              {mintSuccess.tokenId && (
                <p className="text-gray-400">
                  Token ID: <strong>{mintSuccess.tokenId}</strong>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleMintNFT} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Mint To Address
                </label>
                <input
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  NFT Name
                </label>
                <input
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  placeholder="My Awesome NFT #1"
                  className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Metadata URI
                </label>
                <input
                  value={nftUri}
                  onChange={(e) => setNftUri(e.target.value)}
                  placeholder="ipfs://..."
                  className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-pink-500 focus:border-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter IPFS hash or URL for your metadata
                </p>
              </div>

              {mintError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{mintError}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isMinting}
                  className={`px-6 py-2.5 flex items-center gap-2 rounded-lg font-medium ${
                    isMinting
                      ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                  }`}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Minting…
                    </>
                  ) : (
                    "Mint NFT"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Token Grid */}
      <h2 className="text-2xl font-bold mb-6">NFTs in this Collection</h2>
      {collection.tokens.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-xl">
          <p className="text-gray-400">No NFTs found</p>
          {isOwner && (
            <button
              onClick={() => setShowMintForm(true)}
              className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm"
            >
              Mint Your First NFT
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collection.tokens.map((token) => (
            <div
              key={token.id}
              className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden"
            >
              <img
                src={token.uri || "/placeholder.svg"}
                alt={token.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?query=${encodeURIComponent(
                    token.name
                  )}`
                }}
              />
              <div className="p-4">
                <h3 className="font-bold truncate mb-1">{token.name}</h3>
                <p className="text-xs text-gray-400 truncate">
                  Owner: {formatAddress(token.owner)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
