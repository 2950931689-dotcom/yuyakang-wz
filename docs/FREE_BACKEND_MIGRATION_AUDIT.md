# 8.1 Free Backend Migration Audit

> **YU YAKANG AUDIO** — Vercel + Supabase 免费后端迁移审计  
> 阶段：**仅审计 / 方案**（不改业务代码）  
> 日期：2026-07-30  
> 本地路径：`E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-audio-site`  
> GitHub：`https://github.com/2950931689-dotcom/yuyakang-wz`

---

## 1. 当前架构

```text
用户浏览器
    │
    ├─► https://www.yuyakang.top          (Vercel — 静态 SPA dist/)
    │       vercel.json 将 /admin/* 307 重定向到 api 子域
    │       VITE_API_URL=https://api.yuyakang.top（构建时）
    │
    └─► https://api.yuyakang.top           (Render — 已弃用 / 需绑卡)
            Express server/index.js
            API_ONLY=true → 仅 /api/* + /admin/* SPA
            读写的 JSON：server/data/site-content.json
            读写的预约：server/data/bookings.json
            媒体文件：server/uploads/
            Session Cookie：yy_admin_session
```

**本地开发：**

- Vite `:5173` 代理 `/api`、`/uploads` → Express `:3001`
- 全栈模式：`npm run dev`（client + server 并行）

**关键配置：**

| 文件 | 作用 |
|------|------|
| `vercel.json` | 前台构建 + `/admin` → `api.yuyakang.top` 重定向 |
| `render.yaml` | Render API_ONLY 部署（**标记弃用，暂不删除**） |
| `vite.config.js` | dev 代理 |
| `src/lib/api.js` | 前台/后台 fetch 封装、`resolveUploadUrl` |
| `server/index.js` | 全部 Express 路由（无 `server/routes/` 子目录） |

---

## 2. 新目标架构

```text
用户浏览器
    │
    └─► https://www.yuyakang.top          (Vercel 单域)
            ├─ /              → SPA 前台
            ├─ /admin/*       → SPA 后台（同 dist，React Router）
            ├─ /api/*         → Vercel Serverless Functions
            └─ 静态 /assets、/public

Vercel Serverless (/api)
    ├─ 读/写 Supabase Database（site_content、bookings、media_assets）
    ├─ 上传 Supabase Storage（images / audio / videos buckets）
    └─ Admin Session Cookie（同域，无需跨域）

Supabase
    ├─ site_content 表 — JSON section 兼容现有 CMS 结构
    ├─ media_assets 表 — 上传索引（可选但推荐）
    ├─ bookings 表 — 预约记录（现独立于 site-content.json）
    └─ Storage buckets — 公开读、服务端写
```

**主链路变更：**

- `api.yuyakang.top` **不再作为主链路**
- 删除或停用 `vercel.json` 中 `/admin` → Render 的重定向（8.2+ 实施时）
- `VITE_API_URL` 生产环境可留空或设为同域（`api.js` 已支持 `/admin` 下相对路径）

---

## 3. 当前 API 列表

> 全部定义于 [`server/index.js`](../server/index.js)。**不存在** `server/routes/` 目录。  
> **不存在** 独立 `/api/seo` 路由 — SEO 通过 `PATCH /api/content/section/seo` 保存。

