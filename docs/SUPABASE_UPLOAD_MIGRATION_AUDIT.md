# 8.6.1 Supabase Storage 上传链路迁移审计

> **YU YAKANG AUDIO** · `yuyakang-cms-prod`  
> 阶段：**仅审计**（8.6.1）— 不改 `src/`、不改上传实现、不改后台 UI  
> 前置：8.4 GET content、8.5 admin login + PATCH section 已线上跑通

---

## 1. 审计结论摘要

| 项 | 现状 |
|----|------|
| 旧实现 | Express `POST /api/upload`（`server/index.js` + `server/lib/upload.js`） |
| Vercel | **尚无** `api/upload.js` |
| Auth | **必须** admin session（`requireAdminAuth` / `yy_admin_session`） |
| 存储 | 本地磁盘 `server/uploads/` + `GET /uploads/*` 静态服务 |
| 前台依赖 | `result.file.url` → 写入 CMS JSON；`resolveUploadUrl()` 解析 `/uploads/` |
| Supabase | buckets 已有：`images` / `audio` / `videos`；表 `media_assets` 已建但未用于上传 |
| **关键风险** | Vercel Serverless **请求体约 4.5MB 上限**，与 Express 20–300MB 限制 **不兼容** — 8.6 不能简单「multer 改 Storage」 |

---

## 2. 当前旧 upload 实现位置

| 层级 | 文件 | 说明 |
|------|------|------|
| 路由 | [`server/index.js`](../server/index.js) L272–297 | `POST /api/upload` |
| 核心逻辑 | [`server/lib/upload.js`](../server/lib/upload.js) | multer、MIME、大小、响应组装 |
| 媒体列表 | [`server/lib/mediaStore.js`](../server/lib/mediaStore.js) | `GET /api/media` 扫目录 |
| 静态文件 | `server/index.js` L110 | `app.use("/uploads", express.static(UPLOADS_DIR))` |
| 目录常量 | [`server/lib/jsonStore.js`](../server/lib/jsonStore.js) | `UPLOADS_DIR = server/uploads` |
| 前端调用 | [`src/lib/api.js`](../src/lib/api.js) | `uploadFile()` / `resolveUploadUrl()` |
| 本地代理 | [`vite.config.js`](../vite.config.js) | `/api`、`/uploads` → Express `:3001` |

**Vercel `api/` 目录：** 无 upload 相关函数（8.6 待新增 `api/upload.js`）。

---

## 3. Upload Auth 机制

| 项 | 值 |
|----|-----|
| 中间件 | `requireAdminAuth`（[`server/lib/requireAdminAuth.js`](../server/lib/requireAdminAuth.js)） |
| Cookie | `yy_admin_session`（与 8.5 Vercel admin API 相同算法） |
| 未登录 | 401 `{ ok: false, authenticated: false, message: "未登录或登录已过期" }` |
| 未配置 auth | 503 |
| 前端 | `uploadFile()` 使用 `credentials: "include"`（[`api.js` L190–194](../src/lib/api.js)） |

**8.6 要求：** Vercel `POST /api/upload` 必须复用 `api/_lib/adminAuth.js` 的 `requireAdminSession`，与 PATCH content 一致。

---

## 4. 支持的 MIME 类型

来源：[`server/lib/upload.js`](../server/lib/upload.js) `ALLOWED_MIME_TYPES`

| 类别 | MIME |
|------|------|
| **image** | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| **video** | `video/mp4`, `video/webm` |
| **audio** | `audio/mpeg`, `audio/wav`, `audio/mp3`, `audio/x-wav`, `audio/aac`, `audio/mp4`, `audio/ogg` |
| **document** | `application/pdf` |

`getMediaCategory()` 映射：`image` | `video` | `audio` | `document` | `other`（白名单外 MIME 不会进入，other 仅分类兜底）。

---

## 5. 大小限制

来源：[`server/lib/upload.js`](../server/lib/upload.js) `SIZE_LIMITS` + multer `limits.fileSize`

| 类别 | 业务上限 | multer 硬上限 |
|------|----------|---------------|
| image | **20 MB** | 300 MB |
| video | **300 MB** | 300 MB |
| audio | **30 MB** | 300 MB |
| document (pdf) | **50 MB** | 300 MB |
| other | **50 MB** | 300 MB |

校验顺序：multer 先拦截超大 → `validateUploadedFile()` 再按类别校验。

---

## 6. 当前保存位置

