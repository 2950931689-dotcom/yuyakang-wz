import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { getDouyinUrl, isDouyinSelfLink } from "../../lib/content";
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

export default function AdminSocialPage() {
  const getInitial = useCallback(
    (content) => JSON.parse(JSON.stringify(content?.socialLinks ?? {})),
    []
  );

  const { data: social, update, dirty, saving, save, reset, loading } = useSectionEditor(
    "socialLinks",
    getInitial
  );

  if (loading || !social) {
    return <div className="admin-placeholder admin-mono">加载社媒中…</div>;
  }

  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);

  return (
    <>
      <AdminTopbar
        eyebrow="社媒"
        title="社媒 / 联系方式"
        description="抖音 · 微信 · 联系方式"
        actions={
          <Link to="/contact" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览联系页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      {douyinSelf && (
        <div className="admin-unsaved-banner">
          <span>⚠ 当前抖音链接含 /user/self，可能不是公开主页链接。建议替换为公开分享链接。</span>
        </div>
      )}

      <AdminFieldGroup eyebrow="社媒链接" title="社媒链接">
        <AdminField label="抖音 URL (douyinUrl)">
          <AdminInput
            className="admin-mono"
            value={social.douyinUrl ?? ""}
            onChange={(e) => update({ douyinUrl: e.target.value })}
          />
        </AdminField>
        <AdminField label="抖音 Draft (douyinUrlDraft)">
          <AdminInput
            className="admin-mono"
            value={social.douyinUrlDraft ?? ""}
            onChange={(e) => update({ douyinUrlDraft: e.target.value })}
          />
        </AdminField>
        <AdminField label="微信视频号 (wechatVideoUrl)">
          <AdminInput
            className="admin-mono"
            value={social.wechatVideoUrl ?? ""}
            onChange={(e) => update({ wechatVideoUrl: e.target.value })}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="微信" title="微信">
        <AdminField label="微信号 wechatId">
          <AdminInput
            className="admin-mono"
            value={social.wechatId ?? social.wechat ?? ""}
            onChange={(e) => update({ wechatId: e.target.value })}
          />
        </AdminField>
        <AdminMediaField
          label="微信二维码"
          value={social.wechatQrImage ?? ""}
          onChange={(v) => update({ wechatQrImage: v })}
        />
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="联系方式" title="联系方式">
        <div className="admin-form-grid admin-form-grid--bilingual">
          <AdminField label="电话">
            <AdminInput value={social.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} />
          </AdminField>
          <AdminField label="邮箱">
            <AdminInput type="email" value={social.email ?? ""} onChange={(e) => update({ email: e.target.value })} />
          </AdminField>
          <AdminBilingualInput
            label="所在地"
            value={social.location ?? { cn: "", en: "" }}
            onChange={(v) => update({ location: v })}
          />
        </div>
        <AdminBilingualInput
          label="联系说明"
          value={social.contactNote}
          onChange={(v) => update({ contactNote: v })}
          multiline
          rows={4}
        />
      </AdminFieldGroup>

      <AdminSaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} saveLabel="保存社媒" />
    </>
  );
}
