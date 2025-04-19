import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Polka Launchpad',
  description: 'Multichain Coin & NFT Launchpad on Polkadot',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}