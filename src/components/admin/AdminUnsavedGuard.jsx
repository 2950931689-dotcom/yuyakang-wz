import { useEffect } from "react";

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
      有未保存的修改
    </div>
  );
}
