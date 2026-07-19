# Admin CMS Upgrade Audit — 后台 CMS 升级审计

> 项目：YU YAKANG AUDIO  
> 阶段：8.0（只审计，不实现）  
> 日期：2026-07-19  
> 范围：前端页面 / 模块 / 后台能力 / 上传 / 案例 / 媒体 / 缺口 / 模型建议  

**本阶段禁止改代码。** 本文档为只读审计结果。

---

## 0. 开发前 git 注意

审计开始时本地状态：

- 分支：`master`，ahead of `origin/master`
- 允许 untracked：`docs/HOMEPAGE_RESTRUCTURE_AUDIT.md`、`scripts/output/image-manifest.json`
- **额外发现未提交代码改动（两大板块 / 四小分支进行中）：**
  - `src/lib/content.js`、`src/lib/caseAdmin.js`
  - `src/components/home/FeaturedCases.jsx`、`src/components/cases/CaseFilter.jsx`
  - `src/pages/CasesPage.jsx`、`src/styles/components.css`
  - untracked：`docs/CASE_PLATE_TAXONOMY.md`
- 本审计文档**不修改**上述文件；提交时也**不得**把上述代码改动混入本阶段 commit。

下文对案例分类的描述，同时覆盖：

1. **已提交基线**（Live / Mixing 两大首页区块 + 扁平 category）
2. **工作区进行中的 plate/branch 映射**（`CASE_PLATES`：现场/系统 × 系统工程/现场调音；后期/混音 × 多轨/贴唱）

---

## 1. 当前前端页面清单

| 路由 | 页面组件 | 布局 |
|------|----------|------|
| `/` | `src/pages/HomePage.jsx` | `SiteLayout` → Header + Footer |
| `/about` | `src/pages/AboutPage.jsx` | 同上 |
| `/cases` | `src/pages/CasesPage.jsx` | 同上；支持 `?plate=&branch=`（工作区） |
| `/cases/:slug` | `src/pages/CaseDetailPage.jsx` | 同上 |
| `/contact` | `src/pages/ContactPage.jsx` | 同上 |
| `/booking` | `src/pages/BookingPage.jsx` | 同上 |
| `/services` | `src/pages/ServicesPage.jsx` | 同上（导航有入口） |
| `/admin/login` | `src/pages/admin/AdminLoginPage.jsx` | 独立 |
| `/admin/*` | 见第 5 节 | `AdminLayout` + 鉴权 |

路由定义：`src/app/router.jsx`。  
Header：`src/components/layout/Header.jsx`。  
Footer：`src/components/layout/Footer.jsx`。

---

## 2. 当前前端模块清单（按页）

### 2.1 首页 `/`

| 模块 | 组件 | 数据来源 | 后台可编辑 |
|------|------|----------|------------|
| Hero | `HeroSection.jsx` | CMS `hero` + profile 身份；lead 可回落 `homeContent` | **部分**：`/admin/hero`、`/admin/profile` |
| 个人介绍 + 证书 | `HomeProfileSection.jsx` | 姓名 CMS；intro/roles **写死** `homeContent.js`；证书 CMS | **部分**：证书 `/admin/certificates`；文案否 |
| 现场 / 系统案例 | `FeaturedCases variant=live` | 案例 CMS + featured；标题/分支写死 `CASE_PLATES` 或旧 copy | **部分**：案例 `/admin/cases`；板块文案否 |
| 后期 / 混音案例 | `FeaturedCases variant=mixing` | 同上 | **部分** |
| 抖音 / 视频号 | `VideoHighlights.jsx` | URL：`socialLinks`；卡片文案硬编码；`featuredVideos` 无后台 UI | **部分**：URL `/admin/social` |
| 合作流程 | `WorkflowSection.jsx` | `siteSettings.processSteps` 或 `HOME_WORKFLOW_STEPS` | **部分**：步骤 `/admin/site-modules`；标题否 |
| 声音诊断 | `SoundIssueSection.jsx` | `siteSettings.soundIssues` 或 `SOUND_ISSUES` | **部分**：卡片 `/admin/site-modules`；标题否 |
| 服务预览 | `ServicePreview.jsx` + HomePage 标题 | 服务 CMS；问题 chips 有 fallback | **部分**：`/admin/services`；区块标题否 |
| 经验分享 | `TutorialSection.jsx` | `tutorialSection` + 社媒 URL | **是**：`/admin/tutorial` |
| 预约 CTA | `BookingCTA.jsx` | 组件内硬编码 | **否** |

