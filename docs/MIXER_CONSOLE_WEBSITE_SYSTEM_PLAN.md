# Mixer Console Website System 架构方案

**Round 5.0 · YU YAKANG AUDIO**  
**Date:** 2026-07-07  
**Scope:** 从当前 v0.4.x 升级至「调音台式可维护模块系统」的架构规划（文档 only）

---

## 1. 系统定位

### 一句话定义

**YU YAKANG AUDIO = 一个声音系统工程师的数字调音台网站。**

### 前台体验目标

| 维度 | 用户感受 |
|------|----------|
| 像调音台 | Channel Strip、Fader、Meter、Patch Point |
| 像项目控制台 | Project File、Signal Flow、Media Rack |
| 像信号链路系统 | INPUT → PROCESS → OUTPUT 可追踪 |
| 像电影感工程档案 | System Boot、Scan、Reveal，专业而不花哨 |

### 后台体验目标

| 维度 | 客户操作 |
|------|----------|
| 简单 | 选模块、填内容、排序、开关 |
| 低成本 | 无数据库、无 SaaS、现有 JSON CMS 延伸 |
| 低学习成本 | 无设计软件式界面，中文 Console 风格 |
| 安全 | 不能破坏前台设计品质 |

### 与当前阶段的关系

v0.4.x 已完成「**固定页面 + CMS 字段绑定**」。  
v0.5.x 目标是「**固定设计系统 + 可编排模块**」——模块顺序与显隐客户可控，模块外观客户不可控。

---

## 2. 五层架构

```
┌─────────────────────────────────────────────────────────────┐
│  5. 引导转化层  Cinematic Intro / Guided Flow / CTA        │
├─────────────────────────────────────────────────────────────┤
│  4. 工具模块层  Engineer Toolkit (Calculators / Checklist)  │
├─────────────────────────────────────────────────────────────┤
│  3. 后台编辑层  Simple Admin · Content Only · No Free Design  │
├─────────────────────────────────────────────────────────────┤
│  2. 模块系统层  pages.modules · Registry · Renderer         │
├─────────────────────────────────────────────────────────────┤
│  1. 前台视觉层  Console UI · Channel · Rack · Patch · File  │
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
    JSON CMS (site-content.json)   bookings.json / uploads
```

### 1. 前台视觉层（Presentation Layer）

**职责：** 将模块数据渲染为统一的 Console 视觉语言。

| 组件概念 | 说明 | 现有对应 |
|----------|------|----------|
| Console Header | 页级 eyebrow + section index + title | `SectionTitle` |
| Channel Strip | 单条能力/服务/步骤 | `ControlSurface` channel |
| Rack Module | 证书、媒体、工具卡片架 | `ToolRack`, `CaseGallery` |
| Patch Bay | 联系/路由通道 | `CommunicationPatchBay` |
| Project File | 案例档案主容器 | `CaseProjectFile` |
| Engineer Toolkit | 工具输入/输出面板 | *待建 5.3* |

**约束：** 所有模块外观由 `UI_STYLE_GUIDE.md` + design tokens 锁定。

### 2. 模块系统层（Module System Layer）

**职责：** 解耦「页面有哪些块」与「块如何渲染」。

| 概念 | 说明 |
|------|------|
| `pages.{pageId}.modules[]` | 页面模块有序列表 |
| `moduleRegistry` | `type → React Component` 映射 |
| `PageModuleRenderer` | 遍历 modules，按 enabled + sortOrder 渲染 |
| `source` 机制 | 模块引用 hero/services/cases 等已有 CMS 集合 |

**原则：** 未知 `type` 或渲染失败 → 安全空状态 + 日志，不白屏。

### 3. 后台编辑层（Admin Editing Layer）

**职责：** 客户维护模块内容与顺序，不维护布局与样式。

允许：添加预设模块、启停、上移/下移、编辑字段、保存。  
禁止：拖拽画布、改字体颜色、改 CSS、嵌套布局、手写 JSON（MVP 阶段）。

### 4. 工具模块层（Toolkit Layer）

