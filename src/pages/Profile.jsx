import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link } from "react-router-dom";
import { useShelbyVideos } from "../hooks/useShelbyVideos";
import { useState, useRef } from "react";
import { useUploadBlobs, useDeleteBlobs } from "@shelby-protocol/react";

const getAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return address.toString();
};

function VideoCardProfile({ v, username, addr, account, signAndSubmitTransaction }) {
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(v.title);
  const [description, setDescription] = useState(v.description || "");
  const [price, setPrice] = useState(v.price === "Free" ? "0" : v.price.replace(" sUSD", ""));
  const [saving, setSaving] = useState(false);

  const decodedId = decodeURIComponent(v.id);
  const parts = decodedId.split("/");
  const blobNameSuffix = parts[1];
  const metaSuffix = blobNameSuffix + ".meta.json";

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => { setSaving(false); setEditing(false); },
    onError: () => setSaving(false),
  });

  const deleteBlobs = useDeleteBlobs({
    onSuccess: () => window.location.reload(),
    onError: (err) => console.error("Delete failed:", err),
  });

  const handleSave = async () => {
    setSaving(true);
    const metadata = { title, description, price, fileName: blobNameSuffix, updatedAt: new Date().toISOString() };
    const metaData = new TextEncoder().encode(JSON.stringify(metadata));
    uploadBlobs.mutate({
      signer: {
        account,
        signAndSubmitTransaction: async (tx) => await signAndSubmitTransaction(tx),
      },
      blobs: [{ blobName: metaSuffix, blobData: metaData }],
      expirationMicros: Date.now() * 1000 + 86400000000 * 30,
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    deleteBlobs.mutate({
      signer: {
        account,
        signAndSubmitTransaction: async (tx) => await signAndSubmitTransaction(tx),
      },
      blobNames: [blobNameSuffix, metaSuffix],
    });
  };

  return (
    <div className="video-card-wrap">
      <div className="video-card">
        <div className="thumb" style={{ background: v.color, position: "relative" }}>
          {playing && v.videoUrl ? (
            <video
              controls autoPlay
              style={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover" }}
              onEnded={() => setPlaying(false)}
            >
              <source src={v.videoUrl} type="video/mp4" />
            </video>
          ) : (
            <>
              <span className={`price-tag ${v.free ? "price-free" : ""}`}>{v.price}</span>
              {v.videoUrl && (
                <button className="thumb-play-btn" onClick={() => setPlaying(true)}>▶</button>
              )}
              <span className="duration-tag">{v.duration}</span>
            </>
          )}
        </div>

        {editing ? (
          <div className="inline-edit">
            <input
              className="edit-name-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
            />
            <textarea
              className="edit-name-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <div className="price-input" style={{ marginTop: 6 }}>
              <input
                type="number" min="0" step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: "1px solid #d8d8d5" }}
              />
              <span style={{ fontSize: 13, color: "#6b6b67" }}>sUSD</span>
            </div>
            <div className="edit-name-row" style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="video-card-body">
            <span
              className="avatar avatar-sm"
              style={{ background: `hsl(${parseInt(addr?.slice(2, 5) || "0", 16) % 360}, 60%, 45%)` }}
            >
              {v.initials}
            </span>
            <div style={{ flex: 1 }}>
              <p className="video-title">{title}</p>
              <p className="video-author">@{username || addr.slice(0, 8)}</p>
              <p className="video-views">{v.views}</p>
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <button
                className="avatar-edit-btn"
                style={{ position: "static" }}
                onClick={() => setEditing(true)}
              >✎</button>
              <button
                className="avatar-edit-btn"
                style={{ position: "static", background: "#060606" }}
                onClick={handleDelete}
                disabled={deleteBlobs.isPending}
              >🗑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { connected, account, disconnect, signAndSubmitTransaction } = useWallet();
  const addr = getAddress(account?.address);

  const [username, setUsername] = useState(() => localStorage.getItem(`username-${addr}`) || "");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar-${addr}`) || null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const { videos: myVideos, isLoading } = useShelbyVideos(addr);

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => console.log("Profile saved to Shelbynet"),
    onError: (err) => console.error("Profile save failed:", err),
  });

  const saveName = () => {
    setUsername(tempName);
    localStorage.setItem(`username-${addr}`, tempName);
    setEditingName(false);
    const data = new TextEncoder().encode(JSON.stringify({ username: tempName }));
    uploadBlobs.mutate({
      signer: { account, signAndSubmitTransaction: async (tx) => await signAndSubmitTransaction(tx) },
      blobs: [{ blobName: "profile.json", blobData: data }],
      expirationMicros: Date.now() * 1000 + 86400000000 * 365,
    });
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setAvatar(result);
      localStorage.setItem(`avatar-${addr}`, result);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected) {
    return (
      <main className="container">
        <div className="upload-box">
          <h1>Profile</h1>
          <div className="upload-warning">
            <p>Please connect your wallet first to view your profile.</p>
          </div>
        </div>
      </main>
    );
  }

  const shortAddress = addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
  const displayName = username || shortAddress;

  return (
    <main className="container">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar-img" />
          ) : (
            <div
              className="profile-avatar"
              style={{ background: `hsl(${parseInt(addr?.slice(2, 5) || "0", 16) % 360}, 60%, 45%)` }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <button className="avatar-edit-btn" onClick={() => fileRef.current.click()}>✎</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
        </div>

        <div className="profile-info">
          {editingName ? (
            <div className="edit-name-row">
              <input
                className="edit-name-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter username"
                maxLength={30}
              />
              <button className="btn btn-primary" onClick={saveName}>Save</button>
              <button className="btn btn-outline" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <div className="edit-name-row">
              <h1 className="profile-name">@{displayName}</h1>
              <button className="avatar-edit-btn" onClick={() => { setTempName(username); setEditingName(true); }}>✎</button>
            </div>
          )}

          <button className="copy-wallet-btn" onClick={handleCopy}>
            {copied ? "✓ Copied!" : "📋 Copy wallet address"}
          </button>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{myVideos.length}</span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="stat">
              <span className="stat-number">0 sUSD</span>
              <span className="stat-label">Earned</span>
            </div>
            <div className="stat">
              <span className="stat-number">Shelbynet</span>
              <span className="stat-label">Network</span>
            </div>
          </div>

          <button className="btn btn-outline disconnect-btn" onClick={disconnect}>
            Disconnect wallet
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="page-title">My Videos</h2>
        {isLoading && <p style={{ color: "#888" }}>Loading your videos...</p>}
        {!isLoading && myVideos.length === 0 && (
          <p style={{ color: "#888" }}>No videos uploaded yet. <Link to="/upload" className="see-all">Upload your first video</Link></p>
        )}
        <div className="video-grid">
          {myVideos.map((v) => (
            <VideoCardProfile
              key={v.id}
              v={v}
              username={username}
              addr={addr}
              account={account}
              signAndSubmitTransaction={signAndSubmitTransaction}
            />
          ))}
        </div>
      </div>
    </main>
  );
}