| 接口 | 定义位置 | 读 | 写 | site-content.json | server/uploads | Cookie/Session | Vercel Serverless 适合度 | 迁移风险 |
|------|----------|----|----|-------------------|----------------|----------------|--------------------------|----------|
| `GET /api/health` | index.js L119 | 内存/env | 无 | 否 | 否 | 否 | **高** | 低；需加 Supabase ping |
| `GET /api/content` | L180 | `readSiteContent(SITE_CONTENT_PATH)` | 无 | **是（整文件）** | 否 | 否 | **高** | 中；需组装多 section 或单 blob |
| `PUT /api/content` | L221 | 读+校验 | 整文件覆盖 + backup | **是** | 否 | **是** | 中 | 高；整表覆盖危险，建议弃用或限内部 |
| `PATCH /api/content/section/:sectionKey` | L245 | 读 section | `updateJsonSection` + backup | **是（单 key）** | 否 | **是** | **高** | 中；需映射到 Supabase upsert |
| `POST /api/upload` | L272 | 无 | multer → disk | 否 | **是** | **是** | **中** | 高；multer/磁盘不可用，改 Storage SDK |
| `GET /api/media` | L299 | `listMediaFiles()` | 无 | 否 | **是（列目录）** | **是** | 中 | 中；改查 `media_assets` 或 Storage list |
| `DELETE /api/media/:filename` | L309 | 无 | move to `_trash` | 否 | **是** | **是** | 中 | 低 |
| `POST /api/admin/login` | L130 | env hash | Set-Cookie | 否 | 否 | **创建 session** | **高** | 低 |
| `GET /api/admin/me` | L155 | Cookie | 无 | 否 | 否 | **验证 session** | **高** | 低 |
| `POST /api/admin/logout` | L175 | 无 | Clear-Cookie | 否 | 否 | **清除 session** | **高** | 低 |
| `PATCH /api/admin/common-tools` | L190 | Strapi API | Strapi 写入 | 否 | 否 | **是** | 低 | 中；Strapi 默认关闭，可延后 |
| `GET /api/bookings` | L323 | `bookings.json` | 无 | **否（独立文件）** | 否 | **是** | **高** | 中；需新表 |
| `POST /api/bookings` | L352 | 无 | append `bookings.json` | **否** | 否 | 否（公开） | **高** | 低 |
| `PATCH /api/bookings/:id` | L381 | 读+改 | 写回 `bookings.json` | **否** | 否 | **是** | **高** | 低 |
| `GET /admin/login` | L419 | dist/index.html | 无 | 否 | 否 | 否 | **N/A（SPA）** | Vercel rewrite 即可 |
| `GET /admin/*` | L421 | dist/index.html | 无 | 否 | 否 | 否 | **N/A（SPA）** | 同上 |
| `GET /api/seo` | — | **不存在** | — | — | — | — | — | SEO 走 section `seo` |

**静态资源：**

- `GET /uploads/*` — `express.static(UPLOADS_DIR)`（L110）
- 生产 Render 模式下由 API 域提供；Vercel 迁移后改为 Supabase 公开 URL 或 CDN

---

## 4. 前台读取链路

**统一入口：** [`ContentContext.jsx`](../src/context/ContentContext.jsx) → [`getContent()`](../src/lib/content.js) → [`fetchContent()`](../src/lib/api.js) → `GET /api/content`

**优先级：**

```text
1. 内存 cache（同会话内）
2. API 成功 → normalizeContent(data) → source = "api"
3. API 失败 → normalizeContent(mockData) → source = "mock"
```

[`normalizeContent()`](../src/lib/contentDefaults.js) 再合并：

```text
mockData（site-content.mock.json）为底
→ 用 API 字段覆盖
→ siteSettings / homeSections 等 deep merge
→ 缺省数组/对象兜底
```

| 页面/模块 | 数据来源（content 字段） | Fallback |
|-----------|-------------------------|----------|
| 首页 Hero | `hero` + `cases`（轮播 featured/heroVideo） | mock + `homeContent.js` 硬编码 |
| 首页个人介绍+证书 | `profile`、`certificates` + `homeSections.profile` 文案 | mock / `homeSectionsDefaults` |
| Live/Mixing 案例 | `cases[]` + `homeSections.liveCases/mixingCases` + `CASE_PLATES`（taxonomy 在 content.js） | mock |
| 社媒封面滚动 | `featuredVideos[]` + `socialLinks` + `homeSections.videoHighlights` | mock；空数组时 UI 预览框架 |
| 合作流程 | `siteSettings.processSteps` + `homeSections.workflow` | mock / `homeContent.js` |
| 声音诊断 | `siteSettings.soundIssues` + `homeSections.soundCheck` | mock |
| 首页服务预览 | `services[]` + `homeSections.services` | mock |
| About | `profile`、`certificates`、capabilities 组件 | mock |
| Cases 列表 | `cases[]` + `CASE_PLATES` 筛选 | mock |
| Case detail | `cases[]` 按 slug；`mixingAudioModules` 在 case 内 | mock |
| Contact | `socialLinks`、`i18n.contact` | mock |
| Booking | `services[]`、`i18n`、表单静态 copy | mock；提交走 `POST /api/bookings` |
| Header/Footer | `siteSettings.siteName/tagline`、`i18n` nav | mock defaults |
| 混音音频播放器 | `case.mixingAudioModules` + `case.audioUrl` | mock 示例 `/audio/*.mp3` |
| SEO meta | `seo` | mock |

