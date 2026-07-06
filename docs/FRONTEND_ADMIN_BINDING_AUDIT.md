# Frontend × Admin CMS Binding Audit

**Round 4.4 · YU YAKANG AUDIO**  
**Date:** 2026-07-06  
**Scope:** Home, About, Cases, Booking, Contact ↔ JSON CMS (no Strapi / DB)

---

## 1. API / CMS 数据入口

| 入口 | 说明 |
|------|------|
| `GET /api/content` | 读取 `server/data/site-content.json` 全量 JSON |
| `PUT /api/content` | 整文件写入（校验 + 备份） |
| `PATCH /api/content/section/:key` | 按 section 合并保存 |
| `ContentContext` → `getContent()` | 前台统一加载；失败时用 `src/data/site-content.mock.json` |
| `src/lib/cmsBinding.js` | **本轮新增**：CMS 优先 + 集中 fallback |

**允许 PATCH 的 section keys：**  
`hero`, `profile`, `location`, `serviceArea`, `display`, `services`, `cases`, `certificates`, `socialLinks`, `seo`, `tutorialSection`, **`siteSettings`（本轮新增）**

---

## 2. 前台页面读取的 content 字段

### 首页 Home

| 模块 | CMS 字段 | Helper |
|------|----------|--------|
| Hero 标题 | `hero.headline` | `splitHeroHeadline` + CMS |
| Hero 副标题/导语 | `hero.subheadline`, `siteSettings.tagline` | `getHeroCopy` |
| Hero 人名 | `profile.name`, `profile.nameCn/En`, `profile.role`, `profile.title` | `getProfileIdentity` |
| Hero 按钮 | `hero.secondaryButton`, `hero.primaryButton` | `getHeroCopy` |
| Hero 视频 | `hero.*`, `cases[]` | 不变（未改 `HeroVideoCarousel.jsx`） |
| 专业背书 | `certificates[]`, `profile.credentials`, `profile.tags` | `getHomeCredentials` |
| 服务预览 | `services[]` | 已有 `getVisibleServices` |
| 合作流程 | `siteSettings.processSteps` | `getHomeWorkflow` |
| 精选案例 | `cases[]` | 已有 |
| 声音诊断 | `siteSettings.soundIssues` | `getHomeSoundIssues` |
| 教程区 | `tutorialSection`, `socialLinks` | 已有 |

### 关于 About

| 模块 | CMS 字段 | Helper |
|------|----------|--------|
| Engineer Identity | `profile.*` | `getProfileIdentity` |
| Signal Identity | `profile.signalNodes/capabilities/skills`, 或 `services[]` | `getSignalIdentityNodes` |
| Control Surface | `profile.controlChannels`, 或 `services[]` | `getControlSurfaceChannels` |
| Experience Timeline | `profile.experience[]` | `buildExperienceCues`（已有） |
| Tool Rack | `certificates[]`, `profile.affiliation`, `profile.tools` | `buildToolRackItems`（已有） |
| Profile Archive | `profile.bio`, `skillGroups`, certs, `workPhotos` | 已有 |
| Work Philosophy | — | 保留 fallback |

### 案例 Cases

| 模块 | CMS 字段 | 说明 |
|------|----------|------|
| 列表/详情 | `cases[]` | 已 CMS 驱动 |
| Project Console | case 各字段 | 已有 |
| Signal Flow | `cases[].signalFlow` | `getCaseSignalFlow`（新增可选字段） |
| Media Rack | `images`, `videos`, `audioUrl`, `gallery` | `getMediaRackItems` / `CaseGallery` |

### 预约 Booking

| 模块 | CMS 字段 | Helper |
|------|----------|--------|
| 项目类型 | `services[]` | 已有 |
| 声音问题 | `siteSettings.bookingIssues` | `getBookingSoundIssues` |
| Assist Panel | `siteSettings.bookingGuide` | `getBookingGuide` |
| 提交 | `POST /api/bookings` | 未改 API |

### 联系 Contact

| 模块 | CMS 字段 | Helper |
|------|----------|--------|
| 通道 | `socialLinks`, `siteSettings.contactPhone/Email` | `getContactChannels` |
| 二维码 | `socialLinks.wechatQrImage`, `siteSettings.wechatQrUrl` | 已有 |
| 资料清单 | `siteSettings.contactChecklist` | `getContactChecklist` |
| 路由文案 | `socialLinks.contactNote`, location | 部分 CMS |

