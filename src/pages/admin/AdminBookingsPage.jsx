import { Fragment, useEffect, useState } from "react";
import { fetchBookings, updateBooking } from "../../lib/api";
import { useAdmin } from "../../context/AdminContext";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  AdminEmptyState,
  AdminField,
  AdminFieldGroup,
  AdminSelect,
  AdminTextarea,
} from "../../components/admin/AdminForm";

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"];
const STATUS_LABELS = {
  all: "全部",
  new: "新预约",
  contacted: "已联系",
  quoted: "已报价",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function AdminBookingsPage() {
  const { showToast } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const loadBookings = () => {
    setLoading(true);
    setError("");
    const params = status === "all" ? {} : { status };
    fetchBookings(params)
      .then((list) => {
        setBookings(list);
        const nextDrafts = {};
        for (const b of list) {
          nextDrafts[b.id] = {
            status: b.status,
            internalNote: b.internalNote ?? "",
          };
        }
        setDrafts(nextDrafts);
      })
      .catch((err) => {
        setError(err.message);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [status]);

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleSaveBooking = async (id) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    try {
      const updated = await updateBooking(id, {
        status: draft.status,
        internalNote: draft.internalNote,
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast("预约已更新");
    } catch (err) {
      showToast(err.message || "更新失败", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleCopy = async (text, label) => {
    const ok = await copyText(text);
    showToast(ok ? `已复制${label}` : "复制失败", ok ? "success" : "error");
  };

  const isDirty = (booking) => {
    const draft = drafts[booking.id];
    if (!draft) return false;
    return draft.status !== booking.status || draft.internalNote !== (booking.internalNote ?? "");
  };

  return (
    <>
      <AdminTopbar
        eyebrow="Bookings"
        title="预约管理"
        description="STATUS · INTERNAL NOTES · NO DELETE"
      />

      <div className="admin-filter-bar">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-btn admin-btn--ghost admin-btn--sm${status === s ? " is-active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {loading && <div className="admin-placeholder admin-mono">LOADING BOOKINGS…</div>}
      {error && <div className="admin-unsaved-banner">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <AdminEmptyState code="EMPTY" title="暂无预约" description="当前筛选条件下没有预约记录" />
      )}

      {!loading && bookings.length > 0 && (
        <AdminFieldGroup eyebrow="Bookings" title={`${bookings.length} 条预约`}>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--bookings">
              <thead>
                <tr>
                  <th />
                  <th>Client</th>
                  <th>Service</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const expanded = expandedId === b.id;
                  const draft = drafts[b.id] ?? { status: b.status, internalNote: b.internalNote ?? "" };
                  const dirty = isDirty(b);

                  return (
                    <Fragment key={b.id}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost admin-btn--sm admin-mono"
                            onClick={() => setExpandedId(expanded ? null : b.id)}
                            aria-expanded={expanded}
                          >
                            {expanded ? "−" : "+"}
                          </button>
                        </td>
                        <td>{b.name || b.wechat || "—"}</td>
                        <td>{b.serviceType}</td>
                        <td>{b.city || "—"}</td>
                        <td>{b.projectDate || "—"}</td>
                        <td>
                          <span className={`admin-tag admin-tag--type admin-tag--${b.status}`}>
                            {STATUS_LABELS[b.status] ?? b.status}
                          </span>
                        </td>
                        <td className="admin-mono">{new Date(b.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="admin-table__actions">
                            {b.wechat && (
                              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleCopy(b.wechat, "微信")}>
                                Copy 微信
                              </button>
                            )}
                            {b.message && (
                              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleCopy(b.message, "留言")}>
                                Copy 留言
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${b.id}-detail`} className="admin-table__detail-row">
                          <td colSpan={8}>
                            <div className="admin-booking-detail">
                              <div className="admin-form-grid">
                                <AdminField label="Phone">
                                  <span>{b.phone || "—"}</span>
                                </AdminField>
                                <AdminField label="Email">
                                  <span>{b.email || "—"}</span>
                                </AdminField>
                                <AdminField label="WeChat">
                                  <span className="admin-mono">{b.wechat || "—"}</span>
                                </AdminField>
                                <AdminField label="Venue Size">
                                  <span>{b.venueSize || "—"}</span>
                                </AdminField>
                                <AdminField label="Budget">
                                  <span>{b.budgetRange || "—"}</span>
                                </AdminField>
                                <AdminField label="Reference">
                                  <span className="admin-table__mono">{b.referenceLink || "—"}</span>
                                </AdminField>
                              </div>

                              <AdminField label="Message">
                                <p className="admin-booking-detail__message">{b.message || "—"}</p>
                              </AdminField>

                              <div className="admin-form-grid">
                                <AdminField label="Status">
                                  <AdminSelect
                                    value={draft.status}
                                    onChange={(e) => updateDraft(b.id, { status: e.target.value })}
                                  >
                                    {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                                      <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                    ))}
                                  </AdminSelect>
                                </AdminField>
                              </div>

                              <AdminField label="Internal Note">
                                <AdminTextarea
                                  rows={4}
                                  value={draft.internalNote}
                                  onChange={(e) => updateDraft(b.id, { internalNote: e.target.value })}
                                />
                              </AdminField>

                              <div className="admin-inline-actions">
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--primary admin-btn--sm"
                                  onClick={() => handleSaveBooking(b.id)}
                                  disabled={!dirty || savingId === b.id}
                                >
                                  {savingId === b.id ? "Saving…" : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminFieldGroup>
      )}
    </>
  );
}
