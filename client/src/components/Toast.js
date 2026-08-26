/* client/src/components/Toast.js */
import React, { useEffect } from "react";
import "../css/Toast.css";

const Toast = ({ message, type = "info", onClose }) => {
  // auto‑close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`toast toast-${type}`}>{message}</div>;
};

export default Toast;