---

## 3. 后台各页面管理的字段

| 路由 | 管理内容 |
|------|----------|
| `/admin/hero` | 视频模式 + **headline/subheadline/按钮（本轮新增编辑）** |
| `/admin/profile` | 基本信息 + **affiliation/tagline/status/credentials/experience/tools（本轮新增）** |
| `/admin/services` | `services[]` |
| `/admin/cases` | `cases[]` + **signalFlow（本轮新增）** |
| `/admin/certificates` | `certificates[]` |
| `/admin/work-photos` | `profile.workPhotos[]` |
| `/admin/social` | 社媒 + **wechatId（本轮新增）** |
| `/admin/site-modules` | **processSteps/soundIssues/bookingIssues/bookingGuide/contactChecklist（本轮新增）** |
| `/admin/location` | location, serviceArea, display |
| `/admin/tutorial` | tutorialSection |
| `/admin/bookings` | bookings.json |
| `/admin/seo` | seo |
| `/admin/media` | 上传文件 |

---

## 4. 仍硬编码的内容（fallback）

- 页面 Section 装饰 eyebrow（CREDENTIALS, WORKFLOW, SIGNAL CHECK 等）
- `WorkPhilosophy` 全文
- `AboutCTA` / `BookingCTA` / 部分 page lead
- `ContactSignalTimeline` 步骤叙事
- `ROUTING_INTRO/DESC`（Contact hero 部分）
- `PATCH_CHANNELS` 结构标签
- `INTAKE_STEPS`, `VENUE_TYPES`, `DELIVERY_OPTIONS` 等预约流程框架
- `ENGINEER_PARAMS.id/field` 默认值（可被 `profile.engineerId` 覆盖）
- 首页预约按钮（`/booking`）文案 — CMS 无对应字段，保留 fallback

---

## 5. 应转 CMS / 已转 CMS

| 内容 | 状态 |
|------|------|
| Hero 文案按钮 | ✅ 已联动 |
| 专业背书列表 | ✅ 证书优先 |
| 合作流程 | ✅ processSteps |
| 首页声音诊断 | ✅ 可选 soundIssues |
| About 能力模块 | ✅ services/profile 扩展 |
| 预约问题选项 | ✅ 可选 bookingIssues |
| 联系资料清单 | ✅ 可选 contactChecklist |
| case signalFlow | ✅ 可选 |

---

## 6. 可保留 fallback 的内容

- 控制台装饰英文标签（SIGNAL READY, CHECK 01）
- 预约步骤框架与 venue/delivery 枚举
- Work Philosophy 长文（低频变更）
- Contact 路由 timeline 叙事

---

## 7. 新增 JSON 字段（均向后兼容）

| 位置 | 字段 | 必填 |
|------|------|------|
| `siteSettings` | `soundIssues[]`, `bookingIssues[]`, `bookingGuide`, `contactChecklist[]` | 否 |
| `profile` | `tagline`, `status`, `credentials[]`, `signalNodes[]`, `controlChannels[]`, `nameCn`, `nameEn`, `role` | 否 |
| `cases[]` | `signalFlow[]` | 否 |
| `socialLinks` | `wechatId` | 否 |

旧 JSON 无这些字段时，helper 自动使用 `*Content.js` 中的默认值。

---

## 8. 可复用的现有字段

- `siteSettings.processSteps` → 首页 Workflow（之前未接线，现已启用）
- `hero.headline/subheadline/primaryButton/secondaryButton` → Hero（之前部分未用）
- `profile.experience/tools/affiliation` → About（schema 已有，现已加后台编辑）
- `services[]` → Home/Booking/About 能力推导
- `certificates[]` → Home credentials + About Tool Rack

---

## 9. 联动优先级（实施顺序）

1. ✅ 已有 CMS 字段接线（hero copy, processSteps, profile, services, cases, social）
2. ✅ 新增可选 siteSettings 模块字段 + 后台 `/admin/site-modules`
3. ✅ 统一 `cmsBinding.js`
4. ⏸ 长文叙事模块（philosophy, routing intro）— 下轮可选

---

## 10. 不建议现在联动的内容

