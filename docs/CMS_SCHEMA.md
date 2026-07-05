# YU YAKANG AUDIO — JSON CMS 数据结构说明

> 数据文件：`server/data/site-content.json`（运行时）  
> 示例文件：`server/data/site-content.example.json`  
> 预约数据：`server/data/bookings.json`（独立文件，避免主 content 膨胀）

---

## 1. 顶层结构

```text
site-content.json
├── meta              # 版本、更新时间
├── siteSettings      # 站点全局设置
├── profile           # 个人资料
├── hero              # 首页 Hero
├── certificates[]    # 证书
├── services[]        # 服务方向
├── cases[]           # 案例作品
├── seo               # 全局 SEO
├── socialLinks       # 社交链接
└── i18n              # UI 固定文案（非 CMS 内容字段）
```

---

## 2. 字段详解

### meta

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | string | Schema 版本，如 `"1.0.0"` |
| `updatedAt` | ISO string | 最后更新时间 |

### siteSettings

| 字段 | 类型 | 说明 |
|---|---|---|
| `siteName.cn/en` | string | 站点名 |
| `tagline.cn/en` | string | 副标题 |
| `wechatQrUrl` | string | 微信二维码路径（与 `socialLinks.wechatQrImage` 保持同步） |
| `contactEmail` | string | 联系邮箱 |
| `contactPhone` | string | 联系电话（可选） |
| `defaultLanguage` | `"cn"` \| `"en"` | 默认语言 |
| `processSteps[]` | array | 首页工作流程 5 步 |

#### processSteps 项

| 字段 | 类型 |
|---|---|
| `order` | number |
| `title.cn/en` | string |
| `description.cn/en` | string |

### profile

| 字段 | 类型 | 说明 |
|---|---|---|
| `name.cn/en` | string | 姓名 |
| `title.cn/en` | string | 职业头衔 |
| `bio.cn/en` | string | 个人简介（Markdown 可选） |
| `avatarUrl` | string | 头像 |
| `experience[]` | array | 调音台/经验条目 |
| `tools[]` | array | Smaart/EASE/DAW/插件 |
| `location.cn/en` | string | 所在城市 |

#### experience / tools 项

| 字段 | 类型 |
|---|---|
| `label.cn/en` | string |
| `value.cn/en` | string |

### hero

| 字段 | 类型 | 说明 |
|---|---|---|
| `desktopVideoUrl` | string | 桌面 Hero 视频 |
| `mobileVideoUrl` | string | 手机 Hero 视频 |
| `posterUrl` | string | 桌面封面 |
| `mobilePosterUrl` | string | 手机封面 |
| `primaryButton.cn/en` | string | 按钮 1 文案（观看代表视频 / Watch Video） |
| `primaryButton.mobileUrl` | string | 按钮 1 手机端链接（当前：视频号） |
| `primaryButton.desktopUrl` | string | 按钮 1 PC 端链接（当前：视频号网页） |
| `secondaryButton.cn/en` | string | 按钮 2 文案（查看案例作品 / View Cases） |
| `secondaryButton.url` | string | 按钮 2 链接，固定 `/cases` |
| `headline.cn/en` | string | 主标题 |
| `subheadline.cn/en` | string | 副标题 |
| `mode` | `"singleVideo"` \| `"caseVideoCarousel"` | Hero 模式（v1.1.0+） |
| `slideDuration` | number | 轮播默认秒数，通常 5 |
| `fallbackPoster` | string | 全部视频失败时的 poster |
| `slides[]` | array | 案例视频轮播项（见下） |

#### hero.slides[] 项（v1.1.0+）

| 字段 | 类型 | 说明 |
|---|---|---|
| `caseSlug` | string | 关联案例 slug |
| `title.cn/en` | string | 轮播角标标题 |
| `video` | string | 视频路径 |
| `poster` | string | 封面图 |
| `startTime` | number | 起始秒 |
| `duration` | number | 播放秒数（3–5） |
| `enabled` | boolean | 是否启用 |

#### profile 扩展（v1.1.0+）

| 字段 | 类型 | 说明 |
|---|---|---|
| `affiliation.cn/en` | string | 机构 / 会员身份一行摘要 |
| `skillGroups[]` | array | `{ id, title, items[] }` 能力分组 |
| `workPhotos[]` | array | `{ id, order, imageUrl, title, description }` |

