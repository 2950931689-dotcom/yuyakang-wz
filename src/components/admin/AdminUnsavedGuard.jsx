import { useEffect } from "react";
import { AdminStatusDot } from "./AdminForm";

export default function AdminUnsavedGuard({ when, message = "你有未保存的修改，确定离开吗？" }) {
  useEffect(() => {
    if (!when) return undefined;

    const handler = (event) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when, message]);

  if (!when) return null;

  return (
    <div className="admin-unsaved-banner" role="status">
      <AdminStatusDot status="warn" />
      <span className="admin-mono">有未保存修改</span>
      <span>— 离开页面前请确认是否保存</span>
    </div>
  );
}
