import { useCallback, useState } from "react";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { commonActionText } from "../../lib/adminUi";
import { saveContentSection } from "../../lib/api";
import { useArraySectionEditor } from "../../hooks/useSectionEditor";
import { createEmptyCase, normalizeCaseForSave } from "../../lib/caseAdmin";
import { getCategoryLabel, t } from "../../lib/content";
import { randomUUID } from "../../lib/id";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import AdminCaseEditor from "../../components/admin/AdminCaseEditor";
import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFieldGroup,
  AdminSaveBar,
} from "../../components/admin/AdminForm";

export default function AdminCasesPage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const getInitial = useCallback(
    (content) => JSON.parse(JSON.stringify(content?.cases ?? [])),
    []
  );

  const editor = useArraySectionEditor("cases", getInitial);
  const {
    data: cases,
    dirty,
    saving,
    reset,
    loading,
    updateItem,
    addItem,
    removeItem,
    moveItem,
    duplicateItem,
  } = editor;
  const [localSaving, setLocalSaving] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleSave = async () => {
    if (!cases || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    const payload = cases.map((c, i) =>
      normalizeCaseForSave({ ...c, sortOrder: c.sortOrder ?? c.order ?? i + 1, order: c.sortOrder ?? c.order ?? i + 1 })
    );
    setLocalSaving(true);
    try {
      await saveContentSection("cases", payload);
      await reloadContent();
      reset();
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading || !cases) {
    return <div className="admin-placeholder admin-mono">加载案例中…</div>;
  }

  const selected = selectedIndex !== null ? cases[selectedIndex] : null;

  return (
    <>
      <AdminTopbar
        eyebrow="项目"
        title="案例管理"
        description="列表 · 编辑 · 首页展示 · SEO"
      />
      <AdminUnsavedGuard when={dirty} />

      <div className="admin-case-layout">
        <div className="admin-case-layout__list">
          <AdminFieldGroup eyebrow="案例列表" title={`${cases.length} 个案例`}>
            {cases.length === 0 ? (
              <AdminEmptyState code="空" title="暂无案例" description="添加第一个案例" />
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>标题</th>
                      <th>分类</th>
                      <th>首页视频</th>
                      <th>首页精选</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c, index) => (
                      <tr
                        key={c.id ?? c.slug ?? index}
                        className={selectedIndex === index ? "is-selected" : ""}
                        onClick={() => setSelectedIndex(index)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="admin-mono">{index + 1}</td>
                        <td>{c.title?.cn || c.slug}</td>
                        <td>{getCategoryLabel(c.category, "cn")}</td>
                        <td>{c.showInHero !== false ? "✓" : "—"}</td>
                        <td>{c.featured || c.isFeatured ? "✓" : "—"}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="admin-table__actions">
                            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                              ↑
                            </button>
                            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveItem(index, 1)} disabled={index === cases.length - 1}>
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
                addItem(createEmptyCase(cases.length + 1));
                setSelectedIndex(cases.length);
              }}
            >
              + 添加案例
            </button>
          </AdminFieldGroup>
        </div>

        <div className="admin-case-layout__editor">
          <AdminCaseEditor
            caseItem={selected}
            onChange={(next) => {
              if (selectedIndex !== null) updateItem(selectedIndex, next);
            }}
          />
        </div>
      </div>

      <AdminSaveBar saving={localSaving || saving} dirty={dirty} onSave={handleSave} onReset={reset} saveLabel="保存案例" />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除案例"
        message={`${commonActionText.deleteConfirm}「${deleteIndex !== null ? t(cases[deleteIndex]?.title, "cn") : ""}」将从页面中移除案例数据。`}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          removeItem(deleteIndex);
          if (selectedIndex === deleteIndex) setSelectedIndex(null);
          else if (selectedIndex > deleteIndex) setSelectedIndex(selectedIndex - 1);
          setDeleteIndex(null);
        }}
      />
    </>
  );
}
