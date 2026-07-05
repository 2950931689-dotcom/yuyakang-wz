# UI Refinement System — YU YAKANG AUDIO

> 第 3.9 轮：顶级 UI 版式精修与排版系统统一  
> 风格定位：声音系统工程师的项目档案库 · 黑白极简 · Project File

---

## 1. 当前 UI 问题诊断

| 区域 | 问题 |
|------|------|
| 字号 | Hero / Page / Section 标题各自硬编码，层级不够清晰 |
| 间距 | Section 间距尚可，但卡片内边距、列表项 padding 不统一 |
| 宽度 | Container 固定 1100px，与 wide / narrow 场景未变量化 |
| 服务页 | 大量 inline style，与首页 ServicePreview 视觉语言脱节 |
| 标签 | PROJECT / SERVICE / CHECK 等编号样式分散在多个 BEM 块 |
| 卡片 | 首页服务区为列表式边框，案例卡片与首页精选卡片比例接近但未完全统一 |
| 白色主题 | 整体可用，部分 hover 仍使用深色主题 rgba 硬编码 |
| 动效 | 已有 section-reveal 与 card hover，Workflow Signal Flow 略抢 |

---

## 2. 顶级 UI 排版目标

1. **档案库感**：编号、标签、细线边框、等宽数字，像工程控制台 + Project File。
2. **层级清楚**：Eyebrow → Title → Subtitle → Body → Meta，一眼读懂结构。
3. **克制高级**：无大面积装饰，靠间距、字重、细线建立品质感。
4. **全站一致**：首页模块与子页面共用同一套 token 与组件类。
5. **双语友好**：中文正文 15–17px、行高 1.65+；英文标签小字、大字距。

---

## 3. 字号系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--text-hero` | `clamp(56px, 8vw, 116px)` | Hero 主标题 |
| `--text-page` | `clamp(44px, 6vw, 88px)` | 页面 H1 |
| `--text-section` | `clamp(30px, 4vw, 52px)` | Section 标题 |
| `--text-card` | `clamp(20px, 2.5vw, 28px)` | 卡片 / 服务标题 |
| `--text-body` | `clamp(15px, 1.5vw, 17px)` | 正文 |
| `--text-meta` | `clamp(11px, 1.2vw, 13px)` | Meta / Label |
| `--text-code` | 10px | 编号标签 PROJECT / CHECK |

---

## 4. 间距系统

| Token | 值 |
|-------|-----|
| `--space-xs` ~ `--space-2xl` | 4 / 8 / 16 / 24 / 40 / 64px |
| `--space-section` | `clamp(96px, 11vw, 140px)` desktop 主 section |
| `--space-section-md` | `clamp(72px, 9vw, 96px)` tablet |
| `--space-section-sm` | `clamp(56px, 8vw, 72px)` mobile / tight |
| `--card-padding` | `clamp(20px, 3vw, 28px)` |
| `--card-padding-lg` | `clamp(24px, 3.5vw, 36px)` |

---

## 5. 页面最大宽度系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--width-content` | 1120px | 默认 container |
| `--width-wide` | 1360px | Hero / Footer 宽屏 |
| `--width-narrow` | 760px | Project File 长文 |
| `--gutter` | `clamp(20px, 4vw, 48px)` | 左右边距（mobile 20 → desktop 48） |

Utility：`.container` · `.container--wide` · `.container--narrow`

---

## 6. 卡片系统

- 边框：`1px solid var(--color-line)`，hover → `--color-line-strong`
- 圆角：`var(--radius-sm)`（4px）
- 背景：`var(--color-surface)`
- 内边距：`var(--card-padding)` / `--card-padding-lg`
- Hover：顶部 signal 细线（case-card::before）、图片 scale 1.02
- 列表卡片（服务、诊断）：统一 grid + 等高 flex 内容区

---

## 7. 按钮系统

| 类 | 用途 |
|----|------|
| `.btn--primary` | 主 CTA |
| `.btn--secondary` | 次操作 |
| `.btn--ghost` | 弱操作 |
| `.text-link` | 轻量文字链（Hero 观看视频等） |
| `.btn--sm` | 紧凑按钮 |

- 高度：min-height 44px（sm 36px）
- Active：`translateY(1px) scale(0.99)`
- Focus：`outline 2px var(--color-accent-soft)`
- Admin 按钮在 `admin.css` 独立命名空间，不受前台污染

---

## 8. 标签系统

统一 `.code-label` 基类 + 模块别名：

- PROJECT — 案例编号
- SERVICE — 服务编号
- CHECK — 诊断编号
- CERTIFIED / SYSTEM — 背书工程标签
- `.tag` — 分类 / Featured 胶囊

字距：`--label-tracking: 0.14em`  
等宽数字：`font-variant-numeric: tabular-nums`

---

## 9. 图片渐变系统

- **Hero / 案例轮播**：视频为主，不改逻辑
- **案例详情顶图**：`CaseDetailHero` + 多层 gradient overlay，确保正文可读
- **预约页背景**：`BookingVisualBg` 低 opacity + 强 gradient 遮罩
- **环境图 filter**：`--ambient-image-filter` 灰度压暗（dark）/ 柔化（light）

---

## 10. 黑白主题适配规则

**Dark**：`#050505` 底 · 白字层级 · 细白边框 · 图片 grayscale 压暗

**Light**：`#f6f6f3` 纸质底 · 深字 · 清楚但不刺眼的边框 · Hero 视频区仍白字

切换：`data-theme` on `<html>` · token 过渡 `var(--dur-theme)`

---

## 11. 前台各页面精修清单

| 页面 | 精修项 |
|------|--------|
| 首页 | Hero 层级、背书标签 grid、服务卡片 grid、Workflow 线条弱化、案例比例、CTA 平衡 |
| /cases | Page header、卡片 meta / 标签对齐 |
| /cases/:slug | Project File 窄栏、长文行高、顶图不压字 |
| /services | 去除 inline style，问题解决方案卡片 |
| /booking | 标题 token、步骤条、表单高度、背景可读 |
| /contact | 接入入口布局、二维码区、社交按钮对齐 |

---

## 12. 不建议现在做的效果

- 全站 parallax / 粒子 / 3D
- Lenis 平滑滚动 / Motion 库
- 复杂 page transition / 文字逐字 reveal
- 大面积 border beam / 发光动画
- Tailwind / shadcn 引入
- 首页视频 crossfade / 双 video

---

## 13. GitHub 参考项目说明

| 项目 | 借鉴点 | 不引入 |
|------|--------|--------|
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 组件秩序、focus ring、按钮高度一致 | 依赖与 Tailwind |
| [Motion](https://github.com/motiondivision/motion) | 动效节奏 0.18–0.34s ease-out | npm 包 |
| [Magic UI](https://github.com/magicuidesign/magicui) | 细线 grid、克制 border glow | 直接组件 |
| [Codrops](https://github.com/codrops) | Typography 层级、hover 微交互 | 复杂 transition |

本站在 CSS 变量 + 原生组件上实现同等**秩序感**，而非复制特效。

---

## 实施文件索引

- Tokens：`src/styles/tokens.css`
- 基础排版：`src/styles/base.css`
- 布局：`src/styles/layout.css`
- 组件：`src/styles/components.css`
- Section 标题：`src/components/ui/SectionTitle.jsx`
