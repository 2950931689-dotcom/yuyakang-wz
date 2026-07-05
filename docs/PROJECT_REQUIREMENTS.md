# YU YAKANG AUDIO — 项目需求冻结文档 V1.0

> 状态：已拍板 · 2026-07-05  
> 项目目录：`E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-audio-site`  
> 原始素材：`E:\卓面应用\个人文件\Cursor\余`（只读，禁止修改/移动）

---

## 1. 项目定位

| 项 | 冻结值 |
|---|---|
| 项目名称 | YU YAKANG AUDIO |
| 中文名 | 余雅康个人调音师品牌官网 |
| 核心身份 | Live Sound Engineer / System Tuning / Mixing Engineer |
| 中文身份 | 现场调音师 / 音响系统工程师 / 混音师 |
| 网站性质 | 个人专业品牌官网 + 案例作品库 + 预约转化系统 |

### 优先服务对象

1. Livehouse / 酒吧现场调音
2. 演出公司系统工程
3. 活动现场扩声
4. 混音后期试听展示

### 转化逻辑

```text
第一屏：建立专业感
中段：用案例证明能力
底部：引导提交需求或加微信
```

---

## 2. 品牌与视觉（冻结）

### Logo V1

```text
YU YAKANG AUDIO

LIVE SOUND / SYSTEM TUNING / MIXING

现场调音 / 系统工程 / 混音后期
```

- 第一版：**文字型 Logo**，不做复杂图形
- 后续 V2：可追加 YYK 符号

### 风格约束

| 要做 | 禁止 |
|---|---|
| 黑白极简 | 夜店 DJ 风 |
| 专业音频工程感 | 培训机构风 |
| 克制、高级、干净 | 廉价作品集风 |
| 细线边框、小圆角 | 大面积金色 |
| 深黑 / 碳灰 / 白 / 银灰 | 蓝紫赛博霓虹 |

---

## 3. 前台页面（冻结）

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 Home | Hero 视频 + 6 区块 |
| `/cases` | 案例列表 | 分类筛选 |
| `/cases/:slug` | 案例详情 | 叙事型结构 |
| `/about` | 关于余雅康 | 个人简介 + 证书 |
| `/services` | 服务方向 | 4 大服务 |
| `/booking` | 预约合作 | 表单 + 微信 QR |
| `/contact` | 联系方式 | 社交链接 |
| `/admin` | 后台管理 | 基础 CMS |

### 首页 6 区块

1. **Hero 视频首屏** — 案例混剪背景 + Logo + 双按钮
2. **专业背书** — 证书 / 调音台经验 / Smaart·EASE·DAW
3. **服务方向** — Livehouse / 系统工程 / 混音 / 录音编辑
4. **精选案例** — 3–6 个代表项目
5. **工作流程** — 5 步流程
6. **预约合作** — 表单 + 微信二维码

### Hero 双按钮交互

| 按钮 | 文案 CN/EN | 手机端 | PC 端 |
|---|---|---|---|
| 观看代表视频 / Watch Video | `hero.primaryButton` | 打开视频号链接 | 新标签打开视频号网页 |
| 查看案例作品 / View Cases | `hero.secondaryButton` | 跳转 `/cases` | 跳转 `/cases` |

**代表视频入口（当前）：** 视频号 `https://weixin.qq.com/sph/AgeXXBTfmy`  
CMS 字段：`hero.primaryButton.mobileUrl` · `hero.primaryButton.desktopUrl`

> 原方案抖音代表视频入口已调整为视频号；抖音主页链接单独在 Contact 展示。

### 社交媒体与联系方式（已配置）

| 项 | 值 | 说明 |
|---|---|---|
| 视频号 | `https://weixin.qq.com/sph/AgeXXBTfmy` | Hero 按钮 1 + Contact 入口 |
| 抖音草稿 | `douyinUrlDraft`（含 `/user/self`） | **待替换**为公开主页分享链接 |
| 微信二维码 | `/images/wechat-qr.jpg` | Contact / Booking 成功页 / 手机 CTA |
| 常驻地 | 江西南昌 | `socialLinks.location` |
| 手机 / 邮箱 | 空 | 第一版可不公开，仅微信 + 表单 |

**微信二维码规则：**
- 使用原图副本，不重新生成、不 WebP 压缩（保证扫码识别）
- 后台 `/admin/social` 支持上传更换

**抖音 self 链接警告：**  
后台若链接含 `/user/self`，显示黄色提示：「该链接可能不是公开主页链接，建议替换为公开分享链接。」

### Contact 页面展示项

- 微信二维码
- 视频号入口
- 抖音入口（有公开链接前显示草稿或隐藏）
- 预约合作按钮 → `/booking`
- 服务城市：江西南昌
- 品牌：YU YAKANG AUDIO / 余雅康
- 定位：现场调音 / 系统工程 / 混音后期

### Booking 提交成功页

- 成功文案（中英文，见 CMS `i18n.booking.success`）
- 微信二维码
- 返回首页 / 查看案例按钮

---

## 4. Hero 混剪素材（已拍板）

| # | 来源 | 用途 |
|---|---|---|
| 1 | 云浮 ECHO.回声 Live 视频 | Hero 片段 |
| 2 | 深圳 Wild Live 视频 | Hero 片段 |
| 3 | 肇庆 Maca 音乐客厅 视频 | Hero 片段 |
| 4 | 水木年华 25 周年景德镇站 视频 | Hero 片段 |
| 5 | 南昌师范学院毕业晚会 视频 | Hero 片段 |
| 6 | 后期混音实录视频 1 段 | Hero 片段 |

