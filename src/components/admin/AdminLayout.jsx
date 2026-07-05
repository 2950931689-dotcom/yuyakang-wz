import { NavLink, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const MOBILE_LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/cases", "Cases"],
  ["/admin/bookings", "Bookings"],
  ["/admin/social", "Social"],
  ["/admin/seo", "SEO"],
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <nav className="admin-mobile-nav" aria-label="Admin mobile">
          {MOBILE_LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/admin"}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
