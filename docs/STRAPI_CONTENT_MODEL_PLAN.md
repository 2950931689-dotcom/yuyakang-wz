# Strapi Content Model Plan — YU YAKANG AUDIO

> 轮次：6.0 · 对齐当前 `site-content.json` / `site-content.mock.json`  
> 原则：Strapi 为唯一数据源；Adapter 输出保持现有前台 contract

---

## 0. 顶层映射（Adapter 目标）

`buildSiteContentFromStrapi()` 应产出与现 JSON CMS 一致的顶层 keys：

```text
meta, siteSettings, profile, hero, location, serviceArea, display,
certificates, services, cases, seo, socialLinks, tutorialSection, i18n
```

Strapi 侧用多个 Content Types + Single Types 存储；Adapter 组装为单一 JSON。

---

## 1. Profile（Single Type）

**用途：** 个人身份、About / Contact 人物信息。

| 字段 | Strapi 类型 | 必填 | 说明 | JSON CMS 对应 |
|------|-------------|------|------|---------------|
| `nameCn` | string | ✓ | 中文名 | `profile.name.cn` |
| `nameEn` | string | ✓ | 英文名 | `profile.name.en` |
| `roleCn` | string | | 角色中文 | `profile.title.cn` |
| `roleEn` | string | | 角色英文 | `profile.title.en` |
| `taglineCn` | text | | 标语 | `profile.tagline` |
| `taglineEn` | text | | | |
| `locationCn` | string | | | `profile.location.cn` |
| `locationEn` | string | | | `profile.location.en` |
| `statusCn` | string | | 状态文案 | `profile.status` |
| `statusEn` | string | | | |
| `bioCn` | richtext | | 简介 | `profile.bio.cn` |
| `bioEn` | richtext | | | `profile.bio.en` |
| `skills` | component repeatable `skill-item` | | 技能列表 | `profile.skills[]` |
| `experience` | component repeatable `experience-item` | | 经历 | `profile.experience[]` |
| `workPhotos` | relation → WorkPhoto | | 工作照 | `profile.workPhotos[]` |
| `credentials` | relation → Certificate | | 证书 | `profile.credentials` / certificates |
| `avatar` | media single | | 头像 | `profile.avatarUrl` |
| `heroImage` | media single | | About 大图 | 可选 |
| `enabled` | boolean | ✓ | 默认 true | — |

**Component `skill-item`：** `labelCn`, `labelEn`, `valueCn`, `valueEn`, `sortOrder`

**Component `experience-item`：** `labelCn`, `labelEn`, `valueCn`, `valueEn`, `sortOrder`

**Adapter：** `normalizeProfile()` → `content.profile`（保留 `{ cn, en }` 双语对象以兼容 `cmsBinding.js`）。

---

## 2. Cases（Collection Type）

**用途：** 案例列表与详情。

| 字段 | Strapi 类型 | 必填 | 说明 | JSON CMS 对应 |
|------|-------------|------|------|---------------|
| `titleCn` | string | ✓ | | `cases[].title.cn` |
| `titleEn` | string | | | `cases[].title.en` |
| `slug` | UID (from titleCn) | ✓ | **唯一** | `cases[].slug` |
| `summaryCn` | text | | | `cases[].summary` |
| `summaryEn` | text | | | |
| `backgroundCn` | richtext | | | `cases[].background` |
| `backgroundEn` | richtext | | | |
| `challengeCn` | richtext | | | `cases[].challenge` |
| `challengeEn` | richtext | | | |
| `roleDescriptionCn` | richtext | | 角色描述 | `cases[].role` |
| `roleDescriptionEn` | richtext | | | |
| `solutionCn` | richtext | | | `cases[].solution` |
| `solutionEn` | richtext | | | |
| `resultCn` | richtext | | | `cases[].result` |
| `resultEn` | richtext | | | |
| `clientFeedbackCn` | richtext | | | `cases[].clientFeedback` |
| `clientFeedbackEn` | richtext | | | |
| `locationCn` | string | | | `cases[].location.cn` |
| `locationEn` | string | | | |
| `projectRoleCn` | string | | | `cases[].role.cn` |
| `projectRoleEn` | string | | | |
| `category` | string | | livehouse-system-tuning 等 | `cases[].category` |
| `tags` | component repeatable `tag-item` | | | 扩展 |
| `toolsUsedCn` | text | | 设备/软件 | `cases[].equipment.cn` |
| `toolsUsedEn` | text | | | |
| `coverImage` | media single | | | `cases[].coverUrl` |
| `gallery` | media multiple | | | `cases[].images[]` |
| `videos` | component repeatable `case-video` | | | `videoUrl`, hero slides |
| `audio` | media multiple | | | `cases[].audioUrl` |
| `systemFlow` | JSON | | 信号链节点 | `signalFlow` / admin 自定义 |
| `published` | boolean | ✓ | | `cases[].visible` |
| `featured` | boolean | | | `cases[].featured` |
| `sortOrder` | integer | | | `cases[].order` |
| `projectDate` | date | | | `cases[].date` |
| `seoTitleCn` | string | | | `cases[].seo.title` |
| `seoDescriptionCn` | text | | | `cases[].seo.description` |
| `seoKeywords` | JSON | | | `cases[].seo.keywords` |

