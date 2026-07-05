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
import { AdminMediaField } from "../../components/admin/AdminMediaField";
import { commonActionText } from "../../lib/adminUi";

function getInitialProfile(content) {
  const profile = JSON.parse(JSON.stringify(content?.profile ?? {}));
  if (!profile.subtitle && profile.bioShort) profile.subtitle = profile.bioShort;
  if (!profile.bioLong && profile.bio) profile.bioLong = profile.bio;
  return profile;
}

export default function AdminProfilePage() {
  const { reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const getInitial = useCallback((content) => getInitialProfile(content), []);

  const { data: profile, update, dirty, saving, reset, loading } = useSectionEditor(
    "profile",
    getInitial
  );

  const [localSaving, setLocalSaving] = useState(false);

  const skillGroupsJson = profile ? JSON.stringify(profile.skillGroups ?? [], null, 2) : "[]";

  const updateSkillGroupsJson = (json) => {
    try {
      const parsed = JSON.parse(json);
      update({ skillGroups: parsed, _skillGroupsRaw: json });
    } catch {
      update({ _skillGroupsRaw: json });
    }
  };

  const displaySkillGroupsJson = profile?._skillGroupsRaw ?? skillGroupsJson;

  const handleSave = async () => {
    if (!profile || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    let payload = { ...profile };
    if (profile._skillGroupsRaw != null) {
      try {
        payload.skillGroups = JSON.parse(profile._skillGroupsRaw);
      } catch {
        showToast("skillGroups JSON 格式无效", "error");
        return;
      }
    }
    delete payload._skillGroupsRaw;
    setLocalSaving(true);
    try {
      await saveContentSection("profile", payload);
      await reloadContent();
      reset();
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="admin-placeholder admin-mono">加载个人资料中…</div>;
  }

  return (
    <>
      <AdminTopbar
        eyebrow="个人资料"
        title="个人资料"
        description="姓名 · 简介 · 头像 · 技能"
        actions={
          <Link to="/about" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览关于页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="基本信息" title="基本信息">
        <div className="admin-form-grid">
          <AdminBilingualInput
            label="姓名"
            value={profile.name}
            onChange={(v) => update({ name: v })}
          />
          <AdminBilingualInput
            label="头衔"
            value={profile.title}
            onChange={(v) => update({ title: v })}
          />
          <AdminBilingualInput
            label="副标题"
            value={profile.subtitle ?? profile.bioShort ?? { cn: "", en: "" }}
            onChange={(v) => update({ subtitle: v })}
            multiline
            rows={2}
          />
        </div>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="简介" title="个人简介">
        <AdminBilingualInput
          label="简介 (bioLong)"
          value={profile.bioLong ?? profile.bio ?? { cn: "", en: "" }}
          onChange={(v) => update({ bioLong: v })}
          multiline
          rows={6}
        />
        {profile.bio && (
          <p className="admin-field__hint" style={{ marginTop: 8 }}>
            原始 bio 字段已保留，不会被删除。
          </p>
        )}
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="媒体" title="头像与封面">
        <div className="admin-form-grid">
          <AdminMediaField
            label="头像 avatarUrl"
            value={profile.avatarUrl ?? ""}
            onChange={(v) => update({ avatarUrl: v })}
          />
          <AdminMediaField
            label="封面 coverImage"
            value={profile.coverImage ?? ""}
            onChange={(v) => update({ coverImage: v })}
          />
        </div>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="联系方式" title="联系方式">
        <div className="admin-form-grid admin-form-grid--bilingual">
          <AdminBilingualInput
            label="所在地"
            value={profile.location ?? { cn: "", en: "" }}
            onChange={(v) => update({ location: v })}
          />
          <AdminField label="电话">
            <AdminInput
              value={profile.phone ?? ""}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </AdminField>
          <AdminField label="邮箱">
            <AdminInput
              type="email"
              value={profile.email ?? ""}
              onChange={(e) => update({ email: e.target.value })}
            />
          </AdminField>
        </div>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="技能" title="技能分组 skillGroups">
        <AdminField label="JSON" hint="skillGroups 数组">
          <AdminTextarea
            rows={12}
            className="admin-mono"
            value={displaySkillGroupsJson}
            onChange={(e) => updateSkillGroupsJson(e.target.value)}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminSaveBar
        saving={localSaving || saving}
        dirty={dirty}
        onSave={handleSave}
        onReset={reset}
        saveLabel="保存资料"
      />
    </>
  );
}