| 路径 | 用途 |
|------|------|
| **`server/uploads/`** | upload API 写入的唯一目录（gitignore） |
| `server/uploads/_trash/` | DELETE `/api/media/:filename` 软删目标 |
| **`public/`** | 构建进 `dist` 的静态资源（hero 示例视频、`/audio/` 等）— **不经过** upload API |
| ~~`public/uploads`~~ | **不存在** — 上传不在 public 下 |

文件名：`sanitizeFilename()` → `{safeBase}-{timestamp}{ext}`，扁平存放在 `server/uploads/`（无子目录）。

---

## 7. 当前返回格式

### 7.1 `POST /api/upload` 成功（HTTP **201**）

```json
{
  "ok": true,
  "file": {
    "url": "/uploads/{filename}",
    "filename": "{filename}",
    "size": 12345,
    "mimeType": "image/webp",
    "type": "image",
    "uploadedAt": "2026-08-11T12:00:00.000Z"
  }
}
```

### 7.2 失败

| 场景 | 状态 |  body |
|------|------|------|
| 无文件 | 400 | `{ ok: false, error: "No file uploaded" }` |
| MIME 不支持 | 400 | `{ ok: false, error: "Unsupported file type: ..." }` |
| 超大 | 400 | `{ ok: false, error: "File too large..." }` 或 multer `LIMIT_FILE_SIZE` |
| 未登录 | 401 | 同 admin auth |
| 服务器错误 | 500 | `{ ok: false, error: "Upload failed" }` |

### 7.3 `GET /api/media` 列表项（无 `mimeType`）

```json
{
  "ok": true,
  "files": [
    {
      "filename": "...",
      "url": "/uploads/...",
      "type": "image",
      "size": 12345,
      "uploadedAt": "..."
    }
  ]
}
```

### 7.4 multipart 约定

- 字段名：**`file`**（`multer.single("file")`）
- 前端：`FormData.append("file", file)`

---

## 8. 后台调用 upload 的所有位置

### 8.1 统一入口

| 函数 / 组件 | 文件 | 用法 |
|-------------|------|------|
| `uploadFile(file)` | `src/lib/api.js` | `POST /api/upload`，返回整包 JSON |
| `AdminMediaField` | `src/components/admin/AdminMediaField.jsx` | `onChange(result.file.url)` |
| `resolveUploadUrl(url)` | `src/lib/api.js` | 仅处理 `/uploads/` 前缀 → 拼 API 基址；`https://` 原样返回 |

### 8.2 各 Admin 页面

| 页面 | 文件 | 上传场景 | accept / 备注 |
|------|------|----------|---------------|
| **素材库** | `AdminMediaPage.jsx` | 通用上传 + 列表 | 任意白名单类型 |
| **Hero** | `AdminHeroPage.jsx` | 轮播片段 `slide.video` | `video/*`；poster 多为手填 `/hero/...` |
| **案例编辑** | `AdminCaseEditor.jsx` | 封面、案例视频、视频封面、SEO 图 | `image/*`, `video/mp4,video/webm` |
| **混音音频** | `AdminMixingAudioPanel.jsx` | 贴唱/分轨 `track.audioUrl` | audio MIME 列表，≤30MB 提示 |
| **证书** | `AdminCertificatesPage.jsx` | 证书图片 | 默认 `image/*` |
| **服务** | `AdminServicesPage.jsx` | 服务封面 | `image/*` |
| **个人资料** | `AdminProfilePage.jsx` | 头像、封面 | `image/*` |
| **工作照** | `AdminWorkPhotosPage.jsx` | 工作照图片 | `image/*` |
| **SEO** | `AdminSeoPage.jsx` | OG 图、Favicon | `image/*` |
| **社媒/封面卡** | `AdminSocialPage.jsx` | 封面图、预览视频 | `image/*`, `video/mp4,video/webm` |

**不经 upload API 的路径：**

- 案例 **图库**：`AdminCaseEditor` 多行文本手填路径（可填 `/uploads/...` 或外链）
- Hero **poster**：多为 `/hero/...` public 静态路径
- 混音/案例 **手填 URL**：`/audio/...`、`/uploads/...`、外链

### 8.3 前台消费 URL 的位置（只读，8.6 不改）

- `resolveUploadUrl()` — 全站 `/uploads/` 解析
- `VideoHighlights.jsx`、`AdminSocialPage` 等 — 条件 `startsWith("/uploads/")`

---

