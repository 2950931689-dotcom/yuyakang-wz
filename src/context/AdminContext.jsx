import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { checkHealth } from "../lib/api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [apiOnline, setApiOnline] = useState(null);
  const [toasts, setToasts] = useState([]);

  const refreshApiStatus = useCallback(async () => {
    try {
      await checkHealth();
      setApiOnline(true);
      return true;
    } catch {
      setApiOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshApiStatus();
    const timer = window.setInterval(refreshApiStatus, 30000);
    return () => window.clearInterval(timer);
  }, [refreshApiStatus]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  const value = useMemo(
    () => ({
      apiOnline,
      refreshApiStatus,
      toasts,
      showToast,
      dismissToast,
    }),
    [apiOnline, refreshApiStatus, toasts, showToast, dismissToast]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
