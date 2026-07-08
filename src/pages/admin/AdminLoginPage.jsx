import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, isAuthenticated, login, isOffline, authError } = useAdminAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/admin";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  if (status === "loading") {
    return (
      <div className="admin-login-shell">
        <div className="admin-login admin-mono">VERIFYING SESSION…</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.status === 503 || isOffline) {
        setError("后端未连接，请检查 API 服务");
      } else {
        setError(err.message || "账号或密码错误");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login">
        <div className="admin-login__header">
          <span className="admin-panel-eyebrow">YU YAKANG AUDIO</span>
          <h1 className="admin-login__title">ADMIN LOGIN</h1>
          <p className="admin-login__lead">后台管理登录</p>
          <p className="admin-login__hint admin-mono">输入管理员账号后进入内容控制台</p>
        </div>

        {(isOffline) && (
          <div className="admin-login__alert" role="alert">
            {authError || "后端未连接，请检查 API 服务"}
          </div>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__field">
            <span className="admin-mono">USERNAME</span>
            <input
              id="admin-username"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          <label className="admin-login__field">
            <span className="admin-mono">PASSWORD</span>
            <input
              id="admin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          {error && (
            <div className="admin-login__alert" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="admin-btn admin-btn--primary admin-login__submit" disabled={submitting}>
            {submitting ? "登录中…" : "登录"}
          </button>
        </form>

        <Link to="/" className="admin-login__back admin-mono">
          ← 返回前台站点
        </Link>
      </div>
    </div>
  );
}