- `i18n` UI 壳字符串（改动面大）
- 预约步骤结构 / venue 枚举（结构化表单，非营销文案）
- Hero 视频轮播逻辑与转场
- Bookings API 字段结构
- 富文本编辑器

---

## 11. 测试清单

### 自动化
- [x] `npm run build`
- [x] `npm run test:smoke`（20 项）

### 前台
- [x] 首页 Hero 视频正常
- [x] 修改 hero.headline 后刷新可见
- [x] Workflow 读取 processSteps
- [x] About 读取 profile/certificates/workPhotos
- [x] Cases / Case detail 正常
- [x] Booking 服务列表来自 services
- [x] Contact 缺失通道显示 NOT CONFIGURED

### 后台
- [x] `/admin/hero` 保存 headline
- [x] `/admin/profile` 保存 name/title / tagline
- [x] `/admin/site-modules` 保存 processSteps
- [x] `/admin/social` 保存 wechatId
- [x] `/admin/cases` signalFlow 保存
- [x] 保存后前台刷新可见变化

### 联动验证（5 项）
1. [x] Hero headline → 首页（PATCH + Playwright 验证，已恢复）
2. [x] Profile tagline → About Identity（PATCH + Playwright 验证，已恢复）
3. [x] site-modules Workflow 文案 → 首页（PATCH + Playwright 验证，已恢复）
4. [x] social wechatId → Contact 复制按钮启用（PATCH + Playwright 验证，已恢复）
5. [x] case signalFlow → 案例详情信号链（PATCH + Playwright 验证，已恢复）

---

## 12. 第 4.4 验收报告

**日期：** 2026-07-06  
**Commit：** `66d52f0` — `feat(cms): bind frontend modules to admin content`

### 12.1 功能验收

| 项 | 结果 |
|----|------|
| build | ✅ 通过 |
| smoke test | ✅ 20/20 |
| Console 红色报错 | ✅ 无 |
| API 500 | ✅ 无 |
| HeroVideoCarousel.jsx | ✅ 未改动 |
| 首页视频 | ✅ 未受影响 |
| booking 提交 | ✅ 未受影响 |
| 新增依赖 | ✅ 无 |
| CMS 联动 5 项 | ✅ 5/5（`scripts/cms-linkage-verify.mjs`） |

### 12.2 本地 dev restart 端口占用记录

联动验证过程中需重启 dev 以加载 `siteSettings` PATCH 支持，出现以下终端任务记录：

| 任务 ID | 说明 | 结果 |
|---------|------|------|
| **806378** | 原 `npm run dev` 被停止以释放端口 | ✅ **预期行为** |
| **35265** | 重启时 **3001 仍被旧 API 进程占用** → API 进程退出（`EADDRINUSE`）；Vite 临时切到 **5174** | ⚠️ 端口冲突 |
| **203130** | 清理 3001 / 5173 / 5174 后完整重启 | ✅ 成功 |

**当前运行状态（验收时确认）：**

| 服务 | URL | 状态 |
|------|-----|------|
| Frontend | http://localhost:5173 | **200** |
| API | http://localhost:3001/api/health | **200** |
| 后台 | http://localhost:5173/admin | ✅ 可正常访问 |

### 12.3 结论

这是**本地端口占用问题**，不是 CMS linkage、API、后台保存或前台渲染问题。

- **不需要回滚代码**
- 第 4.4 前后台联动验证已完成，可继续后续轮次

**运维提示：** 若 `/admin/site-modules` 保存返回 `Invalid sectionKey` 且 allowed 列表不含 `siteSettings`，说明 API 进程未加载最新 `server/lib/validate.js`——需先结束占用 3001 的旧进程，再执行 `npm run dev`。

---

## Helper API 摘要 (`src/lib/cmsBinding.js`)

- `getProfileIdentity(content, lang)`
- `getHeroCopy(content, lang)`
- `getHomeCredentials(content, lang)`
- `getHomeWorkflow(content)`
- `getHomeSoundIssues(content)`
- `getBookingSoundIssues(content)`
- `getBookingGuide(content, step, lang)`
- `getContactChannels(content)`
- `getContactChecklist(content, lang)`
- `getSignalIdentityNodes(content, lang)`
- `getControlSurfaceChannels(content, lang)`
- `getCaseSignalFlow(caseItem)`
- `getMediaRackItems(caseItem, lang)`