**职责：** 提供轻量工程计算与清单生成，强化专业信任，导向 Booking / Contact。

特点：

- 纯前端计算（公式固定，结果附「估算/参考」免责声明）
- 输入/输出 UI 复用 Processor Rack 视觉
- 结果可复制、可「发送到预约说明」

### 5. 引导转化层（Guided Conversion Layer）

**职责：** 统一电影感引导语言，串联浏览 → 工具 → 预约 → 联系。

| 阶段 | 引导语 | 转化动作 |
|------|--------|----------|
| 进入 | SYSTEM BOOT | 建立专业第一印象 |
| 浏览 | CHANNEL LOADED | 深度阅读 Services / Cases |
| 工具 | INPUT PARAMETER → TOOL RESULT | 复制结果 / 去 Booking |
| 预约 | INPUT → PROCESS → OUTPUT | 完成 Intake |
| 联系 | ROUTING SIGNAL | WeChat / Patch Bay |

---

## 3. 页面对应的调音台概念

| 页面 | 控制台概念 | 模块方向 | 当前状态 |
|------|------------|----------|----------|
| **Home** | Master Console | Hero / Credentials / Services / Workflow / Cases / Sound Check / Toolkit Preview / Booking CTA | 固定组件，CMS 已绑定 |
| **Cases** | Project File Console | Case Grid / Filters / Detail File / Signal Flow / Media Rack | CMS 驱动，非 page modules |
| **About** | Engineer Profile Console | Identity / Signal / Control / Timeline / Tool Rack / Philosophy / Archive | 固定组件，部分 CMS |
| **Booking** | Audio Intake Console | Wave Progress / Steps / Assist / Summary | 固定流程，CMS 选项 |
| **Contact** | Contact Routing Console | Routing Hero / Patch Bay / WeChat / Timeline / Checklist | 固定组件，CMS 通道 |
| **Tools** *(新)* | Engineer Toolkit | Calculator Rack / Checklist / Output Panel | 5.3 新建 |

---

## 4. 前台模块类型规划（MVP Catalog）

以下 `type` 为 Phase 1–3 预设枚举，客户只能选用，不能自定义 type。

### consoleHero

- **用途：** 首页/落地页主 Hero + System Boot
- **适合页面：** home
- **可编辑字段：** title, subtitle, description, ctaPrimary, ctaSecondary, source=`hero`
- **视觉：** 全宽视频 + boot title + identity + actions
- **首页：** ✅ 核心模块

### credentialsRack

- **用途：** 专业背书列表 + 工程 tags
- **适合页面：** home, about（可选）
- **可编辑字段：** eyebrow, title, subtitle, source=`certificates|profile.credentials`
- **视觉：** Rack panel + tag row + list
- **首页：** ✅

### servicesChannel

- **用途：** 服务方向预览
- **适合页面：** home, services
- **可编辑字段：** title, limit (数量), source=`services`
- **视觉：** Channel cards + problem bullets
- **首页：** ✅

### caseFileGrid

- **用途：** 精选/列表案例
- **适合页面：** home, cases
- **可编辑字段：** title, filter, featuredOnly, limit, source=`cases`
- **视觉：** Project file cards
- **首页：** ✅

### workflowSignal

- **用途：** 合作流程步骤
- **适合页面：** home
- **可编辑字段：** title, source=`siteSettings.processSteps`
- **视觉：** Workflow cue list
- **首页：** ✅

### soundCheckGrid

- **用途：** 常见声音问题诊断
- **适合页面：** home
- **可编辑字段：** title, source=`siteSettings.soundIssues`
- **视觉：** CHECK 01–06 cards
- **首页：** ✅ 可选

### toolkitPreview

- **用途：** 首页工具箱入口预览（2–3 个常用工具）
- **适合页面：** home
- **可编辑字段：** title, tools[] (引用 tool id)
- **视觉：** Mini processor cards + link to /tools
- **首页：** ✅ 5.3 后启用

### bookingOutput

