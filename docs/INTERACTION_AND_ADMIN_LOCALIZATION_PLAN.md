# YU YAKANG AUDIO — 第 3.4 轮预研

> **后台中文化 + 品牌动效系统 + 风格化交互方案**  
> 状态：预研文档 · 2026-07-05  
> **本文档仅做分析与方案，不包含实现任务。**  
> 技术栈冻结：**React + Vite + 原生 CSS + Express JSON CMS**（无 Strapi · 无数据库 · 无登录）

---

## 文档说明

| 项 | 说明 |
|---|---|
| 目的 | 为 Round 3.4 及后续迭代提供可拍板的交互与后台文案规范 |
| 读者 | 产品决策 / 开发排期 / 日常后台使用 |
| 品牌定位 | YU YAKANG AUDIO = **声音系统工程师的项目档案库** |
| 视觉关键词 | Signal Flow · Cue · Patch · Project File · Media Rack · System Control |

---

## 1. 后台中文化范围

### 1.1 涉及页面（13 个路由）

| 路由 | 页面名称 |
|---|---|
| `/admin` | 后台控制台（Dashboard） |
| `/admin/hero` | 首页视频管理 |
| `/admin/location` | 所在地 / 服务范围 |
| `/admin/profile` | 个人资料 |
| `/admin/services` | 服务管理 |
| `/admin/cases` | 案例管理 |
| `/admin/certificates` | 证书管理 |
| `/admin/work-photos` | 工作照管理 |
| `/admin/tutorial` | 经验分享 / 教程 |
| `/admin/social` | 社媒 / 联系方式 |
| `/admin/seo` | SEO 设置 |
| `/admin/bookings` | 预约管理 |
| `/admin/media` | 媒体管理 |

### 1.2 需要中文化的 UI 元素

| 类别 | 示例 |
|---|---|
| 左侧菜单 | 仪表盘、首页视频、案例管理… |
| 顶部状态栏 | API 在线、内容已同步… |
| 页面标题 / 模块标题 | 首页视频管理、系统状态… |
| 表单 label / placeholder | 播放秒数、绑定案例… |
| 按钮 | 保存、上传、预览、移入回收站… |
| Toast / 弹窗 | 保存成功、确认删除… |
| 空状态 / 加载 / 错误 | 暂无数据、正在加载… |
| 表格表头 | 客户称呼、状态、创建时间… |
| 状态标签 | 新需求、已联系、已被内容使用… |
| 上传区域 | 选择文件、正在上传… |

### 1.3 中文化原则（硬性约束）

**只改后台界面显示文字，不改：**

- API 路由（如 `/api/content/section/:sectionKey`）
- JSON / CMS 字段名（如 `hero.mode`、`slideDuration`、`caseSlug`、`showInHero`、`isFeatured`）
- JavaScript 变量名、函数名
- `className`、文件名
- 前台中英文切换逻辑（`i18n` / `useLanguage`）

**字段名与显示名分离示例：**

| JSON 字段（保持英文） | 后台显示（中文） |
|---|---|
| `hero.mode` | 轮播模式 |
| `slideDuration` | 默认播放秒数 |
| `caseSlug` | 绑定案例 |
| `showInHero` | 首页视频展示 |
| `isFeatured` | 首页精选 |
| `sortOrder` | 排序 |

### 1.4 当前实现状态（截至 Round 3.3）

| 项 | 状态 |
|---|---|
| `src/lib/adminUi.js` | 已建立预约状态、媒体类型、Hero 模式映射 |
| `AdminSidebar` / `AdminForm` 部分组件 | 部分已中文化 |
| 各 Admin 页面 | **仍有英文 eyebrow、Toast、表头、按钮等待统一** |
| Round 3.2.1 全量中文化 | **预研完成，实施待 Round 3.4 执行** |

---

## 2. 后台中文化词典

> 以下为推荐标准译法。实施时可集中维护于 `src/lib/adminUi.js` 或 `docs/ADMIN_COPY_ZH.md`，**不写入 JSON CMS**。

### 2.1 全局 / 共享

