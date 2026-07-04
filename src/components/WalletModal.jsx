import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletModal({ onClose }) {
  const { wallets, connect } = useWallet();

  const handleConnect = async (walletName) => {
    try {
      await connect(walletName);
      onClose();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Connect Wallet</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">Select your Aptos wallet to continue.</p>
        <div className="wallet-list">
          {wallets.length === 0 && (
            <p className="no-wallet">No wallet detected. Please install <a href="https://petra.app" target="_blank" rel="noreferrer">Petra</a> or <a href="https://martianwallet.xyz" target="_blank" rel="noreferrer">Martian</a>.</p>
          )}
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="wallet-item"
              onClick={() => handleConnect(wallet.name)}
            >
              {wallet.icon && (
                <img src={wallet.icon} alt={wallet.name} className="wallet-icon" />
              )}
              <span>{wallet.name}</span>
              {!wallet.readyState === "Installed" && (
                <span className="wallet-install">Install</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}