**Component `case-video`：** `url`, `labelCn`, `labelEn`, `externalUrl`

**Adapter：** `normalizeCases()` — media → `/uploads/...` 或 CDN URL；gallery 顺序与 `sortOrder` 一致。

---

## 3. Certificates（Collection Type）

| 字段 | Strapi 类型 | 必填 | JSON CMS 对应 |
|------|-------------|------|---------------|
| `titleCn` | string | ✓ | `certificates[].title` |
| `titleEn` | string | | |
| `issuerCn` | string | | `certificates[].issuer` |
| `issuerEn` | string | | |
| `descriptionCn` | text | | `certificates[].description` |
| `descriptionEn` | text | | |
| `image` | media single | | `certificates[].imageUrl` |
| `date` | date | | `certificates[].date` |
| `sortOrder` | integer | | `certificates[].order` |
| `enabled` | boolean | ✓ | `certificates[].visible` |

---

## 4. WorkPhotos（Collection Type）

| 字段 | Strapi 类型 | 必填 | JSON CMS 对应 |
|------|-------------|------|---------------|
| `titleCn` | string | | `profile.workPhotos[].title` |
| `titleEn` | string | | |
| `descriptionCn` | text | | `profile.workPhotos[].description` |
| `descriptionEn` | text | | |
| `image` | media single | ✓ | `profile.workPhotos[].url` |
| `category` | string | | on-site / studio 等 |
| `sortOrder` | integer | | |
| `enabled` | boolean | ✓ | |

---

## 5. Services（Collection Type）

| 字段 | Strapi 类型 | 必填 | JSON CMS 对应 |
|------|-------------|------|---------------|
| `titleCn` | string | ✓ | `services[].title` |
| `titleEn` | string | | |
| `slug` | UID | ✓ | 扩展 |
| `summaryCn` | text | | `services[].summary` |
| `summaryEn` | text | | |
| `descriptionCn` | richtext | | `services[].description` |
| `descriptionEn` | richtext | | |
| `features` | component repeatable `service-feature` | | `services[].features[]` |
| `iconLabel` | string | | `services[].icon` |
| `enabled` | boolean | ✓ | `services[].visible` |
| `sortOrder` | integer | | `services[].order` |

---

## 6. SocialLinks（Single Type 或 Collection）

当前 JSON 为 **单对象** `socialLinks`（非数组）。建议 **Single Type `social-link-settings`**：

| 字段 | Strapi 类型 | JSON CMS 对应 |
|------|-------------|---------------|
| `douyinUrl` | string | `socialLinks.douyinUrl` |
| `douyinUrlDraft` | string | `socialLinks.douyinUrlDraft` |
| `wechatVideoUrl` | string | `socialLinks.wechatVideoUrl` |
| `wechatQrImage` | media | `socialLinks.wechatQrImage` |
| `wechatId` | string | admin 扩展 |
| `phone` | string | `socialLinks.phone` |
| `email` | email | `socialLinks.email` |
| `locationCn` | string | `socialLinks.location.cn` |
| `locationEn` | string | |
| `contactNoteCn` | text | `socialLinks.contactNote.cn` |
| `contactNoteEn` | text | |

若需多平台扩展，可改为 Collection Type `social-link`（`platform`, `label`, `url`, `qrImage`, `enabled`, `sortOrder`, `openInNewTab`）。

---

## 7. CommonTools（Collection Type）— 首批迁移试点

**必须与 `AdminCommonToolsPage` / `normalizeTool()` 对齐：**

