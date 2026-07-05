# YU YAKANG AUDIO — UI 风格指南

> 方案 A：原生 CSS + Design Tokens  
> 参考：shadcn/ui 结构思路，视觉完全自定义

---

## 1. 设计 Token

### 颜色

```css
:root {
  /* 背景 */
  --color-bg: #050505;
  --color-surface: #0E0E0E;
  --color-surface-soft: #151515;

  /* 线条 */
  --color-line: rgba(255, 255, 255, 0.12);
  --color-line-strong: rgba(255, 255, 255, 0.24);

  /* 文字 */
  --color-text-primary: #F5F5F5;
  --color-text-secondary: #A7A7A7;
  --color-text-muted: #6F6F6F;

  /* 强调 */
  --color-accent: #FFFFFF;
  --color-accent-soft: rgba(255, 255, 255, 0.72);

  /* 功能 */
  --color-error: #E05252;
  --color-success: #6BAA75;
}
```

### 禁止色

- 大面积金色
- 蓝紫赛博渐变
- 彩虹霓虹
- 高饱和强调色

### 间距

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
--space-2xl: 64px;
--space-section: clamp(64px, 10vw, 120px);
```

### 圆角

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
```

> 克制使用，避免大圆角卡片风。

### 动效

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dur-fast: 0.2s;
--dur-base: 0.35s;
--dur-slow: 0.6s;
```

---

## 2. 字体层级

### 字体栈

```css
--font-sans: "Inter", "Helvetica Neue", "PingFang SC", "Noto Sans SC", sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", monospace;
```

| 层级 | 大小 | 字重 | 其他 | 用途 |
|---|---|---|---|---|
| Logo | 14–16px | 500 | letter-spacing 0.35em, uppercase, mono | YU YAKANG AUDIO |
| 英文副标 | 11–12px | 400 | letter-spacing 0.25em, uppercase | LIVE SOUND / … |
| 中文副标 | 13–14px | 400 | 正常字距 | 现场调音 / … |
| H1 | clamp(32px, 5vw, 56px) | 600 | line-height 1.1 | 页面主标题 |
| H2 | clamp(22px, 3vw, 32px) | 600 | — | Section 标题 |
| H3 | 18–20px | 500 | — | 卡片标题 |
| Body | 15–16px | 400 | line-height 1.7 | 正文 |
| Caption | 12–13px | 400 | color: muted | 元信息 / 日期 |

---

## 3. 组件风格规范

### Header

- 高度 64px，固定顶部
- 背景 `rgba(5,5,5,0.72)` + `backdrop-filter: blur(12px)`
- 底边 1px `--color-line`
- Logo 左，Nav 中/右，LanguageSwitch 最右

### MobileNav

- 全屏 `#050505`，从右滑入
- 菜单项高 48px，无背景块
- 关闭按钮 Lucide `X`，24px

### HeroButton

**Primary（主按钮）**
```css
background: var(--color-accent);
color: var(--color-bg);
border: none;
border-radius: var(--radius-sm);
padding: 12px 24px;
```

**Secondary（次按钮）**
```css
background: transparent;
color: var(--color-accent);
border: 1px solid var(--color-line-strong);
```

Hover：亮度微调 + `translateY(-1px)`，0.2s

### SectionTitle

- 英文小字 uppercase + 中文大字
- 下方 24px 宽 1px 线
- 左对齐（非居中 SaaS 风）

### CaseCard

- 16:9 封面
- 底部渐变遮罩 `linear-gradient(transparent, rgba(0,0,0,0.8))`
- Hover：图片 `scale(1.02)`，0.35s
- 无 box-shadow，无大圆角

### ServiceItem

- 横向：Lucide icon 20px + 标题 + 一行描述
- 分隔线布局，非独立卡片
- Icon 颜色 `--color-text-secondary`

### CertificateCard

- 竖版比例框，1px `--color-line` 边框
- Hover：边框 → `--color-accent-soft`

### AudioWavePlayer

