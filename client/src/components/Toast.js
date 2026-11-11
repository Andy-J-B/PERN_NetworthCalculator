/* client/src/components/Toast.js */
import React, { useEffect, useRef } from "react";
import "../css/Toast.css";

const Toast = ({ message, type = "info", onClose, duration = 3200 }) => {
  // Hold onClose in a ref so the auto-dismiss timer is not reset every
  // time the parent re-renders and passes a new inline closure.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => closeRef.current?.(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;