| 字段 | Strapi 类型 | 必填 | Admin 字段 |
|------|-------------|------|------------|
| `title` | string | ✓ | `title` |
| `description` | text | | `description` |
| `url` | string | ✓ | `url` |
| `category` | string | | `category` |
| `enabled` | boolean | ✓ | `enabled`（默认 true） |
| `sortOrder` | integer | ✓ | `sortOrder` |
| `openInNewTab` | boolean | ✓ | `openInNewTab`（默认 true） |
| `isFeatured` | boolean | | `isFeatured` |
| `legacyId` | string | | 对应 JSON `id`（UUID），迁移用 |

**JSON 存储位置：** `siteSettings.commonTools[]`

**Adapter：**

```javascript
normalizeCommonTools(strapiItems) =>
  strapiItems.map(t => ({
    id: t.legacyId || String(t.id),
    title: t.title,
    description: t.description ?? "",
    url: t.url,
    category: t.category ?? "",
    enabled: t.enabled !== false,
    sortOrder: t.sortOrder ?? 0,
    openInNewTab: t.openInNewTab !== false,
    isFeatured: !!t.isFeatured,
  }))
```

**PoC 测试数据（Smaart）：**

```json
{
  "title": "Smaart",
  "description": "现场声学测量与系统调试工具",
  "url": "https://www.rationalacoustics.com/",
  "category": "测量工具",
  "enabled": true,
  "sortOrder": 1,
  "openInNewTab": true,
  "isFeatured": true
}
```

---

## 8. SiteSettings（Single Type）

| 字段 | Strapi 类型 | JSON CMS 对应 |
|------|-------------|---------------|
| `siteNameCn` | string | `siteSettings.siteName.cn` |
| `siteNameEn` | string | |
| `taglineCn` | string | `siteSettings.tagline.cn` |
| `taglineEn` | string | |
| `wechatQrUrl` | string / media | `siteSettings.wechatQrUrl` |
| `contactEmail` | email | |
| `contactPhone` | string | |
| `defaultLanguage` | enumeration cn/en | |
| `processSteps` | component repeatable | `siteSettings.processSteps[]` |
| `hero` | component `hero-settings` | 顶层 `hero` 或嵌套 |
| `contact` | component `contact-settings` | |
| `bookingGuide` | component | booking 页文案 |
| `soundIssues` | component repeatable | |
| `navigation` | JSON | `i18n.nav` 部分 |
| `themeSettings` | JSON | 可选 |

**注意：** `commonTools` 独立 Collection，Adapter 合并进 `siteSettings.commonTools`。

---

## 9. Bookings（Collection Type）

| 字段 | Strapi 类型 | 说明 |
|------|-------------|------|
| `name` | string | 客户姓名 |
| `phone` | string | |
| `wechat` | string | |
| `email` | email | |
| `projectType` | string | |
| `location` | string | |
| `eventDate` | date | 避免与 Strapi `createdAt` 混淆 |
| `message` | richtext | |
| `status` | enumeration | `new`, `contacted`, `confirmed`, `done`, `archived` |
| `source` | string | `website`, `wechat` |
| `adminNotes` | text | 后台备注 |

**本轮不接入。** 未来：`POST /api/bookings` → Express → Strapi create。

---

## 10. PageCopy（Collection Type）

**用途：** 未来「全站文案后台可改」。

| 字段 | Strapi 类型 | 说明 |
|------|-------------|------|
| `key` | UID | 唯一，如 `home.workflow.title` |
| `page` | string | home, about, contact… |
| `section` | string | workflow, hero, booking… |
| `titleCn` | string | |
| `titleEn` | string | |
| `subtitleCn` | text | |
| `subtitleEn` | text | |
| `bodyCn` | richtext | |
| `bodyEn` | richtext | |
| `ctaLabelCn` | string | |
| `ctaLabelEn` | string | |
| `ctaHref` | string | |
| `enabled` | boolean | |

**本轮不接前台。** 后期可逐步替换 `i18n` 硬编码与 mock 片段。

---

## 11. PageModules（Collection Type）

**用途：** 后期页面模块化（见 `MODULE_SCHEMA_PLAN.md`）。