> **已废弃（V1.0.1）：** `douyinVideoUrl`、`douyinProfileUrl`、`videoButtonText`、`casesButtonText` — 由 `primaryButton` / `secondaryButton` 替代。

### certificates[]

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | UUID |
| `order` | number | 排序 |
| `title.cn/en` | string | 证书名称 |
| `issuer.cn/en` | string | 颁发机构 |
| `year` | string | 年份 |
| `imageUrl` | string | 图片路径 |
| `visible` | boolean | 是否显示 |

### services[]

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | UUID |
| `order` | number | 排序 |
| `slug` | string | URL slug |
| `icon` | string | Lucide icon 名 |
| `title.cn/en` | string | 服务名 |
| `summary.cn/en` | string | 一行摘要 |
| `description.cn/en` | string | 详细描述 |
| `visible` | boolean | 是否显示 |

### cases[]（核心）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | UUID |
| `slug` | string | URL slug，唯一 |
| `order` | number | 列表排序（兼容字段，与 `sortOrder` 等价） |
| `sortOrder` | number | 列表排序（优先于 `order`） |
| `featured` / `isFeatured` | boolean | 是否首页精选 |
| `showInHero` | boolean | 是否允许进入首页 Hero 轮播（关联 `hero.slides[].caseSlug` 时生效；默认 true） |
| `visible` | boolean | 是否发布 |
| `category` | enum | 见下方分类 |
| `date` | string | 项目时间，如 `2025-06` |
| `location.cn/en` | string | 项目地点 |
| `role.cn/en` | string | 担任角色 |
| `title.cn/en` | string | 项目名称 |
| `summary.cn/en` | string | 列表摘要 |
| `background.cn/en` | string | 项目背景 |
| `services.cn/en` | string | 服务内容 |
| `equipment.cn/en` | string | 使用设备/软件 |
| `challenge.cn/en` | string | 项目难点 |
| `solution.cn/en` | string | 解决方案 |
| `result.cn/en` | string | 最终效果 |
| `clientFeedback.cn/en` | string | 客户反馈 |
| `coverUrl` | string | 封面图 |
| `images[]` | string[] | 画廊图片 |
| `videoUrl` | string \| null | 视频 |
| `audioUrl` | string \| null | 音频试听 |
| `externalVideoUrl` | string \| null | 外链（抖音等） |
| `seo.title.cn/en` | string | 案例 SEO 标题 |
| `seo.description.cn/en` | string | 案例 SEO 描述 |
| `seo.keywords.cn/en` | string[] | 关键词 |

#### 案例模板字段（V2 后台编辑器参考 · 前端已兼容）

以下字段为「工程项目档案」模板的完整结构。现有 JSON 可继续使用 `order` / `equipment` / `services` / `images` 等字段，前台会自动映射。

```json
{
  "title": { "cn": "", "en": "" },
  "slug": "",
  "category": "livehouse-system-tuning",
  "location": { "cn": "", "en": "" },
  "role": { "cn": "", "en": "" },
  "projectDate": "2025-06",
  "date": "2025-06",
  "summary": { "cn": "", "en": "" },
  "background": { "cn": "", "en": "" },
  "challenge": { "cn": "", "en": "" },
  "solution": { "cn": "", "en": "" },
  "result": { "cn": "", "en": "" },
  "services": { "cn": "", "en": "" },
  "serviceContent": { "cn": "", "en": "" },
  "equipment": { "cn": "", "en": "" },
  "toolsUsed": ["Smaart", "WING Compact"],
  "tags": ["FOH", "SYSTEM"],
  "coverUrl": "",
  "coverImage": "",
  "images": [],
  "galleryImages": [],
  "videoUrl": null,
  "videos": [],
  "audioUrl": null,
  "audio": [],
  "featured": true,
  "isFeatured": true,
  "showInHero": true,
  "visible": true,
  "sortOrder": 1,
  "order": 1,
  "seo": {
    "title": { "cn": "", "en": "" },
    "description": { "cn": "", "en": "" },
    "ogImage": ""
  }
}
```

**前台映射规则：**