- 波形：未播放 `#6F6F6F`，已播放 `#F5F5F5`
- 高度：手机 48px / PC 64px
- 播放按钮 Lucide `Play` / `Pause`
- 加载失败：muted 文字提示

### BookingForm

- 输入框：透明底 + 底边线（非 filled input）
- Focus：底边线 → `--color-accent-soft`
- 手机单列，PC 双列 grid

### AdminSidebar

- 宽 240px，`--color-surface`
- 活动项：左侧 2px 白线 + 背景 `--color-surface-soft`

### AdminTable

- 无斑马纹，仅横线
- 行高 44px
- 表头 `--color-text-muted`，12px uppercase

### Toast

- 右下角，黑底白字，1px 边框
- 2.5s 自动消失

### Modal

- 居中，max-width 560px
- 背景 `--color-surface`
- 圆角 `--radius-md`

### LanguageSwitch

- 文字 `CN / EN`，无国旗
- 当前语言 `--color-accent`，另一 `--color-text-muted`

### WeChatQrDisplay

用于 Contact、Booking 成功页、手机端底部 CTA。

```css
.wechat-qr {
  width: min(240px, 70vw);
  height: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  image-rendering: auto; /* 禁止 crisp-edges，保证扫码识别 */
}
.wechat-qr-caption {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
  text-align: center;
}
```

**规则：**
- 使用 JPG/PNG 原图，**不转 WebP、不压缩**
- `loading="eager"` 确保快速显示
- 手机端可长按识别；PC 端显示「请使用手机微信扫码」

### SocialLinkItem

Contact 页社媒入口：Lucide icon + 标签 + 外链，1px 分隔线，无彩色 icon。

---

## 4. 动效规范

| 场景 | 参数 | 移动端 |
|---|---|---|
| 页面进入 | opacity 0→1, y 12→0, 0.45s | 同 |
| Section 滚动进入 | whileInView, once, margin -80px | y 8→0 |
| 按钮 hover | 0.2s, brightness / border | 无 hover，active scale |
| 案例卡片 hover | scale 1.02, 0.35s | 禁用 scale |
| Lightbox | fade + scale 0.98→1, 0.3s | 全屏 swipe |
| 音频播放 | 波形 cursor + icon 切换 | 同 |
| 后台 Toast | slide up 8px + fade, 0.25s | — |
| 移动菜单 | x 100%→0, 0.35s | — |

### 禁止

- 3D 翻转
- 彩虹渐变动画
- 全站粒子
- 影响 Hero 视频播放的重动画

---

## 5. Hero 特效（自写 CSS）

### 暗色遮罩

```css
.hero-overlay {
  background: linear-gradient(
    180deg,
    rgba(5, 5, 5, 0.55) 0%,
    rgba(5, 5, 5, 0.72) 50%,
    rgba(5, 5, 5, 0.88) 100%
  );
}
```

### 扫描线（克制）

```css
.hero-scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 3px
  );
  pointer-events: none;
  animation: hero-scan 8s linear infinite;
}
```

### 声波线（可选 SVG/CSS）

- 1–2 条水平细线，opacity 0.08–0.15
- 缓慢 horizontal drift，8–12s 周期

---

## 6. 响应式断点

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

| 断点 | 布局变化 |
|---|---|
| < 768px | 单列，MobileNav，Hero 用手机视频 |
| ≥ 768px | 双列表单，桌面 Hero 视频 |
| ≥ 1024px | 案例 grid 3 列 |

---

## 7. 文件组织

```text
src/styles/
  tokens.css       # 上面所有 CSS 变量
  base.css         # reset, typography, layout
  components.css   # 前台组件
  admin.css        # 后台（V1 基础）
  mobile.css       # 移动端覆盖
```

---

## 8. 无障碍

- 所有 icon-only 按钮需 `aria-label`
- 表单 input 需 `<label>` 或 `aria-labelledby`
- 视频需 `poster` + 降级静态图
- 动画尊重 `prefers-reduced-motion: reduce`
- Lenis 不使用（V1），无滚动劫持问题