### 2.2 About `/about`

| 模块 | 组件 | 数据来源 | 后台 |
|------|------|----------|------|
| 专业身份 | `EngineerIdentity.jsx` | profile CMS；标签/部分 intro fallback `aboutContent.js` | **部分** |
| 证书 rack | `CertificationRack.jsx` | certificates CMS；标签硬编码 | **部分** |
| 能力模块 03–07 | `AboutCapabilityModules.jsx` | 全写死 `ABOUT_CAPABILITY_MODULES` | **否** |
| 现场工作记录 | `FieldRecord.jsx` | `profile.workPhotos` 或静态图 | **部分**：`/admin/work-photos` |
| 工作方法论 | `WorkPhilosophy.jsx` | `WORK_PHILOSOPHY` 硬编码 | **否** |
| CTA | `AboutCTA.jsx` | 硬编码 | **否** |

### 2.3 案例列表 `/cases`

| 模块 | 说明 | 后台 |
|------|------|------|
| 页头标题/导语 | CasesPage 硬编码 | **否** |
| 筛选 | 扁平 category（基线）或 plate + branch（工作区 `CASE_PLATES`） | 分类选项写死；案例数据 **是** |
| 卡片 | `CaseCard` ← CMS cases | **是** |

### 2.4 案例详情 `/cases/:slug`

| 布局 | 模块 | 后台 |
|------|------|------|
| 非混音 | 项目详细信息 → 媒体机架 → 项目介绍 → CTA | 内容字段 **是**；区块标签否 |
| 混音类 | 贴唱 / 分轨播放器 → 项目介绍 → CTA（无项目数据/媒体机架） | `mixingAudioModules` **是** |
| Hero | `CaseDetailHero` | 案例字段 **是** |

### 2.5 Contact `/contact`

| 模块 | 后台 |
|------|------|
| ContactConsole | 部分（profile / location display / contactNote） |
| AuxChannels / PatchBay / WeChat | 部分（social + QR） |
| CommonTools | **是** `/admin/common-tools` |
| Material checklist | **部分** site-modules |
| Output CTA | **否** / 极少 |

### 2.6 Booking `/booking`

| 模块 | 后台 |
|------|------|
| 页头文案、表单步骤、venue/urgency | **否**（`bookingContent.js`） |
| 声音问题选项、工程师协助文案 | **部分** site-modules |
| 提交记录 | **是** `/admin/bookings`（状态/备注） |
| city 字段 | 表单固定字段，应保留，不建议删 |

### 2.7 Header / Footer / SEO

| 项 | 后台 |
|----|------|
| 导航文案 `i18n.nav` | JSON 有字段，**无后台 UI** |
| 站点名 `siteSettings.siteName` | **无专用 UI** |
| Footer tagline | **无专用 UI** |
| Footer 姓名 | profile **是** |
| Footer 城市 | location + display **是**（现默认隐藏） |
| 全局 SEO | `/admin/seo` **是** |

---

## 3. 首页模块细表（标题 / 媒体 / 按钮）

