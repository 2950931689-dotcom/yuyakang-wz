import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { fetchBookings } from "../../lib/api";
import { getCases, getWorkPhotos } from "../../lib/content";
import AdminTopbar from "./AdminTopbar";

export default function AdminDashboard() {
  const { content, loading, source } = useContent();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
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
  const workPhotos = getWorkPhotos(content);
  const heroSlides = (content.hero?.slides ?? []).filter((s) => s.enabled !== false);
  const newCount = bookings.filter((b) => b.status === "new").length;
  const heroMode = content.hero?.mode ?? "singleVideo";
  const recent = bookings.slice(0, 5);

  return (
    <>
      <AdminTopbar
        title="仪表盘"
        description={`JSON CMS · 内容来源：${source === "api" ? "API" : "Mock fallback"}`}
      />

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">案例</div>
          <div className="admin-stat__value">{cases.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">证书</div>
          <div className="admin-stat__value">{certs.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">服务</div>
          <div className="admin-stat__value">{services.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">工作照</div>
          <div className="admin-stat__value">{workPhotos.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Hero 视频</div>
          <div className="admin-stat__value">{heroSlides.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">预约</div>
          <div className="admin-stat__value">{bookings.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">新需求</div>
          <div className="admin-stat__value">{newCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Hero 模式</div>
          <div className="admin-stat__value admin-stat__value--sm">
            {heroMode === "caseVideoCarousel" ? "案例轮播" : "单视频"}
          </div>
        </div>
      </div>

      <div className="admin-meta-line">
        最近更新：{content.meta?.updatedAt ?? "—"} · Schema v{content.meta?.version ?? "—"}
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/hero">编辑 Hero 视频 →</Link>
        <Link to="/admin/location">编辑所在地 →</Link>
        <Link to="/admin/media">媒体管理 →</Link>
      </div>

      <h2 className="admin-section-title">最近预约</h2>
      {recent.length === 0 ? (
        <div className="admin-placeholder">暂无预约</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>服务</th>
                <th>城市</th>
                <th>状态</th>
                <th>时间</th>
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

      <p className="admin-inline-link">
        <Link to="/admin/bookings">查看全部预约 →</Link>
      </p>
    </>
  );
}
