export function AdminStatusDot({ status = "idle" }) {
  return <span className={`admin-status-dot admin-status-dot--${status}`} aria-hidden="true" />;
}

export function AdminStatusItem({ label, status = "idle" }) {
  return (
    <div className={`admin-status-item admin-status-item--${status}`}>
      <AdminStatusDot status={status} />
      <span className="admin-status-item__label">{label}</span>
    </div>
  );
}

export function AdminFieldGroup({ eyebrow, title, description, children }) {
  return (
    <section className="admin-field-group">
      {(eyebrow || title || description) && (
        <header className="admin-field-group__head">
          {eyebrow && <span className="admin-panel-eyebrow">{eyebrow}</span>}
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

export function AdminInput({ id, className = "", ...props }) {
  return <input id={id} className={`admin-input ${className}`.trim()} {...props} />;
}

export function AdminTextarea({ id, className = "", rows = 4, ...props }) {
  return <textarea id={id} className={`admin-textarea ${className}`.trim()} rows={rows} {...props} />;
}

export function AdminSelect({ id, className = "", children, ...props }) {
  return (
    <select id={id} className={`admin-select ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

export function AdminToggle({ id, checked, onChange, label }) {
  return (
    <label className="admin-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="admin-toggle__track" aria-hidden="true" />
      <span className="admin-toggle__label">{label}</span>
    </label>
  );
}

export function AdminParamStepper({ label, value, min = 3, max = 10, unit = "s", onChange }) {
  const step = (delta) => {
    const next = Math.min(max, Math.max(min, (Number(value) || min) + delta));
    onChange(next);
  };

  return (
    <div className="admin-param">
      {label && <span className="admin-param__label">{label}</span>}
      <div className="admin-param__control">
        <button type="button" className="admin-param__btn" onClick={() => step(-1)} disabled={value <= min} aria-label="减少">
          −
        </button>
        <span className="admin-param__value admin-mono">
          {value}
          {unit}
        </span>
        <button type="button" className="admin-param__btn" onClick={() => step(1)} disabled={value >= max} aria-label="增加">
          +
        </button>
      </div>
    </div>
  );
}

export function AdminSaveBar({ saving, dirty, onSave, onReset, saveLabel = "保存" }) {
  return (
    <div className={`admin-save-bar${dirty ? " admin-save-bar--dirty" : ""}`}>
      <div className="admin-save-bar__status admin-mono">
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

export function AdminEmptyState({ title, description, code }) {
  return (
    <div className="admin-empty">
      {code && <span className="admin-panel-eyebrow">{code}</span>}
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
        <span className="admin-panel-eyebrow">确认操作</span>
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
