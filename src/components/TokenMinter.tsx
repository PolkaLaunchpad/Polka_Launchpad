"use client"

import { useState, useEffect } from "react"
import Web3Modal from "web3modal"
import { ethers, BrowserProvider } from "ethers"
import PolkaTokenHubABI from "@/lib/abi/PolkaTokenHub.json"
import { Check, AlertCircle, Loader2 } from "lucide-react"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_HUB_ADDRESS ||
  "0xcc0927037e6b78cf9e9b647f34a1313252394860"

export default function TokenMinter() {
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [maxSupply, setMaxSupply] = useState("1000000")
  const [decimals, setDecimals] = useState("18")

  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

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
      setSigner(userSigner)
      const addr = await userSigner.getAddress()
      setAccount(addr)
    } catch (err) {
      console.error("Wallet connection failed", err)
      setError("Failed to connect wallet.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!signer) {
      setError("Please connect your wallet first.")
      return
    }

    if (!name || !symbol || !decimals || !initialSupply || !maxSupply) {
      setError("All fields are required.")
      return
    }

    setIsSubmitting(true)

    try {
      // Parse numeric inputs
      const dec = parseInt(decimals)
      const init = ethers.parseUnits(initialSupply, dec)
      const max = ethers.parseUnits(maxSupply, dec)

      // Create contract with signer
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PolkaTokenHubABI,
        signer
      )

      // Send transaction
      const tx = await contract.createToken(
        name,
        symbol,
        dec,
        init,
        max
      )
      setTxHash(tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log("Token created in block", receipt.blockNumber)

      // Optionally parse event
      const parsed = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find(ev => ev && ev.name === "TokenCreated")

      if (!parsed) console.warn("No TokenCreated event found in logs.")

      setSuccess(true)

      // Reset form after delay
      setTimeout(() => {
        setName("")
        setSymbol("")
        setInitialSupply("1000000")
        setMaxSupply("1000000")
        setDecimals("18")
        setSuccess(false)
        setTxHash(null)
      }, 5000)

    } catch (err: any) {
      console.error("Creation failed", err)
      setError(err.message || "Failed to create token.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-6">Create Your Token</h3>

      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium"
        >
          Connect Wallet
        </button>
      ) : success ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Token Created!</h4>
          {txHash && (
            <p className="text-gray-400 text-sm mb-4">
              <a
                href={`https://assethub-westend.subscan.io/evm/${CONTRACT_ADDRESS}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Explorer
              </a>
            </p>
          )}
          <button
            onClick={() => setSuccess(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Create Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Token Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white"
            required
          />

          <input
            type="text"
            placeholder="Symbol (e.g. TKN)"
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            maxLength={10}
            className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Decimals"
              value={decimals}
              onChange={e => setDecimals(e.target.value)}
              min="0"
              max="18"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white"
              required
            />
            <input
              type="number"
              placeholder="Initial Supply"
              value={initialSupply}
              onChange={e => setInitialSupply(e.target.value)}
              min="1"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <input
            type="number"
            placeholder="Max Supply"
            value={maxSupply}
            onChange={e => setMaxSupply(e.target.value)}
            min={initialSupply || "1"}
            className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white"
            required
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
              isSubmitting
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
            ) : (
              "Create Token"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
