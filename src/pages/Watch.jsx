import { useParams, Link } from "react-router-dom";
import { usePurchase } from "../context/PurchaseContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { useShelbyVideos } from "../hooks/useShelbyVideos";

const comments = [
  { author: "@dianaputri", text: "Super clear explanation, understood it right away!", time: "2 hours ago" },
  { author: "@fajarcode", text: "Can you share the dataset link you used?", time: "5 hours ago" },
  { author: "@yudi_w", text: "Finally a complete and detailed tutorial.", time: "1 day ago" },
];

function WatchShelby({ id }) {
  const { connected } = useWallet();
  const savedUrl = sessionStorage.getItem(`videoUrl-${id}`);
  const videoUrl = savedUrl || `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${decodeURIComponent(id)}?apiKey=${import.meta.env.VITE_SHELBY_API_KEY}`;

  return (
    <main className="container">
      <div className="watch-layout">
        <div className="watch-main">
          <video
            controls
            style={{ width: "100%", borderRadius: "16px", background: "#000", marginBottom: 18 }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          <section className="comments">
            <h2>Comments</h2>
            {connected ? (
              comments.map((c, i) => (
                <div className="comment" key={i}>
                  <span className="avatar avatar-sm">{c.author[1].toUpperCase()}</span>
                  <div>
                    <p className="comment-author">{c.author} <span className="comment-time">· {c.time}</span></p>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#888" }}>Connect wallet to view comments.</p>
            )}
          </section>
        </div>
        <aside className="watch-side">
          <h3>About this video</h3>
          <p style={{ fontSize: 14, color: "#4a4a47", lineHeight: 1.6 }}>
            {sessionStorage.getItem(`desc-${id}`) || "No description available."}
          </p>
          <Link to="/" className="see-all" style={{ marginTop: 16, display: "block" }}>← Browse all videos</Link>


        </aside>
      </div>
    </main>
  );
}

export default function Watch() {
  const params = useParams();
  const id = params["*"] || params.id;
  const { connected, signAndSubmitTransaction } = useWallet();
  const { hasPurchased, buyVideo } = usePurchase();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const isShelby = id?.startsWith("0x") || id?.includes("/") || id?.includes("%2F");

  if (!id) {
    return (
      <div className="container">
        <p>Video not found.</p>
        <Link to="/" className="see-all">Back to home</Link>
      </div>
    );
  }

  if (isShelby) return <WatchShelby id={id} />;

  return (
    <div className="container">
      <p>Video not found.</p>
      <Link to="/" className="see-all">Back to home</Link>
    </div>
  );
}