| English（界面） | 中文 |
|---|---|
| Save | 保存 |
| Revert / Reset | 恢复 |
| Cancel | 取消 |
| Confirm | 确认 |
| Delete | 删除 |
| Preview | 预览 |
| Upload | 上传 |
| Copy | 复制 |
| Loading… | 正在加载… |
| Saving… / Syncing… | 保存中… |
| Save successful | 保存成功 |
| Save failed | 保存失败，请重试 |
| Unsaved changes | 有未保存修改 |
| Leave without saving? | 离开页面前请确认是否保存 |
| No data | 暂无数据 |
| API offline | API 离线 |
| Processing… | 处理中… |

### 2.2 Dashboard（`/admin`）

| English | 中文 |
|---|---|
| Dashboard / Engineering Dashboard | 后台控制台 |
| System Status | 系统状态 |
| Content Signal | 内容统计 |
| Media Storage / Media Rack | 媒体库 |
| Booking Input | 预约入口 |
| API ONLINE | API 在线 |
| CMS READY | 内容已同步 |
| HERO ACTIVE | 首页视频正常 |
| MEDIA READY | 媒体库正常 |
| BOOKING INPUT (status) | 预约入口正常 |
| Cases | 案例数量 |
| Certificates | 证书数量 |
| Services | 服务数量 |
| Work Photos | 工作照数量 |
| Hero Videos | 首页视频数量 |
| New Requests | 新需求数量 |
| SEO Score | SEO 完成度 |
| Issues | 待处理项 |
| Completeness Check | 内容完整度检查 |
| Last Sync | 最近更新时间 |
| Normal | 正常 |
| Not configured | 未配置 |
| Needs attention | 需要处理 |
| Offline | 离线 |
| Online | 在线 |

### 2.3 Hero（`/admin/hero`）

| English | 中文 |
|---|---|
| Hero Video / Hero Playback | 首页视频 |
| Case Video Carousel | 案例视频自动轮播 |
| Manual Slides | 手动视频轮播 |
| Single Video | 单视频模式 |
| Slide Duration / Global Duration | 默认播放秒数 / 播放秒数 |
| Apply to All | 应用到全部 |
| Apply to all case videos | 一键应用到所有案例视频 |
| Preview | 预览 |
| Replace Video | 替换视频 |
| Replace Poster | 替换封面 |
| Cue List | 轮播列表 |
| Enabled / Disabled | 已启用 / 已禁用 |
| Video / Poster (status) | 视频 / 封面 |
| No video for carousel | 该案例暂无视频，不会进入首页轮播 |
| No case videos available | 暂无可用于首页轮播的案例视频 |
| Auto carousel reads from cases | 自动案例视频轮播会从案例管理中读取已开启首页展示的视频 |

### 2.4 Cases（`/admin/cases`）

| English | 中文 |
|---|---|
| Cases / Projects | 案例管理 |
| Project File | 项目档案 |
| Overview | 项目概览 |
| Background | 项目背景 |
| Challenge | 项目难点 |
| Solution | 解决方案 |
| Result | 最终效果 |
| Tools / Equipment | 使用设备与软件 |
| Featured | 首页精选 |
| Show in Hero | 首页视频展示 |
| Visible | 已发布 |
| Slug | 案例别名 |
| Sort Order | 排序 |
| View on site | 查看前台 |
| In Hero carousel | 该案例已进入首页视频轮播 |
| No video for Hero | 该案例暂无视频，即使开启首页展示也不会显示 |

### 2.5 Media（`/admin/media`）

| English | 中文 |
|---|---|
| Media Rack | 媒体机架 |
| Upload File / Select File | 上传文件 |
| Copy URL / Copy Path | 复制地址 |
| Move to Trash | 移入回收站 |
| Used by CMS | 已被内容使用 |
| Unused | 未使用 |
| image / video / audio / document | 图片 / 视频 / 音频 / 文档 |
| Files moved to trash, not permanently deleted | 当前版本不会永久删除文件，只会移动到回收站 |

### 2.6 Bookings（`/admin/bookings`）

