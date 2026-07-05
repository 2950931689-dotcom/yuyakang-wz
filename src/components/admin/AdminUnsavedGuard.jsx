import { useEffect } from "react";
import { AdminStatusDot } from "./AdminForm";

import { commonActionText } from "../../lib/adminUi";

export default function AdminUnsavedGuard({ when, message = commonActionText.leaveConfirm }) {
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
      <span className="admin-mono">{commonActionText.unsaved}</span>
      <span>— {commonActionText.leaveConfirm}</span>
    </div>
  );
}
