"use client"

import { useState } from "react"
import type React from "react"
import { X, AlertCircle, Loader2 } from "lucide-react"

interface Token {
  id: string // Changed to string to match TokenCard interface
  name: string
  symbol: string
  price: number
}

interface TradeModalProps {
  token: Token
  type: "buy" | "sell"
  onClose: () => void
}

export default function TradeModal({ token, type, onClose }: TradeModalProps) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate amount
    const tokenAmount = Number.parseFloat(amount)
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, you would call a smart contract here
      // For now, we'll just simulate a successful trade
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || `Failed to ${type} tokens. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = Number.parseFloat(amount || "0") * token.price

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center mb-6">
          <h3 className="text-xl font-bold">
            {type === "buy" ? "Buy" : "Sell"} {token.symbol}
          </h3>
        </div>

        {success ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center mb-4">
            <p className="text-green-400 font-medium">{type === "buy" ? "Purchase" : "Sale"} completed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Amount ({token.symbol})
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
                placeholder="0.00"
                className="block w-full px-3 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white placeholder-gray-500"
                required
              />
            </div>

            <div className="mb-6 bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price per {token.symbol}</span>
                <span className="font-medium">${token.price.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="font-medium">${isNaN(totalPrice) ? "0.00" : totalPrice.toFixed(6)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className={`w-full py-3 rounded-lg font-medium ${
                isSubmitting || !amount
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : type === "buy"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                    : "bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                  Processing...
                </>
              ) : (
                `${type === "buy" ? "Buy" : "Sell"} ${token.symbol}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