| English | 中文 |
|---|---|
| Bookings | 预约管理 |
| new | 新需求 |
| contacted | 已联系 |
| quoted | 已报价 |
| confirmed | 已确认 |
| completed | 已完成 |
| cancelled | 已取消 |
| Internal Note | 内部备注 |
| Copy WeChat | 复制微信 |
| Copy summary | 复制需求摘要 |

### 2.7 其他模块（摘要）

| 模块 | 页面标题 |
|---|---|
| Location | 所在地 / 服务范围 |
| Profile | 个人资料 |
| Services | 服务管理 |
| Certificates | 证书管理 |
| Work Photos | 工作照管理 |
| Tutorial | 经验分享 / 教程 |
| Social | 社媒 / 联系方式 |
| SEO | SEO 设置 |

---

## 3. Logo 点击动画方案（Signal Pulse Logo Animation）

### 3.1 设计目标

在 Header / MobileNav 的 **YU YAKANG AUDIO** Logo 上提供克制、专业的「信号脉冲」反馈，呼应音响控制台语言，避免夜店/霓虹感。

### 3.2 当前基线（Round 3.1.6 已实现）

| 行为 | 现状 |
|---|---|
| hover | 字距略增 + 底部 signal line 展开 |
| active | 轻微下压 |
| 已在首页点击 | 平滑滚动到顶部 |
| 非首页点击 | `Link to="/"` + 现有 PageTransition |
| 桌面 hover 副标 | `SYSTEM / LIVE / MIXING`（可选保留小号英文或改中文副标） |

### 3.3 Round 3.4 增强方案

```
状态机：idle → hover → active → pulse → idle

hover:
  - opacity: 0.85 → 1
  - letter-spacing: +0.04em
  - signal-line: scaleX 0 → 1（300–450ms ease-out）

click (Signal Pulse，仅一次):
  - 触发 .logo-link--pulse class（200ms）
  - signal-line: 从左到右高亮扫描（类似电平扫过）
  - transform: translateY(1px)，150ms
  - 不循环、不旋转、不 scale 弹跳

导航:
  - pathname !== '/' → 正常路由 + PageTransition fade
  - pathname === '/' → preventDefault + scrollTo({ top: 0, behavior: 'smooth' })
  - 滚动完成后移除 pulse class

移动端:
  - 无 hover 时，click 仍触发 pulse + 下压
  - touch 区域 ≥ 44px
  - prefers-reduced-motion: 仅 opacity 变化，跳过 scan 动画
```

### 3.4 CSS 实现建议（未来实施，非本文档范围）

- 纯 CSS：`::after` signal line + `@keyframes signal-scan`
- 可选：单次 `motion` 动画（项目已依赖 `motion`，仅 Logo 单点使用）
- **禁止**：neon glow、rotate、elastic bounce、持续 loop

### 3.5 无障碍

- `aria-label="YU YAKANG AUDIO — 返回首页"`
- 动画 respect `prefers-reduced-motion`
- 键盘 Enter/Space 与点击行为一致

---

## 4. 全站点击反馈系统

### 4.1 设计原则

| 原则 | 说明 |
|---|---|
| 统一语义 | 同类控件同类反馈（按钮 / 卡片 / 保存 / 上传） |
| 短时长 | 交互反馈 100–300ms，状态 Toast 2–4s |
| 可预期 | 不遮挡主要内容，不连续闪烁 |
| 品牌词 | 可用「信号」「同步」「Cue」等控制台隐喻（后台为主） |

### 4.2 按钮（前台 + 后台）

| 状态 | 视觉 | 文案（后台中文） |
|---|---|---|
| default | 边框 `--color-line` | — |
| hover | 边框 `--color-line-strong`，可选 1px signal 底边 | — |
| active | `translateY(1px)` 或 `scale(0.99)` | — |
| click pulse | 极淡白色扫线 150ms（可选） | — |
| loading | 禁用 + opacity 0.7 | 处理中… |
| success | Toast | 操作成功（上下文具体化） |
| error | Toast warn | 操作失败，请重试 |

### 4.3 案例卡片（前台）

