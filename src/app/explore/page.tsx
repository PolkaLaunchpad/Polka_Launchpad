// THIS IS THE PAGE TO EXPLORE ERC-20 TOKENS

import WalletConnector from '../../components/WalletConnector';
import FeaturedBidBanner from '../../components/FeaturedBidBanner';

export default function ExplorePage() {
  return (
    <main>
      <FeaturedBidBanner />
      <WalletConnector />
      <h2>Coin Trading</h2>
      {/* TODO: List tokens with buy/sell functionality */}
    </main>
  );
}