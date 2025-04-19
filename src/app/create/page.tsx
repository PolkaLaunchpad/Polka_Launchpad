"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TokenMinter from "../../components/TokenMinter"
import NFTMinter from "../../components/NFTMinter"

export default function CreatePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Project</h1>
          <p className="text-gray-400">Launch your own token or NFT collection on the Polka Launchpad</p>
        </div>

        <Tabs defaultValue="token" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="token" className="text-sm">
              Create Token (ERC-20)
            </TabsTrigger>
            <TabsTrigger value="nft" className="text-sm">
              Create NFT (ERC-721/1155)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="token">
            <TokenMinter />
          </TabsContent>
          <TabsContent value="nft">
            <NFTMinter />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
