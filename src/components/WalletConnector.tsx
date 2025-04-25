"use client"
import { useEffect, useState } from "react"
import { initWeb3, connectWallet } from "../lib/web3"
import { Wallet, Loader2 } from "lucide-react"

export default function WalletConnector() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    initWeb3()
    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          fetchBalance(accounts[0])
        } else {
          setAddress(null)
          setBalance(null)
        }
      })
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum?.selectedAddress) {
      setAddress(window.ethereum.selectedAddress)
      fetchBalance(window.ethereum.selectedAddress)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      const { provider } = await connectWallet()
      const balance = await provider.getBalance(address)
      // Convert to ETH//native token and format to 4 decimal places
      const ethBalance = Number.parseFloat(balance.toString()) / 1e18
      setBalance(ethBalance.toFixed(4))
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const { signer } = await connectWallet()
      const addr = await signer.getAddress()
      setAddress(addr)
      fetchBalance(addr)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div>
      {address ? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-500/30">
          {balance && <span className="text-xs font-medium text-pink-300">{balance} WND</span>}
          <div className="flex items-center gap-1 text-sm font-medium text-white">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {formatAddress(address)}
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20"
        >
          {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          Connect Wallet
        </button>
      )}
    </div>
  )
}