**读取特点：**

- 前台**从不**直接读 `server/data/site-content.json`
- Hero / 案例结构 / 混音模块**不在本阶段改动**
- API 失败时**不会黑屏**（已有 mock fallback）

---

## 5. 后台保存链路

**通用模式：**

- 单 section 编辑器：[`useSectionEditor`](../src/hooks/useSectionEditor.js) → `saveContentSection(key, data)` → `PATCH /api/content/section/:key`
- 多 section 页面：多次 `saveContentSection` 顺序调用
- 媒体上传：[`AdminMediaField`](../src/components/admin/AdminMediaField.jsx) → `uploadFile()` → `POST /api/upload` → 将返回 URL 写入 section 再保存

| 模块 | 后台页面 | 保存方法 | API 路径 | sectionKey | 整表覆盖？ | PATCH 互踩风险 | Supabase 迁移建议 |
|------|----------|----------|----------|------------|------------|----------------|-------------------|
| 首页文案 | `AdminHomeSectionsPage` | `useSectionEditor` → save | PATCH section | `homeSections` | 单 key 全量 | 低 | upsert `site_content` key=`homeSections` |
| Hero | `AdminHeroPage` | saveContentSection + uploadFile | PATCH `hero`；可能 PATCH `cases` | `hero`, `cases` | cases 整数组 | 中（cases 与案例页互踩） | 分 key；cases 保存前 read-merge-write |
| About/Profile | `AdminProfilePage` | saveContentSection | PATCH | `profile` | 单 key | 低 | upsert profile |
| 工作照 | `AdminWorkPhotosPage` | saveContentSection | PATCH | `profile`（workPhotos 字段） | 单 key | **高**（与 Profile 互踩） | 同 key 合并写 |
| Services | `AdminServicesPage` | saveContentSection | PATCH | `services` | **整数组** | 中 | upsert services |
| Cases 列表/编辑 | `AdminCasesPage` + `AdminCaseEditor` | saveContentSection | PATCH | `cases` | **整数组** | 低（单页独占） | upsert cases；含 mixingAudioModules |
| Certificates | `AdminCertificatesPage` | saveContentSection | PATCH | `certificates` | 整数组 | 低 | upsert certificates |
| Social/封面卡 | `AdminSocialPage` | 两次 saveContentSection | PATCH | `socialLinks`, `featuredVideos` | 分 key | 低 | 两个 key |
| Tutorial | `AdminTutorialPage` | saveContentSection ×2 | PATCH | `tutorialSection`, `socialLinks` | 分 key | socialLinks 互踩 | 顺序保存或合并 UI |
| 流程/诊断 | `AdminSiteModulesPage` | saveContentSection | PATCH | `siteSettings` | **整对象** | **高**（与 CommonTools 互踩） | read-merge-write siteSettings |
| Common tools | `AdminCommonToolsPage` | saveCommonTools 或 saveContentSection | PATCH | Strapi 或 `siteSettings` | 视模式 | **高** | 统一写 siteSettings.commonTools |
| Location | `AdminLocationPage` | save ×3 | PATCH | `location`, `serviceArea`, `display` | 分 key | 低 | 三 key upsert |
| SEO | `AdminSeoPage` | useSectionEditor | PATCH | `seo` | 单 key | 低 | upsert seo |
| Media 库 | `AdminMediaPage` | upload/trash API | POST upload, DELETE media | 不写 content | — | — | Storage + media_assets |
| Bookings | `AdminBookingsPage` | updateBooking | PATCH `/api/bookings/:id` | **bookings.json** | 单条 patch | 低 | `bookings` 表 |
| 混音贴唱/分轨 | `AdminCaseEditor` 内 | 随 cases 保存 | PATCH | `cases[].mixingAudioModules` | 整 cases 数组 | — | JSON 内嵌保留 |

