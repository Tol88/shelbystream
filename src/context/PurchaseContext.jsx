import { createContext, useContext, useState } from "react";

const PurchaseContext = createContext();

export function PurchaseProvider({ children }) {
  const [purchased, setPurchased] = useState([]);

  const buyVideo = (videoId) => {
    setPurchased((prev) => [...prev, videoId]);
  };

  const hasPurchased = (videoId) => {
    return purchased.includes(videoId);
  };

  return (
    <PurchaseContext.Provider value={{ purchased, buyVideo, hasPurchased }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}