# Homepage Restructure Audit — Round 7.0

> YU YAKANG AUDIO · 网站内容结构审计  
> 审计日期：2026-07-19  
> 范围：只读审计 · **本文件为唯一允许写入物** · 未改代码 / CSS / 数据 / 未 commit

目标主页结构（用户规划）：

| # | 目标模块 |
|---|----------|
| 01 | 个人介绍 + 专业证书 |
| 02 | 现场 Live 精选案例 |
| 03 | 后期 / 混音案例 |
| 04 | 抖音主页 + 视频号主页 / 精选视频展示 |
| 05 | 合作流程 |
| 06 | 现场声音问题诊断 |
| 07 | 取消所在城市显示 |

---

## 1. 当前首页模块顺序

### 1.1 DOM 源顺序（`src/pages/HomePage.jsx`）

适用于 **PC（≥768px）** 的视觉顺序（与 DOM 一致）：

| 顺序 | id / 区域 | 组件 | 说明 |
|------|-----------|------|------|
| 0 | Hero | `HeroSection` | 全宽首屏；含身份文案 + 视频 |
| 1 | `#credentials` | `CredentialsSection` | 「专业背书」文字列表（非证书图） |
| 2 | `#home-certificates` | `HomeMobileCertificates` | PC 上 **隐藏**（`mobile-only-block`） |
| 3 | `#services` | `ServicePreview` | 声音解决方案 |
| 4 | `#process` | `WorkflowSection` | 合作流程 |
| 5 | `#featured-cases` | `FeaturedCases` | 精选案例（`featured: true`，最多 6） |
| 6 | `#video-highlights` | `VideoHighlights` | PC 上 **隐藏**（`mobile-only-block`） |
| 7 | `#sound-check` | `SoundIssueSection` | 现场声音问题诊断 |
| 8 | `#conversion` | `BookingCTA` + `TutorialSection` | 预约 CTA + 经验分享/社媒按钮 |

### 1.2 手机端视觉顺序（≤767px，`mobile.css` flex `order`）

| 视觉顺序 | 模块 | CSS |
|----------|------|-----|
| 0 | Hero | 在 flow 外，始终第一 |
| 1 | 专业证书图架 | `home-section--certificates` order:1 |
| 2 | 精选案例 | `home-section--featured-cases` order:2 |
| 3 | 精选视频 | `home-section--video-highlights` order:3 |
| 4 | 预约 / 教程 | `home-section--conversion` order:4 |
| 5 | 服务 | `home-section--services` order:5 |
| 6 | 合作流程 | `home-section--process` order:6 |
| 7 | 声音诊断 | `home-section--sound-check` order:7 |

手机端隐藏：

- `#credentials`（`home-mobile-hide`）→ PC「专业背书」文字不在手机显示
- 证书图架 / 精选视频仅手机显示

### 1.3 与目标结构差距

| 目标 | 当前状态 |
|------|----------|
| 01 个人介绍 + 专业证书 | Hero 有身份文案；证书图仅手机首页有；PC 首页只有文字背书，证书图在 About |
| 02 现场 Live 精选 | 混在单一 `FeaturedCases`，含 Live + 巡演系统 + 混音 + 声学模拟 |
| 03 后期 / 混音案例 | 无独立首页区块；`mix-gulou-v7` 仅作为 featured 之一 |
| 04 抖音 + 视频号 | 手机有 `VideoHighlights`；PC 主要靠 conversion 区 `TutorialSection` |
| 05 合作流程 | 已有，PC 在案例之前；手机在案例/视频之后 |
| 06 声音诊断 | 已有，靠后 |
| 07 取消城市 | 城市仍显示在多处（见 §10） |

---

## 2. 当前数据来源

