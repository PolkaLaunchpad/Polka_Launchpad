"use client"
import { useState } from "react"
import type React from "react"

import { Check, AlertCircle, Loader2 } from "lucide-react"

export default function TokenMinter() {
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [supply, setSupply] = useState("1000000")
  const [decimals, setDecimals] = useState("18")
  const [tokenType, setTokenType] = useState<"ERC-20" | "ERC-1155">("ERC-20")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setIsSubmitting(true)

      // In a real app, you would call the token minting contract here
      // For now, we'll just simulate a successful mint
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setName("")
        setSymbol("")
        setSupply("1000000")
        setDecimals("18")
        setTokenType("ERC-20")
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to mint token. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-6">Create Your Token</h3>

      {success ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Token Created Successfully!</h4>
          <p className="text-gray-400 mb-4">Your token has been created and is now available in your wallet.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Create Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Token Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="My Awesome Token"
                required
              />
            </div>

            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">
                Token Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="TKN"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label htmlFor="tokenType" className="block text-sm font-medium text-gray-300 mb-1">
                Token Standard
              </label>
              <select
                id="tokenType"
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value as "ERC-20" | "ERC-1155")}
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                required
              >
                <option value="ERC-20">ERC-20 (Fungible)</option>
                <option value="ERC-1155">ERC-1155 (Multi-Token)</option>
              </select>
            </div>

            <div>
              <label htmlFor="supply" className="block text-sm font-medium text-gray-300 mb-1">
                Initial Supply
              </label>
              <input
                type="number"
                id="supply"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                min="1"
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <label htmlFor="decimals" className="block text-sm font-medium text-gray-300 mb-1">
                Decimals
              </label>
              <input
                type="number"
                id="decimals"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                min="0"
                max="18"
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="18"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Standard is 18 (like ETH)</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center ${
              isSubmitting
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Token"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
