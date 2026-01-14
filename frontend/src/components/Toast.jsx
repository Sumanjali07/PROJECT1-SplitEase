import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`toast ${type}`}>
      <span>{message}</span>
      <button className="toast-x" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
