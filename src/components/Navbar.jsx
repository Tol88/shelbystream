import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { trending, free } from "../data";
import WalletModal from "./WalletModal";

const allVideos = [...trending, ...free];

const getAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return address.toString();
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { connected, account } = useWallet();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() === "") { setResults([]); return; }
    const filtered = allVideos.filter((v) =>
      v.title.toLowerCase().includes(val.toLowerCase()) ||
      v.author.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
  };

  const clearSearch = () => { setQuery(""); setResults([]); };

  const addr = getAddress(account?.address);
  const shortAddress = addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  return (
    <>
      <header className="navbar">
        <div className="navbar-row">
          <Link to="/" className="brand">
            <span className="brand-dot" />
            ShelbyStream
          </Link>
          <nav className="nav-links">
            <Link to="/" className={pathname === "/" ? "active-link" : ""}>Explore</Link>
            <Link to="/trending" className={pathname === "/trending" ? "active-link" : ""}>Trending</Link>
            <Link to="/categories" className={pathname === "/categories" ? "active-link" : ""}>Categories</Link>
          </nav>
          <div className="navbar-actions">
            <div className="search-wrap">
              <input
                className="search-input"
                type="text"
                placeholder="Search videos..."
                value={query}
                onChange={handleSearch}
              />
              {results.length > 0 && (
                <div className="search-dropdown">
                  {results.map((v) => (
                    <Link
                      to={`/watch/${v.id}`}
                      key={v.id}
                      className="search-item"
                      onClick={clearSearch}
                    >
                      <span className="avatar avatar-sm">{v.initials}</span>
                      <div>
                        <p className="search-title">{v.title}</p>
                        <p className="search-author">{v.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {connected ? (
              <Link to="/profile" className="btn btn-outline wallet-connected">
                ● {shortAddress}
              </Link>
            ) : (
              <button className="btn btn-outline" onClick={() => setShowModal(true)}>
                Connect wallet
              </button>
            )}
            <Link to="/upload" className="btn btn-primary">Upload</Link>
          </div>
        </div>
        <div className="tabs-row">
          <Link to="/" className={`tab ${pathname === "/" ? "active" : ""}`}>Home</Link>
          <Link to="/upload" className={`tab ${pathname === "/upload" ? "active" : ""}`}>Upload video</Link>

        </div>
      </header>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}