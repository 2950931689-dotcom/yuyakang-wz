export function AdminFieldGroup({ title, description, children }) {
  return (
    <section className="admin-field-group">
      {(title || description) && (
        <header className="admin-field-group__head">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </header>
      )}
      <div className="admin-field-group__body">{children}</div>
    </section>
  );
}

export function AdminField({ label, hint, children, htmlFor }) {
  return (
    <label className="admin-field" htmlFor={htmlFor}>
      <span className="admin-field__label">{label}</span>
      {children}
      {hint && <span className="admin-field__hint">{hint}</span>}
    </label>
  );
}

export function AdminInput({ id, ...props }) {
  return <input id={id} className="admin-input" {...props} />;
}

export function AdminTextarea({ id, rows = 4, ...props }) {
  return <textarea id={id} className="admin-textarea" rows={rows} {...props} />;
}

export function AdminSelect({ id, children, ...props }) {
  return (
    <select id={id} className="admin-select" {...props}>
      {children}
    </select>
  );
}

export function AdminToggle({ id, checked, onChange, label }) {
  return (
    <label className="admin-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="admin-toggle__track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function AdminSaveBar({ saving, dirty, onSave, onReset, saveLabel = "保存" }) {
  return (
    <div className="admin-save-bar">
      <div className="admin-save-bar__status">
        {saving ? "保存中…" : dirty ? "有未保存修改" : "已同步"}
      </div>
      <div className="admin-save-bar__actions">
        {onReset && (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onReset} disabled={saving}>
            恢复
          </button>
        )}
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={onSave}
          disabled={saving || !dirty}
        >
          {saving ? "保存中…" : saveLabel}
        </button>
      </div>
    </div>
  );
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function AdminConfirmDialog({ open, title, message, onConfirm, onCancel, confirming }) {
  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="admin-dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="admin-dialog__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={confirming}>
            取消
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? "处理中…" : "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}
