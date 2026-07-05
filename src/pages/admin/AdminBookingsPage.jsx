import { Fragment, useEffect, useState } from "react";
import { fetchBookings, updateBooking } from "../../lib/api";
import { useAdmin } from "../../context/AdminContext";
import { bookingStatusText, commonActionText } from "../../lib/adminUi";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminField,
  AdminFieldGroup,
  AdminLoadingState,
  AdminSelect,
  AdminTextarea,
} from "../../components/admin/AdminForm";

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"];

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
      showToast(err.message || commonActionText.updateFailed, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleCopy = async (text, label) => {
    const ok = await copyText(text);
    showToast(ok ? `${commonActionText.copied}：${label}` : commonActionText.copyFailed, ok ? "success" : "error");
  };

  const isDirty = (booking) => {
    const draft = drafts[booking.id];
    if (!draft) return false;
    return draft.status !== booking.status || draft.internalNote !== (booking.internalNote ?? "");
  };

  return (
    <>
      <AdminTopbar
        eyebrow="预约管理"
        title="预约管理"
        description="状态 · 内部备注 · 不可删除"
      />

      <div className="admin-filter-bar">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-btn admin-btn--ghost admin-btn--sm${status === s ? " is-active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {bookingStatusText[s] ?? s}
          </button>
        ))}
      </div>

      {loading && <AdminLoadingState message="正在加载预约..." />}
      {error && <AdminErrorState message={error} />}

      {!loading && !error && bookings.length === 0 && (
        <AdminEmptyState code="空" title="暂无预约" description="当前筛选条件下没有预约记录" />
      )}

      {!loading && bookings.length > 0 && (
        <AdminFieldGroup eyebrow="预约概览" title={`${bookings.length} 条预约`}>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--bookings">
              <thead>
                <tr>
                  <th />
                  <th>客户称呼</th>
                  <th>服务类型</th>
                  <th>城市</th>
                  <th>项目日期</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
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
                            {bookingStatusText[b.status] ?? b.status}
                          </span>
                        </td>
                        <td className="admin-mono">{new Date(b.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="admin-table__actions">
                            {b.wechat && (
                              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleCopy(b.wechat, "微信")}>
                                复制微信
                              </button>
                            )}
                            {b.message && (
                              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleCopy(b.message, "留言")}>
                                复制留言
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
                                <AdminField label="电话">
                                  <span>{b.phone || "—"}</span>
                                </AdminField>
                                <AdminField label="邮箱">
                                  <span>{b.email || "—"}</span>
                                </AdminField>
                                <AdminField label="微信">
                                  <span className="admin-mono">{b.wechat || "—"}</span>
                                </AdminField>
                                <AdminField label="场地规模">
                                  <span>{b.venueSize || "—"}</span>
                                </AdminField>
                                <AdminField label="预算">
                                  <span>{b.budgetRange || "—"}</span>
                                </AdminField>
                                <AdminField label="参考链接">
                                  <span className="admin-table__mono">{b.referenceLink || "—"}</span>
                                </AdminField>
                              </div>

                              <AdminField label="留言">
                                <p className="admin-booking-detail__message">{b.message || "—"}</p>
                              </AdminField>

                              <div className="admin-form-grid">
                                <AdminField label="状态">
                                  <AdminSelect
                                    value={draft.status}
                                    onChange={(e) => updateDraft(b.id, { status: e.target.value })}
                                  >
                                    {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                                      <option key={s} value={s}>{bookingStatusText[s] ?? s}</option>
                                    ))}
                                  </AdminSelect>
                                </AdminField>
                              </div>

                              <AdminField label="内部备注">
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
                                  {savingId === b.id ? commonActionText.saving : "保存预约"}
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
