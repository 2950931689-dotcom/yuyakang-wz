import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { saveContentSection } from "../../lib/api";
import { randomUUID } from "../../lib/id";
import { t } from "../../lib/content";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFieldGroup,
  AdminSaveBar,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { AdminMediaField } from "../../components/admin/AdminMediaField";

function createEmptyPhoto(order) {
  return {
    id: randomUUID(),
    order,
    imageUrl: "",
    title: { cn: "工作照", en: "On-site photo" },
    description: { cn: "项目现场工作记录", en: "On-site working record" },
  };
}

export default function AdminWorkPhotosPage() {
  const { content, reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const [profile, setProfile] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  useEffect(() => {
    if (!content) return;
    const next = JSON.parse(JSON.stringify(content.profile ?? {}));
    if (!next.workPhotos) next.workPhotos = [];
    setProfile(next);
    setBaseline(JSON.stringify(next));
  }, [content]);

  const dirty = profile && baseline && JSON.stringify(profile) !== baseline;

  const updatePhoto = (index, patch) => {
    setProfile((prev) => {
      const workPhotos = [...(prev.workPhotos ?? [])];
      workPhotos[index] = { ...workPhotos[index], ...patch };
      return { ...prev, workPhotos };
    });
  };

  const movePhoto = (index, direction) => {
    setProfile((prev) => {
      const workPhotos = [...(prev.workPhotos ?? [])];
      const target = index + direction;
      if (target < 0 || target >= workPhotos.length) return prev;
      [workPhotos[index], workPhotos[target]] = [workPhotos[target], workPhotos[index]];
      return {
        ...prev,
        workPhotos: workPhotos.map((p, i) => ({ ...p, order: i + 1 })),
      };
    });
  };

  const handleSave = async () => {
    if (!profile || apiOnline === false) {
      showToast("API 离线，无法保存", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...profile,
        workPhotos: (profile.workPhotos ?? []).map((p, i) => ({ ...p, order: i + 1 })),
      };
      await saveContentSection("profile", payload);
      await reloadContent();
      setBaseline(JSON.stringify(payload));
      showToast("保存成功");
    } catch (err) {
      showToast(err.message || "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!content) return;
    const next = JSON.parse(JSON.stringify(content.profile ?? {}));
    setProfile(next);
    setBaseline(JSON.stringify(next));
  };

  if (!profile) {
    return <div className="admin-placeholder admin-mono">加载工作照中…</div>;
  }

  const photos = profile.workPhotos ?? [];

  return (
    <>
      <AdminTopbar
        eyebrow="工作照"
        title="工作照管理"
        description="profile.workPhotos · 保存至 profile 区块"
        actions={
          <Link to="/about" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览关于页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup eyebrow="图库" title={`${photos.length} 张工作照`}>
        {photos.length === 0 ? (
          <AdminEmptyState code="空" title="暂无工作照" description="添加第一张工作照" />
        ) : (
          <div className="admin-slide-list">
            {photos.map((photo, index) => (
              <article key={photo.id ?? index} className="admin-slide-card">
                <div className="admin-slide-card__head">
                  <span className="admin-mono">#{index + 1}</span>
                  <div className="admin-slide-card__actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => movePhoto(index, -1)} disabled={index === 0}>
                      ↑
                    </button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1}>
                      ↓
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteIndex(index)}>
                      删除
                    </button>
                  </div>
                </div>

                <AdminMediaField
                  label="图片"
                  value={photo.imageUrl ?? ""}
                  onChange={(v) => updatePhoto(index, { imageUrl: v })}
                />
                <AdminBilingualInput
                  label="标题"
                  value={photo.title}
                  onChange={(v) => updatePhoto(index, { title: v })}
                />
                <AdminBilingualInput
                  label="描述"
                  value={photo.description}
                  onChange={(v) => updatePhoto(index, { description: v })}
                  multiline
                  rows={3}
                />
              </article>
            ))}
          </div>
        )}

        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() =>
            setProfile((prev) => ({
              ...prev,
              workPhotos: [...(prev.workPhotos ?? []), createEmptyPhoto((prev.workPhotos?.length ?? 0) + 1)],
            }))
          }
        >
          + 添加工作照
        </button>
      </AdminFieldGroup>

      <AdminSaveBar saving={saving} dirty={dirty} onSave={handleSave} onReset={handleReset} saveLabel="保存工作照" />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除工作照"
        message={`确认删除「${deleteIndex !== null ? t(photos[deleteIndex]?.title, "cn") : ""}」？`}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          setProfile((prev) => {
            const workPhotos = [...(prev.workPhotos ?? [])];
            workPhotos.splice(deleteIndex, 1);
            return { ...prev, workPhotos: workPhotos.map((p, i) => ({ ...p, order: i + 1 })) };
          });
          setDeleteIndex(null);
        }}
      />
    </>
  );
}