**允许的 sectionKey**（[`validate.js`](../server/lib/validate.js)）：  
`hero`, `profile`, `location`, `serviceArea`, `display`, `services`, `cases`, `certificates`, `socialLinks`, `seo`, `tutorialSection`, `siteSettings`, `homeSections`, `featuredVideos`

**未在 ALLOWED 列表但存在于 JSON 的顶层键：** `meta`, `i18n`, `featuredVideos`（已允许）— 迁移时需决定 `i18n` / `meta` 是否单独成 key。

---

## 6. 上传链路

| 项 | 现状 |
|----|------|
| 定义位置 | [`server/index.js`](../server/index.js) L272 + [`server/lib/upload.js`](../server/lib/upload.js) |
| MIME 白名单 | jpeg/png/webp/gif, mp4/webm, mpeg/wav/mp3/aac/ogg, pdf |
| 大小限制 | 图片 20MB、视频 300MB、音频 30MB、文档 50MB；multer 硬上限 300MB |
| 存储位置 | `server/uploads/{sanitized-filename-timestamp}.ext` |
| 返回格式 | `{ ok, file: { url: "/uploads/...", filename, size, mimeType, type, uploadedAt } }` |
| media 记录 | **不写入** site-content；仅 [`GET /api/media`](../server/lib/mediaStore.js) 扫目录 |
| 路径穿越防护 | [`resolveSafeUploadPath`](../server/lib/mediaStore.js) — basename + relative 检查 |
| 删除 | 移到 `server/uploads/_trash/` |
| 持久化问题 | **Render 免费盘无持久化** — 重启丢文件；迁移 Supabase 可解 |

**前台 URL 解析：** [`resolveUploadUrl()`](../src/lib/api.js) — `/uploads/` 前缀拼 API 基址。

**Supabase Storage 映射建议：**

| Bucket | 内容 | 备注 |
|--------|------|------|
| `images` | 案例封面、证书、缩略图、视频封面、OG 图 | 公开读 |
| `audio` | 贴唱/分轨/混音案例 MP3 | 公开读；大文件注意免费额度 |
| `videos` | 少量预览短视频 | 大视频建议继续外链（抖音/视频号） |

上传后 URL 建议改为 Supabase 公开 URL 或 `/storage/v1/object/public/...`，并可选写入 `media_assets`。

---

## 7. 当前数据源

| 数据源 | 路径 | 用途 |
|--------|------|------|
| 生产 CMS（Render） | `server/data/site-content.json`（gitignore） | API 读写主库 |
| 种子/参考 | `server/data/site-content.example.json` | 首次启动复制 |
| Mock fallback | `src/data/site-content.mock.json` | API 失败时前台 |
| 预约 | `server/data/bookings.json` | 独立文件 |
| 备份 | `server/backups/site-content.*.json` | PATCH/PUT 前自动备份 |
| 上传 | `server/uploads/` | 媒体文件 |
| 静态 public | `public/`（含 hero 视频、示例 audio） | 构建进 dist，不经过 upload API |
| Strapi（可选） | 外部 | CommonTools 读写，默认 **关闭** |

---

## 8. 当前风险

