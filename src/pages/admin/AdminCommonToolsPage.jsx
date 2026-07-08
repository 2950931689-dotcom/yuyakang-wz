import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { saveContentSection } from "../../lib/api";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { randomUUID } from "../../lib/id";
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
import { commonActionText } from "../../lib/adminUi";

function normalizeTool(tool, index) {
  return {
    id: tool.id || randomUUID(),
    title: String(tool.title ?? "").trim(),
    description: String(tool.description ?? "").trim(),
    url: String(tool.url ?? "").trim(),
    category: String(tool.category ?? "").trim(),
    enabled: tool.enabled !== false,
    sortOrder: tool.sortOrder ?? index + 1,
    openInNewTab: tool.openInNewTab !== false,
    isFeatured: !!tool.isFeatured,
  };
}

function getInitialSettings(content) {
  const settings = JSON.parse(JSON.stringify(content?.siteSettings ?? {}));
  settings.commonTools = (settings.commonTools ?? []).map(normalizeTool);
  return settings;
}

function createEmptyTool(list) {
  const sortOrder = list.length + 1;
  return {
    id: randomUUID(),
    title: "",
    description: "",
    url: "",
    category: "",
    enabled: true,
    sortOrder,
    openInNewTab: true,
    isFeatured: false,
  };
}

function validateTools(tools) {
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    if (!tool.title?.trim()) {
      return { ok: false, error: `第 ${i + 1} 项缺少工具名称` };
    }
    if (!tool.url?.trim()) {
      return { ok: false, error: `第 ${i + 1} 项缺少链接地址` };
    }
  }
  return { ok: true };
}

export default function AdminCommonToolsPage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();
  const getInitial = useCallback((content) => getInitialSettings(content), []);

  const { data: settings, update, dirty, saving, reset, loading } = useSectionEditor(
    "siteSettings",
    getInitial
  );

  const [localSaving, setLocalSaving] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const tools = settings?.commonTools ?? [];

  const setTools = (nextTools) => {
    update({ commonTools: nextTools.map((tool, i) => ({ ...tool, sortOrder: i + 1 })) });
  };

  const updateTool = (index, patch) => {
    const next = [...tools];
    next[index] = { ...next[index], ...patch };
    setTools(next);
  };

  const addTool = () => {
    const next = [...tools, createEmptyTool(tools)];
    setTools(next);
    setEditIndex(next.length - 1);
  };

  const removeTool = (index) => {
    const next = tools.filter((_, i) => i !== index);
    setTools(next);
    setEditIndex(null);
    setDeleteIndex(null);
  };

  const moveTool = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= tools.length) return;
    const next = [...tools];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setTools(next);
    setEditIndex(target);
  };

  const handleSave = async () => {
    if (!settings || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    const payload = { ...settings };
    for (const key of Object.keys(payload)) {
      if (key.startsWith("_") && key.endsWith("Raw")) delete payload[key];
    }
    payload.commonTools = (payload.commonTools ?? []).map(normalizeTool);
    const validation = validateTools(payload.commonTools.filter((t) => t.enabled !== false));
    if (!validation.ok) {
      showToast(validation.error, "error");
      return;
    }
    setLocalSaving(true);
    try {
      await saveContentSection("siteSettings", payload);
      await reloadContent();
      reset();
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="admin-placeholder admin-mono">加载常用工具中…</div>;
  }

  const editing = editIndex !== null ? tools[editIndex] : null;

  return (
    <>
      <AdminTopbar
        eyebrow="联系页"
        title="常用工具"
        description="管理联系页常用工具链接 · 排序 · 显示/隐藏"
        actions={
          <Link to="/contact" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览联系页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="工具链接" title={`${tools.length} 个链接`}>
        {tools.length === 0 ? (
          <AdminEmptyState
            code="空"
            title="还没有常用工具链接"
            description="可以添加第一个。"
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>名称</th>
                  <th>分类</th>
                  <th>链接</th>
                  <th>启用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, index) => (
                  <tr key={tool.id ?? index}>
                    <td className="admin-mono">{index + 1}</td>
                    <td>{tool.title || "—"}</td>
                    <td>{tool.category || "—"}</td>
                    <td className="admin-table__mono" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{tool.url || "—"}</td>
                    <td>{tool.enabled !== false ? "✓" : "—"}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditIndex(index)}>
                          编辑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveTool(index, -1)} disabled={index === 0}>
                          ↑
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveTool(index, 1)} disabled={index === tools.length - 1}>
                          ↓
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

        <button type="button" className="admin-btn admin-btn--ghost" style={{ marginTop: 16 }} onClick={addTool}>
          + 添加工具链接
        </button>
      </AdminFieldGroup>

      {editing && editIndex !== null && (
        <AdminFieldGroup eyebrow="编辑器" title={`编辑：${editing.title || "新工具"}`}>
          <div className="admin-form-grid">
            <AdminField label="工具名称">
              <AdminInput value={editing.title} onChange={(e) => updateTool(editIndex, { title: e.target.value })} />
            </AdminField>
            <AdminField label="分类">
              <AdminInput value={editing.category} onChange={(e) => updateTool(editIndex, { category: e.target.value })} placeholder="测量工具 / 资料网站" />
            </AdminField>
            <AdminField label="链接地址" hint="https:// 开头">
              <AdminInput className="admin-mono" value={editing.url} onChange={(e) => updateTool(editIndex, { url: e.target.value })} />
            </AdminField>
            <AdminField label="工具说明">
              <AdminTextarea rows={3} value={editing.description} onChange={(e) => updateTool(editIndex, { description: e.target.value })} />
            </AdminField>
            <AdminField label="启用">
              <AdminToggle checked={editing.enabled !== false} onChange={(e) => updateTool(editIndex, { enabled: e.target.checked })} />
            </AdminField>
            <AdminField label="重点推荐">
              <AdminToggle checked={!!editing.isFeatured} onChange={(e) => updateTool(editIndex, { isFeatured: e.target.checked })} />
            </AdminField>
            <AdminField label="新窗口打开">
              <AdminToggle checked={editing.openInNewTab !== false} onChange={(e) => updateTool(editIndex, { openInNewTab: e.target.checked })} />
            </AdminField>
          </div>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 12 }} onClick={() => setEditIndex(null)}>
            完成编辑
          </button>
        </AdminFieldGroup>
      )}

      <AdminSaveBar
        saving={localSaving || saving}
        dirty={dirty}
        onSave={handleSave}
        onReset={reset}
        saveLabel="保存常用工具"
      />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除工具链接？"
        message={deleteIndex !== null ? `确认删除「${tools[deleteIndex]?.title || "未命名"}」？` : ""}
        onConfirm={() => removeTool(deleteIndex)}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