| 字段 | Strapi 类型 | 说明 |
|------|-------------|------|
| `page` | enumeration | home, about, cases, contact, services |
| `moduleType` | string | hero, workflow, featuredCases… |
| `titleCn` | string | |
| `titleEn` | string | |
| `subtitleCn` | text | |
| `subtitleEn` | text | |
| `enabled` | boolean | |
| `sortOrder` | integer | |
| `sourceType` | string | cases, certificates, custom |
| `sourceId` | string | slug 或 id |
| `settings` | JSON | 模块专属配置 |

---

## 12. MediaAsset（可选 Collection Type）

若需统一管理「非 Strapi 默认 media」元数据：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | |
| `altCn` / `altEn` | string | SEO |
| `file` | media | |
| `usage` | enumeration | hero, case, certificate, og |
| `externalUrl` | string | CDN 外链 |
| `sortOrder` | integer | |

PoC 阶段可仅用 Strapi 内置 Media Library，不单独建 Type。

---

## 13. Adapter 函数清单（未来实现）

**文件：** `server/lib/strapiClient.js`, `server/lib/strapiAdapter.js`

### strapiClient

```javascript
// 读取 STRAPI_BASE_URL, STRAPI_API_TOKEN, STRAPI_TIMEOUT_MS
getCollection(type, { populate, filters, sort })
getSingle(type, { populate })
createEntry(type, data)
updateEntry(type, documentId, data)
deleteEntry(type, documentId)
```

### strapiAdapter

```javascript
normalizeProfile(strapiProfile)
normalizeCases(strapiCases)
normalizeCertificates(strapiCerts)
normalizeWorkPhotos(strapiPhotos)
normalizeServices(strapiServices)
normalizeSocialLinks(strapiSocial)
normalizeCommonTools(strapiTools)
normalizeSiteSettings(strapiSettings, tools, hero, ...)
normalizeHero(strapiHero)
normalizeI18n(strapiPageCopy) // 后期
buildSiteContentFromStrapi(strapiBundle) // → site-content shape
```

---

## 14. 双源读取（设计 only，本轮不实现）

```javascript
// GET /api/content — 未来
if (process.env.STRAPI_ENABLED === "true") {
  try {
    const raw = await fetchAllFromStrapi();
    return res.json(await buildSiteContentFromStrapi(raw));
  } catch (err) {
    console.warn("[strapi] fallback to JSON CMS", err.message);
  }
}
return res.json(await readJson(SITE_CONTENT_PATH));
```

---

## 15. 自制后台写 Strapi（未来）

```text
/admin/common-tools → PATCH /api/admin/common-tools (或 section)
  → requireAdminAuth
  → strapiClient.updateCollection("common-tools", ...)
  → 禁止浏览器直连 Strapi
```

JSON CMS 在迁移完成后 **不再接收 PATCH**。

---

## 16. PoC 验证记录

> Round 6.0 · 2026-07-09 本地验证

| 项 | 结果 |
|----|------|
| PoC 路径 | `E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-strapi-poc` |
| Strapi 版本 | **5.12.4** (Community) |
| Node | v22.22.0 |
| 数据库 | SQLite (`.tmp/data.db`) |
| Admin URL | `http://localhost:1337/admin` → **200**（首次需注册管理员） |
| CommonTools CT | **已创建**（schema + bootstrap seed） |
| REST 读取 | **通过** `GET /api/common-tools` |
| 接入前台 | **未接入**（符合 6.0 要求） |

**安装注意：** 若 `better-sqlite3` 报错，在 PoC 目录执行 `npm rebuild better-sqlite3`。

### API 响应示例（实测 Strapi v5.12.4）

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "flfzlfs4r0mnlvzwkl52r1df",
      "title": "Smaart",
      "description": "现场声学测量与系统调试工具",
      "url": "https://www.rationalacoustics.com/",
      "category": "测量工具",
      "enabled": true,
      "sortOrder": 1,
      "openInNewTab": true,
      "isFeatured": true,
      "legacyId": null,
      "createdAt": "2026-07-09T14:56:36.032Z",
      "updatedAt": "2026-07-09T14:56:36.032Z",
      "publishedAt": "2026-07-09T14:56:36.027Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### PoC 启动命令

```powershell
cd "E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-strapi-poc"
npm rebuild better-sqlite3   # 若 sqlite 绑定失败
npm run develop
# Admin: http://localhost:1337/admin
# API:   http://localhost:1337/api/common-tools
```

PoC 目录 **不在主仓库内**，不提交到 `yuyakang-audio-site`。
