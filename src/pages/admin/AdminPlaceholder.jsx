export default function AdminPlaceholder({ title }) {
  return (
    <>
      <div className="admin-topbar">
        <h1>{title}</h1>
        <p>后台占位页 · 第 2 步接入 JSON CMS API 与编辑功能</p>
      </div>
      <div className="admin-placeholder">
        此模块将在 Express + Admin CRUD 阶段实现真实编辑能力。
      </div>
    </>
  );
}