## 9. Response 兼容要求（8.6 必须保持）

前台 / 后台 **硬依赖** 字段：

| 字段 | 依赖方 | 要求 |
|------|--------|------|
| **`file.url`** | `AdminMediaField`, `AdminHeroPage` | **必须** — 写入 CMS 的主 URL |
| `ok: true` | `parseResponse()` | 必须 — HTTP 2xx |
| `file.filename` | 可选 — Media 页展示/删除 | 建议保留；可用 Storage object key  basename |
| `file.size` | Media 页 | 建议保留 |
| `file.mimeType` | 无强依赖 | 建议保留 |
| `file.type` | Media 页筛选 | 建议保留（image/video/audio/document） |
| `file.uploadedAt` | Media 页排序 | 建议保留 ISO 字符串 |

**URL 形态兼容策略（推荐）：**

1. **优先** 返回 Supabase 公开 HTTPS URL — `resolveUploadUrl()` 对 `http(s)://` 原样放行，**无需改 src**。
2. **可选兼容** 继续支持 `/uploads/...` 形态（需额外 CDN/反代；8.6 可不实现）。
3. **不要** 改为 `{ data: { url } }` 等嵌套结构。

**HTTP 状态码：** 成功保持 **201**（与 Express 一致）。

---

## 10. Supabase bucket 映射建议

现有 bucket（用户已确认）：`images` | `audio` | `videos` — **本阶段不新增 bucket**。

| MIME / type | 目标 bucket | Storage path 建议 |
|-------------|-------------|-------------------|
| `image/*` | **`images`** | `cms/{yyyy}/{filename}` 或 `cases/`、`certificates/`、`profile/` 分前缀 |
| `audio/*` | **`audio`** | `mixing/{caseSlug}/...` 或 `cms/{filename}` |
| `video/*` | **`videos`** | `hero/`、`social/`、`cases/` |
| `application/pdf` | **`images`**（建议） | `documents/{filename}` — **不新增 docs bucket**；PDF 用量少，与图片同 bucket 公开读即可 |

**公开 URL 格式：**

```text
https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
```

示例（project_ref 来自 `SUPABASE_URL`，勿硬编码）：

```text
https://<ref>.supabase.co/storage/v1/object/public/images/cms/photo-1735689600000.webp
```

**Content-Type：** 上传时设置 `contentType: file.mimetype`，便于浏览器正确预览。

---

## 11. 是否写入 `media_assets` 表

表结构见 [`docs/SUPABASE_MINIMAL_CONNECTION.md`](./SUPABASE_MINIMAL_CONNECTION.md)：

`id`, `type`, `title`, `url`, `thumbnail_url`, `bucket`, `path`, `mime_type`, `size`, `metadata`, `created_at`, `updated_at`

| 选项 | 建议 |
|------|------|
| **8.6 最小** | upload 成功 → **可选 insert** `media_assets`（与 Express「只写磁盘」行为等价增强） |
| **8.6 不做 insert** | 仅 Storage + 返回 URL；`GET /api/media` 仍不可用（需 8.6.2） |
| **推荐** | **写入** — 便于 `GET /api/media` 迁移、`AdminMediaPage` 列表、usage 标签；失败策略见 §14 |

insert 字段映射建议：

| 列 | 来源 |
|----|------|
| `type` | `getMediaCategory(mimeType)` |
| `title` | 原始文件名（sanitize 前 basename）或 null |
| `url` | 公开 HTTPS URL |
| `thumbnail_url` | 图片可与 url 相同；视频/audio 暂 null |
| `bucket` | `images` / `audio` / `videos` |
| `path` | object key |
| `mime_type` | mimetype |
| `size` | bytes |
| `metadata` | `{ filename, uploadedAt, source: "admin-upload" }` |

**不强制：** CMS section JSON 仍只存 URL 字符串（与现网一致）。

---

## 12. 旧 `/uploads/` 路径兼容

| 场景 | 建议 |
|------|------|
| **已入库 URL** | `site_content` / Supabase 中大量 `/uploads/xxx.webp` — 迁移前仍依赖 Render 静态或本地 Express |
| **新上传** | 返回 `https://...supabase.co/storage/...` — 前台 `resolveUploadUrl` 无需改动 |
| **历史文件** | 8.6 后单独脚本 `scripts/migrate-uploads-to-supabase.mjs`（roadmap 已列）批量上传 + 替换 JSON URL |
| **Vercel 反代 `/uploads`** | 需改 `vercel.json` — **8.6.1 不建议**；8.7 或迁移脚本阶段处理 |
| **兼容期** | 双轨：旧 URL 继续可访问（Render/OSS），新 URL 走 Supabase |

