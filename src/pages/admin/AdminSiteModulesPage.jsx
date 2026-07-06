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
  AdminSaveBar,
  AdminTextarea,
} from "../../components/admin/AdminForm";
import { commonActionText } from "../../lib/adminUi";

function getInitialSettings(content) {
  return JSON.parse(JSON.stringify(content?.siteSettings ?? {}));
}

function jsonField(value, fallback) {
  try {
    return JSON.stringify(value ?? fallback, null, 2);
  } catch {
    return JSON.stringify(fallback, null, 2);
  }
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
        eyebrow="站点模块"
        title="前台模块内容"
        description="合作流程 · 声音问题 · 预约引导 · 联系清单"
        actions={
          <Link to="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览首页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup
        eyebrow="合作流程"
        title="首页合作流程 (processSteps)"
        description="已在 JSON 中配置时，首页 Workflow 区块优先读取此处。留空数组则使用前端默认流程。"
      >
        <AdminField label="processSteps JSON" hint="order · title {cn,en} · description {cn,en}">
          <AdminTextarea
            rows={14}
            className="admin-mono"
            value={displayJson("processSteps", [])}
            onChange={(e) => updateJson("processSteps", e.target.value, [])}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="声音诊断"
        title="首页声音问题 (soundIssues)"
        description="首页 Sound Check 区块；可选，留空则使用前端默认。"
      >
        <AdminField label="soundIssues JSON" hint="order · title {cn,en} · description {cn,en}">
          <AdminTextarea
            rows={12}
            className="admin-mono"
            value={displayJson("soundIssues", [])}
            onChange={(e) => updateJson("soundIssues", e.target.value, [])}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="预约"
        title="预约声音问题选项 (bookingIssues)"
        description="预约 Step 03 选项；结构与 bookingContent 中 id/cn/en/recommended 一致。"
      >
        <AdminField label="bookingIssues JSON">
          <AdminTextarea
            rows={12}
            className="admin-mono"
            value={displayJson("bookingIssues", [])}
            onChange={(e) => updateJson("bookingIssues", e.target.value, [])}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="预约引导"
        title="预约工程师辅助面板 (bookingGuide)"
        description="可选。steps 数组，每项含 task {cn,en} 与 checklist {cn,en[]}。"
      >
        <AdminField label="bookingGuide JSON">
          <AdminTextarea
            rows={10}
            className="admin-mono"
            value={displayJson("bookingGuide", {})}
            onChange={(e) => updateJson("bookingGuide", e.target.value, {})}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="联系页"
        title="项目资料清单 (contactChecklist)"
        description="联系页 Project Material Checklist；每项 { cn, en }。"
      >
        <AdminField label="contactChecklist JSON">
          <AdminTextarea
            rows={10}
            className="admin-mono"
            value={displayJson("contactChecklist", [])}
            onChange={(e) => updateJson("contactChecklist", e.target.value, [])}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminSaveBar
        saving={localSaving || saving}
        dirty={dirty}
        onSave={handleSave}
        onReset={reset}
        saveLabel="保存站点模块"
      />
    </>
  );
}
