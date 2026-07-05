import { useCallback, useEffect, useMemo, useState } from "react";
import { getSafeHero } from "../../lib/content";
import { useAdmin } from "../../context/AdminContext";
import { resolveUploadUrl, saveContentSection, uploadFile } from "../../lib/api";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminSelect,
  AdminToggle,
} from "../../components/admin/AdminForm";

function cloneHero(hero) {
  return JSON.parse(JSON.stringify(hero ?? {}));
}

function normalizeSlides(slides = []) {
  return slides.map((slide, index) => ({
    enabled: slide.enabled !== false,
    title: slide.title ?? { cn: "", en: "" },
    caseSlug: slide.caseSlug ?? "",
    video: slide.video ?? "",
    mobileVideo: slide.mobileVideo ?? "",
    poster: slide.poster ?? "",
    startTime: slide.startTime ?? 0,
    duration: slide.duration ?? 5,
    sortOrder: slide.sortOrder ?? index + 1,
  }));
}

function createEmptySlide(order) {
  return {
    enabled: true,
    title: { cn: "新案例片段", en: "New clip" },
    caseSlug: "",
    video: "",
    mobileVideo: "",
    poster: "",
    startTime: 0,
    duration: 5,
    sortOrder: order,
  };
}

export default function AdminHeroPage() {
  const { content, reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();
  const [hero, setHero] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  useEffect(() => {
    if (!content) return;
    const next = cloneHero(getSafeHero(content));
    next.slides = normalizeSlides(next.slides);
    setHero(next);
    setBaseline(JSON.stringify(next));
  }, [content]);

  const dirty = hero && baseline && JSON.stringify(hero) !== baseline;

  const caseOptions = useMemo(
    () => (content?.cases ?? []).map((c) => c.slug),
    [content]
  );

  const updateHero = useCallback((patch) => {
    setHero((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSlide = useCallback((index, patch) => {
    setHero((prev) => {
      const slides = [...(prev.slides ?? [])];
      slides[index] = { ...slides[index], ...patch };
      return { ...prev, slides };
    });
  }, []);

  const moveSlide = useCallback((index, direction) => {
    setHero((prev) => {
      const slides = [...(prev.slides ?? [])];
      const target = index + direction;
      if (target < 0 || target >= slides.length) return prev;
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return {
        ...prev,
        slides: slides.map((s, i) => ({ ...s, sortOrder: i + 1 })),
      };
    });
  }, []);

  const applyDurationToAll = useCallback((seconds) => {
    setHero((prev) => ({
      ...prev,
      slideDuration: seconds,
      slides: (prev.slides ?? []).map((s) => ({ ...s, duration: seconds })),
    }));
  }, []);

  const handleUpload = async (index, field, file) => {
    if (!file) return;
    const key = `${index}-${field}`;
    setUploadingKey(key);
    try {
      const result = await uploadFile(file);
      updateSlide(index, { [field]: result.file.url });
      showToast(`${field === "poster" ? "封面" : "视频"}上传成功`);
    } catch (err) {
      showToast(err.message || "上传失败", "error");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    if (!hero || apiOnline === false) {
      showToast("API 离线，无法保存", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...hero,
        slideDuration: Math.min(10, Math.max(3, Number(hero.slideDuration) || 5)),
        slides: normalizeSlides(hero.slides),
      };
      await saveContentSection("hero", payload);
      await reloadContent();
      setBaseline(JSON.stringify(payload));
      showToast("Hero 设置已保存");
    } catch (err) {
      showToast(err.message || "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!content) return;
    const next = cloneHero(getSafeHero(content));
    next.slides = normalizeSlides(next.slides);
    setHero(next);
    setBaseline(JSON.stringify(next));
  };

  const confirmDeleteSlide = () => {
    if (deleteIndex === null) return;
    setHero((prev) => {
      const slides = [...(prev.slides ?? [])];
      slides.splice(deleteIndex, 1);
      return {
        ...prev,
        slides: slides.map((s, i) => ({ ...s, sortOrder: i + 1 })),
      };
    });
    setDeleteIndex(null);
  };

  if (!hero) {
    return <div className="admin-placeholder">Loading…</div>;
  }

  return (
    <>
      <AdminTopbar
        title="首页 Hero 视频"
        description="管理首屏视频模式、轮播秒数与案例片段"
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminFieldGroup title="播放模式" description="caseVideoCarousel 为案例视频轮播">
        <div className="admin-form-grid">
          <AdminField label="Hero 模式">
            <AdminSelect
              value={hero.mode ?? "caseVideoCarousel"}
              onChange={(e) => updateHero({ mode: e.target.value })}
            >
              <option value="singleVideo">singleVideo · 单视频</option>
              <option value="caseVideoCarousel">caseVideoCarousel · 案例轮播</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="默认轮播秒数" hint="范围 3–10 秒">
            <AdminInput
              type="number"
              min={3}
              max={10}
              step={1}
              value={hero.slideDuration ?? 5}
              onChange={(e) => updateHero({ slideDuration: Number(e.target.value) })}
            />
          </AdminField>
        </div>
        <div className="admin-chip-row">
          {[3, 5, 8].map((sec) => (
            <button
              key={sec}
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => applyDurationToAll(sec)}
            >
              {sec} 秒 · 应用到全部
            </button>
          ))}
        </div>
      </AdminFieldGroup>

      <AdminFieldGroup title="轮播片段" description={`共 ${hero.slides?.length ?? 0} 条`}>
        {(hero.slides ?? []).length === 0 ? (
          <AdminEmptyState title="暂无轮播片段" description="点击下方按钮添加第一条 slide" />
        ) : (
          <div className="admin-slide-list">
            {(hero.slides ?? []).map((slide, index) => (
              <article key={`slide-${index}`} className="admin-slide-card">
                <div className="admin-slide-card__head">
                  <strong>片段 {index + 1}</strong>
                  <div className="admin-slide-card__actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveSlide(index, -1)} disabled={index === 0}>
                      上移
                    </button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveSlide(index, 1)} disabled={index === hero.slides.length - 1}>
                      下移
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteIndex(index)}>
                      删除
                    </button>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <AdminField label="启用">
                    <AdminToggle
                      id={`slide-enabled-${index}`}
                      checked={slide.enabled !== false}
                      onChange={(e) => updateSlide(index, { enabled: e.target.checked })}
                      label={slide.enabled !== false ? "已启用" : "已禁用"}
                    />
                  </AdminField>
                  <AdminField label="关联案例 slug">
                    <AdminSelect
                      value={slide.caseSlug ?? ""}
                      onChange={(e) => updateSlide(index, { caseSlug: e.target.value })}
                    >
                      <option value="">— 不关联 —</option>
                      {caseOptions.map((slug) => (
                        <option key={slug} value={slug}>{slug}</option>
                      ))}
                    </AdminSelect>
                  </AdminField>
                  <AdminField label="标题（中文）">
                    <AdminInput
                      value={slide.title?.cn ?? ""}
                      onChange={(e) =>
                        updateSlide(index, { title: { ...slide.title, cn: e.target.value } })
                      }
                    />
                  </AdminField>
                  <AdminField label="标题（英文）">
                    <AdminInput
                      value={slide.title?.en ?? ""}
                      onChange={(e) =>
                        updateSlide(index, { title: { ...slide.title, en: e.target.value } })
                      }
                    />
                  </AdminField>
                  <AdminField label="视频路径">
                    <AdminInput
                      value={slide.video ?? ""}
                      onChange={(e) => updateSlide(index, { video: e.target.value })}
                    />
                  </AdminField>
                  <AdminField label="手机视频路径">
                    <AdminInput
                      value={slide.mobileVideo ?? ""}
                      onChange={(e) => updateSlide(index, { mobileVideo: e.target.value })}
                    />
                  </AdminField>
                  <AdminField label="封面路径">
                    <AdminInput
                      value={slide.poster ?? ""}
                      onChange={(e) => updateSlide(index, { poster: e.target.value })}
                    />
                  </AdminField>
                  <AdminField label="起始秒">
                    <AdminInput
                      type="number"
                      min={0}
                      step={1}
                      value={slide.startTime ?? 0}
                      onChange={(e) => updateSlide(index, { startTime: Number(e.target.value) })}
                    />
                  </AdminField>
                  <AdminField label="播放秒数">
                    <AdminInput
                      type="number"
                      min={3}
                      max={10}
                      step={1}
                      value={slide.duration ?? hero.slideDuration ?? 5}
                      onChange={(e) => updateSlide(index, { duration: Number(e.target.value) })}
                    />
                  </AdminField>
                </div>

                <div className="admin-upload-row">
                  <label className="admin-btn admin-btn--ghost admin-btn--sm">
                    {uploadingKey === `${index}-video` ? "上传中…" : "替换视频"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      hidden
                      onChange={(e) => handleUpload(index, "video", e.target.files?.[0])}
                    />
                  </label>
                  <label className="admin-btn admin-btn--ghost admin-btn--sm">
                    {uploadingKey === `${index}-poster` ? "上传中…" : "替换封面"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      hidden
                      onChange={(e) => handleUpload(index, "poster", e.target.files?.[0])}
                    />
                  </label>
                  {slide.video && (
                    <a
                      href={resolveUploadUrl(slide.video)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                    >
                      预览视频
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() =>
            setHero((prev) => ({
              ...prev,
              slides: [...(prev.slides ?? []), createEmptySlide((prev.slides?.length ?? 0) + 1)],
            }))
          }
        >
          + 添加 slide
        </button>
      </AdminFieldGroup>

      <AdminSaveBar saving={saving} dirty={dirty} onSave={handleSave} onReset={handleReset} />

      <AdminConfirmDialog
        open={deleteIndex !== null}
        title="删除 slide"
        message="确定删除这条轮播片段吗？保存前仍可恢复。"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={confirmDeleteSlide}
      />
    </>
  );
}