1. **Render 弃用 + api 子域 500** — 线上后台不可用（已发生）。
2. **vercel.json 重定向** — `/admin` 指向已弃用 Render，与「同域后台」目标冲突。
3. **无持久化** — JSON + uploads 在 Render 免费层不可靠。
4. **section 互踩** — `profile`、`siteSettings`、`socialLinks` 多页写同一 key，后写覆盖先写。
5. **cases 整数组保存** — 并发编辑会丢数据（单管理员场景风险低）。
6. **PUT /api/content 整文件覆盖** — 误用可删数据（后台 UI 主要用 PATCH section）。
7. **Vercel Serverless 限制** — 请求体大小、执行时间、无本地磁盘，需改 upload 实现。
8. **Cookie 跨域** — 旧架构 api 子域 + www 需 CORS/credentials；同域后可简化。
9. **17+ 本地 commit 曾未 push** — 用户称已同步；迁移前需确认 GitHub 与 Vercel 部署版本一致。

---

## 9. 需要迁移的接口

**P0（最小可用）：**

- `GET /api/health`
- `GET /api/content`
- `PATCH /api/content/section/:sectionKey`
- `POST /api/admin/login` | `GET /api/admin/me` | `POST /api/admin/logout`
- `POST /api/upload`
- `POST /api/bookings` | `GET /api/bookings` | `PATCH /api/bookings/:id`

**P1：**

- `GET /api/media` | `DELETE /api/media/:filename`
- `PATCH /api/admin/common-tools`（若继续不用 Strapi 可跳过）

**P2 / 可弃用：**

- `PUT /api/content`（整库覆盖，建议不迁移或仅运维脚本）
- Render `API_ONLY` admin 静态路由（改 Vercel SPA rewrite）

---

## 10. 需要迁移的数据

**site_content 表（JSON key-value）建议 keys：**

| key | 现 JSON 顶层字段 |
|-----|------------------|
| meta | meta |
| siteSettings | siteSettings |
| profile | profile |
| hero | hero |
| location | location |
| serviceArea | serviceArea |
| display | display |
| services | services |
| cases | cases |
| certificates | certificates |
| socialLinks | socialLinks |
| featuredVideos | featuredVideos |
| seo | seo |
| tutorialSection | tutorialSection |
| homeSections | homeSections |
| i18n | i18n |

**独立表：**

- `bookings` — 从 `bookings.json` 导入

---

## 11. 需要迁移的媒体

1. `server/uploads/*` → Supabase Storage（按类型分 bucket）
2. `public/` 中 `/uploads/` 或 `/audio/` 引用 — 评估是否迁到 Storage 或保留静态 CDN
3. content JSON 内所有 `/uploads/...` URL — 批量替换为 Supabase 公开 URL
4. Hero 视频（`public/hero/`）— **本阶段不改动**；可继续 Vercel 静态托管

---

## 12. Supabase 表建议

### 12.1 `site_content`（已计划）— **足够支撑 CMS 阶段**

```sql
-- 概念结构
key text primary key,
data_json jsonb not null,
description text,
updated_at timestamptz default now()
```

- 与现有 `PATCH section` 模型 **1:1 对齐**
- `GET /api/content` 在服务端 SELECT 全部 key 组装为单一 JSON（与现前端一致）

### 12.2 `media_assets`（已计划）— **推荐保留**

- 支撑 Admin Media 页、上传追溯、删除索引
- **非必须**于第一分钟上线（可先仅 Storage），但缺少则 `/api/media` 需改 list bucket

### 12.3 最少额外表

| 表 | 必要性 | 说明 |
|----|--------|------|
| `bookings` | **必须** | 现独立于 site-content；含 status、internalNote、createdAt |
| `site_content_revisions` | 可选 P1 | 替代 `server/backups/` 版本历史 |
| 其余业务表 | **不需要** | 案例/服务/证书保持 JSON 内嵌 |

**结论：两张表 + `bookings` 表 = 当前阶段最小完备集。**

---

## 13. Supabase Storage bucket 建议

| Bucket | public | 写入 | 对象示例 |
|--------|--------|------|----------|
| `images` | 是 | service role only | covers, certs, og, marquee covers |
| `audio` | 是 | service role only | mixing modules, case audioUrl |
| `videos` | 是 | service role only | 短 preview；长视频外链 |

**RLS：** bucket 公共读；INSERT/UPDATE/DELETE 仅 service role（Vercel API 内使用）。

---