| 内容 | 数据源 | 读取路径 |
|------|--------|----------|
| 整站内容 | CMS JSON / mock fallback | `getContent()` → `src/data/site-content.mock.json` 或 `GET /api/content` |
| 个人介绍 | `content.profile` | Hero（`getProfileIdentity`）、About `EngineerIdentity` |
| 专业背书文字 | 证书标题 + profile credentials/tags | `getHomeCredentials()` in `cmsBinding.js` |
| 证书图片 | `content.certificates[]` | `getVisibleCertificates()` → About / 手机首页 `CertificationRack` |
| 精选案例 | `content.cases` where `featured` | `getCases({ featured: true }).slice(0, 6)` |
| 案例分类 | `case.category` 字符串 | `CATEGORY_FILTERS` in `content.js` |
| 合作流程 | `siteSettings.processSteps` | `getHomeWorkflow()` |
| 声音诊断 | `siteSettings.soundIssues`（或 fallback） | `getHomeSoundIssues()` |
| 抖音 | `socialLinks.douyinUrl` 或 `douyinUrlDraft` | `getDouyinUrl()` |
| 视频号 | `socialLinks.wechatVideoUrl` | 直接字段 |
| 站点城市 | `location` / `socialLinks.location` / `profile.location` | `getSiteLocation()` |
| 城市显示开关 | `display.showOnHome/Contact/Footer` | `getLocationDisplay()` |
| Hero 视频 | `hero` + cases `showInHero` | **禁止本阶段改** `HeroVideoCarousel.jsx` |

---

## 3. 当前案例分类情况

### 3.1 分类枚举（`CATEGORY_FILTERS`）

| UI id | CMS `category` 值 | 中文标签 |
|-------|-------------------|----------|
| livehouse | `livehouse-system-tuning` | Livehouse |
| system | `tour-system-engineering` | 系统工程 |
| corporate-event | `event-sound-reinforcement` | 活动扩声 |
| mixing | `mixing-post-production` | 混音后期 |
| recording | `recording-editing` | 录音编辑 |
| acoustic-simulation | `acoustic-simulation` | 声学模拟 |

### 3.2 mock 中全部案例（真实数据）

| slug | category | featured | 归类建议（相对目标 02/03） |
|------|----------|----------|---------------------------|
| `echo-live-yunfu` | livehouse-system-tuning | ✓ | **现场 Live** |
| `wild-live-shenzhen` | livehouse-system-tuning | ✓ | **现场 Live** |
| `maca-live-guangning` | livehouse-system-tuning | ✓ | **现场 Live** |
| `shuimuhuaya-jingdezhen-2025` | tour-system-engineering | ✓ | 偏现场/巡演系统（是否并入 Live 需产品确认） |
| `mix-gulou-v7` | mixing-post-production | ✓ | **后期 / 混音** |
| `acoustic-simulation-tavern` | acoustic-simulation | ✓ | **声学模拟**（目标首页拟不强调） |
| `ncnu-graduation-gala` | event-sound-reinforcement | ✗ | 活动扩声；不在 featured |

**结论：**

- **现场 Live（明确）**：3 条 livehouse
- **后期混音（明确）**：1 条 `mix-gulou-v7`（文案多为【待补充】，有 `audioUrl`）
- **声学模拟**：1 条 `acoustic-simulation-tavern`，且 `featured: true`，会出现在首页精选
- **录音编辑**分类：有 filter，但 mock **无**对应案例

首页精选 = 所有 `featured: true` 的前 6 条，**未按 Live / 混音拆分**。

---

## 4. 声学模拟案例位置

| 位置 | 是否展示 |
|------|----------|
| 首页 `FeaturedCases` | **是**（`featured: true`） |
| `/cases` 列表 + 筛选「声学模拟」 | **是** |
| `/cases/acoustic-simulation-tavern` 详情 | **是** |
| Hero 轮播 | 取决于 `showInHero` / 是否有视频（需个案看；封面在 `public/cases/acoustic-simulation-tavern/`） |
| About / Contact | 不直接列表 |

### 若取消首页声学模拟展示，可能改动点（7.x 实施时，本阶段不改）

1. **数据**：`acoustic-simulation-tavern.featured = false`（最小、推荐）
2. **或代码**：`FeaturedCases` / 未来 Live 区块过滤 `category !== "acoustic-simulation"`
3. **不必删**：案例数据、`/cases` 筛选、详情页均可保留

---

## 5. 混音案例是否存在

**存在。**

