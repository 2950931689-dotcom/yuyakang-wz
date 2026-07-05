import { NavLink } from "react-router-dom";
import { ADMIN_ROUTE_LINKS, adminRouteText } from "../../lib/adminUi";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-panel-eyebrow">YU YAKANG AUDIO</span>
        <div>{adminRouteText.dashboard}</div>
      </div>
      <nav aria-label="后台导航">
        {ADMIN_ROUTE_LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            <span className="admin-sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
