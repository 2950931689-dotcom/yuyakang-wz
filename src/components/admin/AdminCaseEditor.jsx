import { useState } from "react";

import { Link } from "react-router-dom";

import { CASE_CATEGORIES, buildCaseVideoEntry } from "../../lib/caseAdmin";

import {

  AdminField,

  AdminFieldGroup,

  AdminInput,

  AdminSelect,

  AdminTextarea,

  AdminToggle,

} from "./AdminForm";

import { AdminBilingualInput, AdminTabs } from "./AdminBilingualField";

import { AdminMediaField } from "./AdminMediaField";



const TABS = [

  ["basic", "基础信息"],

  ["copy", "项目文案"],

  ["media", "项目媒体"],

  ["hero", "首页展示"],

  ["seo", "SEO 设置"],

];



function tagsToString(tags) {

  if (!tags?.length) return "";

  return tags.map((t) => (typeof t === "string" ? t : t.cn || t.en || "")).join(", ");

}



function parseTags(str) {

  if (!str?.trim()) return [];

  return str.split(",").map((s) => s.trim()).filter(Boolean);

}



function toolsToString(tools) {

  if (!tools?.length) return "";

  return tools.join(", ");

}



function imagesToString(images) {

  if (!images?.length) return "";

  return images.join("\n");

}



function parseImages(str) {

  if (!str?.trim()) return [];

  return str.split("\n").map((s) => s.trim()).filter(Boolean);

}



