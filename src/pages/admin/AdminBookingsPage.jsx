import { useEffect, useState } from "react";
import { fetchBookings } from "../../lib/api";

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = status === "all" ? {} : { status };
    fetchBookings(params)
      .then(setBookings)
      .catch((err) => {
        setError(err.message);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <>
      <div className="admin-topbar">
        <h1>Bookings</h1>
        <p>预约列表 · 只读 · 编辑器第 3 步</p>
      </div>

      <div className="case-filter" style={{ marginBottom: 24 }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={status === s ? "active" : ""}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <div className="admin-placeholder">Loading…</div>}
      {error && <div className="alert alert--warn">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="admin-placeholder">No bookings</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>City</th>
                <th>Date</th>
                <th>Status</th>
                <th>Created</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.name || b.wechat || "—"}</td>
                  <td>{b.serviceType}</td>
                  <td>{b.city || "—"}</td>
                  <td>{b.projectDate || "—"}</td>
                  <td>{b.status}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
