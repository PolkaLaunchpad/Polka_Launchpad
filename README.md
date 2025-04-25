ERC-721: NFT and NFT Collection 'Minter' Contract:
0xa87fe90a07de4e10398f2203a9f3bd8b98cf902d

ERC-20: Coin 'Minter' Contract:
0xcc0927037e6b78cf9e9b647f34a1313252394860

TODO:
Move to Production Build and make further MVP advancements from there.

Modify NFT contact to be compatible with IPFS metadata URL's containing images, and not strictly require IPFS image URL's.
Allow NFT collections to be created with any ERC20 token as the purchasing currency.
ADD CREATE IMPLEMENTATIONS FOR:
- NFT [Where UI shows the user collections they have authority mint to]
- Add purchase, sell, burn implementation into UI for Tokens and NFT's
- Finish CLI for dev's to do all operations above + mass NFT mint from a CSV/JSON/TXT of IPFS Images & Metadata
- Add ability to pay for your token/collection to be 'featured'
- Replace Placeholder token data with real:
24h Volume
Market Cap
Displayed Price
Price Chart
Trading History

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