- **用途：** 预约 CTA 输出面板
- **适合页面：** home, cases, about, tools
- **可编辑字段：** title, description, ctaLabel, ctaHref
- **视觉：** OUTPUT panel + primary button
- **首页：** ✅

### contactPatchBay

- **用途：** 联系通道摘要（非完整 Contact 页）
- **适合页面：** home, footer slot
- **可编辑字段：** source=`socialLinks`
- **视觉：** 精简 Patch 02–04
- **首页：** ⏸ 可选

### textBlock

- **用途：** 纯文案块（说明、声明、更新日志）
- **适合页面：** 任意
- **可编辑字段：** eyebrow, title, description (bilingual)
- **视觉：** prose-block in console panel
- **首页：** 低频

### mediaRack

- **用途：** 图片/视频/音频展示架
- **适合页面：** case detail, about, custom
- **可编辑字段：** items[], source=`custom|case.images`
- **视觉：** CaseGallery rack mode
- **首页：** ❌

### faqConsole

- **用途：** 常见问题控制台
- **适合页面：** booking, contact, services
- **可编辑字段：** items[] { q, a }
- **视觉：** Accordion + CHECK code
- **首页：** ⏸

### checklistModule

- **用途：** 项目资料清单
- **适合页面：** contact, booking, tools
- **可编辑字段：** source=`siteSettings.contactChecklist`
- **视觉：** 已有 Contact checklist
- **首页：** ❌

### ctaOutput

- **用途：** 通用双按钮 CTA 面板
- **适合页面：** 任意
- **可编辑字段：** title, ctaPrimary, ctaSecondary
- **视觉：** Console output strip
- **首页：** ✅ 可复用

---

## 5. 后台低成本编辑原则

### 后台只允许

1. 从**预设 catalog** 添加模块（选 type）
2. **启用 / 隐藏**模块（`enabled: false` 不渲染）
3. **上移 / 下移**（改 `sortOrder`，MVP 用按钮不用拖拽）
4. 编辑模块**内容字段**：标题、描述、按钮、图片 URL、关联 source 参数
5. **保存** → PATCH `pages` section → 前台刷新生效

### 后台不允许

1. 自由拖拽布局、改模块宽度/列数
2. 自由改字体、字号、颜色、圆角
3. 自由改动画类型、时长、easing
4. 手写 JSON（MVP；高级模式可 Phase 2+ 对开发者开放）
5. 改 React 组件结构或新增自定义 type
6. 复杂嵌套（模块内再拖子模块）
7. 上传任意 HTML / iframe 嵌入

### 客户心智模型（培训一句话）

> 「网站像一台已经设计好的调音台。您可以选择打开哪些通道、填什么内容，但不能改调音台本身的面板布局。」

---

## 6. 后台推荐信息架构

### 当前（v0.4.x）

```
/admin
├── hero, profile, services, cases, certificates, work-photos
├── tutorial, social, seo, location, site-modules, media, bookings
```

### 目标（v0.5.x）

```
/admin
├── dashboard
├── pages              ← 新增：页面模块管理中心
│   ├── home
│   ├── about          ← Phase 2
│   └── contact        ← Phase 2
├── profile
├── services
├── cases
├── tools              ← 新增：工具模块管理（启用哪些工具、默认参数文案）
├── contact            ← 可与 social 合并或保留 social
├── media
├── bookings
└── seo
```

### `/admin/pages` 职责

- 选择页面（Home 优先）
- 模块 Rack 列表（type、enabled、sortOrder、title 摘要）
- Inspector：编辑该模块允许的字段
- 添加模块：从 catalog 弹窗选择
- 预览链接：打开前台对应页

### `/admin/tools` 职责

- 启用/禁用各计算器
- 编辑工具页 intro 文案
- 编辑 disclaimer 免责声明
- 不涉及公式本身（公式由代码锁定）

---

## 7. 工具模块规划

### 页面名称

- **中文：** 音响工程常用工具箱
- **英文：** Engineer Toolkit
- **路由建议：** `/tools`

### 第一阶段工具（6 个）

#### 1. Delay Calculator 延时计算器

