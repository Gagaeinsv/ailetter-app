import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export function usePortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const fn = httpsCallable(getFunctions(), "createPortalSession");
      const result = await fn();
      window.location.href = result.data.url;
    } catch (err) {
      console.error("Portal error:", err);
      setError("Could not open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { openPortal, loading, error };
}