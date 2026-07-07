# Module Schema Plan

**Round 5.0 · YU YAKANG AUDIO**  
**Date:** 2026-07-07  
**Scope:** 页面模块系统数据结构、Registry、后台编辑与迁移方案（文档 only）

---

## 1. 当前 CMS 数据结构现状

### 顶层结构（`site-content.json`）

```text
site-content.json
├── meta
├── siteSettings          # tagline, processSteps, soundIssues, bookingIssues, …
├── profile                 # name, title, bio, experience, tools, workPhotos, …
├── hero                    # headline, video, slides, buttons, mode
├── location / serviceArea / display
├── certificates[]
├── services[]
├── cases[]                 # 含可选 signalFlow
├── seo
├── socialLinks
├── tutorialSection
└── i18n                    # UI 壳文案（非页面内容）
```

### 独立文件

| 文件 | 用途 |
|------|------|
| `server/data/bookings.json` | 预约记录 |
| `server/uploads/` | 媒体上传 |

### 当前页面内容组织方式

| 页面 | 内容来源 | 模块顺序 |
|------|----------|----------|
| Home | hero, profile, services, cases, siteSettings + 固定组件 | **写死在** `HomePage.jsx` |
| About | profile, certificates, workPhotos + 固定 about/* | **写死** |
| Cases | cases[] | CMS 列表 + 固定 detail 布局 |
| Booking | services, siteSettings + 固定 intake | **写死** |
| Contact | socialLinks, siteSettings + 固定 contact/* | **写死** |

### Round 4.4 已有能力

- `src/lib/cmsBinding.js`：CMS 优先 + fallback
- `source` 思想已实践：hero、processSteps、bookingIssues 等字段
- Admin section PATCH：`hero`, `profile`, `siteSettings`, `cases`, …

### 缺口

- **页面级模块顺序**与**启用状态**仍由代码决定
- 客户无法自行「关掉首页 Sound Check」或「把 Booking CTA 上移」
- 新增区块（如 Toolkit Preview）需改代码 + 发版

---

## 2. 新增 `pages.modules` 的原因

| 需求 | 现有结构 | pages.modules |
|------|----------|---------------|
| 模块排序 | 改 React 组件顺序 | `sortOrder` |
| 模块显隐 | 注释/删除组件 | `enabled` |
| 页面扩展 | 新建页面 + 路由 | 同页追加 module type |
| 客户维护 | 找开发者 | `/admin/pages` |
| 设计品质 | 开发者控制 | type 锁定组件，客户只填内容 |

### 设计原则

1. **模块 = 预设控制台组件**，不是任意 HTML block。
2. **内容优先引用 source**，避免 hero/services 双份数据。
3. **向后兼容**：无 `pages` 时，前台与现在完全一致。
4. **JSON 文件 CMS 不变**：不引入数据库。

---

## 3. 推荐数据结构

### 顶层新增 section

```json
{
  "pages": {
    "home": {
      "title": { "cn": "首页", "en": "Home" },
      "slug": "home",
      "route": "/",
      "modules": []
    },
    "about": {
      "title": { "cn": "关于", "en": "About" },
      "slug": "about",
      "route": "/about",
      "modules": []
    },
    "contact": {
      "title": { "cn": "联系", "en": "Contact" },
      "slug": "contact",
      "route": "/contact",
      "modules": []
    },
    "tools": {
      "title": { "cn": "工程工具箱", "en": "Engineer Toolkit" },
      "slug": "tools",
      "route": "/tools",
      "modules": []
    }
  }
}
```

### Home 模块示例

```json
{
  "pages": {
    "home": {
      "title": { "cn": "首页", "en": "Home" },
      "slug": "home",
      "modules": [
        {
          "id": "home-hero",
          "type": "consoleHero",
          "enabled": true,
          "sortOrder": 1,
          "eyebrow": { "cn": "01 / MASTER", "en": "01 / MASTER" },
          "title": {
            "cn": "现场调音 / 系统工程 / 混音后期",
            "en": "Live Sound / System Tuning / Mixing"
          },
          "subtitle": {
            "cn": "YU YAKANG AUDIO",
            "en": "YU YAKANG AUDIO"
          },
          "description": {
            "cn": "面向 Livehouse、演出现场、系统调试与混音后期的声音解决方案。",
            "en": "Live sound, system tuning and mixing solutions for livehouse, events and audio projects."
          },
          "source": "hero",
          "sourceOptions": {
            "useProfileIdentity": true,
            "useHeroVideo": true
          },
          "ctaPrimary": {
            "label": { "cn": "查看代表案例", "en": "Featured Projects" },
            "href": "/cases"
          },
          "ctaSecondary": {
            "label": { "cn": "预约项目评估", "en": "Book Assessment" },
            "href": "/booking"
          },
          "displayOptions": {
            "showCarouselStatus": true,
            "motionPhase": "SYSTEM_BOOT"
          }
        },
        {
          "id": "home-credentials",
          "type": "credentialsRack",
          "enabled": true,
          "sortOrder": 2,
          "eyebrow": { "cn": "CREDENTIALS", "en": "CREDENTIALS" },
          "title": { "cn": "专业背书", "en": "Professional Credentials" },
          "subtitle": {
            "cn": "以录音技术、系统工程和现场调音经验为基础…",
            "en": "Built on recording engineering, system design and live sound experience…"
          },
          "source": "certificates",
          "sourceOptions": {
            "includeProfileCredentials": true,
            "maxItems": 8
          },
          "displayOptions": {
            "sectionIndex": 1
          }
        },
        {
          "id": "home-services",
          "type": "servicesChannel",
          "enabled": true,
          "sortOrder": 3,
          "title": { "cn": "服务解决方案", "en": "Services" },
          "source": "services",
          "sourceOptions": {
            "visibleOnly": true,
            "maxItems": 4,
            "showProblems": true
          },
          "displayOptions": {
            "sectionIndex": 2
          }
        },
        {
          "id": "home-workflow",
          "type": "workflowSignal",
          "enabled": true,
          "sortOrder": 4,
          "title": { "cn": "合作流程", "en": "Workflow" },
          "source": "siteSettings.processSteps",
          "displayOptions": {
            "sectionIndex": 4
          }
        },
        {
          "id": "home-cases",
          "type": "caseFileGrid",
          "enabled": true,
          "sortOrder": 5,
          "title": { "cn": "代表案例", "en": "Featured Projects" },
          "source": "cases",
          "sourceOptions": {
            "featuredOnly": true,
            "maxItems": 4
          },
          "displayOptions": {
            "sectionIndex": 5
          }
        },
        {
          "id": "home-sound-check",
          "type": "soundCheckGrid",
          "enabled": true,
          "sortOrder": 6,
          "title": { "cn": "现场声音问题诊断", "en": "Sound Issue Diagnostics" },
          "source": "siteSettings.soundIssues",
          "displayOptions": {
            "sectionIndex": 6
          }
        },
        {
          "id": "home-booking-cta",
          "type": "bookingOutput",
          "enabled": true,
          "sortOrder": 7,
          "title": { "cn": "开始项目评估", "en": "Start Project Assessment" },
          "description": {
            "cn": "通过预约控制台提交项目类型、场地与声音问题。",
            "en": "Submit project type, venue and sound issues via the intake console."
          },
          "ctaPrimary": {
            "label": { "cn": "进入预约控制台", "en": "Open Intake Console" },
            "href": "/booking"
          },
          "displayOptions": {
            "sectionIndex": 7,
            "motionPhase": "OUTPUT"
          }
        }
      ]
    }
  }
}
```

### Cases 页面策略

**不完全 modularize。**  
Cases 列表/详情保持 `cases[]` CMS + 固定 Project File 布局。  
仅允许详情内**可选 blocks**（如 signalFlow、extra textBlock）在 Phase 4 增强。

---

## 4. 模块通用字段

每个 module 对象应包含：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 稳定 UUID 或 slug，如 `home-hero` |
| `type` | string | ✅ | registry 枚举：`consoleHero`, … |
| `enabled` | boolean | ✅ | false 时不渲染 |
| `sortOrder` | number | ✅ | 升序渲染 |
| `eyebrow` | `{cn,en}` | ⬜ | Console 眉标 |
| `title` | `{cn,en}` | ⬜ | 模块标题（可覆盖 source 默认） |
| `subtitle` | `{cn,en}` | ⬜ | 副标题 |
| `description` | `{cn,en}` | ⬜ | 描述/导语 |
| `source` | string | ⬜ | 数据来源键，见 §5 |
| `sourceOptions` | object | ⬜ | 过滤、limit、featuredOnly 等 |
| `ctaPrimary` | `{label,href}` | ⬜ | 主按钮 |
| `ctaSecondary` | `{label,href}` | ⬜ | 次按钮 |
| `items` | array | ⬜ | `source: custom` 时的条目 |
| `displayOptions` | object | ⬜ | sectionIndex, motionPhase, layoutVariant |
| `meta` | object | ⬜ | 扩展，如 analytics id |

### 双语规则

- 与现有 CMS 一致：`{ cn, en }`
- Renderer 通过 `t()` / `useLanguage()` 解析
- 模块级 title 为空时，fallback 到 source 数据的标题

---

## 5. 模块 source 机制

### source 枚举

| source 值 | 读取路径 | 模块行为 |
|-------------|----------|----------|
| `hero` | `content.hero` + `content.profile` | Hero 视频/标题/按钮；identity 来自 profile |
| `profile` | `content.profile` | About 类 identity 模块 |
| `services` | `content.services[]` | 过滤 visible，按 order |
| `cases` | `content.cases[]` | 过滤 visible/featured |
| `certificates` | `content.certificates[]` | Tool rack / credentials |
| `siteSettings.processSteps` | 点分路径 | Workflow 步骤 |
| `siteSettings.soundIssues` | 点分路径 | Sound check cards |
| `siteSettings.contactChecklist` | 点分路径 | Checklist |
| `socialLinks` | `content.socialLinks` | Patch bay |
| `tutorialSection` | `content.tutorialSection` | Tutorial block |
| `custom` | 模块自身 `items` / 文本字段 | 不读外部集合 |

### 解析伪代码

```javascript
function resolveModuleData(module, content) {
  if (!module.source || module.source === "custom") {
    return { items: module.items ?? [], text: module };
  }
  if (module.source.includes(".")) {
    return getByPath(content, module.source);
  }
  return content[module.source];
}
```

### 与 cmsBinding.js 的关系

- **不替换** `cmsBinding.js`
- Module renderer 内部调用 cmsBinding helpers（如 `getHomeCredentials`）当 `source` 匹配
- 模块 `title/description` 仅覆盖**展示层文案**，不覆盖 source 集合内条目文本（除非 type 定义为 override）

---

## 6. 模块 Registry 规划

### 未来文件

```
src/lib/moduleRegistry.js       # type → component, schema, adminForm
src/lib/moduleResolver.js       # source 解析 + cmsBinding 桥接
src/components/modules/
  PageModuleRenderer.jsx        # 遍历 pages[pageId].modules
  ModuleFallback.jsx            # 未知 type / 渲染错误
  types/
    ConsoleHeroModule.jsx
    CredentialsRackModule.jsx
    …
```

### moduleRegistry 职责

| 职责 | 说明 |
|------|------|
| 注册 type | `registerModule(type, { Component, label, adminFields, defaultModule })` |
| 标准化 props | `{ module, content, lang, resolvedData }` |
| fallback | 未知 type → `ModuleFallback` + console.warn |
| admin catalog | 供 `/admin/pages`「添加模块」列表 |

### 示例 registry 条目

```javascript
export const MODULE_REGISTRY = {
  consoleHero: {
    label: { cn: "主控制台 Hero", en: "Console Hero" },
    Component: ConsoleHeroModule,
    allowedPages: ["home"],
    defaultSource: "hero",
    adminFields: ["title", "subtitle", "description", "ctaPrimary", "ctaSecondary", "enabled"],
  },
  servicesChannel: {
    label: { cn: "服务通道", en: "Services Channel" },
    Component: ServicesChannelModule,
    allowedPages: ["home", "services"],
    defaultSource: "services",
    adminFields: ["title", "subtitle", "sourceOptions.maxItems", "enabled"],
  },
  // …
};
```

---

## 7. 后台编辑方案（/admin/pages）

### MVP 功能清单

1. **选择页面** — Tab: Home（Phase 1）→ About / Contact（Phase 2）
2. **模块 Rack 列表** — 显示 type、title 摘要、enabled、sortOrder
3. **添加模块** — 从 catalog 选择（过滤 `allowedPages`）
4. **编辑模块** — Inspector 表单（仅 `adminFields` 白名单）
5. **启用 / 隐藏** — Toggle `enabled`
6. **上移 / 下移** — 交换 sortOrder（**不做拖拽**）
7. **删除** — 仅允许 `source: custom` 模块；preset 模块只能隐藏
8. **保存** — PATCH `pages` section
9. **预览** — 新 tab 打开前台

### UI 布局（EasyEffects 启发）

```
┌────────────────────┬──────────────────────────┐
│  RACK LIST         │  INSPECTOR               │
│  [01] consoleHero  │  类型: 主控制台 Hero      │
│  [02] credentials  │  启用: [x]               │
│  [03] services     │  标题 · 中文 [____]      │
│  …                 │  标题 · EN   [____]      │
│  [+ 添加模块]      │  source: hero (只读)     │
│                    │  [上移] [下移] [保存]    │
└────────────────────┴──────────────────────────┘
```

### API

- `PATCH /api/content/section/pages` — 需在 `validate.js` 增加 `pages` allowed key（5.2 实施时）
- 校验：`modules[].type` 必须在 registry；`id` 唯一；`sortOrder` 连续可选

---

## 8. 向后兼容策略

| # | 规则 |
|---|------|
| 1 | `content.pages` 不存在或 `pages.home.modules` 为空 → **使用现有固定 `HomePage.jsx` 结构** |
| 2 | 首次启用模块系统时，可用脚本 **自动生成** default modules（从当前页面结构 mirror） |
| 3 | 单模块渲染 try/catch → `ModuleFallback`，不阻断其他模块 |
| 4 | **不删除** hero/profile/services 等旧字段；pages 模块通过 source 引用 |
| 5 | 现有 `/admin/hero` 等页面 **继续保留**；与 `/admin/pages` 并行，source 一致 |
| 6 | `cmsBinding.js` helpers **保持**；module resolver 调用它们 |
| 7 | smoke test 路径 **不变**；默认 config 下行为与现网一致 |
| 8 | 所有新增字段 **均可选**；validate 宽松 |

### HomePage 兼容伪代码

```javascript
export default function HomePage() {
  const { content } = useContent();
  const modules = content?.pages?.home?.modules?.filter(m => m.enabled);

  if (modules?.length) {
    return <PageModuleRenderer pageId="home" modules={modules} content={content} />;
  }

  return <LegacyHomePage content={content} />; // 当前实现
}
```

---

## 9. 迁移策略

### 阶段 1 — Home 部分模块（5.1）

- 新增 `pages.home.modules` 可选字段
- 实现 `PageModuleRenderer` + 3 个 type
- 默认 **仍走 LegacyHomePage**；开发环境可 flag 开启 modules
- Admin 尚未开放 → 开发者用 seed script 生成 JSON

### 阶段 2 — /admin/pages + Home 全模块（5.2）

- 开放 Home 全模块 catalog
- 自动生成 default modules 写入 site-content
- 客户可启停/排序

### 阶段 3 — About / Contact 模块化（5.2+）

- `pages.about.modules`：identity, signal, control, timeline, toolRack, archive, cta
- Contact：routingHero, patchBay, checklist, timeline

### 阶段 4 — Tools 页（5.3）

- `pages.tools.modules` + `/admin/tools`
- 工具本身配置（启用、顺序）在 tools section 或 pages modules

### 阶段 5 — Cases 增强（5.4+）

- **不** full modularize case detail
- 可选：`cases[].blocks[]` 或在 detail 模板增加 `textBlock` slot

### 数据迁移脚本（未来）

```bash
node scripts/seed-pages-modules.mjs   # 从当前结构生成 pages.home.modules
```

- 只写 `pages` section
- 不修改 hero/profile 等
- 运行前备份 `site-content.json`

---

## 10. 不建议现在做

1. ❌ 自由拖拽排序（pointer drag）
2. ❌ 模块嵌套模块（parent/children tree depth > 1）
3. ❌ 复杂布局网格编辑器（12-column grid）
4. ❌ 颜色/字体/动画自定义字段
5. ❌ 多语言字段结构重构（保持 `{cn,en}`）
6. ❌ 数据库 / Strapi / Directus 迁移
7. ❌ 用户权限 / 多角色 admin
8. ❌ 客户自定义 module type 或上传 React 组件
9. ❌ 全站一次性切换 modules（必须 phase + fallback）
10. ❌ 删除 LegacyHomePage 直到 5.5 验收完成

---

## 11. validate.js 扩展预案（5.2 实施时）

```javascript
// ALLOWED_SECTION_KEYS 新增
"pages"

// validateSiteContent 新增
if (body.pages !== undefined && (typeof body.pages !== "object" || Array.isArray(body.pages))) {
  return { ok: false, error: "pages must be an object" };
}
```

### pages 内轻量校验

- 每个 page 的 `modules` 必须是数组
- 每项必须有 `id`, `type`, `enabled`, `sortOrder`
- `type` 不在 registry → warn 不 block（forward compat）

---

## 12. 与 Round 4.4 CMS Binding 的衔接

| 4.4 成果 | 5.x 模块系统用法 |
|----------|------------------|
| `cmsBinding.getProfileIdentity` | `consoleHero` + about identity modules |
| `getHomeCredentials` | `credentialsRack` |
| `getHomeWorkflow` | `workflowSignal` |
| `getHomeSoundIssues` | `soundCheckGrid` |
| `getContactChannels` | `contactPatchBay` |
| `/admin/site-modules` | source 数据编辑；与 `/admin/pages` 分工明确 |
| `/admin/hero` | 仍编辑 hero 视频/文案；pages 模块 source 引用 |

**分工建议：**

- **内容数据** → 现有 section admin（hero, profile, services, …）
- **页面编排** → `/admin/pages`（顺序、显隐、模块级标题/CTA 覆盖）

---

*文档版本：5.0.0 · Round 5.0 Schema 方案 · 不涉及代码变更*
