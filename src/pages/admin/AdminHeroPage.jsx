import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { useContent } from "../../context/ContentContext";

import { getCaseVideoSource, getHeroCasePreviewList, getHeroSlides, getSafeHero, t } from "../../lib/content";

import { useAdmin } from "../../context/AdminContext";

import { resolveUploadUrl, saveContentSection, uploadFile } from "../../lib/api";

import { HERO_MODE_LABELS, heroModeLabel } from "../../lib/adminUi";

import AdminTopbar from "../../components/admin/AdminTopbar";

import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";

import {

  AdminConfirmDialog,

  AdminEmptyState,

  AdminField,

  AdminFieldGroup,

  AdminInput,

  AdminParamStepper,

  AdminSaveBar,

  AdminSelect,

  AdminStatusDot,

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

    duration: slide.duration ?? 8,

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

    duration: 8,

    sortOrder: order,

  };

}



const MODE_OPTIONS = Object.entries(HERO_MODE_LABELS);



export default function AdminHeroPage() {

  const { content, reloadContent } = useContent();

  const { showToast, apiOnline } = useAdmin();

  const [hero, setHero] = useState(null);

  const [baseline, setBaseline] = useState("");

  const [saving, setSaving] = useState(false);

  const [uploadingKey, setUploadingKey] = useState(null);

  const [deleteIndex, setDeleteIndex] = useState(null);

  const [applyingDuration, setApplyingDuration] = useState(false);



  useEffect(() => {

    if (!content) return;

    const next = cloneHero(getSafeHero(content));

    next.slides = normalizeSlides(next.slides);

    next.slideDuration = next.slideDuration ?? 8;

    setHero(next);

    setBaseline(JSON.stringify(next));

  }, [content]);



  const dirty = hero && baseline && JSON.stringify(hero) !== baseline;



  const casePreview = useMemo(

    () => (content && hero ? getHeroCasePreviewList(content, hero) : []),

    [content, hero]

  );



  const activeSlides = useMemo(

    () => (content && hero ? getHeroSlides(content, hero) : []),

    [content, hero]

  );



  const carouselCases = casePreview.filter((c) => c.inCarousel);

  const heroWarnings = casePreview.filter((c) => c.showInHero && !c.hasVideo);



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

      return { ...prev, slides: slides.map((s, i) => ({ ...s, sortOrder: i + 1 })) };

    });

  }, []);



  const applyDurationToAll = useCallback((seconds) => {

    setHero((prev) => ({

      ...prev,

      slideDuration: seconds,

      slides: (prev.slides ?? []).map((s) => ({ ...s, duration: seconds })),

    }));

  }, []);



  const applyDurationToAllCases = async () => {

    if (!content || apiOnline === false) return;

    const sec = Math.min(15, Math.max(3, Number(hero.slideDuration) || 8));

    setApplyingDuration(true);

    try {

      const cases = (content.cases ?? []).map((c) => ({

        ...c,

        heroDuration: getCaseVideoSource(c)?.video ? sec : c.heroDuration,

      }));

      await saveContentSection("cases", cases);

      await reloadContent();

      showToast(`已将 ${sec}s 应用到所有有视频的案例`);

    } catch (err) {

      showToast(err.message || "保存失败", "error");

    } finally {

      setApplyingDuration(false);

    }

  };



  const handleUpload = async (index, field, file) => {

    if (!file) return;

    const key = `${index}-${field}`;

    setUploadingKey(key);

    try {

      const result = await uploadFile(file);

      updateSlide(index, { [field]: result.file.url });

      showToast("上传成功");

    } catch (err) {

      showToast(err.message || "上传失败", "error");

    } finally {

      setUploadingKey(null);

    }

  };



  const handleSave = async () => {

    if (!hero || apiOnline === false) {

      showToast("API 离线", "error");

      return;

    }

    setSaving(true);

    try {

      const payload = {

        ...hero,

        slideDuration: Math.min(15, Math.max(3, Number(hero.slideDuration) || 8)),

        slides: normalizeSlides(hero.slides),

      };

      await saveContentSection("hero", payload);

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

      return { ...prev, slides: slides.map((s, i) => ({ ...s, sortOrder: i + 1 })) };

    });

    setDeleteIndex(null);

  };



  if (!hero) {

    return <div className="admin-placeholder admin-mono">加载中…</div>;

  }



  const globalDuration = hero.slideDuration ?? 8;

  const mode = hero.mode ?? "caseVideoCarousel";



  return (

    <>

      <AdminTopbar

        eyebrow="首页播放"

        title="首页 Hero 轮播"

        description="案例视频自动轮播 · 手动轮播 · 单视频模式"

      />

      <AdminUnsavedGuard when={dirty} />



      <AdminFieldGroup eyebrow="播放模式" title="播放模式" description="自动模式从 cases 读取视频，不重复存储">

        <div className="admin-form-grid">

          <AdminField label="Hero 模式">

            <AdminSelect value={mode} onChange={(e) => updateHero({ mode: e.target.value })}>

              {MODE_OPTIONS.map(([v, label]) => (

                <option key={v} value={v}>{label}</option>

              ))}

            </AdminSelect>

          </AdminField>

        </div>



        <div className="admin-duration-panel">

          <span className="admin-param__label">全局时长 · 默认 8s</span>

          <div className="admin-chip-row">

            {[5, 8, 10].map((sec) => (

              <button

                key={sec}

                type="button"

                className={`admin-btn admin-btn--ghost admin-btn--sm admin-mono${globalDuration === sec ? " is-active" : ""}`}

                onClick={() => applyDurationToAll(sec)}

              >

                {sec}s

              </button>

            ))}

          </div>

          <div className="admin-duration-panel__custom">

            <AdminParamStepper

              label="自定义"

              value={globalDuration}

              min={3}

              max={15}

              onChange={(val) => updateHero({ slideDuration: val })}

            />

            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => applyDurationToAll(globalDuration)}>

              应用到手动片段

            </button>

            <button

              type="button"

              className="admin-btn admin-btn--ghost admin-btn--sm"

              onClick={applyDurationToAllCases}

              disabled={applyingDuration || mode !== "caseVideoCarousel"}

            >

              {applyingDuration ? "应用中…" : "一键应用到所有案例视频"}

            </button>

          </div>

        </div>

      </AdminFieldGroup>



      {mode === "caseVideoCarousel" && (

        <AdminFieldGroup

          eyebrow="自动轮播"

          title={`案例视频预览 · ${carouselCases.length} 条进入轮播`}

          description="数据来自 content.cases，保存案例后自动生效"

        >

          {carouselCases.length === 0 ? (

            <AdminEmptyState

              code="无视频"

              title="暂无可用于首页轮播的案例视频"

              description="请为案例添加 videoUrl 或 videos[]，并开启 showInHero"

            />

          ) : (

            <div className="admin-cue-list">

              {carouselCases.map((item, index) => (

                <article key={item.slug} className="admin-cue-card admin-cue-card--compact">

                  <div className="admin-cue-card__header">

                    <span className="admin-cue-card__num admin-mono">

                      项目 {String(index + 1).padStart(2, "0")}

                    </span>

                    <span className="admin-cue-card__name">{t(item.title, "cn")}</span>

                    <span className="admin-mono">{item.duration}s</span>

                  </div>

                  <div className="admin-cue-card__signals">

                    <AdminStatusDot status={item.hasVideo ? "ok" : "idle"} />

                    视频

                    <AdminStatusDot status={item.hasPoster ? "ok" : "idle"} />

                    封面

                    <AdminStatusDot status={item.showInHero ? "ok" : "idle"} />

                    showInHero

                  </div>

                  <Link to="/admin/cases" className="admin-inline-link">编辑案例 →</Link>

                </article>

              ))}

            </div>

          )}



          {heroWarnings.length > 0 && (

            <div className="admin-alert admin-alert--warn" style={{ marginTop: 16 }}>

              {heroWarnings.length} 个案例开启了 showInHero 但暂无视频，不会进入轮播。

            </div>

          )}

        </AdminFieldGroup>

      )}



      {mode === "manualSlides" && (

        <AdminFieldGroup eyebrow="手动轮播" title="手动片段列表" description={`${hero.slides?.length ?? 0} 个片段`}>

          {(hero.slides ?? []).length === 0 ? (

            <AdminEmptyState code="无信号" title="暂无手动片段" description="在下方添加片段" />

          ) : (

            <div className="admin-cue-list">

              {(hero.slides ?? []).map((slide, index) => {

                const posterSrc = slide.poster?.startsWith("/uploads/") ? resolveUploadUrl(slide.poster) : slide.poster;

                return (

                  <article key={`cue-${index}`} className="admin-cue-card">

                    <div className="admin-cue-card__header">

                      <span className="admin-cue-card__num admin-mono">片段 {String(index + 1).padStart(2, "0")}</span>

                      <span className="admin-cue-card__name">{slide.title?.cn || slide.caseSlug || "未命名"}</span>

                    </div>

                    <div className="admin-cue-card__body">

                      {posterSrc && <img src={posterSrc} alt="" className="admin-cue-card__poster" />}

                      <AdminParamStepper label="时长" value={slide.duration ?? globalDuration} min={3} max={15} onChange={(v) => updateSlide(index, { duration: v })} />

                      <AdminField label="视频">

                        <AdminInput className="admin-mono" value={slide.video ?? ""} onChange={(e) => updateSlide(index, { video: e.target.value })} />

                      </AdminField>

                    </div>

                    <div className="admin-cue-card__actions">

                      <label className="admin-btn admin-btn--ghost admin-btn--sm">

                        {uploadingKey === `${index}-video` ? "上传中…" : "替换视频"}

                        <input type="file" accept="video/*" hidden onChange={(e) => handleUpload(index, "video", e.target.files?.[0])} />

                      </label>

                      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveSlide(index, -1)} disabled={index === 0}>上移</button>

                      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => moveSlide(index, 1)} disabled={index === hero.slides.length - 1}>下移</button>

                      <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteIndex(index)}>删除</button>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setHero((p) => ({ ...p, slides: [...(p.slides ?? []), createEmptySlide((p.slides?.length ?? 0) + 1)] }))}>

            + 添加片段

          </button>

        </AdminFieldGroup>

      )}



      {mode === "singleVideo" && (

        <AdminFieldGroup eyebrow="单视频" title="单视频模式">

          <AdminField label="桌面端视频">

            <AdminInput className="admin-mono" value={hero.desktopVideoUrl ?? ""} onChange={(e) => updateHero({ desktopVideoUrl: e.target.value })} />

          </AdminField>

          <AdminField label="移动端视频">

            <AdminInput className="admin-mono" value={hero.mobileVideoUrl ?? ""} onChange={(e) => updateHero({ mobileVideoUrl: e.target.value })} />

          </AdminField>

          <AdminField label="封面图">

            <AdminInput className="admin-mono" value={hero.posterUrl ?? ""} onChange={(e) => updateHero({ posterUrl: e.target.value })} />

          </AdminField>

        </AdminFieldGroup>

      )}



      <div className="admin-meta-line admin-mono">

        当前前台有效片段: {activeSlides.length} · 模式: {heroModeLabel(mode)}

      </div>



      <AdminSaveBar saving={saving} dirty={dirty} onSave={handleSave} onReset={handleReset} saveLabel="保存 Hero" />



      <AdminConfirmDialog

        open={deleteIndex !== null}

        title="删除片段"

        message="确定移除此手动片段？"

        onCancel={() => setDeleteIndex(null)}

        onConfirm={confirmDeleteSlide}

      />

    </>

  );

}


