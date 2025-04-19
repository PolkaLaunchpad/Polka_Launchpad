// src/lib/web3.ts
import { BrowserProvider } from "ethers";
import type { Signer } from "ethers";
import Web3Modal from "web3modal";

let web3Modal: Web3Modal;
let provider: BrowserProvider | null = null;
let signer: Signer | null = null;

export function initWeb3() {
  if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({ cacheProvider: true });
  }
}

export async function connectWallet(): Promise<{ provider: BrowserProvider; signer: Signer }> {
  const instance = await web3Modal.connect();
  provider = new BrowserProvider(instance);
  signer = await provider.getSigner();
  return { provider, signer };
}

export function getSigner(): Signer {
  if (!signer) throw new Error("Wallet not connected");
  return signer;
}
