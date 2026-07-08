import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { adminLogin, adminLogout, adminMe, AuthRequiredError, checkHealth } from "../lib/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider() {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  const refreshAuth = useCallback(async () => {
    setAuthError(null);
    try {
      await checkHealth();
    } catch {
      setStatus("offline");
      setUser(null);
      return false;
    }

    try {
      const data = await adminMe();
      if (data?.authenticated && data.user) {
        setUser(data.user);
        setStatus("authenticated");
        return true;
      }
      setUser(null);
      setStatus("unauthenticated");
      return false;
    } catch (err) {
      if (err instanceof AuthRequiredError || err.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return false;
      }
      if (err.status === 503) {
        setAuthError(err.message || "后台认证未配置");
        setUser(null);
        setStatus("offline");
        return false;
      }
      setAuthError(err.message || "无法验证登录状态");
      setUser(null);
      setStatus("offline");
      return false;
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (username, password) => {
    setAuthError(null);
    const data = await adminLogin(username, password);
    setUser(data.user ?? { username });
    setStatus("authenticated");
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      // Clear client state even if network fails
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      authError,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      isOffline: status === "offline",
      refreshAuth,
      login,
      logout,
    }),
    [authError, login, logout, refreshAuth, status, user]
  );

  return <AdminAuthContext.Provider value={value}><Outlet /></AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
