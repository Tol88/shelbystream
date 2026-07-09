import { useState } from "react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

async function registerUploader(addr) {
  try {
    await fetch("/api/uploaders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
    });
  } catch (err) {
    console.error("Register failed:", err);
  }
}

export default function Upload() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => {
      setShowToast(true);
      setTitle("");
      setDescription("");
      setFile(null);
      setPrice("0");
      setErrorMsg("");
      setTimeout(() => navigate("/"), 4000);
    },
    onError: (err) => {
      console.error("Upload failed:", err);
      setErrorMsg(err?.message || "Upload failed. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !account) return;
    setErrorMsg("");

    const addr = typeof account.address === "string"
      ? account.address
      : account.address.toString();

    const timestamp = Date.now();
    const videoName = `${timestamp}-${file.name}`;
    const metaName = `${timestamp}-${file.name}.meta.json`;

    const fileData = new Uint8Array(await file.arrayBuffer());
    const metadata = { title, description, price, fileName: file.name, uploadedAt: new Date().toISOString() };
    const metaData = new TextEncoder().encode(JSON.stringify(metadata));

    await registerUploader(addr);

    uploadBlobs.mutate({
      signer: {
        account,
        signAndSubmitTransaction: async (tx) => await signAndSubmitTransaction(tx),
      },
      blobs: [
        { blobName: videoName, blobData: fileData },
        { blobName: metaName, blobData: metaData },
      ],
      expirationMicros: Date.now() * 1000 + 86400000000 * 365,
    });
  };

  if (!connected) {
    return (
      <main className="container">
        <div className="upload-box">
          <h1>Upload video</h1>
          <div className="upload-warning">
            <p>Please connect your wallet first before uploading a video.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      {showToast && (
        <Toast
          message="Video uploaded successfully! Redirecting to home..."
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="upload-box">
        <h1>Upload video</h1>
        <p className="upload-sub">Share your video and earn sUSD from viewers. Stored on Shelby Protocol Shelbynet.</p>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label>
            Video title
            <input type="text" placeholder="Example: Fine-tune LLM tutorial" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea rows={4} placeholder="Tell us about this video" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label>
            Video file
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
          </label>
          <label>
            Watch price
            <div className="price-input">
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              <span>sUSD (set 0 for free)</span>
            </div>
          </label>
          <button type="submit" className="btn btn-primary upload-submit" disabled={uploadBlobs.isPending}>
            {uploadBlobs.isPending ? "Uploading to Shelby..." : "Upload video"}
          </button>
          {errorMsg && <p className="upload-error">{errorMsg}</p>}
        </form>
      </div>
    </main>
  );
}