| 模板字段 | 现有字段兼容 |
|---|---|
| `projectDate` | `date` |
| `serviceContent` | `services` |
| `toolsUsed[]` | `equipment`（字符串） |
| `coverImage` | `coverUrl` |
| `galleryImages[]` | `images[]` |
| `sortOrder` | `order` |
| `isFeatured` | `featured` |

**详情页区块顺序（Project File）：** PROJECT FILE → OVERVIEW → CHALLENGE → MY ROLE → SOLUTION → RESULT → TOOLS → MEDIA → CTA。空字段自动隐藏。

#### category 枚举

```text
livehouse-system-tuning
tour-system-engineering
event-sound-reinforcement
mixing-post-production
recording-editing
acoustic-simulation
```

### seo（全局）

| 字段 | 类型 |
|---|---|
| `title.cn/en` | string |
| `description.cn/en` | string |
| `keywords.cn/en` | string[] |
| `ogImageUrl` | string |
| `faviconUrl` | string |

### socialLinks

| 字段 | 类型 | 说明 |
|---|---|---|
| `douyinUrl` | string | 抖音公开主页（正式，前台优先使用） |
| `douyinUrlDraft` | string | 抖音草稿链接（含 self 等待替换） |
| `wechatVideoUrl` | string | 视频号链接（Hero 按钮 1 + Contact） |
| `wechatQrImage` | string | 微信二维码路径，如 `/images/wechat-qr.jpg` |
| `phone` | string | 电话（可选，第一版可留空） |
| `email` | string | 邮箱（可选，第一版可留空） |
| `location.cn/en` | string | 服务城市 / 常驻地 |
| `contactNote.cn/en` | string | Contact 页联系说明 |

#### 字段使用规则

- 前台抖音入口：`douyinUrl` 非空则用正式链接，否则用 `douyinUrlDraft` 并显示「待更新」提示
- 微信二维码：读取 `wechatQrImage`；`siteSettings.wechatQrUrl` 保持同步（兼容旧字段）
- 后台校验：若 `douyinUrl` 或 `douyinUrlDraft` 含 `/user/self`，显示黄色 Admin 警告

#### 后台 AdminSocial 管理字段

路径：`/admin/social` · API：`PUT /api/admin/content/socialLinks`

可编辑：`douyinUrl` · `douyinUrlDraft` · `wechatVideoUrl` · `wechatQrImage` · `phone` · `email` · `location` · `contactNote`  
可上传：微信二维码 → 写入 `public/images/` 或 `server/uploads/` 后更新 `wechatQrImage`

### i18n（UI 固定文案）

导航、按钮、表单 label、错误提示等不随内容编辑的 UI 字符串。

结构：`i18n.nav.home.cn` = `"首页"`

---

## 3. bookings.json（独立）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | UUID |
| `clientName` | string | 客户姓名 |
| `wechat` | string | 微信 |
| `phone` | string | 手机 |
| `email` | string | 邮箱 |
| `serviceType` | string | 服务类型 slug 或自由文本 |
| `city` | string | 城市 |
| `projectDate` | string | 项目日期 |
| `venueScale` | string | 场地规模 |
| `budgetRange` | string | 预算范围 |
| `referenceUrl` | string | 参考链接 |
| `description` | string | 需求描述 |
| `status` | enum | `new` / `contacted` / `confirmed` / `closed` |
| `internalNote` | string | 内部备注 |
| `createdAt` | ISO string | 创建时间 |
| `updatedAt` | ISO string | 更新时间 |

---

## 4. API 读写约定

- 公开 GET `/api/content`：返回完整 JSON，但 **不含** `bookings`
- 公开 GET `/api/cases`：仅 `visible=true` 的案例
- POST `/api/bookings`：append 到 `bookings.json`
- Admin PUT：按 section 局部更新，自动写 `meta.updatedAt`

---

## 5. 版本迁移

Schema 版本记录在 `meta.version`。升级时：

1. 备份 `site-content.json`
2. 运行迁移脚本（V2 再写）
3. 递增 `meta.version`

---

## 6. 首批 6 案例在 Schema 中的 slug

| slug | featured |
|---|---|
| `echo-live-yunfu` | true |
| `wild-live-shenzhen` | true |
| `maca-live-guangning` | true |
| `shuimuhuaya-jingdezhen-2025` | true |
| `mix-gulou-v7` | true |
| `acoustic-simulation-tavern` | true |