export default function AdminCaseEditor({ caseItem, onChange }) {

  const [tab, setTab] = useState("basic");



  if (!caseItem) {

    return (

      <div className="admin-empty">

        <h3>选择案例进行编辑</h3>

        <p>从左侧列表选择一项，或新建案例</p>

      </div>

    );

  }



  const update = (patch) => onChange({ ...caseItem, ...patch });



  const videoSrc = caseItem.videos?.[0]?.src ?? caseItem.videoUrl ?? "";

  const videoPoster = caseItem.videos?.[0]?.poster ?? caseItem.heroPoster ?? "";

  const upsertPrimaryVideo = (src, patch = {}) => {
    const duration = patch.duration ?? caseItem.videos?.[0]?.duration ?? caseItem.heroDuration ?? 8;
    const entry = buildCaseVideoEntry(src, {
      poster: patch.poster ?? videoPoster,
      duration,
      mobileSrc: patch.mobileSrc ?? caseItem.videos?.[0]?.mobileSrc ?? "",
    });
    if (!entry) {
      return { videoUrl: null, videos: [], heroDuration: caseItem.heroDuration ?? 8 };
    }
    return {
      videoUrl: src,
      videos: [{ ...entry, ...patch, src, type: "video", duration }],
      heroDuration: duration,
    };
  };



  return (

    <div className="admin-case-editor">

      <div className="admin-case-editor__head">

        <div>

          <span className="admin-panel-eyebrow">案例编辑</span>

          <h3>{caseItem.title?.cn || caseItem.slug || "未命名"}</h3>

        </div>

        {caseItem.slug && (

          <Link

            to={`/cases/${caseItem.slug}`}

            target="_blank"

            rel="noreferrer"

            className="admin-btn admin-btn--ghost admin-btn--sm admin-mono"

          >

            预览 ↗

          </Link>

        )}

      </div>



      <AdminTabs tabs={TABS} active={tab} onChange={setTab} />



      {tab === "basic" && (

        <AdminFieldGroup eyebrow="基础" title="基本信息">

          <div className="admin-form-grid">

            <AdminField label="ID">

              <AdminInput className="admin-mono" value={caseItem.id ?? ""} onChange={(e) => update({ id: e.target.value })} />

            </AdminField>

            <AdminField label="案例别名 / slug">

              <AdminInput className="admin-mono" value={caseItem.slug ?? ""} onChange={(e) => update({ slug: e.target.value })} />

            </AdminField>

            <AdminField label="分类">

              <AdminSelect value={caseItem.category ?? ""} onChange={(e) => update({ category: e.target.value })}>

                <option value="">— 请选择 —</option>

                {CASE_CATEGORIES.map(([val, label]) => (

                  <option key={val} value={val}>{label}</option>

                ))}

              </AdminSelect>

            </AdminField>

            <AdminField label="项目时间">

              <AdminInput value={caseItem.projectDate ?? caseItem.date ?? ""} onChange={(e) => update({ projectDate: e.target.value, date: e.target.value })} />

            </AdminField>

            <AdminField label="排序">

              <AdminInput type="number" value={caseItem.sortOrder ?? caseItem.order ?? 0} onChange={(e) => update({ sortOrder: Number(e.target.value), order: Number(e.target.value) })} />

            </AdminField>

          </div>



          <AdminBilingualInput label="标题" value={caseItem.title} onChange={(v) => update({ title: v })} />

          <AdminBilingualInput label="地点" value={caseItem.location} onChange={(v) => update({ location: v })} />

          <AdminBilingualInput label="角色" value={caseItem.role} onChange={(v) => update({ role: v })} />



          <AdminField label="标签 (逗号分隔)">

            <AdminInput value={tagsToString(caseItem.tags)} onChange={(e) => update({ tags: parseTags(e.target.value) })} />

          </AdminField>



          <AdminField label="使用工具 (逗号分隔)">

            <AdminInput value={toolsToString(caseItem.toolsUsed)} onChange={(e) => update({ toolsUsed: parseTags(e.target.value) })} />

          </AdminField>



          <div className="admin-routing-list">

            <AdminToggle

              id="case-visible"

              checked={caseItem.visible !== false}

              onChange={(e) => update({ visible: e.target.checked })}

              label="可见"

            />

            <AdminToggle

              id="case-featured"

              checked={caseItem.featured || caseItem.isFeatured}

              onChange={(e) => update({ featured: e.target.checked, isFeatured: e.target.checked })}

              label="首页精选"

            />

            <AdminToggle

              id="case-hero"

              checked={caseItem.showInHero !== false}

              onChange={(e) => update({ showInHero: e.target.checked })}

              label="首页视频展示"

            />

          </div>

        </AdminFieldGroup>

      )}



      {tab === "copy" && (

        <AdminFieldGroup eyebrow="文案" title="项目文案">

          <AdminBilingualInput label="摘要" value={caseItem.summary} onChange={(v) => update({ summary: v })} multiline rows={6} />

          <AdminBilingualInput label="背景" value={caseItem.background} onChange={(v) => update({ background: v })} multiline rows={6} />

          <AdminBilingualInput label="挑战" value={caseItem.challenge} onChange={(v) => update({ challenge: v })} multiline rows={6} />

          <AdminBilingualInput label="方案" value={caseItem.solution} onChange={(v) => update({ solution: v })} multiline rows={6} />

          <AdminBilingualInput label="成果" value={caseItem.result} onChange={(v) => update({ result: v })} multiline rows={6} />

          <AdminBilingualInput label="服务内容" value={caseItem.services} onChange={(v) => update({ services: v })} multiline rows={6} />

          <AdminBilingualInput label="设备" value={caseItem.equipment} onChange={(v) => update({ equipment: v })} multiline rows={6} />

          <AdminBilingualInput label="客户反馈" value={caseItem.clientFeedback} onChange={(v) => update({ clientFeedback: v })} multiline rows={6} />

        </AdminFieldGroup>

      )}



      {tab === "media" && (

        <AdminFieldGroup eyebrow="项目媒体" title="案例图片与音视频">

          <AdminMediaField label="封面图" value={caseItem.coverUrl ?? caseItem.coverImage ?? ""} onChange={(v) => update({ coverUrl: v, coverImage: v })} />

          <AdminField label="图库图片 (每行一个路径)">

            <AdminTextarea

              rows={6}

              className="admin-mono"

              value={imagesToString(caseItem.images ?? caseItem.galleryImages)}

              onChange={(e) => {

                const imgs = parseImages(e.target.value);

                update({ images: imgs, galleryImages: imgs });

              }}

            />

          </AdminField>

          <AdminField label="音频 URL">

            <AdminInput className="admin-mono" value={caseItem.audioUrl ?? ""} onChange={(e) => update({ audioUrl: e.target.value || null })} />

          </AdminField>

          <AdminField label="外部视频 URL">

            <AdminInput className="admin-mono" value={caseItem.externalVideoUrl ?? ""} onChange={(e) => update({ externalVideoUrl: e.target.value || null })} />

          </AdminField>

          <AdminMediaField

            label="案例视频 (首页轮播)"

            value={videoSrc}

            onChange={(v) => update(upsertPrimaryVideo(v))}

            accept="video/mp4,video/webm"

          />

          <AdminField label="视频 URL">

            <AdminInput

              className="admin-mono"

              value={videoSrc}

              onChange={(e) => update(upsertPrimaryVideo(e.target.value))}

              placeholder="/uploads/... 或外部链接"

            />

          </AdminField>

          <AdminMediaField

            label="视频封面"

            value={videoPoster}

            onChange={(v) => {

              const videos = [...(caseItem.videos ?? [])];

              if (videos.length) {

                videos[0] = { ...videos[0], poster: v };

              } else if (videoSrc) {

                videos.push(buildCaseVideoEntry(videoSrc, { poster: v, duration: caseItem.heroDuration ?? 8 }));

              }

              update({ heroPoster: v, videos });

            }}

            accept="image/*"

          />

          <AdminField label="播放秒数 (首页轮播)">

            <AdminInput

              type="number"

              min={3}

              max={15}

              value={caseItem.videos?.[0]?.duration ?? caseItem.heroDuration ?? 8}

              onChange={(e) => {

                const duration = Number(e.target.value) || 8;

                const videos = [...(caseItem.videos ?? [])];

                if (videos.length) videos[0] = { ...videos[0], duration };

                update({ heroDuration: duration, videos: videos.length ? videos : caseItem.videos });

              }}

            />

          </AdminField>

        </AdminFieldGroup>

      )}



      {tab === "hero" && (

        <AdminFieldGroup eyebrow="首页展示" title="首页视频轮播设置">

          <AdminField label="视频 URL">

            <AdminInput

              className="admin-mono"

              value={videoSrc}

              onChange={(e) => update(upsertPrimaryVideo(e.target.value))}

            />

          </AdminField>

          <AdminMediaField

            label="视频封面"

            value={videoPoster}

            onChange={(v) => {

              const videos = [...(caseItem.videos ?? [])];

              if (videos.length) videos[0] = { ...videos[0], poster: v };

              else if (videoSrc) videos.push(buildCaseVideoEntry(videoSrc, { poster: v, duration: caseItem.heroDuration ?? 8 }));

              update({ heroPoster: v, videos });

            }}

            accept="image/*"

          />

          <AdminMediaField

            label="Hero 视频 (上传)"

            value={videoSrc}

            onChange={(v) => update(upsertPrimaryVideo(v))}

            accept="video/mp4,video/webm"

          />

          <AdminField label="Hero 起始时间 (秒)">

            <AdminInput type="number" min={0} value={caseItem.heroStartTime ?? 0} onChange={(e) => update({ heroStartTime: Number(e.target.value) })} />

          </AdminField>

          <AdminField label="Hero 时长 (秒)">

            <AdminInput type="number" min={3} max={15} value={caseItem.heroDuration ?? ""} onChange={(e) => update({ heroDuration: e.target.value ? Number(e.target.value) : null })} />

          </AdminField>

        </AdminFieldGroup>

      )}



      {tab === "seo" && (

        <AdminFieldGroup eyebrow="SEO" title="案例 SEO">

          <AdminBilingualInput

            label="SEO 标题"

            value={caseItem.seo?.title ?? { cn: "", en: "" }}

            onChange={(v) => update({ seo: { ...caseItem.seo, title: v } })}

          />

          <AdminBilingualInput

            label="SEO 描述"

            value={caseItem.seo?.description ?? { cn: "", en: "" }}

            onChange={(v) => update({ seo: { ...caseItem.seo, description: v } })}

            multiline

            rows={6}

          />

          <AdminField label="关键词 CN (逗号分隔)">

            <AdminInput

              value={(caseItem.seo?.keywords?.cn ?? []).join(", ")}

              onChange={(e) =>

                update({

                  seo: {

                    ...caseItem.seo,

                    keywords: {

                      ...(caseItem.seo?.keywords ?? {}),

                      cn: parseTags(e.target.value),

                    },

                  },

                })

              }

            />

          </AdminField>

          <AdminField label="关键词 EN (逗号分隔)">

            <AdminInput

              value={(caseItem.seo?.keywords?.en ?? []).join(", ")}

              onChange={(e) =>

                update({

                  seo: {

                    ...caseItem.seo,

                    keywords: {

                      ...(caseItem.seo?.keywords ?? {}),

                      en: parseTags(e.target.value),

                    },

                  },

                })

              }

            />

          </AdminField>

        </AdminFieldGroup>

      )}

    </div>

  );

}


