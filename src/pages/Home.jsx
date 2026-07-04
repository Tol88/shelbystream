import VideoSection from "../components/VideoSection";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useShelbyVideos } from "../hooks/useShelbyVideos";
import { useState, useEffect } from "react";

const REGISTRY_OWNER = "0xfe34b155ee9b7bc7ffc78468fb72e91f44d0c1b4f352239e5593374803c9f609";
const API_KEY = import.meta.env.VITE_SHELBY_API_KEY;

async function fetchUploaders() {
  try {
    const url = `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${REGISTRY_OWNER}/uploaders.json?apiKey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [REGISTRY_OWNER];
    const text = await res.text();
    const list = JSON.parse(text);
    return [...new Set([REGISTRY_OWNER, ...list])];
  } catch {
    return [REGISTRY_OWNER];
  }
}

function UploaderVideos({ addr }) {
  const { videos, isLoading } = useShelbyVideos(addr);
  if (isLoading || videos.length === 0) return null;
  return <VideoSection title="" videos={videos} />;
}

export default function Home() {
  const { account } = useWallet();
  const [uploaders, setUploaders] = useState([REGISTRY_OWNER]);
  const [loadingUploaders, setLoadingUploaders] = useState(true);

  const addr = account?.address
    ? typeof account.address === "string"
      ? account.address
      : account.address.toString()
    : null;

  useEffect(() => {
    fetchUploaders().then((list) => {
      const withCurrent = addr && !list.includes(addr)
        ? [...list, addr]
        : list;
      setUploaders(withCurrent);
      setLoadingUploaders(false);
    });
  }, [addr]);

  return (
    <main className="container">
      <div className="home-header">
        <h1 className="home-title">Discover Videos</h1>
        <p className="home-sub">Watch and share videos stored on Shelby Protocol</p>
      </div>

      {loadingUploaders && (
        <div className="home-loading">
          <div className="loading-spinner" />
          <p>Loading videos...</p>
        </div>
      )}

      {!loadingUploaders && uploaders.length === 0 && (
        <div className="home-empty">
          <p className="home-empty-icon">🎬</p>
          <h2>No videos yet</h2>
          <p>Be the first to upload a video!</p>
        </div>
      )}

      {uploaders.map((uploaderAddr) => (
        <UploaderVideos key={uploaderAddr} addr={uploaderAddr} />
      ))}
    </main>
  );
}