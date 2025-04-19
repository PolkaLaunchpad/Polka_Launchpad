'use client';
import { useEffect, useState } from "react";
import { initWeb3, connectWallet } from "../lib/web3";

export default function WalletConnector() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    initWeb3();
    if (window.ethereum?.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const handleConnect = async () => {
    const { signer } = await connectWallet();
    const addr = await signer.getAddress();
    setAddress(addr);
  };

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}