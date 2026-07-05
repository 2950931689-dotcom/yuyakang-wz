import { useAdmin } from "../../context/AdminContext";

export default function AdminToast() {
  const { toasts, dismissToast } = useAdmin();

  if (!toasts.length) return null;

  return (
    <div className="admin-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`admin-toast admin-toast--${toast.type}`}
          role="status"
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