### 输出目标（网站副本）

```text
public/hero/desktop/hero-reel.mp4      ≤ 8 MB
public/hero/mobile/hero-reel-mobile.mp4 ≤ 4 MB
public/hero/desktop/hero-poster.webp
public/hero/mobile/hero-poster-mobile.webp
```

> 混剪本身需人工或 ffmpeg 完成；脚本只负责复制源片段清单，不自动剪辑。

---

## 5. 首批 6 个案例（已拍板）

| # | Slug | 名称 | 分类 |
|---|---|---|---|
| 1 | `echo-live-yunfu` | 云浮 ECHO.回声 Live | livehouse-system-tuning |
| 2 | `wild-live-shenzhen` | 深圳南山 Wild Live | livehouse-system-tuning |
| 3 | `maca-live-guangning` | 肇庆广宁 Maca 音乐客厅 Live | livehouse-system-tuning |
| 4 | `shuimuhuaya-jingdezhen-2025` | 水木年华 25 周年巡回演唱会·景德镇站 | tour-system-engineering |
| 5 | `mix-gulou-v7` | 《鼓楼》混音案例 | mixing-post-production |
| 6 | `acoustic-simulation-tavern` | 声学模拟·酒馆 | acoustic-simulation |

### 案例详情必填叙事字段

每个案例必须写清楚（中英文）：

- 项目背景
- 现场问题 / 项目难点
- 我的角色
- 使用设备 / 软件
- 解决方案（我做了什么判断、怎么处理声音）
- 最终效果
- 客户反馈（如有）

> **当前最大短板：原始资料目录中 5 份 `文案.txt` 均为空，上线前必须补写。**

### 案例分类优先级

1. `livehouse-system-tuning` — Livehouse / 酒吧现场调音
2. `tour-system-engineering` — 演出公司系统工程
3. `event-sound-reinforcement` — 会议 / 年会 / 活动扩声
4. `mixing-post-production` — 混音后期
5. `recording-editing` — 录音 / 音频编辑
6. `acoustic-simulation` — 声学模拟 / 系统设计

---

## 6. 后台 CMS 功能（V1 最小集）

V1 后台只需做到：

- [x] 能改首页视频
- [x] 能改个人资料
- [x] 能改证书
- [x] 能改服务
- [x] 能改案例
- [x] 能查看预约
- [x] 能改 SEO
- [x] 能改中英文内容
- [x] 能改微信二维码
- [x] 能改社媒链接（`/admin/social`）

V2 再考虑：拖拽排序、草稿、版本记录、复杂权限。

---

## 7. 技术路线（方案 A，已拍板）

### V1 使用

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Vite + React Router |
| 样式 | 原生 CSS + `tokens.css` |
| 图标 | Lucide React |
| 动效 | Motion |
| 音频 | wavesurfer.js |
| 后端 | Express |
| 数据 | JSON CMS（无数据库） |
| 部署 | Vercel（前端）+ Railway（API） |

### V1 不使用

Magic UI · React Bits · Lenis · shadcn/ui 前台 · 数据库 · Strapi · Next.js

### V1.5 后台增强

Tailwind CSS + shadcn/ui（仅 Admin 路由）

### V2 升级路径

Next.js + Strapi（SEO 与内容量增长后）

---

## 8. 非功能需求

- PC + 手机双端响应式
- 中英文切换（i18n 字段成对）
- 音频全局单例：同时只播一个
- 首页 Hero 视频不能卡顿
- 不修改 / 不移动原始素材目录
- 网站素材一律使用 `public/` 副本

---

## 9. MVP 开发顺序

| 步骤 | 内容 | 状态 |
|---|---|---|
| 第 0 步 | 项目骨架 + 文档 + Schema + 安全脚本 | ✅ 进行中 |
| 第 1 步 | 前端静态页面 + Design Tokens | 待开始 |
| 第 2 步 | JSON CMS 数据结构 + Express API | 待开始 |
| 第 3 步 | 首页 Hero + 案例系统 | 待开始 |
| 第 4 步 | 预约表单 + 微信 QR | 待开始 |
| 第 5 步 | 中英文切换 | 待开始 |
| 第 6 步 | SEO + Admin + 部署 | 待开始 |

---

## 10. 待用户补充的内容清单

| 内容 | 紧急度 | 状态 |
|---|---|---|
| 6 个案例完整文案（中英文） | 🔴 高 | ⬜ |
| 个人简介 Bio（中英文） | 🔴 高 | ⬜ |
| 微信二维码图片 | — | ✅ `/images/wechat-qr.jpg` |
| 视频号代表视频 URL | — | ✅ 已写入 CMS |
| 抖音公开主页 URL | 🔴 高 | ⚠️ 当前为 self 草稿 |
| Hero 混剪成品 | 🔴 高 | ⬜ |
| 公开手机号（可选） | 🟡 中 | 留空，第一版不展示 |
| 公开邮箱（可选） | 🟡 中 | 留空，第一版不展示 |
| 南昌师范学院案例图片 | 🟡 中 | ⬜ |
| 客户反馈 | 🟡 中 | ⬜ |
| 专业头像 | 🟡 中 | ⬜ |
| Smaart / EASE 截图 | 🟢 低 | ⬜ |
