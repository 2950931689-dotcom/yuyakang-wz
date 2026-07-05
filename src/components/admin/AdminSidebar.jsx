import { NavLink } from "react-router-dom";

const LINKS = [
  ["/admin", "仪表盘"],
  ["/admin/hero", "首页视频"],
  ["/admin/profile", "个人资料"],
  ["/admin/certificates", "证书"],
  ["/admin/services", "服务"],
  ["/admin/cases", "案例"],
  ["/admin/bookings", "预约"],
  ["/admin/social", "社媒"],
  ["/admin/seo", "SEO"],
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">YU YAKANG · Admin</div>
      <nav>
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