| 状态 | 行为 |
|---|---|
| hover | 封面轻微 scale(1.03)；overlay 显示「查看项目」；可选 PROJECT FILE 底边 scan |
| active | `translateY(2px) scale(0.995)`（已有 `case-card--pressing`） |
| click | 100ms 延迟后 navigate（已有），保持 |

### 4.4 后台保存

| 阶段 | 显示 |
|---|---|
| 保存中 | 底栏：`保存中…` / `正在同步内容…` |
| 成功 | Toast：`保存成功` / `内容已同步` |
| 失败 | Toast：`保存失败，请检查接口或字段` |
| 脏数据 | 顶栏 banner：`有未保存修改 — 离开页面前请确认` |

### 4.5 媒体上传

| 阶段 | 显示 |
|---|---|
| 上传中 | 按钮：`正在上传媒体…` |
| 成功 | Toast：`媒体已加入素材库` |
| 失败 | Toast：`上传失败，请检查文件类型或大小` |

### 4.6 预约提交（前台 Booking）

| 阶段 | 显示 |
|---|---|
| 提交中 | 按钮：`正在发送需求信号…` |
| 成功 | 成功页 + 可选 subtle check 动画 |
| 失败 | `提交失败，请添加微信沟通` |

### 4.7 技术实现路径（建议）

| 层级 | 方案 |
|---|---|
| CSS | `:hover` / `:active` / `@keyframes pulse` — **优先** |
| class toggle | `is-loading` / `is-success` / `is-pressing` |
| Toast | 统一 `AdminToast` / 前台 toast 组件，文案来自词典 |
| Motion（可选） | 仅 Dialog / Lightbox / Logo pulse |

---

## 5. 前台风格化交互方案

### 5.1 视觉语言（Project Archive + Console）

围绕「**声音系统工程师的项目档案库**」，在前台克制使用：

| 元素 | 用途 | 示例位置 |
|---|---|---|
| Signal Flow 细线 | 分区、卡片底边、Hero 进度 | Hero 进度条、section title line |
| Patch Point 小圆点 | 列表项、标签前缀 | 服务项、案例 meta |
| Level Meter 小电平条 | 状态、加载 | Hero `PROJECT 01/04` 进度 |
| Cue 编号 | 区块顺序 | `01 / HERO`、`02 / CASES` |
| Project File 扫描线 | 卡片 hover | CaseCard overlay |
| System Check | 表单步骤反馈 | Booking 步骤条 |
| Media Rack | 媒体相关 UI | Lightbox 边框、gallery |
| Mono 数字 | 专业编号感 | `PROJECT 001` |

### 5.2 已有基础（可扩展，非重写）

- Hero：双 layer 结束叠化、状态提示、进度线
- Logo：`LogoLink` signal line
- 案例：Project File 详情模板、PROJECT 编号
- Section：`SectionTitle` index eyebrow
- 页面：`fade-in` 进入

### 5.3 建议增强（分阶段）

| 优先级 | 交互 | 说明 |
|---|---|---|
| P1 | Logo Signal Pulse click | 见第 3 节 |
| P1 | 按钮 active 统一 | 全站 `.btn:active` 规范 |
| P2 | CaseCard PROJECT FILE scan | hover 时 1px 扫描线 |
| P2 | Hero CUE 进度增强 | 与叠化同步，不额外叠层 |
| P3 | Booking 步骤 signal 反馈 | 每步完成短 pulse |
| P3 | Lightbox 打开/关闭 | 250ms fade + scale(0.98→1) |

### 5.4 明确不要加入

- 大面积霓虹、夜店风、赛博网格爆闪
- 复杂粒子、Three.js 背景
- 全页 parallax、滚动劫持
- 同时多个大 video 动画
- 影响移动端首屏性能的动效

---

## 6. 后台风格化交互方案

### 6.1 后台整体隐喻：Audio Console / System Control Desk

