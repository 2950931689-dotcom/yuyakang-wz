import { Link } from "react-router-dom";

import { useAdmin } from "../../context/AdminContext";

import { AdminStatusDot } from "./AdminForm";



export default function AdminTopbar({ title, description, eyebrow, actions }) {

  const { apiOnline } = useAdmin();



  return (

    <div className="admin-topbar">

      <div className="admin-topbar__row">

        <div>

          {eyebrow && <span className="admin-panel-eyebrow">{eyebrow}</span>}

          <h1>{title}</h1>

          {description && <p>{description}</p>}

        </div>

        <div className="admin-topbar__meta">

          <span className={`admin-api-pill${apiOnline ? " is-online" : apiOnline === false ? " is-offline" : ""}`}>

            <AdminStatusDot status={apiOnline ? "ok" : apiOnline === false ? "warn" : "idle"} />

            <span className="admin-mono">

              API {apiOnline === null ? "…" : apiOnline ? "在线" : "离线"}

            </span>

          </span>

          <Link to="/" className="admin-topbar__link admin-mono" target="_blank" rel="noreferrer">

            查看站点 ↗

          </Link>

        </div>

      </div>

      {actions && <div className="admin-topbar__actions">{actions}</div>}

    </div>

  );

}


