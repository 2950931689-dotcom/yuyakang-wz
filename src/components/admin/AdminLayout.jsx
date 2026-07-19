import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AdminProvider } from "../../context/AdminContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminToast from "./AdminToast";

const MOBILE_LINKS = [
  ["/admin", "仪表盘"],
  ["/admin/hero", "首页视频"],
  ["/admin/home-sections", "首页文案"],
  ["/admin/cases", "案例"],
  ["/admin/media", "媒体"],
  ["/admin/bookings", "预约"],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <AdminProvider>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <nav className="admin-mobile-nav" aria-label="后台导航">
            {MOBILE_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/admin"}>
                {label}
              </NavLink>
            ))}
            <button type="button" className="admin-mobile-nav__logout" onClick={handleLogout}>
              退出
            </button>
          </nav>
          <Outlet />
        </div>
        <AdminToast />
      </div>
    </AdminProvider>
  );
}
