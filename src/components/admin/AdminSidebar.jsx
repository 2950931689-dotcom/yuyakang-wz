import { NavLink, useNavigate } from "react-router-dom";
import { ADMIN_ROUTE_LINKS, adminRouteText } from "../../lib/adminUi";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-panel-eyebrow">YU YAKANG AUDIO</span>
        <div>{adminRouteText.dashboard}</div>
        {user?.username && (
          <div className="admin-sidebar__user admin-mono">{user.username}</div>
        )}
      </div>
      <nav aria-label="后台导航">
        {ADMIN_ROUTE_LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            <span className="admin-sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <button type="button" className="admin-sidebar__logout admin-mono" onClick={handleLogout}>
          退出登录
        </button>
      </div>
    </aside>
  );
}