- **公式：** `delay_ms = distance_m / 343 × 1000`
- **输入：** 距离（米）、可选温度修正（高级 Phase 2）
- **输出：** ms 延时、工程记录文本
- **免责：** 声速按 343 m/s 估算，现场需实测校准

#### 2. Wavelength Calculator 波长计算器

- **公式：** `wavelength_m = 343 / frequency_hz`
- **输入：** 频率 Hz
- **输出：** 波长 m / cm

#### 3. Frequency Period Calculator 周期计算器

- **公式：** `period_ms = 1000 / frequency_hz`
- **输入：** 频率 Hz
- **输出：** 周期 ms

#### 4. dB Estimate dB 估算工具

- **说明：**
  - +3 dB ≈ 功率 ×2
  - +6 dB ≈ 声压 ×2
  - -6 dB ≈ 声压减半
- **输入：** 当前 dB、变化量
- **输出：** 估算结果 + 说明文字
- **免责：** 非替代 SPL 实测与系统校准

#### 5. Coverage Note 覆盖记录器

- **输入：** 场地宽度、听众距离、音箱覆盖角（粗略）
- **输出：** 工程记录模板文本（供复制到微信/预约）
- **性质：** 记录辅助，非精确声学模拟

#### 6. Project Checklist Generator 项目资料清单生成器

- **输入：** 项目类型（Livehouse / 系统调试 / 混音 / 活动扩声）
- **输出：** 勾选式清单 + 可复制文本
- **联动：** 与 Contact checklist、Booking message 模板一致

### 工具页 UI 结构

```
Console Header (Engineer Toolkit)
├── Tool Rack Tabs (Delay | Wavelength | Period | dB | Coverage | Checklist)
├── Input Panel (Parameter Strip)
├── Process Indicator (静态 CSS meter，非真实 DSP)
└── Output Panel (TOOL RESULT + Copy + 「带入预约」)
```

---

## 8. 电影感引导系统规划

### 统一引导语言表

| 代码 | 中文提示 | 使用场景 |
|------|----------|----------|
| SYSTEM BOOT | 系统启动 | 首页 Hero 进入 |
| CHANNEL LOADED | 通道已载入 | 模块进入视口 |
| SIGNAL READY | 信号就绪 | Patch / Carousel / Assist |
| PROJECT OPENED | 项目档案已打开 | Case detail |
| SCAN PROJECT FILE | 扫描项目档案 | Case list → detail |
| INPUT | 输入阶段 | Booking step 1–2 |
| PROCESS | 处理阶段 | Booking step 3–4 |
| OUTPUT | 输出阶段 | Booking step 5 / success |
| ROUTING SIGNAL | 路由信号 | Contact hero |
| SIGNAL RECEIVED | 信号已接收 | Booking success |
| INPUT PARAMETER | 输入参数 | Tools input |
| TOOL RESULT | 工具输出 | Tools output |
| OUTPUT SENT | 输出已发送 | Contact CTA |

### 页面对应

| 页面 | 主引导语 | 次要动效 |
|------|----------|----------|
| Home | SYSTEM BOOT | CHANNEL LOADED per section |
| Cases | SCAN PROJECT FILE | PROJECT OPENED on detail |
| About | CHANNEL LOADED | Timeline cue stagger |
| Booking | INPUT → PROCESS → OUTPUT | Wave progress |
| Contact | ROUTING SIGNAL | Patch active hover |
| Tools | INPUT PARAMETER → TOOL RESULT | Output reveal |

### 技术要求

- ✅ 支持 `prefers-reduced-motion: reduce`
- ✅ 动画总时长单模块 ≤ 600ms（boot 可 ≤ 1.2s）
- ✅ 不影响 LCP：Hero 内容不等待动画完成
- ✅ 表单页（Booking）禁止 route 级全屏 transition
- ✅ 移动端减少 stagger 数量
- ❌ 不做 WebGL 全屏转场
- ❌ 不做 scroll hijacking

---

## 9. 风险点