---

## 13. 安全风险

| 风险 | 现 Express 做法 | 8.6 要求 |
|------|-----------------|----------|
| 未授权上传 | `requireAdminAuth` | Vercel 必须 `requireAdminSession` |
| Service role 泄露 | 仅 server | **禁止** `src/` import；仅 `api/_lib/supabaseServer.js` |
| MIME 伪造 | multer mimetype + 白名单 | 白名单 + 可选 magic-byte 抽检（P1） |
| 超大文件 | 分类上限 | 保留相同业务上限（但受 Vercel 网关限制，见 §15） |
| 路径穿越 | `sanitizeFilename` + `resolveSafeUploadPath` | Storage object key 只用 basename；禁止 `..` |
| 文件名注入 | NFKD + 替换非 `[\\w.-]` | 复用 `sanitizeFilename` 逻辑到 `api/_lib/upload*.js` |
| 公开 bucket | N/A | buckets 公开读仅 CMS 媒体；**写**必须 service role + admin |
| 枚举 | 目录列表需 admin | `GET /api/media` 保持 admin-only |

---

## 14. 回滚策略

### 14.1 Storage 成功、`media_assets` insert 失败

| 步骤 | 动作 |
|------|------|
| 1 | 返回 **503** 或 500，**不**返回 `{ ok: true }`（避免 CMS 写入幽灵 URL） |
| 2 | 记录 object path；可选异步补偿 job 重试 insert |
| 3 | 或：insert 失败时 **删除** 已上传 Storage object（best-effort cleanup） |
| 4 | 运维：按 path 手动删孤儿 object |

### 14.2 上传成功、PATCH section 保存失败

| 步骤 | 动作 |
|------|------|
| 1 | 文件已在 Storage — **保留**（与现 Express 行为一致：upload 与 save 分离） |
| 2 | Admin 可重新 save；Media 库可见（若写了 media_assets） |
| 3 | 不回滚 Storage |

### 14.3 旧 URL 保留

- 迁移脚本前 **不修改** 已有 `/uploads/` 字符串
- 新 upload 仅新 URL 形态
- 回滚 feature：env `UPLOAD_TARGET=express|supabase`（可选，8.6 文档级建议）

---

## 15. Vercel Serverless 限制与风险

| 限制 | 影响 | 对策 |
|------|------|------|
| **请求体 ~4.5 MB**（Serverless 硬限制） | Express 允许 20–300 MB — **无法原样透传** | 见 §16 方案 B/C |
| **无持久磁盘** | 不能 multer diskStorage | 内存 / 流式直传 Supabase |
| **执行时间** | Hobby 10s / Pro 可调 | 大文件上传易超时 |
| **内存** | 峰值与 body 相关 | 避免整文件 buffer 到内存（大文件） |
| **multipart 解析** | 无 multer | `busboy` / `@fastify/busboy` 在 `api/upload.js` |
| **冷启动** | 首次上传延迟 | 可接受 |

**结论：** 若坚持 **不改 `src/lib/api.js`**，则 Vercel 上的 `POST /api/upload` **只能可靠支持 ≤ ~4MB 文件**（留 multipart 开销）。这与后台「图片 20MB / 音频 30MB / 视频 300MB」**严重冲突**。

---

## 16. 最小迁移方案（8.6 实施建议）

### 16.1 原则（与用户约束对齐）

1. **优先** 新增 Vercel `api/upload.js` + `api/_lib/upload*.js`
2. **不改** `src/`、后台 UI、`HeroVideoCarousel`、案例页
3. **保持** `{ ok, file: { url, filename, size, mimeType, type, uploadedAt } }`
4. **保留** Express upload（Render 本地 dev / 回滚）
5. **复用** `adminAuth`、`sanitizeFilename`、MIME/大小常量（抽到共享模块或从 `server/lib/upload.js` 只读复制）

### 16.2 方案 A — 直传 Vercel（仅适合小文件）

```text
Admin → multipart POST /api/upload → busboy 解析 → Supabase Storage.upload → 201 + file.url
```

- ✅ 零 `src` 改动  
- ❌ 实际 max ~4.5 MB — **不满足** 现网 audio/image 上限  

