"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Upload, X, Check, AlertCircle, Loader2 } from "lucide-react"

export default function NFTMinter() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [royalty, setRoyalty] = useState("10")
  const [tokenType, setTokenType] = useState<"ERC-721" | "ERC-1155">("ERC-721")
  const [supply, setSupply] = useState("1")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!image) {
      setError("Please upload an image for your NFT")
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, you would:
      // 1. Upload the image to IPFS
      // 2. Create metadata JSON and upload to IPFS
      // 3. Call the NFT minting contract with the IPFS URI

      // For now, we'll just simulate a successful mint
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setName("")
        setDescription("")
        setRoyalty("10")
        setTokenType("ERC-721")
        setSupply("1")
        setImage(null)
        setImagePreview(null)
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-6">Mint Your NFT</h3>

      {success ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">NFT Minted Successfully!</h4>
          <p className="text-gray-400 mb-4">Your NFT has been minted and is now available in your wallet.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Mint Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  imagePreview
                    ? "border-pink-500/50 bg-pink-500/5"
                    : "border-gray-700 hover:border-pink-500/30 hover:bg-gray-800/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="NFT Preview"
                      className="w-full h-64 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImage(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-300 font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  NFT Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                  placeholder="My Awesome NFT"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                  placeholder="Describe your NFT..."
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="tokenType" className="block text-sm font-medium text-gray-300 mb-1">
                Token Standard
              </label>
              <select
                id="tokenType"
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value as "ERC-721" | "ERC-1155")}
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                required
              >
                <option value="ERC-721">ERC-721 (Non-Fungible)</option>
                <option value="ERC-1155">ERC-1155 (Multi-Token)</option>
              </select>
            </div>

            <div>
              <label htmlFor="supply" className="block text-sm font-medium text-gray-300 mb-1">
                Supply
              </label>
              <input
                type="number"
                id="supply"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                min="1"
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="1"
                disabled={tokenType === "ERC-721"}
                required
              />
              {tokenType === "ERC-721" && (
                <p className="text-xs text-gray-500 mt-1">ERC-721 tokens are unique (supply of 1)</p>
              )}
            </div>

            <div>
              <label htmlFor="royalty" className="block text-sm font-medium text-gray-300 mb-1">
                Royalty Percentage
              </label>
              <input
                type="number"
                id="royalty"
                value={royalty}
                onChange={(e) => setRoyalty(e.target.value)}
                min="0"
                max="50"
                className="block w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="10"
                required
              />
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
            disabled={isSubmitting || !image}
            className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center ${
              isSubmitting || !image
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
