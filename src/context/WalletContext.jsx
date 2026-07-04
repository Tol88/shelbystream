import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

export default function WalletProvider({ children }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => console.error("Wallet error:", error)}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}