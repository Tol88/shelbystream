import { useParams, Link } from "react-router-dom";
import { usePurchase } from "../context/PurchaseContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_SHELBY_API_KEY;

const comments = [
  { author: "@Akasha|Shelby", text: "Super clear explanation, understood it right away!", time: "2 hours ago" },
  { author: "@Castro", text: "Can you share the dataset link you used?", time: "5 hours ago" },
  { author: "@Mbappe Oppa", text: "Finally a complete and detailed tutorial.", time: "1 day ago" },
];

function WatchShelby({ id }) {
  const { connected } = useWallet();
  const savedUrl = sessionStorage.getItem(`videoUrl-${id}`);
  const videoUrl = savedUrl || `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${decodeURIComponent(id)}?apiKey=${API_KEY}`;

  const [description, setDescription] = useState(sessionStorage.getItem(`desc-${id}`) || "");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const decodedId = decodeURIComponent(id);
    const parts = decodedId.split("/");
    const addr = parts[0];
    const blobSuffix = parts[1];
    const metaUrl = `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${addr}/${blobSuffix}.meta.json?apiKey=${API_KEY}`;
    fetch(metaUrl)
      .then(r => r.json())
      .then(meta => {
        if (meta.description) setDescription(meta.description);
        if (meta.title) setTitle(meta.title);
      })
      .catch(() => {});
  }, [id]);

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
          {title && (
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1c1c1c", marginBottom: 8 }}>
              {title}
            </p>
          )}
          <div style={{ fontSize: 14, color: "#000000", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {description ? description.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
              /^https?:\/\//.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "underline" }}>
                {part}
                </a>
              ) : part
            ) : "No description available."}
          </div>
          <Link to="/" className="see-all" style={{ marginTop: 16, display: "block" }}>
            ← Browse all videos
          </Link>
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