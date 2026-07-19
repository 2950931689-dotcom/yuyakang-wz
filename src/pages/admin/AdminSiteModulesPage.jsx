import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { saveContentSection } from "../../lib/api";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminTextarea,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { commonActionText } from "../../lib/adminUi";
import { HOME_WORKFLOW_STEPS, SOUND_ISSUES } from "../../lib/homeContent";

function getInitialSettings(content) {
  const settings = JSON.parse(JSON.stringify(content?.siteSettings ?? {}));
  if (!Array.isArray(settings.processSteps) || !settings.processSteps.length) {
    settings.processSteps = JSON.parse(JSON.stringify(HOME_WORKFLOW_STEPS));
  }
  if (!Array.isArray(settings.soundIssues) || !settings.soundIssues.length) {
    settings.soundIssues = JSON.parse(JSON.stringify(SOUND_ISSUES));
  }
  return settings;
}

function StepListEditor({ items, onChange, emptyLabel }) {
  const list = Array.isArray(items) ? items : [];

  const updateItem = (index, patch) => {
    const next = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const remove = (index) => {
    onChange(list.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 })));
  };

  const add = () => {
    onChange([
      ...list,
      {
        order: list.length + 1,
        title: { cn: "", en: "" },
        description: { cn: "", en: "" },
      },
    ]);
  };

  return (
    <div className="admin-routing-list">
      {list.length === 0 && <p className="admin-mixing-empty">{emptyLabel}</p>}
      {list.map((item, index) => (
        <div key={item.order ?? index} className="admin-mixing-track">
          <div className="admin-mixing-track__head">
            <span className="admin-mixing-track__index">#{index + 1}</span>
            <div className="admin-mixing-track__actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                {commonActionText.moveUp}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => move(index, 1)}
                disabled={index === list.length - 1}
              >
                {commonActionText.moveDown}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => remove(index)}
              >
                {commonActionText.delete}
              </button>
            </div>
          </div>
          <AdminField label="排序 order">
            <AdminInput
              type="number"
              className="admin-mono"
              value={item.order ?? index + 1}
              onChange={(e) => updateItem(index, { order: Number(e.target.value) || index + 1 })}
            />
          </AdminField>
          <AdminBilingualInput
            label="标题"
            value={item.title}
            onChange={(v) => updateItem(index, { title: v })}
          />
          <AdminBilingualInput
            label="说明"
            value={item.description}
            onChange={(v) => updateItem(index, { description: v })}
            multiline
            rows={3}
          />
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--secondary" onClick={add}>
        {commonActionText.add}
      </button>
    </div>
  );
}

export default function AdminSiteModulesPage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();
  const getInitial = useCallback((content) => getInitialSettings(content), []);

  const { data: settings, update, dirty, saving, reset, loading } = useSectionEditor(
    "siteSettings",
    getInitial
  );

  const [localSaving, setLocalSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const jsonField = (value, fallback) => {
    try {
      return JSON.stringify(value ?? fallback, null, 2);
    } catch {
      return JSON.stringify(fallback, null, 2);
    }
  };

  const updateJson = (key, raw, fallback) => {
    try {
      const parsed = JSON.parse(raw);
      update({ [key]: parsed, [`_${key}Raw`]: undefined });
    } catch {
      update({ [`_${key}Raw`]: raw });
    }
  };

  const displayJson = (key, fallback) =>
    settings?.[`_${key}Raw`] ?? jsonField(settings?.[key], fallback);

  const handleSave = async () => {
    if (!settings || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    const payload = { ...settings };
    for (const key of Object.keys(payload)) {
      if (key.startsWith("_") && key.endsWith("Raw")) delete payload[key];
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
    return <div className="admin-placeholder admin-mono">加载站点模块中…</div>;
  }

  return (
    <>
      <AdminTopbar
        eyebrow="06"
        title="合作流程 / 声音诊断"
        description="首页步骤与诊断卡片 · 预约选项 · 联系清单"
        actions={
          <Link to="/#process" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览首页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup
        eyebrow="合作流程"
        title="流程步骤 (processSteps)"
        description="对应首页「合作流程」列表。区块标题请到「首页文案」编辑。"
      >
        <StepListEditor
          items={settings.processSteps}
          onChange={(processSteps) => update({ processSteps })}
          emptyLabel="暂无步骤，点击下方添加。"
        />
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="声音诊断"
        title="声音问题卡片 (soundIssues)"
        description="对应首页「现场声音问题诊断」。区块标题请到「首页文案」编辑。"
      >
        <StepListEditor
          items={settings.soundIssues}
          onChange={(soundIssues) => update({ soundIssues })}
          emptyLabel="暂无卡片，点击下方添加。"
        />
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="高级" title="预约 / 联系 JSON（可选）">
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? "收起高级 JSON" : "展开高级 JSON"}
        </button>
        {showAdvanced && (
          <>
            <AdminField label="bookingIssues JSON">
              <AdminTextarea
                rows={10}
                className="admin-mono"
                value={displayJson("bookingIssues", [])}
                onChange={(e) => updateJson("bookingIssues", e.target.value, [])}
              />
            </AdminField>
            <AdminField label="bookingGuide JSON">
              <AdminTextarea
                rows={8}
                className="admin-mono"
                value={displayJson("bookingGuide", {})}
                onChange={(e) => updateJson("bookingGuide", e.target.value, {})}
              />
            </AdminField>
            <AdminField label="contactChecklist JSON">
              <AdminTextarea
                rows={8}
                className="admin-mono"
                value={displayJson("contactChecklist", [])}
                onChange={(e) => updateJson("contactChecklist", e.target.value, [])}
              />
            </AdminField>
          </>
        )}
      </AdminFieldGroup>

      <AdminSaveBar
        saving={localSaving || saving}
        dirty={dirty}
        onSave={handleSave}
        onReset={reset}
        saveLabel="保存模块"
      />
    </>
  );
}