- slug：`mix-gulou-v7`
- category：`mixing-post-production`
- featured：`true`（已进首页精选混池）
- 媒体：`audioUrl: /audio/mix-gulou-v7.mp3`；无封面图（`coverUrl`/`images` 空）
- 文案：summary/challenge/solution 等多为【待补充】

目标「03 后期/混音案例」需要：独立区块 + 可能补封面/文案，而非从零建分类。

---

## 6. 当前社媒链接情况

| 字段 | mock 值 | 可用性 |
|------|---------|--------|
| `socialLinks.douyinUrl` | `""` | 空 |
| `socialLinks.douyinUrlDraft` | `.../user/self?...` | **self 草稿**；`isDouyinSelfLink` 为 true |
| `socialLinks.wechatVideoUrl` | `https://weixin.qq.com/sph/AgeXXBTfmy` | **已配置** |
| `socialLinks.wechatQrImage` | `/images/wechat-qr.jpg` | 有 |

展示入口：

| 入口 | 抖音 | 视频号 |
|------|------|--------|
| `VideoHighlights`（手机首页） | 仅非 self 的正式 URL → **当前不显示抖音卡** | 有则显示 |
| `TutorialSection`（首页 conversion） | 用 `getDouyinUrl`（会落到 draft） | 有 |
| Contact `AuxChannels` | 同左 | 有 |
| Admin `/admin` 社媒页 | 可编辑 | 可编辑 |

**阻塞：** 正式抖音公开主页 URL 尚未写入 `douyinUrl`。

---

## 7. 当前精选视频能力

| 能力 | 状态 |
|------|------|
| 模块是否存在 | **是**：`VideoHighlights.jsx`（6.5） |
| PC 首页 | **不显示**（`mobile-only-block`） |
| 手机首页 | 有数据才渲染；无数据 `return null` |
| 外链 | **支持**（`ExternalLinkButton`） |
| iframe / 自动播放 | **不支持**（刻意避免） |
| 封面 | **弱支持**：复用微信二维码图作 poster，**无独立视频封面字段** |
| 多条精选视频 CMS 数组 | **无**（仅社媒主页级外链，非视频条目列表） |
| 大视频嵌入 public | 不在此模块 |

---

## 8. 合作流程位置

- 组件：`src/components/home/WorkflowSection.jsx`
- 页面：首页 `#process`
- 数据：`siteSettings.processSteps`（`getHomeWorkflow`）
- PC 顺序：服务之后、精选案例之前
- 手机顺序：order 6（案例/视频/CTA 之后）

目标 05 可复用该组件，主要改 **首页排序**，不必新建数据模型。

---

## 9. 现场声音问题诊断位置

- 组件：`src/components/home/SoundIssueSection.jsx`
- 页面：首页 `#sound-check`
- 数据：`getHomeSoundIssues()` ← `siteSettings.soundIssues` 或 `homeContent` fallback
- PC / 手机均靠后；手机 order 7

目标 06 可复用，改顺序即可。

---

## 10. 当前城市字段显示位置

站点「常驻城市」默认文案：**江西南昌 / Nanchang, Jiangxi**  
来源优先级：`content.location` → `socialLinks.location` → `profile.location`

| 位置 | 组件 / 页 | 是否站点城市 | 开关 |
|------|-----------|--------------|------|
| Footer 版权行 | `Footer.jsx` | ✓ 是 | `display.showOnFooter` |
| Contact 控制台 | `ContactConsole.jsx` | ✓ 是 | `display.showOnContact` |
| Contact LOCATION 参数 | `getRoutingLocation` | ✓ 相关 | 内容层 |
| About 工程师身份 | `EngineerIdentity.jsx` | ✓ profile.location | 无 display 开关 |
| Hero 身份（cmsBinding） | `getProfileIdentity` | 有 location 字段 | 视 Hero 是否渲染 |
| `CredentialStrip` | 常驻地 | ✓ | `showOnHome` — **但该组件当前未挂到 HomePage** |
| Admin | `AdminLocationPage` | 编辑 | — |
| **案例卡片「地点」** | `CaseCard` | ✗ **项目地点**（如广东云浮） | 与「取消常驻城市」不同 |
| 案例详情 | `CaseDetailHero` / `ProjectConsole` | ✗ 项目地点 | 同上 |
| Booking 表单 city | 用户填写城市 | ✗ 表单字段 | 不应当「取消所在城市」误删 |