| 模块 | 标题/eyebrow | 说明 | 显隐 | 排序 | 图/视频上传 | 按钮文案/链接 | 列表增删排序 | 后台现状 | 缺口 |
|------|-------------|------|------|------|-------------|---------------|--------------|----------|------|
| Hero | 部分 CMS | 部分 CMS | 幻灯 enabled | 幻灯 sort | **是** | 部分 CMS | 幻灯 **是** | Hero 页强 | 无整页预览；身份文案分散 |
| 个人介绍 | **否** | **否** | **否** | **否** | 证书图是 | **否** | 证书是 | 证书可；文案否 | HomeProfile 专用后台 |
| Live/Mixing 案例 | **否**（plate 写死） | **否** | featured 间接 | case order | 封面在案例 | 查看全部写死 | 案例级是 | 案例可；板块否 | section 级 CMS + plate 配置 |
| 社媒视频 | **否** | **否** | 无 | 无 | URL 外链 | 部分硬编码 | featuredVideos 无 UI | URL 可 | 卡片文案 + featuredVideos UI |
| 合作流程 | **否** | **否** | 无 | JSON 内 | 无 | 无 | JSON 编辑 | site-modules | 结构化 UI + 标题字段 |
| 声音诊断 | **否** | **否** | 无 | JSON 内 | 无 | 无 | JSON 编辑 | site-modules | 同上 |
| 服务 | 区块标题否 | 服务有 | visible | sortOrder | 封面可 | 服务内可 | **是** | services | 首页区块 chrome |
| Tutorial | 部分 | **是** | enabled | 无 | 无 | CTA 部分 | 无 | tutorial | eyebrow 硬编码 |
| BookingCTA | **否** | **否** | **否** | **否** | 无 | **否** | 无 | 无 | 整块后台化 |

---

## 4. About 模块细表

| 模块 | 标题后台 | 文案后台 | 标签增删排序 | 证书增删/上传/排序 | 写死？ | 缺口 |
|------|----------|----------|--------------|-------------------|--------|------|
| 专业身份 | 否（chrome） | 部分 profile | 标签否 | — | 标签/部分 intro | About section CMS |
| 证书 | chrome 否 | — | credential tags 否 | **是** | 标签 | — |
| 能力 03–07 | **否** | **否** | 否 | — | **全写死** | 能力模块数组 CMS |
| Field Record | chrome 否 | 图注部分 | — | 工作照 **是** | chrome | — |
| Philosophy | **否** | **否** | — | — | **全写死** | CMS |
| CTA | **否** | **否** | — | — | **全写死** | CMS |

---

## 5. 后台现有能力清单

路由：`src/app/router.jsx`；导航：`src/lib/adminUi.js`。

| 路由 | 组件 | 能编辑 | 保存 API | 上传 | 增删 | 排序 | 显隐 | 校验 | 预览 | 备份 UI |
|------|------|--------|----------|------|------|------|------|------|------|---------|
| `/admin/login` | AdminLoginPage | 登录 | `POST /api/admin/login` | 否 | — | — | — | 必填 | — | — |
| `/admin` | AdminDashboard | 只读统计 | bookings + content | 否 | 否 | 否 | 否 | 完整度提示 | 链到子页 | 否 |
| `/admin/hero` | AdminHeroPage | hero + 案例 hero 旗标 | `PATCH .../hero`（+ cases） | 是 | 幻灯 | 是 | 是 | 软 | 无专页 | 服务端自动 |
| `/admin/location` | AdminLocationPage | location/serviceArea/display | 三 section | 否 | 否 | 否 | showOn* | 否 | 链 contact | 自动 |
| `/admin/profile` | AdminProfilePage | profile | `profile` | 媒体字段 | 否 | 否 | 否 | JSON 字段 | 链 about | 自动 |
| `/admin/services` | AdminServicesPage | services[] | `services` | 封面 | 是 | 是 | 是 | 否 | 链 services | 自动 |
| `/admin/cases` | AdminCasesPage + Editor | cases[] | `cases` | 是 | 是 | 是 | visible/featured/hero | normalize | 链详情 | 自动 |
| `/admin/certificates` | AdminCertificatesPage | certificates[] | `certificates` | 是 | 是 | 是 | visible | 否 | 否 | 自动 |
| `/admin/work-photos` | AdminWorkPhotosPage | profile.workPhotos | `profile` | 是 | 是 | 是 | 否 | 否 | 链 about | 自动 |
| `/admin/tutorial` | AdminTutorialPage | tutorialSection + 社媒 URL | 两 section | 否 | 否 | 否 | enabled | Douyin 警告 | 链 #tutorials | 自动 |
| `/admin/site-modules` | AdminSiteModulesPage | processSteps/soundIssues/booking* / checklist | `siteSettings` | 否 | JSON | JSON 内 | 否 | JSON parse | 链 `/` | 自动 |
| `/admin/common-tools` | AdminCommonToolsPage | commonTools | common-tools 或 siteSettings | 否 | 是 | 是 | enabled | title+url | 链 contact | 自动 |
| `/admin/bookings` | AdminBookingsPage | 状态/备注 | `PATCH /api/bookings/:id` | 否 | 仅更新 | 否 | 筛选 | 服务端 | 行展开 | N/A |
| `/admin/social` | AdminSocialPage | socialLinks | socialLinks | 微信 QR | 否 | 否 | 否 | Douyin 警告 | 链 contact | 自动 |
| `/admin/seo` | AdminSeoPage | seo | seo | OG/favicon | 否 | 否 | 否 | 长度提示 | 页内 SERP | 自动 |
| `/admin/media` | AdminMediaPage | 上传列表 | upload + trash | 是 | 上传/软删 | 时间序 | usage 标签 | MIME/大小 | 模态 | trash 目录 |

