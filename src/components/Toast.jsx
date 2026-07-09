import { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <span>✓</span>
      <p>{message}</p>
      <button onClick={onClose}>✕</button>
    </div>
  );
}