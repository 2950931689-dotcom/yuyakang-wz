import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminProtectedRoute() {
  const { status, isAuthenticated, authError } = useAdminAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="admin-auth-loading">
        <span className="admin-mono">VERIFYING SESSION…</span>
      </div>
    );
  }

  if (status === "offline") {
    return (
      <div className="admin-auth-loading admin-auth-loading--error">
        <span className="admin-panel-eyebrow">ADMIN CONSOLE</span>
        <h1 className="admin-auth-loading__title">后台服务未连接</h1>
        <p className="admin-auth-loading__text">
          {authError || "请检查 API 服务是否在 3001 端口运行，并确认后台认证环境变量已配置。"}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