| # | 风险 | 缓解措施 |
|---|------|----------|
| 1 | 后台变复杂，客户不会用 | 只做 catalog + 表单；中文说明；视频教程 3 分钟 |
| 2 | 模块系统过度抽象，开发成本上升 | Phase 1 仅 Home 2–3 模块；registry 与组件 1:1 |
| 3 | 自由布局破坏设计品质 | 禁止 layout 编辑；设计系统锁定 |
| 4 | 工具计算被当成专业承诺 | 全工具加「估算/参考」免责；不提供 SPL 精确模拟 |
| 5 | 动效过多影响性能 | motion token + reduced-motion；Lighthouse 监控 |
| 6 | 移动端模块过多页面过长 | Home MVP ≤ 8 模块；折叠低频模块 default off |
| 7 | JSON schema 迁移破坏兼容 | 无 pages 时 fallback 现有固定页；见 MODULE_SCHEMA_PLAN |
| 8 | 破坏现有 CMS binding | 模块 `source` 引用旧字段，不复制数据 |
| 9 | smoke test 回归 | 每 phase 保持 20/20；模块 disabled 不影响 test path |
| 10 | 客户要求「像 WordPress 一样拖」 | 产品边界写进 admin 帮助页 |

---

## 10. 推荐实施路线

| 轮次 | 目标 | 交付物 |
|------|------|--------|
| **5.0** | 参考案例 + 架构文档 | 本文档 + REFERENCE + MODULE_SCHEMA |
| **5.1** | Module Renderer MVP | `moduleRegistry` + `PageModuleRenderer`；Home 仅 2–3 模块可切换 |
| **5.2** | `/admin/pages` | 模块列表、启停、排序、编辑、保存 |
| **5.3** | Engineer Toolkit MVP | `/tools` + Delay/Wavelength/Checklist 三工具 |
| **5.4** | 电影感引导增强 | 统一 `consoleMotion` + 各页 phase 文案 |
| **5.5** | 全站稳定验收 | 客户使用说明 + smoke + 模块 fallback 全测 |

### 5.1 最小切片建议

**只动 Home，只接 3 个 module type：**

1. `consoleHero`（source: hero）
2. `servicesChannel`（source: services）
3. `bookingOutput`（custom CTA）

其余 Home 区块保持现有固定渲染作为 fallback，直到 5.2 完成 admin 编排。

---

## 11. 与现有技术栈对齐

| 层 | 技术 | 不变更 |
|----|------|--------|
| 前端 | React + Vite | ✅ |
| 样式 | 原生 CSS + tokens | ✅ |
| CMS | JSON file + Express | ✅ |
| 绑定 | `cmsBinding.js` | 扩展，不替换 |
| 测试 | smoke-test.mjs | 每 phase 必须通过 |
| 依赖 | 无新依赖 Phase 1 | ✅ |

---

## 12. Strapi Migration Note

> 未来方向说明 · 非本轮实施范围

1. **当前状态**：项目已是 React + 自制 Admin + Express/JSON CMS，并非「纯静态站」；前后台通过 `cmsBinding.js` 与 `/api/content` 联动。
2. **Strapi 定位**：Strapi 是**未来正式 CMS 方向**，用于内容模型、权限、媒体库与多环境发布；**不建议在页面结构未稳定前直接迁移**。
3. **推荐顺序**：先完成 Mixer Console 页面结构与模块系统（About / Cases / Contact / Home 模块编排）→ 再设计 Strapi Content Types → 最后做数据迁移与 Admin 切换。
4. **未来 Strapi Content Types 草案**：Profile、Services、Cases、Certificates、WorkPhotos、SocialLinks、PageModules、Tools、Bookings、SiteSettings、CommonTools。

### 第 5.3 计划（未实施）

- **Site Copy / 页面文案管理**：模块标题、按钮文案、CTA 等逐步后台可编辑；本轮 Common Tools 内容已后台化，模块标题暂用组件 fallback。
- **页面进入动画**：建议单独放在第 5.2.2 轮（route transition / reveal），本轮不做。

---

*文档版本：5.2.1 · Common Tools + 结构修正说明*
