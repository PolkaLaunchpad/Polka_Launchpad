// THIS IS THE PAGE TO EXPLORE ERC-721 TOKENS

import WalletConnector from '../../components/WalletConnector';
import NFTMinter from '../../components/NFTMinter';

export default function NFTMarketPage() {
  return (
    <main>
      <h2>NFT Marketplace</h2>
      <WalletConnector />
      <NFTMinter />
      {/* TODO: Display NFTs for trading */}
    </main>
  );
}