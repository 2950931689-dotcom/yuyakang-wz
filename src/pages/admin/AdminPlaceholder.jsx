export default function AdminPlaceholder({ title, phase = "3.2" }) {
  return (
    <>
      <div className="admin-topbar">
        <h1>{title}</h1>
        <p>后台占位页 · 第 {phase} 轮接入编辑能力</p>
      </div>
      <div className="admin-placeholder">
        此模块将在后续轮次实现完整编辑器。当前可使用仪表盘、Hero 视频、所在地与媒体管理。
      </div>
    </>
  );
}
