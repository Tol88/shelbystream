import VideoSection from "../components/VideoSection";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useShelbyVideos } from "../hooks/useShelbyVideos";

function ShelbyTrending({ addr }) {
  const { videos, isLoading } = useShelbyVideos(addr);
  if (isLoading) return <p style={{ color: "#888" }}>Loading...</p>;
  if (videos.length === 0) return <p style={{ color: "#888" }}>No videos yet.</p>;
  return <VideoSection title="Trending videos" videos={videos} />;
}

export default function Trending() {
  const { account } = useWallet();
  const addr = account?.address
    ? typeof account.address === "string"
      ? account.address
      : account.address.toString()
    : null;

  return (
    <main className="container">
      <h1 className="page-title">Trending this week</h1>
      {addr
        ? <ShelbyTrending addr={addr} />
        : <p style={{ color: "#888" }}>Connect your wallet to see trending videos.</p>
      }
    </main>
  );
}