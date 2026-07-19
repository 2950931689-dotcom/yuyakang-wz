import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { saveContentSection } from "../../lib/api";
import { commonActionText } from "../../lib/adminUi";
import { getDouyinUrl, isDouyinSelfLink } from "../../lib/content";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminToggle,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";

function tagsToString(tags) {
  if (!tags?.length) return "";
  return tags.map((t) => (typeof t === "string" ? t : `${t.cn || ""}|${t.en || ""}`)).join(", ");
}

function parseTags(str) {
  if (!str?.trim()) return [];
  return str.split(",").map((part) => {
    const trimmed = part.trim();
    if (trimmed.includes("|")) {
      const [cn, en] = trimmed.split("|").map((s) => s.trim());
      return { cn: cn || "", en: en || cn || "" };
    }
    return { cn: trimmed, en: trimmed };
  }).filter((t) => t.cn || t.en);
}

export default function AdminTutorialPage() {
  const { content, reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const [section, setSection] = useState(null);
  const [social, setSocial] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!content) return;
    const nextSection = JSON.parse(JSON.stringify(content.tutorialSection ?? {}));
    const nextSocial = JSON.parse(JSON.stringify(content.socialLinks ?? {}));
    setSection(nextSection);
    setSocial(nextSocial);
    setBaseline(JSON.stringify({ section: nextSection, social: nextSocial }));
  }, [content]);

  const current = JSON.stringify({ section, social });
  const dirty = baseline && current !== baseline;

  const handleSave = async () => {
    if (!section || !social || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    setSaving(true);
    try {
      await saveContentSection("tutorialSection", section);
      await saveContentSection("socialLinks", {
        ...social,
        douyinUrl: social.douyinUrl || "",
        wechatVideoUrl: social.wechatVideoUrl || "",
      });
      await reloadContent();
      setBaseline(current);
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!content) return;
    setSection(JSON.parse(JSON.stringify(content.tutorialSection ?? {})));
    setSocial(JSON.parse(JSON.stringify(content.socialLinks ?? {})));
  };

  if (!section || !social) {
    return <div className="admin-placeholder admin-mono">加载教程中…</div>;
  }

  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);

  return (
    <>
      <AdminTopbar
        eyebrow="08"
        title="预约 CTA / 经验分享"
        description="首页 conversion：经验分享区块（预约 CTA 文案在「首页文案」）"
        actions={
          <>
            <Link to="/admin/home-sections" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
              编辑预约 CTA
            </Link>
            <Link to="/#conversion" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
              预览首页 ↗
            </Link>
          </>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="区块" title="区块设置">
        <AdminToggle
          id="tutorial-enabled"
          checked={section.enabled !== false}
          onChange={(e) => setSection((prev) => ({ ...prev, enabled: e.target.checked }))}
          label="启用"
        />

        <AdminBilingualInput label="标题" value={section.title} onChange={(v) => setSection((prev) => ({ ...prev, title: v }))} />
        <AdminBilingualInput label="副标题" value={section.subtitle} onChange={(v) => setSection((prev) => ({ ...prev, subtitle: v }))} multiline rows={3} />
        <AdminBilingualInput label="描述" value={section.description} onChange={(v) => setSection((prev) => ({ ...prev, description: v }))} multiline rows={6} />

        <AdminField label="标签 (cn|en 逗号分隔，无 | 则中英文相同)">
          <AdminInput
            value={tagsToString(section.tags)}
            onChange={(e) => setSection((prev) => ({ ...prev, tags: parseTags(e.target.value) }))}
          />
        </AdminField>

        <AdminBilingualInput
          label="抖音按钮文案"
          value={section.douyinButton}
          onChange={(v) => setSection((prev) => ({ ...prev, douyinButton: v }))}
        />
        <AdminBilingualInput
          label="视频号按钮文案"
          value={section.wechatVideoButton}
          onChange={(v) => setSection((prev) => ({ ...prev, wechatVideoButton: v }))}
        />
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="链接" title="视频链接 (socialLinks)">
        <AdminField label="抖音 URL (douyinUrl)">
          <AdminInput
            className="admin-mono"
            value={social.douyinUrl ?? ""}
            onChange={(e) => setSocial((prev) => ({ ...prev, douyinUrl: e.target.value }))}
            placeholder="公开主页链接"
          />
        </AdminField>
        <AdminField label="抖音 Draft URL (douyinUrlDraft)">
          <AdminInput
            className="admin-mono"
            value={social.douyinUrlDraft ?? ""}
            onChange={(e) => setSocial((prev) => ({ ...prev, douyinUrlDraft: e.target.value }))}
          />
        </AdminField>
        {douyinSelf && (
          <div className="admin-unsaved-banner" style={{ marginTop: 12 }}>
            <span>⚠ 当前抖音链接含 /user/self，可能不是公开主页链接。建议替换为公开分享链接。</span>
          </div>
        )}
        <AdminField label="微信视频号 URL (wechatVideoUrl)">
          <AdminInput
            className="admin-mono"
            value={social.wechatVideoUrl ?? ""}
            onChange={(e) => setSocial((prev) => ({ ...prev, wechatVideoUrl: e.target.value }))}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminSaveBar saving={saving} dirty={dirty} onSave={handleSave} onReset={handleReset} saveLabel="保存教程" />
    </>
  );
}