目标 07「取消所在城市显示」应聚焦 **站点常驻地**（Footer / Contact / About / display 开关），**不要误伤案例项目地点**。

---

## 11. 个人介绍模块在哪里？

**没有名为「个人介绍」的独立首页 section。**

当前分散在：

1. **Hero**：站点名 + 姓名/角色（`getProfileIdentity` / `getHeroCopy`）
2. **CredentialsSection**（PC）：证书标题拼成的「专业背书」列表，非完整 bio
3. **About 页**：`EngineerIdentity` + bio / 工作照等完整介绍

目标 01「个人介绍 + 专业证书」需要：新建或组合区块（可能复用 About 片段 + `CertificationRack`），且考虑 PC 是否也显示证书图架（现仅手机）。

---

## 12. 专业证书模块在哪里？

| 场景 | 位置 |
|------|------|
| 数据 | `content.certificates`（mock 中 3 张，`public/certificates/cert-*.webp`） |
| About | `CertificationRack` — **PC/手机主展示** |
| 首页 PC | 无证书图；仅有文字 `CredentialsSection` |
| 首页手机 | `HomeMobileCertificates` → 复用 `CertificationRack` |

---

## 13. Round 6.5 新增模块与 class（摘要）

**新增文件：**

- `HomeMobileCertificates.jsx`
- `VideoHighlights.jsx`
- `docs/MOBILE_ASSET_AUDIT.md`

**关键 class：**

- `home-sections-flow` / `home-section--*`
- `mobile-only-block` / `home-mobile-hide`
- `home-mobile-certificates` / `video-highlights*`
- 案例详情：`case-file__section--mobile-defer` / `--mobile-priority` / `--mobile-muted-head`

**commit：** `078286e`（本地 ahead，未要求本阶段 push）

---

## 14. 建议修改阶段（7.1+）

| 阶段 | 内容 | 风险 |
|------|------|------|
| **7.1** | 首页模块重排（PC+手机统一目标顺序）；合作流程 / 声音诊断移位；Services 后置或保留 | 中：布局/CSS order 冲突 |
| **7.2** | 精选案例拆分为「现场 Live」+「后期混音」两区；声学模拟移出首页 featured | 中：筛选逻辑；巡演案例归属需确认 |
| **7.3** | 01 个人介绍 + 证书（PC 也显示证书 rack；可选短 intro） | 中高：与 About 重复、文案取舍 |
| **7.4** | 精选视频 PC 可见；正式抖音 URL；可选封面字段 | 低–中：等真实链接 |
| **7.5** | 取消站点城市显示（Footer/Contact/About/display） | 低：范围清晰；勿动案例地点 |
| **7.6** | 混音案例补封面/文案（内容运营，可并行） | 低（数据） |

### 可先改

- 首页 section 顺序（JSX + 收敛 mobile order）
- `featured` 标记（声学模拟移出首页）
- `display.showOn*` 关城市
- VideoHighlights 去掉 `mobile-only-block`（有链接时）

### 应后改 / 需确认

- 「水木年华」算不算现场 Live
- 个人介绍文案长度与是否从 About 抽段落
- 抖音正式 URL
- 是否新增 `videoHighlights[]` CMS 结构（会碰 schema，宜延后）

### 不建议一次性改动的原因

1. PC 与手机两套顺序（6.5）叠加，一次大改易回归黑屏/错序
2. 案例拆分依赖产品分类规则，不是纯 CSS
3. 城市字段多入口，易误伤案例地点与 Booking
4. 社媒缺正式抖音时做大模块易出现空态/self 链接
5. Hero 视频链路已稳定，应隔离

---

## 15. 后续可能修改的文件

