import { useContent } from "../../context/ContentContext";
import { getCases, getCategoryLabel, t } from "../../lib/content";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminCasesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) {
    return <div className="admin-placeholder">Loading…</div>;
  }

  const cases = getCases(content, { visible: false });

  return (
    <>
      <div className="admin-topbar">
        <h1>Cases</h1>
        <p>案例列表 · 只读 · 编辑器第 3 步</p>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Featured</th>
              <th>Video</th>
              <th>Audio</th>
              <th>Slug</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.slug}>
                <td>{t(c.title, lang)}</td>
                <td>{getCategoryLabel(c.category, lang)}</td>
                <td>{t(c.location, lang)}</td>
                <td>{c.featured ? "Yes" : "No"}</td>
                <td>{c.videoUrl ? "Yes" : "—"}</td>
                <td>{c.audioUrl ? "Yes" : "—"}</td>
                <td>{c.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