| 页面 | 控制台隐喻 | 视觉特征 |
|---|---|---|
| Dashboard | 系统状态面板 | 状态灯、mono 数字、信号条 |
| Hero | CUE LIST 播放控制器 | Cue 卡片、Duration stepper、VIDEO/POSTER 灯 |
| Cases | PROJECT FILE 管理台 | Tab 分区、档案编号、长文编辑器 |
| Media | MEDIA RACK 素材机架 | slot 卡片、类型 tag、usage 灯 |
| Bookings | INPUT SIGNAL 预约入口 | 状态 tag、信号强度式「新需求」计数 |
| Location / Social / SEO | 参数面板 | FieldGroup + mono label |

### 6.2 后台交互规范

| 组件 | 交互 |
|---|---|
| `AdminSaveBar` | 脏数据时底栏高亮；保存中禁用；成功回 `已同步` |
| `AdminParamStepper` | ± 步进，mono 数字，像播放秒数旋钮 |
| `AdminStatusDot` | ok / warn / idle 三色，像电平/信号灯 |
| `AdminConfirmDialog` | 居中弹窗，backdrop blur，确认删除二次确认 |
| `AdminTabs` | 案例编辑分区，下划线 signal |
| `AdminEmptyState` | 小号 eyebrow code + 中文说明 |
| 表格行 expand | Booking 详情展开，像 patch sheet |

### 6.3 与 shadcn 结构对照（只借鉴，不引库）

| shadcn 概念 | 当前项目对应 |
|---|---|
| Form + Label | `AdminField` / `AdminBilingualInput` |
| Dialog | `AdminConfirmDialog` + 媒体 preview dialog |
| Tabs | `AdminTabs` |
| Toast | `AdminToast` |
| Table | `admin-table` |
| Sheet | 暂未需要；移动端可用现有 `admin-mobile-nav` |

---

## 7. 可参考的 GitHub 开源项目

| 项目 | 地址 | 主要参考价值 |
|---|---|---|
| shadcn/ui | https://github.com/shadcn-ui/ui | Dialog、Tabs、Form、Toast、Table 信息架构 |
| Motion | https://github.com/motiondivision/motion | Logo/按钮/页面/弹窗动效 API 设计 |
| Magic UI | https://github.com/magicuidesign/magicui | Border Beam、Grid、Text Reveal 视觉 |
| React Bits | https://github.com/DavidHDev/react-bits | Hover、文字动效、轻量背景 |
| Radix UI | https://github.com/radix-ui/primitives | 无障碍 Dialog/Tabs 行为（若未来需要） |
| Sonner | https://github.com/emilkowalski/sonner | Toast 堆叠与动画思路 |
| Lucide | https://github.com/lucide-icons/lucide | **已使用** — 图标一致 |

---

## 8. 哪些可以参考，哪些不要直接引入

### 8.1 可以参考（思路 / 结构 / 视觉）

| 来源 | 参考什么 | 如何落地到 YU YAKANG |
|---|---|---|
| shadcn/ui | 组件分层、Form 字段结构、Dialog/Tabs 模式 | 完善 `AdminForm` 规范文档，不引 Tailwind |
| Motion | `animate` / `transition` 时序、spring 参数 | Logo pulse、Lightbox 单点使用 |
| Magic UI | Border Beam → 1px scan line；Grid → poster grid | CSS gradient + mask |
| React Bits | 1–2 个 hover 思路 | CaseCard overlay 增强 |

### 8.2 不要直接引入（当前阶段）

| 来源 | 原因 |
|---|---|
| shadcn/ui 全套 | 依赖 Tailwind + Radix 体系，重构成本高，与现有 admin.css 冲突 |
| Magic UI 全量 | 模板感强，易偏离黑白极简 |
| React Bits 堆叠 | 动效过多，性能与品牌调性风险 |
| Lenis 等滚动库 | 用户已明确禁止；且影响移动端 |
| Tailwind | 用户已明确禁止 |
| 新 UI 库（MUI、Ant Design） | 与控制台定制风格不符，体积大 |

### 8.3 项目已有依赖说明

| 依赖 | 状态 | 建议 |
|---|---|---|
| `motion` | 已安装 | 可选、单点使用，不包装全站 |
| `lucide-react` | 已安装 | 继续使用 |
| 原生 CSS | 主方案 | 动效优先 CSS |

---

## 9. 第一阶段推荐做什么

**目标：日常后台可用 + 基础品牌交互闭环**