**不存在：** `AdminHomePage` / `AdminAboutPage` / `AdminContactPage`。

**自动备份：** `server/lib/jsonStore.js` 在 section PATCH 前写入 `server/backups/`（无后台「恢复上一版」UI）。

---

## 6. 案例系统能力

### 6.1 当前 category（`caseAdmin.CASE_CATEGORIES`）

| CMS ID | 后台标签（当前文案方向） |
|--------|--------------------------|
| `livehouse-system-tuning` | 现场调音 |
| `tour-system-engineering` | 系统工程 |
| `event-sound-reinforcement` | 现场调音（活动扩声） |
| `mixing-post-production` | 多轨混音 |
| `recording-editing` | 贴唱混音 |
| `acoustic-simulation` | 声学模拟 |

### 6.2 首页 / 列表筛选

- **基线已提交：** `getHomeLiveCases` / `getHomeMixingCases`（category allowlist + featured）
- **工作区：** `CASE_PLATES` + `getHomePlateCases` / `getCases({ plateId, branchId })`  
  - 现场调音 ← livehouse + event  
  - 系统工程 ← tour-system  
  - 多轨 ← mixing-post-production  
  - 贴唱 ← recording-editing  
  - 声学模拟仅「全部」

**尚无独立字段：** `caseGroup` / `caseBranch`（仅为前端映射）。

### 6.3 后台案例能力矩阵

| 能力 | 状态 |
|------|------|
| 新增 / 删除 / 复制 | 是 |
| 改 category | 是 |
| featured / visible / showInHero | 是 |
| sortOrder | 是 |
| 封面 cover | 是（AdminMediaField） |
| 独立 thumbnail 字段 | **否**（多用 cover） |
| gallery 多图 | 是（路径列表） |
| 视频 / poster / hero 时长 | 是 |
| 混音贴唱/分轨 | 是（MixingAudioPanel） |
| 媒体排序（gallery 精细 DnD） | **弱**（文本行序） |
| 案例排序 | 是 |
| 保存协议 | `PATCH /api/content/section/cases` |

### 6.4 案例缺口

1. 无一等公民 `caseGroup` / `caseBranch`（仅映射层）  
2. 无独立 thumbnail / poster 字段语义统一  
3. gallery 体验偏原始  
4. 板块标题/分支文案不可后台改  
5. 混音详情 chrome（01 VOCAL TUNE 等）硬编码  
6. 无案例级后台预览页（仅外链）

---

## 7. 混音音频模块

| 项 | 现状 |
|----|------|
| 结构 | `mixingAudioModules.{enabled,vocalTune,multitrack}` |
| Track | id, name, description, audioUrl, duration, order, enabled |
| 前端 | `MixingAudioSection` + `MixingAudioPlayer`；同页互斥播放 |
| 后台 | AdminMixingAudioPanel：开关、双语标题说明、轨 CRUD、排序、上传 |
| 上传 | `POST /api/upload`；音频 MIME；约 30MB |
| URL | `/uploads/...` 或 `/audio/...` |
| 音频封面 | **否** |
| 缺口 | 波形/封面、批量上传、试听预览、与列表「贴唱混音」分类命名易混淆（需文档区分） |

