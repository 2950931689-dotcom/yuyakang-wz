import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { checkHealth, fetchBookings } from "../../lib/api";
import { getCases } from "../../lib/content";

export default function AdminDashboard() {
  const { content, loading, source } = useContent();
  const [apiOnline, setApiOnline] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    fetchBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  if (loading || !content) {
    return <div className="admin-placeholder">Loading…</div>;
  }

  const cases = getCases(content, { visible: false });
  const certs = content.certificates ?? [];
  const services = content.services ?? [];
  const newCount = bookings.filter((b) => b.status === "new").length;
  const heroConfigured = Boolean(
    content.hero?.desktopVideoUrl || content.hero?.mobileVideoUrl
  );
  const recent = bookings.slice(0, 5);

  return (
    <>
      <div className="admin-topbar">
        <h1>Admin Dashboard</h1>
        <p>
          JSON CMS · 内容来源：{source === "api" ? "API" : "Mock fallback"} · API{" "}
          {apiOnline ? "online" : "offline"}
        </p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Cases</div>
          <div className="admin-stat__value">{cases.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Certificates</div>
          <div className="admin-stat__value">{certs.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Services</div>
          <div className="admin-stat__value">{services.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Bookings</div>
          <div className="admin-stat__value">{bookings.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">New Requests</div>
          <div className="admin-stat__value">{newCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Hero Video</div>
          <div className="admin-stat__value" style={{ fontSize: 16 }}>
            {heroConfigured ? "Configured" : "Pending"}
          </div>
        </div>
      </div>

      <div className="admin-placeholder" style={{ marginBottom: 24 }}>
        最近更新：{content.meta?.updatedAt} · Schema v{content.meta?.version}
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Recent Bookings</h2>
      {recent.length === 0 ? (
        <div className="admin-placeholder">No bookings yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Service</th>
                <th>City</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td>{b.name || b.wechat || "—"}</td>
                  <td>{b.serviceType}</td>
                  <td>{b.city || "—"}</td>
                  <td>{b.status}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/admin/bookings">View all bookings →</Link>
      </p>
    </>
  );
}