| 文件 | 用途 |
|------|------|
| `src/pages/HomePage.jsx` | 模块顺序与分区 |
| `src/components/home/FeaturedCases.jsx` | 拆 Live / 混音 |
| `src/components/home/VideoHighlights.jsx` | PC 显示、封面 |
| `src/components/home/HomeMobileCertificates.jsx` | 或改为全端证书区 |
| `src/components/home/CredentialsSection.jsx` | 与个人介绍合并或降级 |
| `src/components/layout/Footer.jsx` | 隐藏城市 |
| `src/components/contact/ContactConsole.jsx` | 隐藏城市 |
| `src/components/about/EngineerIdentity.jsx` | 可选隐藏 location |
| `src/styles/mobile.css` | 对齐新 order / 去掉冲突 |
| `src/lib/content.js` / `cmsBinding.js` | 筛选 helper（如 `getLiveFeaturedCases`） |
| `src/data/site-content.mock.json` | featured / social / display（若本地 mock） |
| `server/data/site-content.example.json` | 若同步示例 |

---

## 16. 禁止修改（至少到明确开轮之前）

| 文件 / 范围 | 原因 |
|-------------|------|
| `HeroVideoCarousel.jsx` | 用户硬约束；首页视频逻辑隔离 |
| 首页 Hero 视频路径 / 播放逻辑 | 稳定资产 |
| Strapi Adapter / 同步逻辑 | 非本阶段 |
| 后台保存 API / admin 业务逻辑 | 非本阶段（城市开关可用现有 AdminLocation，不必改保存协议） |
| Render / Vercel / DNS 配置 | 部署另轮 |
| `.env.local` / token | 敏感 |
| 擅自删除案例 JSON / 改写用户原文 | 内容安全 |
| 自动导入 `E:\...\余` 大视频 | 素材策略 |

---

## 17. 27 项审计问答速查

1. **首页顺序** — 见 §1（PC ≠ 手机）  
2. **个人介绍** — Hero + About；无独立首页 section  
3. **专业证书** — About 全端；首页仅手机 `HomeMobileCertificates`  
4. **证书数据** — `content.certificates` + `public/certificates/`  
5. **精选案例** — `#featured-cases` / `FeaturedCases`  
6. **分类逻辑** — `case.category` + `CATEGORY_FILTERS`；首页用 `featured`  
7. **现场 Live** — echo / wild / maca（+ 待定 shuimuhuaya）  
8. **后期混音** — `mix-gulou-v7`  
9. **声学模拟** — `acoustic-simulation-tavern`  
10. **声学展示** — 首页 featured + `/cases` + 详情  
11. **取消首页声学** — 优先 `featured: false`；或过滤 category  
12. **抖音配置** — `socialLinks.douyinUrl` / `douyinUrlDraft`  
13. **视频号配置** — `socialLinks.wechatVideoUrl`  
14. **精选视频模块** — 有，手机 only  
15. **视频封面** — 弱（二维码复用）；无专用字段  
16. **视频外链** — 支持  
17. **合作流程** — `WorkflowSection` / `#process`  
18. **声音诊断** — `SoundIssueSection` / `#sound-check`  
19. **城市字段** — `location` + `display` + profile/social  
20. **Footer 城市** — 有（`showOnFooter`）  
21. **Contact 城市** — 有（`showOnContact`）  
22. **案例卡片城市** — 有，但是 **项目地点**  
23. **个人介绍城市** — About `EngineerIdentity` 有  
24. **手机/PC 结构** — **不同**（6.5 order + mobile-only）  
25. **6.5 新增** — 见 §13  
26. **最高风险** — 一次重排+拆案例+改 Hero；以及误伤案例地点  
27. **先改/后改** — 见 §14  

---

## 18. 下一阶段 7.1 建议

**7.1 主题建议：Homepage Section Reorder（结构重排，不拆数据模型）**

建议范围：

1. 将 PC 与手机首页对齐到目标大框架（允许 Services 仍保留但后置）  
2. 不改 Hero 视频组件  
3. 不改 CMS schema  
4. 不做城市删除（留给 7.5）或仅做 display 开关预埋说明  
5. Featured 暂可仍为单列表，但文档标明 7.2 拆分  

验收：PC/390/430 顺序一致可读；无黑屏；smoke 页面项通过；不 push 除非用户要求。