**重要：** 列表分支「贴唱混音 / 多轨混音」≠ 详情内「贴唱 / 分轨」播放器模块。

---

## 8. 媒体 / 上传能力

| 项 | 现状 |
|----|------|
| 上传入口 | AdminMediaField 各页；`/admin/media` 库列表 |
| API | `POST /api/upload`；`GET` 媒体列表；`DELETE /api/media/:filename` → `_trash` |
| MIME | jpeg/png/webp/gif；mp4/webm；mpeg/wav/aac/ogg…；pdf |
| 限额 | 图 20MB / 视频 300MB / 音频 30MB（multer 硬顶 300MB） |
| 存储 | `server/uploads/` → URL `/uploads/<file>` |
| 压缩 / 自动缩略图 | **否** |
| 视频 poster | 案例/hero 字段手填或上传，非自动生成 |
| 音频封面 | **否** |
| 替换 | 重新上传新文件；旧文件易成孤儿 |
| 重命名 / 引用计数 | **弱** |
| 统一 Media Library 实体 | **无**（仅文件系统列表） |
| Git 风险 | 大文件勿提交；`uploads` / 素材应忽略 |
| JSON 风险 | 勿写本机绝对路径；只用站点相对 URL |

---

## 9. Contact / Booking / Footer 摘要

| 区域 | 可后台改 | 缺口 |
|------|----------|------|
| Contact 联系方式/QR/社媒 | 大部分 | 控制台文案 chrome、CTA |
| Booking 表单结构 | 否 | 是否值得后台化需评估（建议先文案/选项，不改字段协议） |
| Booking city | 固定保留 | 不要删除 |
| Footer | 姓名/城市开关节 | siteName、tagline、导航无 UI |

---

## 10. 当前缺口总表（优先级）

**P0 — 内容经常改却无入口**

1. 首页个人介绍文案（`homeContent`）  
2. About 能力模块 + 方法论  
3. 首页/案例板块标题、eyebrow、说明  
4. BookingCTA / AboutCTA / 多数 SectionTitle chrome  
5. `siteSettings.siteName` / tagline / `i18n.nav` 无 UI  

**P1 — 有数据无好 UI**

1. site-modules JSON → 结构化编辑器  
2. featuredVideos  
3. gallery / 媒体排序体验  
4. Media Library（引用、替换、孤儿清理）  
5. 备份恢复 UI  

**P2 — 模型升级**

1. pages / sections 兼容层  
2. caseGroup / caseBranch 一等字段  
3. thumbnail / poster 统一  
4. 保存前预览  

---

## 11. 统一 CMS 数据模型建议（方案，不实现）

```text
globalSettings     → siteName, tagline, i18n, display, seo defaults
pages[]            → { id, path, title, enabled, sectionIds[] }
sections[]         → 见下方统一 section
cases[]            → 见第 12 节
mediaLibrary[]     → 见第 13 节
certificates[]     → 已有，挂 section 或独立
socialLinks        → 已有
bookingConfig      → 文案/选项（非提交数据）
contactConfig      → checklist 等
footer             → 或并入 globalSettings
```

### 统一 section 基础结构

```json
{
  "id": "home-live-cases",
  "type": "case-section",
  "enabled": true,
  "order": 20,
  "title": { "cn": "现场 / 系统类案例", "en": "Live & System Works" },
  "eyebrow": { "cn": "LIVE & SYSTEM", "en": "LIVE & SYSTEM" },
  "description": { "cn": "…", "en": "…" },
  "layout": "tabs",
  "buttons": [{ "id": "view-all", "label": {}, "to": "/cases?plate=live" }],
  "items": [],
  "media": {},
  "settings": {
    "plateId": "live",
    "defaultBranchId": "live-tuning",
    "source": "featured-cases"
  }
}
```

每个 section 至少：`id, type, enabled, order, title, eyebrow, description, layout, buttons, items, media, settings`。

