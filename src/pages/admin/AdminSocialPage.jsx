import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { resolveUploadUrl, saveContentSection } from "../../lib/api";
import { getDouyinUrl, isDouyinSelfLink } from "../../lib/content";
import { commonActionText } from "../../lib/adminUi";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminSelect,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput } from "../../components/admin/AdminBilingualField";
import { AdminMediaField } from "../../components/admin/AdminMediaField";

function newVideoId() {
  return `video-${Date.now().toString(36)}`;
}

function padIndex(n) {
  return String(n).padStart(2, "0");
}

function thumbSrc(url) {
  if (!url) return "";
  return url.startsWith("/uploads/") ? resolveUploadUrl(url) : url;
}

/**
 * Admin for homepage 04 SOCIAL VIDEO:
 * - Cover marquee cards (link / cover / preview video)
 * - Platform profile URLs (Douyin / WeChat Channel)
 */
export default function AdminSocialPage() {
  const { content, reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();

  const [social, setSocial] = useState(null);
  const [videos, setVideos] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!content) return;
    const nextSocial = JSON.parse(JSON.stringify(content.socialLinks ?? {}));
    const nextVideos = JSON.parse(JSON.stringify(content.featuredVideos ?? []));
    setSocial(nextSocial);
    setVideos(nextVideos);
    setBaseline(JSON.stringify({ social: nextSocial, videos: nextVideos }));
  }, [content]);

  const current = JSON.stringify({ social, videos });
  const dirty = baseline && current !== baseline;

  const updateVideo = (index, patch) => {
    setVideos((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const moveVideo = (index, dir) => {
    setVideos((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, i) => ({ ...item, order: i + 1, index: padIndex(i + 1) }));
    });
  };

  const handleSave = async () => {
    if (!social || !videos || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return;
    }
    setSaving(true);
    try {
      const normalized = videos.map((item, i) => ({
        ...item,
        id: item.id || newVideoId(),
        order: Number(item.order) || i + 1,
        index: item.index || padIndex(i + 1),
        mediaType: item.mediaType === "video" ? "video" : "image",
        url: String(item.url || "").trim(),
        coverImage: String(item.coverImage || "").trim(),
        previewVideo: String(item.previewVideo || "").trim(),
        enabled: item.enabled !== false,
      }));

      await saveContentSection("socialLinks", {
        ...social,
        douyinUrl: social.douyinUrl || "",
        wechatVideoUrl: social.wechatVideoUrl || "",
      });
      await saveContentSection("featuredVideos", normalized);
      await reloadContent();
      setVideos(normalized);
      setBaseline(JSON.stringify({ social, videos: normalized }));
      showToast(commonActionText.saved);
    } catch (err) {
      showToast(err.message || commonActionText.saveFailed, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!content) return;
    setSocial(JSON.parse(JSON.stringify(content.socialLinks ?? {})));
    setVideos(JSON.parse(JSON.stringify(content.featuredVideos ?? [])));
  };

  if (!social || !videos) {
    return <div className="admin-placeholder admin-mono">加载封面滚动 / 社媒中…</div>;
  }

  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);

  return (
    <>
      <AdminTopbar
        eyebrow="05"
        title="封面滚动 / 社媒"
        description="对应首页「04 / SOCIAL VIDEO」：横向封面卡（跳转链接 · 封面 · 预览视频）+ 抖音 / 视频号主页链接"
        actions={
          <>
            <Link to="/admin/home-sections" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
              编辑区块文案
            </Link>
            <Link
              to="/#video-highlights"
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn--ghost admin-btn--sm admin-mono"
            >
              预览首页 ↗
            </Link>
          </>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      {douyinSelf && (
        <div className="admin-unsaved-banner">
          <span>⚠ 当前抖音链接含 /user/self，可能不是公开主页链接。建议替换为公开分享链接。</span>
        </div>
      )}

      <AdminFieldGroup
        eyebrow="平台主页"
        title="抖音 / 视频号链接"
        description="对应首页下方两张平台文字卡的「打开主页」按钮目标地址。"
      >
        <div className="admin-form-grid admin-form-grid--bilingual">
          <AdminField label="抖音主页 URL" hint="前台「打开抖音主页」">
            <AdminInput
              className="admin-mono"
              value={social.douyinUrl ?? ""}
              onChange={(e) => setSocial((prev) => ({ ...prev, douyinUrl: e.target.value }))}
              placeholder="https://www.douyin.com/user/..."
            />
          </AdminField>
          <AdminField label="视频号主页 URL" hint="前台「打开视频号主页」">
            <AdminInput
              className="admin-mono"
              value={social.wechatVideoUrl ?? ""}
              onChange={(e) => setSocial((prev) => ({ ...prev, wechatVideoUrl: e.target.value }))}
              placeholder="https://weixin.qq.com/sph/..."
            />
          </AdminField>
        </div>
        <AdminField label="抖音 Draft（备用）">
          <AdminInput
            className="admin-mono"
            value={social.douyinUrlDraft ?? ""}
            onChange={(e) => setSocial((prev) => ({ ...prev, douyinUrlDraft: e.target.value }))}
          />
        </AdminField>
      </AdminFieldGroup>

      <AdminFieldGroup
        eyebrow="封面滚动"
        title="照片 / 视频卡片"
        description="首页上方横向滚动卡。可改：跳转链接、封面图、预览视频。未添加有效卡片时前台显示 PHOTO/VIDEO 预览框架。"
      >
        {videos.length === 0 && (
          <p className="admin-mixing-empty">
            暂无卡片。点击下方「添加封面卡片」；填写封面或预览视频后保存，首页即可替换预览框架。
          </p>
        )}

        {videos.map((item, index) => {
          const mediaType = item.mediaType === "video" ? "video" : "image";
          const cover = thumbSrc(item.coverImage);
          const preview = thumbSrc(item.previewVideo);
          const indexLabel = item.index || padIndex(index + 1);

          return (
            <div key={item.id || index} className="admin-cover-card">
              <div className="admin-cover-card__preview" aria-hidden="true">
                {mediaType === "video" && preview ? (
                  <video src={preview} muted playsInline preload="metadata" />
                ) : cover ? (
                  <img src={cover} alt="" />
                ) : (
                  <div className="admin-cover-card__placeholder">
                    <span>{indexLabel}</span>
                    <span>{mediaType === "video" ? "VIDEO" : "PHOTO"}</span>
                  </div>
                )}
                <span className="admin-cover-card__badge">
                  {mediaType === "video" ? "VIDEO" : "PHOTO"}
                </span>
              </div>

              <div className="admin-cover-card__body">
                <div className="admin-mixing-track__head">
                  <span className="admin-mixing-track__index">
                    卡片 {indexLabel} · #{index + 1}
                  </span>
                  <div className="admin-cover-card__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      disabled={index === 0}
                      onClick={() => moveVideo(index, -1)}
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      disabled={index >= videos.length - 1}
                      onClick={() => moveVideo(index, 1)}
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setVideos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      {commonActionText.delete}
                    </button>
                  </div>
                </div>

                <AdminField label="启用">
                  <AdminSelect
                    value={item.enabled === false ? "0" : "1"}
                    onChange={(e) => updateVideo(index, { enabled: e.target.value === "1" })}
                  >
                    <option value="1">显示在首页</option>
                    <option value="0">隐藏</option>
                  </AdminSelect>
                </AdminField>

                <AdminField label="媒体类型">
                  <AdminSelect
                    value={mediaType}
                    onChange={(e) => updateVideo(index, { mediaType: e.target.value })}
                  >
                    <option value="image">照片 PHOTO</option>
                    <option value="video">视频 VIDEO（悬停预览）</option>
                  </AdminSelect>
                </AdminField>

                <AdminField
                  label="点击跳转链接"
                  hint="点击卡片后打开（抖音作品页 / 外链）。留空则卡片不可点，仅展示。"
                >
                  <AdminInput
                    className="admin-mono"
                    value={item.url ?? ""}
                    onChange={(e) => updateVideo(index, { url: e.target.value })}
                    placeholder="https://www.douyin.com/video/..."
                  />
                </AdminField>

                <AdminMediaField
                  label={mediaType === "video" ? "封面图 / 海报" : "封面照片"}
                  value={item.coverImage ?? ""}
                  onChange={(v) => updateVideo(index, { coverImage: v })}
                  accept="image/*"
                  hint={
                    mediaType === "image"
                      ? "滚动卡片显示的图片（可上传或填 URL）"
                      : "视频未播放时的封面（可选，建议上传）"
                  }
                />

                {mediaType === "video" && (
                  <AdminMediaField
                    label="预览视频"
                    value={item.previewVideo ?? ""}
                    onChange={(v) => updateVideo(index, { previewVideo: v })}
                    accept="video/mp4,video/webm"
                    hint="短视频 mp4/webm；前台悬停静音循环。可上传或填直链。"
                  />
                )}

                <div className="admin-form-grid admin-form-grid--bilingual">
                  <AdminField label="序号角标">
                    <AdminInput
                      className="admin-mono"
                      value={item.index ?? indexLabel}
                      onChange={(e) => updateVideo(index, { index: e.target.value })}
                      placeholder="01"
                    />
                  </AdminField>
                  <AdminField label="排序 order">
                    <AdminInput
                      type="number"
                      className="admin-mono"
                      value={item.order ?? index + 1}
                      onChange={(e) =>
                        updateVideo(index, { order: Number(e.target.value) || index + 1 })
                      }
                    />
                  </AdminField>
                </div>

                <AdminBilingualInput
                  label="卡片标题（底部文案）"
                  value={item.title}
                  onChange={(v) => updateVideo(index, { title: v })}
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() =>
            setVideos((prev) => {
              const n = (prev?.length ?? 0) + 1;
              return [
                ...prev,
                {
                  id: newVideoId(),
                  platform: "douyin",
                  mediaType: "image",
                  url: "",
                  coverImage: "",
                  previewVideo: "",
                  order: n,
                  index: padIndex(n),
                  enabled: true,
                  title: { cn: `照片卡片 ${padIndex(n)}`, en: `Photo ${padIndex(n)}` },
                  description: { cn: "", en: "" },
                },
              ];
            })
          }
        >
          添加封面卡片
        </button>
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="微信" title="微信联系">
        <AdminField label="微信号 wechatId">
          <AdminInput
            className="admin-mono"
            value={social.wechatId ?? social.wechat ?? ""}
            onChange={(e) => setSocial((prev) => ({ ...prev, wechatId: e.target.value }))}
          />
        </AdminField>
        <AdminMediaField
          label="微信二维码"
          value={social.wechatQrImage ?? ""}
          onChange={(v) => setSocial((prev) => ({ ...prev, wechatQrImage: v }))}
        />
      </AdminFieldGroup>

      <AdminFieldGroup eyebrow="联系方式" title="联系方式">
        <div className="admin-form-grid admin-form-grid--bilingual">
          <AdminField label="电话">
            <AdminInput
              value={social.phone ?? ""}
              onChange={(e) => setSocial((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </AdminField>
          <AdminField label="邮箱">
            <AdminInput
              type="email"
              value={social.email ?? ""}
              onChange={(e) => setSocial((prev) => ({ ...prev, email: e.target.value }))}
            />
          </AdminField>
          <AdminBilingualInput
            label="所在地"
            value={social.location ?? { cn: "", en: "" }}
            onChange={(v) => setSocial((prev) => ({ ...prev, location: v }))}
          />
        </div>
        <AdminBilingualInput
          label="联系说明"
          value={social.contactNote}
          onChange={(v) => setSocial((prev) => ({ ...prev, contactNote: v }))}
          multiline
          rows={4}
        />
      </AdminFieldGroup>

      <AdminSaveBar
        saving={saving}
        dirty={dirty}
        onSave={handleSave}
        onReset={handleReset}
        saveLabel="保存封面滚动 / 社媒"
      />
    </>
  );
}