**适用：** POC、仅 favicon/小图；**不适用** 生产全量。

### 16.3 方案 B — Signed URL 两阶段（推荐生产）

```text
1. POST /api/upload/sign  { mimeType, size, filename }  → admin session
   ← { uploadUrl, token, publicUrl, path }   // 或仍叫 /api/upload，body 无 file
2. Browser PUT 直传 Supabase Storage（绕开 Vercel body 限制）
3. POST /api/upload/complete { path }  → insert media_assets → 201 同构 file 对象
```

- ⚠️ 需 **极小** `uploadFile()` 改动（用户 8.6 若坚持零 src，则只能方案 A + 降低上限并改 Admin 提示 — **不推荐**）
- ✅ 支持 300MB 视频（Supabase 单文件上限依项目配置）
- ✅ service role 仅在后端 sign/complete

### 16.4 方案 C — 混合（8.6  pragmatic）

| 文件大小 | 路径 |
|----------|------|
| ≤ 4 MB | 方案 A：经 Vercel multipart |
| > 4 MB | 方案 B：signed URL（需后续 8.6b 极小 src 改动） |

Express 路由保留至 8.7 全同域。

### 16.5 建议文件（8.6 实现阶段，非 8.6.1）

| 文件 | 作用 |
|------|------|
| `api/upload.js` | POST multipart 或 sign/complete 路由入口 |
| `api/_lib/uploadConfig.js` | MIME、SIZE_LIMITS（与 server 同步） |
| `api/_lib/uploadStorage.js` | Supabase Storage upload + publicUrl |
| `api/_lib/uploadValidate.js` | validate + sanitize |
| `api/_lib/mediaAssets.js` | 可选 insert `media_assets` |
| `docs/SUPABASE_UPLOAD_API.md` | 8.6 实现文档 |

**8.6.1 不创建上述实现文件。**

---

## 17. 测试方案

### 17.1 本地

| 步骤 | 说明 |
|------|------|
| 1 | `.env.local` 配 Supabase + admin |
| 2 | `npx vercel dev` |
| 3 | admin login → POST `/api/upload` multipart |
| 4 | 断言 201 + `file.url` 可 GET |
| 5 | PATCH section 写入 URL → GET `/api/content` 含新 URL |
| 6 | 前台预览图片/音频 |

**Helper 测试（不 commit）：** Node 脚本调用 `uploadStorage` + service role — 仅 dev 用。

### 17.2 线上

```text
POST https://www.yuyakang.top/api/admin/login   → Cookie
POST https://www.yuyakang.top/api/upload        → multipart file
GET  {file.url}                                 → 200 + 正确 Content-Type
GET  https://www.yuyakang.top/api/content       → JSON 内 URL 可访问
```

| 用例 | 类型 | 期望 |
|------|------|------|
| 小 webp | image | 201，公开 URL 可显示 |
| mp3 ~5MB | audio | 方案 A **失败** / 方案 B **成功** |
| 未登录 | — | 401 |
| 错误 MIME | — | 400 |
| 超大 | — | 400 |

### 17.3 诊断脚本（可选，不 commit）

**原因：** 8.6 后可加 `scripts/upload-smoke.mjs`（login + 上传 1x1 png + 打印 safe meta）。8.6.1 **不新增**。

---

## 18. 与路线图关系

| 阶段 | 内容 |
|------|------|
| **8.6.1** | 本文档审计 ✅ |
| **8.6.2** | 实现 `api/upload.js`（选 A/B/C） |
| **8.6.3** | `GET/DELETE /api/media` → Storage / `media_assets` |
| **8.6.4** | `migrate-uploads-to-supabase.mjs` + content URL 批量替换 |
| **8.7** | `/admin` 同域、去掉 Render 依赖 |

---

## 19. 参考

- [`docs/FREE_BACKEND_MIGRATION_AUDIT.md`](./FREE_BACKEND_MIGRATION_AUDIT.md) §6 上传链路
- [`docs/FREE_BACKEND_MIGRATION_ROADMAP.md`](./FREE_BACKEND_MIGRATION_ROADMAP.md) §8.6
- [`docs/MIXING_AUDIO_MODULES.md`](./MIXING_AUDIO_MODULES.md) — 混音音频 upload
- [`docs/ADMIN_CMS_UPGRADE_AUDIT.md`](./ADMIN_CMS_UPGRADE_AUDIT.md) — Media 库

---

*文档版本：8.6.1 · 仅审计，无代码变更*
