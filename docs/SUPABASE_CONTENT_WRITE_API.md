# 8.5 Supabase Content Write API — PATCH /api/content/section/:key

> **YU YAKANG AUDIO**  
> 前置：8.4 `GET /api/content` 已从 Supabase 读取  
> 本阶段：**后台保存写入 Supabase `site_content`**；最小迁移 admin session API

---

## 1. 本阶段目标

1. 实现 `PATCH /api/content/section/:key` → Supabase upsert。
2. 保持与旧 Express **请求 body** 与 **成功响应** 兼容。
3. 写接口必须 **admin session** 保护，不可公开。
4. 最小迁移 `POST /api/admin/login`、`GET /api/admin/me`、`POST /api/admin/logout`。
5. **不**影响 8.4 `GET /api/content`；**不**写本地 JSON fallback。
6. **不**做上传 / Storage / `/admin` 同域入口迁移。

---

## 2. 写入链路

```text
Admin UI saveContentSection(key, data)
  → PATCH /api/content/section/:key
       body: { data: sectionPayload }
       Cookie: yy_admin_session
  → api/content/section/[key].js
       requireAdminSession()
       writeContentSection(key, body)
            read current data_json (merge 用)
            mergeSectionData()
            upsert site_content { key, data_json, updated_at }
            touch meta.updatedAt
  → 200 { ok, sectionKey, data, updatedAt }
```

---

## 3. 旧 Express 审计结论

| 项 | 结论 |
|----|------|
| Auth | `requireAdminAuth` — Cookie `yy_admin_session` |
| Body | **`{ data: sectionData }`**（非裸 section） |
| 写入 | `updateJsonSection` — **整 section 覆盖**（文件级 meta.updatedAt 同步更新） |
| 成功响应 | `{ ok: true, sectionKey, data: section, updatedAt }` |
| 失败 400 | `{ ok: false, error: "..." }` |
| 失败 401 | `{ ok: false, authenticated: false, message: "未登录或登录已过期" }` |
| 前台 | `saveContentSection(key, data)` → `JSON.stringify({ data })`；保存后 `reloadContent()`，**不依赖响应 body 字段** |

---

## 4. Section key 白名单

与 Supabase 现有 16 rows 对齐：

`meta`, `siteSettings`, `profile`, `hero`, `certificates`, `services`, `cases`, `seo`, `socialLinks`, `featuredVideos`, `tutorialSection`, `i18n`, `location`, `serviceArea`, `display`, `homeSections`

非法 key → `400` `{ "error": "Invalid content section" }`

---

## 5. Merge / overwrite 策略

| 类型 | Section keys | 策略 |
|------|--------------|------|
| **整数组覆盖** | `cases`, `services`, `certificates`, `featuredVideos` | incoming 数组完整替换（与 `useArraySectionEditor` 一致） |
| **对象 deep merge** | `profile`, `siteSettings`, `socialLinks`, `hero`, `seo`, … | 读当前 `data_json` + deep merge incoming，避免多页写同一 key 丢字段 |
| **meta** | `meta` | 任意 section 写入成功后自动更新 `meta.updatedAt`（对齐旧 JSON 文件行为） |

前台编辑器通常发送**完整 section**；对象型 section 仍采用 merge 作为安全网（如 Profile 页 vs 工作照页均写 `profile`）。

---

## 6. 请求 / 响应格式

### 请求

```http
PATCH /api/content/section/siteSettings
Cookie: yy_admin_session=...
Content-Type: application/json

{ "data": { ...完整或部分 siteSettings 对象... } }
```

### 成功 `200`

```json
{
  "ok": true,
  "sectionKey": "siteSettings",
  "data": { ...写入后的 section... },
  "updatedAt": "2026-08-10T14:00:00.000Z"
}
```

响应头：`X-Content-Write-Target: supabase`，`X-Content-Section: siteSettings`

### 错误

| 状态 | Body |
|------|------|
| 405 | `{ "error": "Method not allowed" }` |
| 401 | `{ "ok": false, "authenticated": false, "error": "Unauthorized", "message": "未登录或登录已过期" }` |
| 400 | `{ "error": "Invalid content section" }` 或 `{ "error": "Invalid request body" }` |
| 503 | `{ "error": "Content write unavailable", "source": "not_configured" \| "supabase_error" }` |

---

## 7. Admin session / Cookie

| 项 | 值 |
|----|-----|
| Cookie 名 | `yy_admin_session` |
| 算法 | HMAC-SHA256 签名 payload（与 Express `server/lib/auth.js` 一致） |
| Env | `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `ADMIN_SESSION_MAX_AGE` |

### 本阶段迁移的 admin API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 验证账号密码，Set-Cookie |
| GET | `/api/admin/me` | 验证 session |
| POST | `/api/admin/logout` | Clear-Cookie |

> **注意**：`vercel.json` 仍将 `/admin` 重定向到 Render；线上后台 UI 完整切到 Vercel 同域属 **8.7**。本阶段仅提供 API 能力。

---

## 8. 本阶段不做

- `POST /api/upload` → Supabase Storage（**8.6**）
- `/admin` 同域 SPA / 重定向修改
- 写 `media_assets`
- 写本地 `server/data/site-content.json`
- 改前台 / 后台 UI

---

## 9. 本地测试

```bash
npm run build

# 加载 .env.local 后
npx vercel dev
```

1. `GET /api/content` — 仍返回 16 sections，`cases.length === 7`
2. 无 Cookie `PATCH /api/content/section/siteSettings` → **401**
3. `POST /api/admin/login` → 带 Cookie PATCH 测试字段 → GET 验证 → PATCH 恢复

或直接 Node 调用 `writeContentSection()` helper（见 `api/_lib/contentWriter.js`）。

无 Supabase env 时：`GET /api/content` fallback 仍可用；`PATCH` 返回 **503** `not_configured`。

---

## 10. 线上测试

部署后在 Vercel 环境变量齐全的前提下：

1. `GET https://www.yuyakang.top/api/content?t=...`
2. 登录 admin（待 8.7 同域或手动带 Cookie 测试 PATCH）
3. 确认写入后 GET 能读到变更

---

## 11. 下一阶段：8.6

`POST /api/upload` → Supabase Storage，替换 Render 磁盘上传。

---

## 12. 文件

| 文件 | 作用 |
|------|------|
| `api/content/section/[key].js` | PATCH handler |
| `api/_lib/contentWriter.js` | Supabase upsert + meta touch |
| `api/_lib/contentSections.js` | 白名单 + merge + body 校验 |
| `api/_lib/adminAuth.js` | Session cookie（与 Express 兼容） |
| `api/admin/login.js` | 登录 |
| `api/admin/me.js` | 会话探测 |
| `api/admin/logout.js` | 登出 |
