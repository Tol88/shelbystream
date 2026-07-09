import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUploadBlobs } from "@shelby-protocol/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const API_KEY = import.meta.env.VITE_SHELBY_API_KEY;

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, signAndSubmitTransaction } = useWallet();

  const decodedId = decodeURIComponent(id);
  const parts = decodedId.split("/");
  const addr = parts[0];
  const blobNameSuffix = parts[1];
  const metaSuffix = blobNameSuffix + ".meta.json";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => setDone(true),
    onError: (err) => setErrorMsg(err?.message || "Failed to save changes."),
  });

  if (!loaded) {
    fetch(`https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${addr}/${metaSuffix}?apiKey=${API_KEY}`)
      .then(res => res.text())
      .then(text => {
        const meta = JSON.parse(text);
        setTitle(meta.title || "");
        setDescription(meta.description || "");
        setPrice(meta.price || "0");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return;
    setErrorMsg("");

    const metadata = {
      title,
      description,
      price,
      fileName: blobNameSuffix,
      updatedAt: new Date().toISOString(),
    };

    const metaData = new TextEncoder().encode(JSON.stringify(metadata));

    uploadBlobs.mutate({
      signer: {
        account,
        signAndSubmitTransaction: async (tx) => await signAndSubmitTransaction(tx),
      },
      blobs: [{ blobName: metaSuffix, blobData: metaData }],
      expirationMicros: Date.now() * 1000 + 86400000000 * 365,
    });
  };

  if (done) {
    return (
      <main className="container">
        <div className="upload-box">
          <div className="upload-success">
            <p>Video updated successfully!</p>
            <button className="btn btn-primary" onClick={() => navigate("/profile")}>
              Back to profile
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="upload-box">
        <h1>Edit video</h1>
        <p className="upload-sub">Update your video title, description, or price.</p>
        <form className="upload-form" onSubmit={handleSubmit}>
          <label>
            Video title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this video"
              required
            />
          </label>
          <label>
            Watch price
            <div className="price-input">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span>sUSD (set 0 for free)</span>
            </div>
          </label>
          <button
            type="submit"
            className="btn btn-primary upload-submit"
            disabled={uploadBlobs.isPending}
          >
            {uploadBlobs.isPending ? "Saving..." : "Save changes"}
          </button>
          {errorMsg && <p className="upload-error">{errorMsg}</p>}
        </form>
      </div>
    </main>
  );
}