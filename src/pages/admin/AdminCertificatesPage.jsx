import { useCallback, useState } from "react";
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
  AdminToggle,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { AdminMediaField } from "../../components/admin/AdminMediaField";
import { commonActionText } from "../../lib/adminUi";

function normalizeCert(cert, index) {
  const order = cert.sortOrder ?? cert.order ?? index + 1;
  return {
    ...cert,
    order,
    sortOrder: order,
    title: cert.title ?? { cn: "", en: "" },
    issuer: cert.issuer ?? cert.organization ?? { cn: "", en: "" },
    description: cert.description ?? { cn: "", en: "" },
    date: cert.date ?? cert.year ?? "",
    imageUrl: cert.imageUrl ?? cert.image ?? "",
    visible: cert.visible !== false,
    isFeatured: cert.isFeatured ?? false,
  };
}

function createEmptyCert(list) {
  const order = list.length + 1;
  return {
    id: randomUUID(),
    order,
    sortOrder: order,
    title: { cn: "新证书", en: "New Certificate" },
    issuer: { cn: "", en: "" },
    description: { cn: "", en: "" },
    date: "",
    imageUrl: "",
    visible: true,
    isFeatured: false,
  };
}

export default function AdminCertificatesPage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const getInitial = useCallback(
    (content) => (content?.certificates ?? []).map(normalizeCert),
    []
  );

  const editor = useArraySectionEditor("certificates", getInitial);
  const { data: certs, dirty, saving, reset, loading, updateItem, addItem, removeItem, moveItem, duplicateItem } = editor;
  const [localSaving, setLocalSaving] = useState(false);

  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleSave = async () => {
    if (!certs || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    const payload = certs.map((c, i) => {
      const order = i + 1;
      return {
        ...c,
        order,
        sortOrder: order,
        imageUrl: c.imageUrl ?? c.image ?? "",
        image: c.imageUrl ?? c.image ?? "",
        issuer: c.issuer ?? c.organization,
        year: c.date ?? c.year ?? "",
      };
    });
    setLocalSaving(true);
    try {
      await saveContentSection("certificates", payload);
      await reloadContent();
      reset();
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading || !certs) {
    return <div className="admin-placeholder admin-mono">加载证书中…</div>;
  }

  const editing = editIndex !== null ? certs[editIndex] : null;

  return (
    <>
      <AdminTopbar
        eyebrow="证书"
        title="证书管理"
        description="增删改查 · 排序 · 可见性"
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="证书列表" title={`${certs.length} 张证书`}>
        {certs.length === 0 ? (
          <AdminEmptyState code="空" title="暂无证书" description="添加第一张证书" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>标题</th>
                  <th>颁发机构</th>
                  <th>日期</th>
                  <th>可见</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((cert, index) => (
                  <tr key={cert.id ?? index}>
                    <td className="admin-mono">{index + 1}</td>
                    <td>{cert.title?.cn || "—"}</td>
                    <td>{cert.issuer?.cn || cert.organization?.cn || "—"}</td>
                    <td>{cert.date || cert.year || "—"}</td>
                    <td>{cert.visible !== false ? "✓" : "—"}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditIndex(index)}>
                          编辑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                          ↑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, 1)} disabled={index === certs.length - 1}>
                          ↓
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() =>
                            duplicateItem(index, (copy) => {
                              copy.id = randomUUID();
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
            addItem(createEmptyCert(certs));
            setEditIndex(certs.length);
          }}
        >
          + 添加证书
        </button>
      </AdminFieldGroup>

      {editing && editIndex !== null && (
        <AdminFieldGroup eyebrow="编辑器" title={`编辑：${editing.title?.cn || editing.id}`}>
          <AdminField label="ID">
            <AdminInput className="admin-mono" value={editing.id ?? ""} onChange={(e) => updateItem(editIndex, { id: e.target.value })} />
          </AdminField>
            <AdminField label="排序">
              <AdminInput type="number" value={editing.sortOrder ?? editIndex + 1} onChange={(e) => updateItem(editIndex, { sortOrder: Number(e.target.value), order: Number(e.target.value) })} />
            </AdminField>

          <AdminBilingualInput label="标题" value={editing.title} onChange={(v) => updateItem(editIndex, { title: v })} />
          <AdminBilingualInput label="颁发机构" value={editing.issuer ?? editing.organization} onChange={(v) => updateItem(editIndex, { issuer: v, organization: v })} />
          <AdminBilingualInput label="描述" value={editing.description} onChange={(v) => updateItem(editIndex, { description: v })} multiline rows={6} />

          <AdminField label="日期">
            <AdminInput value={editing.date ?? editing.year ?? ""} onChange={(e) => updateItem(editIndex, { date: e.target.value, year: e.target.value })} />
          </AdminField>

          <AdminMediaField
            label="证书图片"
            value={editing.imageUrl ?? editing.image ?? ""}
            onChange={(v) => updateItem(editIndex, { imageUrl: v, image: v })}
          />

          <div className="admin-routing-list">
            <AdminToggle
              id={`cert-visible-${editIndex}`}
              checked={editing.visible !== false}
              onChange={(e) => updateItem(editIndex, { visible: e.target.checked })}
              label="可见"
            />
            <AdminToggle
              id={`cert-featured-${editIndex}`}
              checked={editing.isFeatured === true}
              onChange={(e) => updateItem(editIndex, { isFeatured: e.target.checked })}
              label="精选"
            />
          </div>

          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 12 }} onClick={() => setEditIndex(null)}>
            关闭编辑器
          </button>
        </AdminFieldGroup>
      )}

      <AdminSaveBar saving={localSaving || saving} dirty={dirty} onSave={handleSave} onReset={reset} saveLabel="保存证书" />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除证书"
        message={`确认删除「${deleteIndex !== null ? t(certs[deleteIndex]?.title, "cn") : ""}」？`}
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
