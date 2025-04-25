"use client"
import { useState } from "react"
import type React from "react"

import { X, DollarSign, AlertCircle } from "lucide-react"

type Item = {
  id: string
  type: string
  name: string
  description: string
  image: string
  currentBid: string
  creator: string
  link: string
}

interface BidModalProps {
  item: Item
  onClose: () => void
}

export default function BidModal({ item, onClose }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate bid amount
    const bid = Number.parseFloat(bidAmount)
    if (isNaN(bid) || bid <= 0) {
      setError("Please enter a valid bid amount")
      return
    }

    const currentBid = Number.parseFloat(item.currentBid)
    if (bid <= currentBid) {
      setError(`Bid must be higher than the current bid (${currentBid} WND)`)
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, you would call a smart contract here
      // For now, we'll just simulate a successful bid
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to place bid. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center mb-4">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover mr-4"
          />
          <div>
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p className="text-sm text-gray-400">Current bid: {item.currentBid} WND</p>
          </div>
        </div>

        {success ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center mb-4">
            <p className="text-green-400 font-medium">Bid placed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleBidSubmit}>
            <div className="mb-4">
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-1">
                Your Bid (WND)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder={`Min ${(Number.parseFloat(item.currentBid) + 0.01).toFixed(2)}`}
                  className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="text-xs text-gray-400 mb-4">
              <p>
                By placing a bid, you agree to our Terms of Service and that your bid will be visible on the featured
                section if it's the highest.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-medium ${
                isSubmitting
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
              }`}
            >
              {isSubmitting ? "Processing..." : "Place Bid"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