| # | 任务 | 工作量 | 价值 |
|---|---|---|---|
| 1 | **后台全量中文化**（13 页 + 共享组件） | 中 | 日常维护效率 |
| 2 | **集中文案词典**（扩展 `adminUi.js`） | 低 | 一致性、后续好维护 |
| 3 | **Logo Signal Pulse 点击动画**（补齐 click pulse） | 低 | 品牌识别 |
| 4 | **按钮 hover/active 全站统一** | 低 | 点击反馈一致 |
| 5 | **Dashboard + SaveBar + Toast 中文统一** | 低 | 最高频路径 |

**验收：**

- 后台主文案无英文（字段名 tooltip 可用「中文 + 灰色 field key」可选）
- Logo 点击有单次 signal pulse
- 保存/上传/预约 Toast 全部为中文
- 前台中英文切换不受影响
- 无新依赖

---

## 10. 第二阶段再做什么

| # | 任务 | 说明 |
|---|---|---|
| 1 | 案例卡片 Project File 扫描线 | CaseCard hover CSS |
| 2 | Hero CUE 状态增强 | 进度与叠化同步，不增加 video layer |
| 3 | Media Rack 视觉增强 | Admin + 前台 Lightbox 边框语言统一 |
| 4 | Booking 提交信号反馈 | 步骤完成 pulse + 中文文案 |
| 5 | 后台字段 hint 双语 | label 中文 + hint 显示 `caseSlug` 等 field key 供对照 |
| 6 | `prefers-reduced-motion` 全站审计 | Hero、Logo、Dialog |

---

## 11. 第三阶段 / 不建议现在做

### 11.1 第三阶段（远期）

- Motion 动效系统文档化 + Lightbox/PageTransition 统一
- 更完整 Design Token（signal duration、easing、console colors）
- 声音问题诊断器（交互问卷）
- Before / After 音频对比
- 项目地图、设备能力墙动效

### 11.2 不建议现在做

| 项 | 原因 |
|---|---|
| 引入 Tailwind + shadcn 重构 | 成本高、与现有 CSS 体系冲突 |
| Magic UI / React Bits 全量接入 | 模板风、动效过载 |
| Lenis / 滚动劫持 | 已禁止；移动端风险 |
| 前台大改结构 | Round 3.4 仅交互与文案 |
| 接 Strapi / 数据库 / 登录 | 范围外 |
| 为动效引入 Three.js / 粒子 | 与品牌调性、性能不符 |
| 后台英文小 tag 全部删除前未备份 | 可保留极小号 mono field key 作开发对照（可选） |

---

## 12. 实施检查清单（Round 3.4 执行时用）

### 后台中文化

- [ ] 13 个 admin 路由页面主文案为中文
- [ ] `AdminForm` 共享组件（SaveBar、Dialog、EmptyState）中文
- [ ] `adminUi.js` 覆盖 Booking / Media / Hero 状态
- [ ] 未修改任何 JSON 字段名与 API

### 品牌动效

- [ ] Logo Signal Pulse click
- [ ] 按钮 active 统一
- [ ] CaseCard scan（若纳入本阶段）
- [ ] `prefers-reduced-motion` 降级

### 测试

- [ ] `npm run dev` 全路由无黑屏
- [ ] 后台保存 / 上传正常
- [ ] 前台 `/` 中英文切换正常
- [ ] Console 无红色报错
- [ ] 移动端 Header Logo + Menu 可点

---

## 13. 相关文档

| 文档 | 关系 |
|---|---|
| `docs/CMS_SCHEMA.md` | 字段定义（不改名，仅对照） |
| `docs/WEBSITE_OPTIMIZATION_IDEAS.md` | 产品优化 backlog |
| `docs/UI_STYLE_GUIDE.md` | 视觉基准 |
| `docs/LOCAL_NETWORK_PREVIEW.md` | 移动端测试 |

---

## 变更记录

| 版本 | 日期 | 说明 |
|---|---|---|
| 1.0.0 | 2026-07-05 | Round 3.4 预研：后台中文化 + 品牌动效 + 风格化交互 |
