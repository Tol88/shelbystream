import { useAccountBlobs } from "@shelby-protocol/react";
import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_SHELBY_API_KEY;

async function fetchMeta(addr, blobNameSuffix) {
  try {
    const url = `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${addr}/${blobNameSuffix}?apiKey=${API_KEY}`;
    const res = await fetch(url);
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}



async function fetchProfile(addr) {
  const cached = localStorage.getItem(`username-${addr}`);
  const avatar = localStorage.getItem(`avatar-${addr}`);
  if (cached) return { username: cached, avatar };

  try {
    const url = `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${addr}/profile.json?apiKey=${API_KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { username: "", avatar: null };
    const text = await res.text();
    const profile = JSON.parse(text);
    if (profile.username) localStorage.setItem(`username-${addr}`, profile.username);
    return { username: profile.username || "", avatar: null };
  } catch {
    return { username: "", avatar: null };
  }
}






export function useShelbyVideos(addr) {
  const { data: blobs, isLoading } = useAccountBlobs(
    addr
      ? { account: addr, pagination: { limit: 50, offset: 0 } }
      : { account: "0x1", pagination: { limit: 1, offset: 0 } }
  );

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!blobs || !addr) return;

    const videoBlobs = blobs.filter(b => b.blobNameSuffix && !b.blobNameSuffix.endsWith(".meta.json") && b.blobNameSuffix !== "profile.json" && b.blobNameSuffix !== "uploaders.json");
    const metaBlobs = blobs.filter(b => b.blobNameSuffix && b.blobNameSuffix.endsWith(".meta.json"));

    const loadMetas = async () => {
      const profile = await fetchProfile(addr);
      const username = profile?.username || "";
      const avatar = profile?.avatar || localStorage.getItem(`avatar-${addr}`) || null;
      const displayName = username || addr.slice(0, 8);
      const initials = username ? username.slice(0, 2).toUpperCase() : addr.slice(2, 4).toUpperCase();

      const result = await Promise.all(
        videoBlobs.map(async (blob) => {
          const metaBlob = metaBlobs.find(m =>
            m.blobNameSuffix === blob.blobNameSuffix + ".meta.json"
          );

          let meta = null;
          if (metaBlob) {
            meta = await fetchMeta(addr, metaBlob.blobNameSuffix);
          }

          const videoUrl = `https://shelby.shelbynet.shelby.xyz/shelby/v1/blobs/${addr}/${blob.blobNameSuffix}?apiKey=${API_KEY}`;

          return {
            id: encodeURIComponent(`${addr}/${blob.blobNameSuffix}`),
            videoUrl,
            price: meta?.price && parseFloat(meta.price) > 0 ? `${meta.price} sUSD` : "Free",
            free: !meta?.price || parseFloat(meta.price) === 0,
            duration: "0:00",
            title: meta?.title || blob.blobNameSuffix.replace(/^\d+-/, "").replace(/\.[^.]+$/, ""),
            description: meta?.description || "",
            author: `@${displayName}`,
            initials,
            avatar,
            views: "0 views",
            color: "#dde8e3",
          };
        })
      );
      setVideos(result);
    };

    loadMetas();
  }, [blobs, addr]);

  return { videos, isLoading };
}