import { useContent } from "../../context/ContentContext";
import { getCases } from "../../lib/content";

export default function AdminDashboard() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return <div className="admin-placeholder">Loading…</div>;
  }

  const caseCount = getCases(content).length;
  const heroReady = content.hero.desktopVideoUrl ? "Configured" : "Pending";
  const seoReady = content.seo?.title?.cn ? "Configured" : "Pending";

  return (
    <>
      <div className="admin-topbar">
        <h1>Admin Dashboard</h1>
        <p>占位后台 · 真实 CMS 编辑将在第 2 步接入</p>
      </div>
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Cases</div>
          <div className="admin-stat__value">{caseCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Bookings</div>
          <div className="admin-stat__value">0</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Hero Video</div>
          <div className="admin-stat__value" style={{ fontSize: 16 }}>
            {heroReady}
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">SEO</div>
          <div className="admin-stat__value" style={{ fontSize: 16 }}>
            {seoReady}
          </div>
        </div>
      </div>
      <div className="admin-placeholder">
        最近更新：{content.meta.updatedAt} · Schema v{content.meta.version}
      </div>
    </>
  );
}
