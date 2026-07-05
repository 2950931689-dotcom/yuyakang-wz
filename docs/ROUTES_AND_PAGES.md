# YU YAKANG AUDIO — 路由与页面结构

---

## 1. 前台路由

| 路径 | 页面组件（规划） | 数据来源 | 说明 |
|---|---|---|---|
| `/` | `HomePage` | hero, profile, certificates, services, cases (featured), siteSettings | 6 区块首页 |
| `/cases` | `CasesListPage` | cases[] | 分类筛选 + 卡片列表 |
| `/cases/:slug` | `CaseDetailPage` | cases[slug] | 叙事型详情 |
| `/about` | `AboutPage` | profile, certificates | 个人简介 |
| `/services` | `ServicesPage` | services[] | 4 大服务方向 |
| `/booking` | `BookingPage` | socialLinks.wechatQrImage, services[] | 预约表单 + 提交成功页 |
| `/contact` | `ContactPage` | socialLinks, profile, hero.primaryButton | 联系方式 + 社媒入口 |

### 前台布局

```text
App
├── Header（Logo + Nav + LanguageSwitch）
├── Outlet（页面内容）
└── Footer（版权 + 社交链接）
```

### 首页区块 ID（锚点）

| ID | 区块 |
|---|---|
| `#hero` | Hero 视频首屏 |
| `#credentials` | 专业背书 |
| `#services` | 服务方向 |
| `#featured-cases` | 精选案例 |
| `#process` | 工作流程 |
| `#booking` | 预约合作 |

---

## 2. 后台路由（V1 基础版）

| 路径 | 页面 | 功能 |
|---|---|---|
| `/admin` | AdminDashboard | 概览统计 |
| `/admin/login` | AdminLogin | 简单密码登录 |
| `/admin/hero` | AdminHero | 首页视频 / Hero 按钮文案与链接 |
| `/admin/social` | AdminSocial | 社媒链接 / 微信二维码 / 联系说明 |
| `/admin/profile` | AdminProfile | 个人资料中英文 |
| `/admin/certificates` | AdminCertificates | 证书 CRUD |
| `/admin/services` | AdminServices | 服务 CRUD |
| `/admin/cases` | AdminCases | 案例 CRUD + 精选标记 |
| `/admin/bookings` | AdminBookings | 预约列表 + 状态 |
| `/admin/seo` | AdminSeo | 全局 SEO |
| `/admin/settings` | AdminSettings | 站点全局设置（与 social 分工：settings 偏站点，social 偏联系转化） |

### 后台布局

```text
AdminApp
├── AdminSidebar（菜单）
├── AdminTopbar（标题 + 保存状态 + 退出）
└── Outlet（管理页面）
```

### V1 后台不做

- 多用户权限
- 草稿 / 发布版本
- 拖拽排序（用 order 数字字段代替）
- 富文本 WYSIWYG（V1 用 Textarea + Markdown 可选）

---

## 3. API 路由（Express 规划）

### 公开只读

| Method | Path | 说明 |
|---|---|---|
| GET | `/api/content` | 完整 site content（或分模块） |
| GET | `/api/cases` | 案例列表 |
| GET | `/api/cases/:slug` | 单案例 |
| POST | `/api/bookings` | 提交预约（写入 JSON） |

### 后台（需 auth）

| Method | Path | 说明 |
|---|---|---|
| GET | `/api/admin/content` | 读取完整 CMS |
| PUT | `/api/admin/content/:section` | 更新模块 |
| GET | `/api/admin/bookings` | 预约列表 |
| PATCH | `/api/admin/bookings/:id` | 更新状态/备注 |
| POST | `/api/admin/upload` | 文件上传 → uploads/ |

---

## 4. 页面 → CMS 字段映射

### 首页

| 区块 | CMS 路径 |
|---|---|
| Hero 视频 | `hero.desktopVideoUrl`, `hero.mobileVideoUrl`, `hero.posterUrl` |
| Hero 按钮 1 | `hero.primaryButton` → 视频号 `socialLinks.wechatVideoUrl` |
| Hero 按钮 2 | `hero.secondaryButton` → `/cases` |
| 背书 | `certificates[]`, `profile.experience`, `profile.tools[]` |
| 服务 | `services[]` |
| 精选案例 | `cases[] where featured=true` |
| 流程 | `siteSettings.processSteps[]` |
| 预约 | `socialLinks.wechatQrImage`, booking 表单 POST |
| 手机端底部 CTA | `socialLinks.wechatQrImage` + `/booking` |

### Contact 页面

| 区块 | CMS 字段 |
|---|---|
| 品牌 / 姓名 / 定位 | `siteSettings.siteName`, `profile.name`, `profile.title` |
| 常驻地 | `socialLinks.location` |
| 微信二维码 | `socialLinks.wechatQrImage` |
| 视频号 | `socialLinks.wechatVideoUrl` |
| 抖音 | `socialLinks.douyinUrl` 或 `douyinUrlDraft` |
| 联系说明 | `socialLinks.contactNote` |
| 预约按钮 | 链接 `/booking` |

### Booking 提交成功

| 区块 | CMS 字段 |
|---|---|
| 标题 / 正文 | `i18n.booking.successTitle`, `i18n.booking.success` |
| 微信二维码 | `socialLinks.wechatQrImage` |
| 返回首页 | `i18n.booking.successBackHome` → `/` |
| 查看案例 | `i18n.booking.successViewCases` → `/cases` |

### 案例详情

| 区块 | CMS 字段 |
|---|---|
| 标题 | `title.cn` / `title.en` |
| 元信息 | `category`, `date`, `location`, `role` |
| 叙事 | `background`, `challenge`, `solution`, `result` |
| 媒体 | `images[]`, `videoUrl`, `audioUrl` |
| 反馈 | `clientFeedback.cn/en` |

---

## 5. 语言切换

- URL 策略 V1：**同 URL + Context 切换**（不采用 `/en/` 前缀）
- 存储：`localStorage.lang` = `cn` | `en`
- 组件：`<LanguageSwitch />` 切换 context
- 所有展示文案从 CMS i18n 字段读取

### V2 可选升级

- `/en/cases/:slug` 独立 SEO 路由（Next.js 迁移时）

---

## 6. 404 / 错误页

| 路径 | 处理 |
|---|---|
| 未知前台路由 | `NotFoundPage` |
| 未知案例 slug | 跳转 `/cases` 或 404 |
| 未登录访问 /admin/* | 跳转 `/admin/login` |

---

## 7. 文件与路由对应（src/ 规划）

```text
src/app/
  router.tsx          # 路由定义
  App.tsx             # 前台根布局
  AdminApp.tsx        # 后台根布局

src/components/home/
  HeroSection.tsx
  CredentialsSection.tsx
  ServicesSection.tsx
  FeaturedCasesSection.tsx
  ProcessSection.tsx
  BookingSection.tsx

src/components/cases/
  CaseCard.tsx
  CaseFilter.tsx
  CaseDetail.tsx

src/components/booking/
  BookingForm.tsx

src/components/audio/
  AudioWavePlayer.tsx

src/components/admin/
  AdminShell.tsx
  AdminSidebar.tsx
  ...（各管理页 V1.5 完善）
```

> 以上组件文件在第 1 步才创建，当前仅为规划。
