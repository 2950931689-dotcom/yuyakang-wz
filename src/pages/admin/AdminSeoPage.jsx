import { useCallback } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { t } from "../../lib/content";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { AdminMediaField } from "../../components/admin/AdminMediaField";
import { resolveUploadUrl } from "../../lib/api";

function keywordsToString(kw) {
  if (!kw) return { cn: "", en: "" };
  return {
    cn: Array.isArray(kw.cn) ? kw.cn.join(", ") : String(kw.cn ?? ""),
    en: Array.isArray(kw.en) ? kw.en.join(", ") : String(kw.en ?? ""),
  };
}

function parseKeywords(str) {
  if (!str?.trim()) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function CharHint({ value, max, label }) {
  const len = (value ?? "").length;
  const warn = max && len > max;
  return (
    <span className={`admin-char-hint admin-mono${warn ? " is-warn" : ""}`}>
      {label}: {len}{max ? ` / ${max}` : ""}
    </span>
  );
}

export default function AdminSeoPage() {
  const getInitial = useCallback((content) => {
    const seo = JSON.parse(JSON.stringify(content?.seo ?? {}));
    if (!seo.keywords) seo.keywords = { cn: [], en: [] };
    return seo;
  }, []);

  const { data: seo, update, dirty, saving, save, reset, loading } = useSectionEditor("seo", getInitial);

  if (loading || !seo) {
    return <div className="admin-placeholder admin-mono">加载 SEO 中…</div>;
  }

  const kw = keywordsToString(seo.keywords);
  const ogImage = seo.ogImage ?? seo.ogImageUrl ?? "";
  const favicon = seo.favicon ?? seo.faviconUrl ?? "";
  const previewTitle = t(seo.title, "cn") || "页面标题";
  const previewDesc = t(seo.description, "cn") || "页面描述…";

  return (
    <>
      <AdminTopbar
        eyebrow="SEO"
        title="SEO 设置"
        description="标题 · 描述 · 分享图"
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="预览" title="搜索预览">
        <div className="admin-seo-preview">
          <div className="admin-seo-preview__title">{previewTitle}</div>
          <div className="admin-seo-preview__url admin-mono">yuyakang.audio</div>
          <div className="admin-seo-preview__desc">{previewDesc}</div>
          {ogImage && (
            <img
              src={ogImage.startsWith("/uploads/") ? resolveUploadUrl(ogImage) : ogImage}
              alt=""
              className="admin-seo-preview__image"
            />
          )}
        </div>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="Meta" title="Meta 标签">
        <AdminBilingualInput
          label="标题"
          value={seo.title}
          onChange={(v) => update({ title: v })}
        />
        <div className="admin-char-hints">
          <CharHint value={seo.title?.cn} max={60} label="中文" />
          <CharHint value={seo.title?.en} max={60} label="英文" />
        </div>

        <AdminBilingualInput
          label="描述"
          value={seo.description}
          onChange={(v) => update({ description: v })}
          multiline
          rows={4}
        />
        <div className="admin-char-hints">
          <CharHint value={seo.description?.cn} max={160} label="中文" />
          <CharHint value={seo.description?.en} max={160} label="英文" />
        </div>

        <AdminField label="Keywords CN (逗号分隔)">
          <AdminInput
            value={kw.cn}
            onChange={(e) =>
              update({ keywords: { ...seo.keywords, cn: parseKeywords(e.target.value) } })
            }
          />
        </AdminField>
        <AdminField label="关键词 EN (逗号分隔)">
          <AdminInput
            value={kw.en}
            onChange={(e) =>
              update({ keywords: { ...seo.keywords, en: parseKeywords(e.target.value) } })
            }
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="资源" title="图标与分享图">
        <AdminMediaField
          label="分享图 (OG Image)"
          value={ogImage}
          onChange={(v) => update({ ogImage: v, ogImageUrl: v })}
        />
        <AdminMediaField
          label="网站图标 (Favicon)"
          value={favicon}
          onChange={(v) => update({ favicon: v, faviconUrl: v })}
        />
      </AdminFieldGroup>

      <AdminSaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} saveLabel="保存 SEO" />
    </>
  );
}
