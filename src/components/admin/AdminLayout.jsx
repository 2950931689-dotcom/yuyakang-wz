import { NavLink, Outlet } from "react-router-dom";
import { AdminProvider } from "../../context/AdminContext";
import AdminSidebar from "./AdminSidebar";
import AdminToast from "./AdminToast";

const MOBILE_LINKS = [
  ["/admin", "仪表盘"],
  ["/admin/hero", "首页视频"],
  ["/admin/location", "所在地"],
  ["/admin/media", "媒体管理"],
  ["/admin/bookings", "预约管理"],
];

export default function AdminLayout() {
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
          </nav>
          <Outlet />
        </div>
        <AdminToast />
      </div>
    </AdminProvider>
  );
}
