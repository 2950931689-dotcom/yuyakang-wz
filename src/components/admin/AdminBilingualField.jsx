import { AdminField, AdminInput, AdminTextarea } from "./AdminForm";

export function AdminBilingualInput({ label, value, onChange, multiline = false, rows = 4 }) {
  const field = value ?? { cn: "", en: "" };
  const Input = multiline ? AdminTextarea : AdminInput;
  const props = multiline ? { rows } : {};

  return (
    <div className="admin-bilingual">
      <AdminField label={`${label} · 中文`}>
        <Input
          value={field.cn ?? ""}
          onChange={(e) => onChange({ ...field, cn: e.target.value })}
          {...props}
        />
      </AdminField>
      <AdminField label={`${label} · EN`}>
        <Input
          value={field.en ?? ""}
          onChange={(e) => onChange({ ...field, en: e.target.value })}
          {...props}
        />
      </AdminField>
    </div>
  );
}

export function AdminTabs({ tabs, active, onChange }) {
  return (
    <div className="admin-tabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`admin-tabs__btn${active === id ? " is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
