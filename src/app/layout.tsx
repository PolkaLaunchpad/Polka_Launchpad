import "./globals.css"
import type { ReactNode } from "react"
import Header from "../components/Header"

export const metadata = {
  title: "Polka Launchpad",
  description: "Multichain Coin & NFT Launchpad on Polkadot",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <Header />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  )
}
