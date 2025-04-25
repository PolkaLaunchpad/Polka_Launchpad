"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletConnector from "./WalletConnector"
import { Sparkles, Coins, ImageIcon, Home, Menu, X, User } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Explore Tokens", path: "/explore", icon: <Coins className="w-4 h-4 mr-2" /> },
    { name: "NFT Market", path: "/nft-market", icon: <ImageIcon className="w-4 h-4 mr-2" /> },
    { name: "Create", path: "/create", icon: <Sparkles className="w-4 h-4 mr-2" /> },
    { name: "My Creations", path: "/my-creations", icon: <User className="w-4 h-4 mr-2" /> },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <div className="absolute w-2 h-2 bg-white rounded-full top-2 left-2"></div>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-3 right-2"></div>
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              PolkaLaunch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center text-sm font-medium transition-colors hover:text-pink-500 ${
                  pathname === item.path ? "text-pink-500" : "text-gray-300"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <WalletConnector />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-300 hover:text-pink-500 focus:outline-none" onClick={toggleMenu}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-black/90 backdrop-blur-md rounded-xl">
            <nav className="flex flex-col space-y-4 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-pink-500 ${
                    pathname === item.path ? "text-pink-500" : "text-gray-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                <WalletConnector />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
