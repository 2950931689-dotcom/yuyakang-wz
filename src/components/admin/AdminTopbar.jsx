import { Link } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function AdminTopbar({ title, description, actions }) {
  const { apiOnline } = useAdmin();

  return (
    <div className="admin-topbar">
      <div className="admin-topbar__row">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <div className="admin-topbar__meta">
          <span className={`admin-api-pill${apiOnline ? " is-online" : " is-offline"}`}>
            API {apiOnline === null ? "…" : apiOnline ? "online" : "offline"}
          </span>
          <Link to="/" className="admin-topbar__link" target="_blank" rel="noreferrer">
            查看前台 ↗
          </Link>
        </div>
      </div>
      {actions && <div className="admin-topbar__actions">{actions}</div>}
    </div>
  );
}