**兼容策略：** 现有扁平 `hero` / `profile` / `cases` / `siteSettings.*` 通过 adapter 映射到 sections，避免一次性打破 PATCH 协议。

---

## 12. 案例数据模型建议

```json
{
  "id": "",
  "slug": "",
  "title": { "cn": "", "en": "" },
  "enabled": true,
  "featured": false,
  "order": 0,
  "caseGroup": "live-system",
  "caseBranch": "live-tuning",
  "category": "livehouse-system-tuning",
  "coverImage": "",
  "thumbnailImage": "",
  "posterImage": "",
  "location": { "cn": "", "en": "" },
  "date": "",
  "role": { "cn": "", "en": "" },
  "intro": { "cn": "", "en": "" },
  "media": { "videoUrl": "", "audioUrl": "" },
  "gallery": [],
  "videos": [],
  "mixingAudioModules": {},
  "seo": {}
}
```

| caseGroup | caseBranch |
|-----------|------------|
| `live-system` | `system-engineering`, `live-tuning` |
| `mixing` | `multitrack-mixing`, `vocal-tuning-mixing` |

- `acoustic-simulation`：保留 `category`，不进首页主线 plates  
- `event-sound-reinforcement` → branch `live-tuning`  
- **旧 `category` 必保留**，新字段可由映射回填；前端优先 `caseBranch`，无则回落 category  

---

## 13. 媒体库模型建议

```json
{
  "id": "media-001",
  "type": "image",
  "title": "Wild Live 封面",
  "url": "/uploads/images/cases/wild-cover.webp",
  "thumbnailUrl": "/uploads/images/cases/wild-thumb.webp",
  "posterUrl": "",
  "mimeType": "image/webp",
  "size": 123456,
  "alt": "Wild Live 项目现场",
  "description": "",
  "tags": ["case", "wild-live"],
  "usedBy": [{ "type": "case", "id": "", "field": "coverImage" }],
  "createdAt": "",
  "updatedAt": ""
}
```

升级要点：图片/音频/视频统一登记；封面/缩略图/poster；删除前检查引用；替换写新文件并更新引用；孤儿扫描；**禁止大文件进 Git**；JSON 只存相对 URL。

---

## 14. 风险评估

| # | 风险 | 说明 |
|---|------|------|
| 1 | 一次性大改 | 易全站回归失败；必须分阶段 + 兼容层 |
| 2 | 字段不兼容 | 缺 fallback 会空页；保留 category / 旧 sectionKey |
| 3 | 后台误删 | 需确认框 + 备份恢复 UI |
| 4 | 上传安全 | 已有 MIME/大小；需鉴权保持、防路径穿越 |
| 5 | 大文件进 Git | uploads/素材必须 ignore；CI 检查 |
| 6 | 空字段崩溃 | 继续强化 `t()` / normalize / EmptyState |
| 7 | PATCH 覆盖 | 整 section 写入；并发两页编辑可能互踩；需 updatedAt/乐观锁远期 |
| 8 | Strapi | 现 JSON CMS；模型设计应便于日后同步，不绑死 Strapi |
| 9 | Vercel/Render | 无状态上传目录需对象存储远期方案 |
|10 | 回滚 | 依赖 `server/backups` + git；需文档化恢复步骤 |

---

## 15. 下一步建议

1. **先处理工作区未提交的 plate/branch 改动**：单独 commit 或 stash，避免与 8.0 文档混淆。  
2. **8.0 文档提交后**，优先 **8.1 统一内容模型（兼容层）**，不要先推生产大改。  
3. 若急需上线稳定版：可先做 **最终 QA + 选择性 push 已稳定 commit**，CMS 大改放本地继续。  

详见：`docs/ADMIN_CMS_UPGRADE_ROADMAP.md`。

---

## 16. 本阶段约束自检

| 项 | 结果 |
|----|------|
| 修改前端/后台/API/CSS/JSON | **否**（审计文档除外） |
| 修改 Hero / 案例详情 / 混音播放器 | **否** |
| push / tag | **否** |
| 仅新增文档 | **是** |
