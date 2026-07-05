import { NavLink } from "react-router-dom";

const LINKS = [
  ["/admin", "仪表盘"],
  ["/admin/hero", "首页视频"],
  ["/admin/location", "所在地 / 服务范围"],
  ["/admin/profile", "个人资料"],
  ["/admin/services", "服务管理"],
  ["/admin/cases", "案例管理"],
  ["/admin/certificates", "证书管理"],
  ["/admin/work-photos", "工作照管理"],
  ["/admin/tutorial", "经验分享 / 教程"],
  ["/admin/bookings", "预约管理"],
  ["/admin/social", "社媒 / 联系方式"],
  ["/admin/seo", "SEO 设置"],
  ["/admin/media", "媒体管理"],
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-panel-eyebrow">YU YAKANG AUDIO</span>
        <div>后台控制台</div>
      </div>
      <nav aria-label="后台导航">
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            <span className="admin-sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