## 14. Vercel 环境变量建议

**构建时（可 VITE_）：**

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 留空或 `https://www.yuyakang.top`（同域相对路径优先） |

**运行时（Serverless only — 禁止 VITE_）：**

| 变量 | 说明 |
|------|------|
| `ADMIN_USERNAME` | 后台账号 |
| `ADMIN_PASSWORD_HASH` | scrypt hash |
| `ADMIN_SESSION_SECRET` | session HMAC |
| `ADMIN_SESSION_MAX_AGE` | ms |
| `SUPABASE_URL` | 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **仅服务端** |
| `SUPABASE_ANON_KEY` | 可选；若 API 层代理读则不必暴露给前端 |

**不要提交：** `.env.local`、service role key、任何 token。

---

## 15. 安全风险与对策

| 风险 | 对策 |
|------|------|
| Service role 泄露 | 仅 Vercel env；禁止 `VITE_`；禁止进 git |
| 公开 bucket 被写 | RLS 拒绝 anon/authenticated 写；仅 API 用 service role |
| 未登录保存/上传 | 复用 `requireAdminAuth` 逻辑到 serverless |
| 保存失败覆盖旧数据 | Supabase upsert 前校验；或 transaction；保留 revision 表 |
| 前台 API 失败黑屏 | 保持 `normalizeContent(mock)` fallback |
| PUT 整库覆盖 | 不暴露或废弃 |
| 上传恶意文件 | 保留 MIME 白名单 + 大小限制 |
| Session 固定/窃取 | HttpOnly + Secure + SameSite=Lax（已有） |

---

## 16. 回滚方式

1. **前台**：Supabase/API 失败 → 自动 mock fallback（已实现）。
2. **DNS/路由**：保留 `render.yaml` 文档标记弃用；紧急时可恢复 `api.yuyakang.top` CNAME（若 Render 仍可用）。
3. **vercel.json**：可恢复 `/admin` → api 重定向（旧模式）。
4. **数据**：迁移前导出 `site-content.json` + `bookings.json` + uploads 归档；Supabase 定期 backup。
5. **代码**：Express `server/` **不删除**；Vercel API 可 feature-flag 切换读 JSON / 读 Supabase。
6. **环境**：Vercel 保留上一 Deployment 一键回滚。

---

## 17. 迁移不破坏的前台成果（确认）

以下模块数据均来自 `content` JSON + 现有组件，迁移仅换**数据源**，不改组件结构则不影响：

- 首页 Hero / HeroVideoCarousel
- 个人介绍 + 证书、Live/Mixing 案例、四分支筛选
- 社媒封面滚动、流程、声音诊断
- About、案例详情减法结构、项目介绍、混音贴唱/分轨播放器
- 城市隐藏逻辑、Booking city 字段、Contact、移动端布局

**前提：** `GET /api/content` 返回的 JSON 形状与现 `normalizeContent` 输入一致。

---

## 附录 A：开发前 Git 检查（执行记录）

> 用户声明：**GitHub master 已同步**。审计阶段要求干净工作区。

**预期检查命令：**

```bash
git status
git log --oneline -20
git remote -v
```

**允许 untracked：** `scripts/output/image-manifest.json`  
**禁止提交：** `.env.local`、`node_modules`、`dist`、密钥、大素材、`yuyakang-strapi-poc`

**审计结论：** 本阶段仅新增 `docs/FREE_BACKEND_MIGRATION_*.md`，无业务代码改动。

---

## 附录 B：Vercel API 最小接口规划摘要

| 接口 | 难度 | 风险 |
|------|------|------|
| `/api/health` | 低 | 低 |
| `/api/content` | 中 | 组装遗漏 section |
| `/api/content/section/[key]` | 中 | 互踩需 merge 策略 |
| `/api/upload` | 高 | 体积/超时；需 streaming |
| `/api/admin/*` | 低 | Cookie 在 serverless 需一致 |
| `/api/bookings/*` | 中 | 新表 schema |

---

*文档版本：8.1-audit · 仅方案，不含实现代码*
