import { NavLink } from "react-router-dom";

const LINKS = [
  ["/admin", "仪表盘"],
  ["/admin/hero", "首页 Hero 视频"],
  ["/admin/location", "所在地 / 服务范围"],
  ["/admin/profile", "个人资料"],
  ["/admin/services", "服务管理"],
  ["/admin/cases", "案例管理"],
  ["/admin/certificates", "证书管理"],
  ["/admin/work-photos", "工作照管理"],
  ["/admin/tutorials", "经验分享 / 教程"],
  ["/admin/bookings", "预约管理"],
  ["/admin/social", "社媒 / 联系方式"],
  ["/admin/seo", "SEO 设置"],
  ["/admin/media", "媒体管理"],
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
