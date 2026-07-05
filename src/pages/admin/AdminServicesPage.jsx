import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { saveContentSection } from "../../lib/api";
import { useArraySectionEditor } from "../../hooks/useSectionEditor";
import { randomUUID } from "../../lib/id";
import { t } from "../../lib/content";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminTextarea,
  AdminToggle,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { AdminMediaField } from "../../components/admin/AdminMediaField";
import { commonActionText } from "../../lib/adminUi";

function normalizeService(svc, index) {
  const order = svc.sortOrder ?? svc.order ?? index + 1;
  return {
    ...svc,
    order,
    sortOrder: order,
    title: svc.title ?? { cn: "", en: "" },
    summary: svc.summary ?? { cn: "", en: "" },
    description: svc.description ?? svc.detail ?? { cn: "", en: "" },
    visible: svc.visible !== false && svc.isActive !== false,
    isActive: svc.isActive !== false && svc.visible !== false,
  };
}

function createEmptyService(list) {
  const order = list.length + 1;
  return {
    id: randomUUID(),
    slug: `service-${Date.now()}`,
    order,
    sortOrder: order,
    title: { cn: "新服务", en: "New Service" },
    summary: { cn: "", en: "" },
    description: { cn: "", en: "" },
    features: [],
    icon: "",
    coverImage: "",
    visible: true,
    isActive: true,
  };
}

function featuresToString(features) {
  if (!features) return "";
  if (Array.isArray(features)) return features.join(", ");
  return String(features);
}

function parseFeatures(str) {
  if (!str?.trim()) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function AdminServicesPage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const getInitial = useCallback(
    (content) => (content?.services ?? []).map(normalizeService),
    []
  );

  const editor = useArraySectionEditor("services", getInitial);
  const { data: services, dirty, saving, reset, loading, updateItem, addItem, removeItem, moveItem, duplicateItem } = editor;
  const [localSaving, setLocalSaving] = useState(false);

  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleSave = async () => {
    if (!services || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    const payload = services.map((svc, i) => {
      const order = i + 1;
      return {
        ...svc,
        order,
        sortOrder: order,
        visible: svc.visible !== false,
        isActive: svc.isActive !== false,
        description: svc.description ?? svc.detail ?? { cn: "", en: "" },
      };
    });
    setLocalSaving(true);
    try {
      await saveContentSection("services", payload);
      await reloadContent();
      reset();
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading || !services) {
    return <div className="admin-placeholder admin-mono">加载服务中…</div>;
  }

  const editing = editIndex !== null ? services[editIndex] : null;

  return (
    <>
      <AdminTopbar
        eyebrow="服务"
        title="服务管理"
        description="增删改查 · 排序 · 可见性"
        actions={
          <Link to="/services" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览服务页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="服务列表" title={`${services.length} 项服务`}>
        {services.length === 0 ? (
          <AdminEmptyState code="空" title="暂无服务" description="添加第一项服务" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>标题</th>
                  <th>Slug</th>
                  <th>可见</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc, index) => (
                  <tr key={svc.id ?? index}>
                    <td className="admin-mono">{index + 1}</td>
                    <td>{svc.title?.cn || svc.title?.en || "—"}</td>
                    <td className="admin-table__mono">{svc.slug}</td>
                    <td>{svc.visible !== false ? "✓" : "—"}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditIndex(index)}>
                          编辑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                          ↑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, 1)} disabled={index === services.length - 1}>
                          ↓
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() =>
                            duplicateItem(index, (copy) => {
                              copy.id = randomUUID();
                              copy.slug = `${copy.slug}-copy`;
                            })
                          }
                        >
                          复制
                        </button>
                        <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteIndex(index)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          style={{ marginTop: 16 }}
          onClick={() => {
            addItem(createEmptyService(services));
            setEditIndex(services.length);
          }}
        >
          + 添加服务
        </button>
      </AdminFieldGroup>

      {editing && editIndex !== null && (
        <AdminFieldGroup eyebrow="编辑器" title={`编辑：${editing.title?.cn || editing.slug}`}>
          <div className="admin-form-grid">
            <AdminField label="ID">
              <AdminInput className="admin-mono" value={editing.id ?? ""} onChange={(e) => updateItem(editIndex, { id: e.target.value })} />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput className="admin-mono" value={editing.slug ?? ""} onChange={(e) => updateItem(editIndex, { slug: e.target.value })} />
            </AdminField>
            <AdminField label="图标">
              <AdminInput value={editing.icon ?? ""} onChange={(e) => updateItem(editIndex, { icon: e.target.value })} />
            </AdminField>
            <AdminField label="排序">
              <AdminInput type="number" value={editing.sortOrder ?? editIndex + 1} onChange={(e) => updateItem(editIndex, { sortOrder: Number(e.target.value), order: Number(e.target.value) })} />
            </AdminField>
          </div>

          <AdminBilingualInput label="标题" value={editing.title} onChange={(v) => updateItem(editIndex, { title: v })} />
          <AdminBilingualInput label="摘要" value={editing.summary} onChange={(v) => updateItem(editIndex, { summary: v })} multiline rows={3} />
          <AdminBilingualInput label="描述" value={editing.description} onChange={(v) => updateItem(editIndex, { description: v, detail: v })} multiline rows={6} />

          <AdminField label="特性 (逗号分隔)">
            <AdminInput
              value={featuresToString(editing.features)}
              onChange={(e) => updateItem(editIndex, { features: parseFeatures(e.target.value) })}
            />
          </AdminField>

          <AdminMediaField label="封面图" value={editing.coverImage ?? ""} onChange={(v) => updateItem(editIndex, { coverImage: v })} />

          <div className="admin-routing-list">
            <AdminToggle
              id={`svc-visible-${editIndex}`}
              checked={editing.visible !== false}
              onChange={(e) => updateItem(editIndex, { visible: e.target.checked, isActive: e.target.checked })}
              label="可见 / 启用"
            />
          </div>

          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 12 }} onClick={() => setEditIndex(null)}>
            关闭编辑器
          </button>
        </AdminFieldGroup>
      )}

      <AdminSaveBar saving={localSaving || saving} dirty={dirty} onSave={handleSave} onReset={reset} saveLabel="保存服务" />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除服务"
        message={`确认删除「${deleteIndex !== null ? t(services[deleteIndex]?.title, "cn") : ""}」？`}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          removeItem(deleteIndex);
          if (editIndex === deleteIndex) setEditIndex(null);
          setDeleteIndex(null);
        }}
      />
    </>
  );
}
