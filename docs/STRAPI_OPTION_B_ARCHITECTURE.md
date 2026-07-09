# Strapi 方案 B — 数据中心架构

> 轮次：6.0 · 状态：设计 / 本地 PoC  
> 适用项目：YU YAKANG AUDIO（余雅康 · 现场调音 / 系统工程 / 混音）

---

## 1. 方案 B 总架构

```text
┌─────────────────────────────────────────────────────────────────┐
│  前台 React SPA（Vercel）                                         │
│  · 调音台式展示 UI                                                │
│  · 只读 GET /api/content                                         │
│  · 公开 POST /api/bookings                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS（无 Strapi Token）
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express API / Adapter 层（Render）                               │
│  · requireAdminAuth 保护写入                                      │
│  · strapiClient → Strapi REST                                    │
│  · strapiAdapter → 归一化为 site-content 形状                     │
│  · GET /api/content 双源读取（Strapi 优先，JSON fallback）         │
└────────────────────────────┬────────────────────────────────────┘
                             │ STRAPI_API_TOKEN（仅服务端）
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Strapi CMS（Render / 后期独立服务）                              │
│  · 唯一数据源（Single Source of Truth）                           │
│  · Content Types + Media Library                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    Postgres + 对象存储（Cloudinary / S3 / OSS）

┌─────────────────────────────────────────────────────────────────┐
│  自制后台 /admin（Vercel 静态 → 重定向 api 子域）                  │
│  · 简化操作面板（Common Tools、Hero、Cases…）                      │
│  · PATCH /api/content/section/* → Express → Strapi               │
│  · 浏览器永远不持有 Strapi Token                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 为什么 Strapi 做数据中心

| 能力 | JSON CMS（当前） | Strapi（目标） |
|------|------------------|----------------|
| 结构化字段与关系 | 手工维护 JSON | Content-Type + Admin |
| 媒体管理 | `public/` + uploads 目录 | Media Library + 对象存储 |
| 权限与审计 | 自制 auth | Role / API Token |
| 多环境 | 文件复制 | API + DB 迁移 |
| 扩展 | 改 schema 脚本 | Admin UI 改模型 |

Strapi 作为**唯一数据源**，解决 JSON 文件难以版本化、难以协作、难以持久化（Render 免费盘）的问题。

---

## 3. 为什么自制后台继续保留

1. **品牌与 UX**：调音台风格 `/admin` 已是产品识别，不必换成 Strapi 默认 Admin 皮肤。
2. **低成本操作**：只暴露业务字段（Common Tools、Hero 文案），隐藏 Strapi 复杂配置。
3. **安全边界**：所有写入经 Express `requireAdminAuth`，Strapi Token 不进入浏览器。
4. **渐进迁移**：按模块试点（CommonTools → Contact → Cases），前台与 Adapter 保持稳定 contract。

Strapi Admin 保留给**超级管理员**（Content-Type 调整、批量导入、媒体整理）；日常编辑走自制后台。

---

## 4. Express Adapter 的作用

| 层 | 职责 |
|----|------|
| `strapiClient.js` | HTTP 客户端：base URL、Token、populate、超时、错误 |
| `strapiAdapter.js` | 将 Strapi 原始 JSON **normalize** 为当前 `site-content.json` 结构 |

**前台为什么不直接读 Strapi 原始结构：**

1. Strapi REST 响应含 `data.attributes`、media `formats` 等嵌套，与现有 `cmsBinding.js` / `content.js` 不兼容。
2. 双语字段在 JSON CMS 为 `{ cn, en }` 对象，Strapi 需统一映射策略。
3. 切换数据源时，Adapter 保证 **React 零改动或极少改动**。
4. Token 不能暴露给浏览器，必须由 Express 代理。

目标函数：`buildSiteContentFromStrapi()` 输出形状 ≈ 当前 `site-content.mock.json` 顶层 keys。

---

## 5. 为什么不能双主写入

**禁止：**

```text
/admin → JSON site-content.json   ❌
/admin → Strapi                   ❌
（两者同时作为主写入）
```

**允许（迁移期）：**

```text
写入：Express → Strapi only
读取：Strapi → Adapter → 前台；失败时 JSON fallback（只读）
JSON CMS：backup-only，不再 PATCH
```

双主写入会导致：前台读到 A、后台保存到 B、回滚不可预测。

---

## 6. 当前 JSON CMS 的位置

| 阶段 | `server/data/site-content.json` | Strapi |
|------|--------------------------------|--------|
| **6.0（本轮）** | 生产数据源 | 本地 PoC，不接生产 |
| **6.1–6.2** | 主写入 + 主读取 | Adapter 只读验证 |
| **6.3+** | fallback 只读 | 模块级主写入 |
| **6.9** | backup / 灾难恢复 | 唯一主数据源 |

`src/data/site-content.mock.json` 继续作为前端离线 fallback，不受 Strapi 影响。

---

## 7. 迁移阶段概览

详见 `docs/STRAPI_MIGRATION_ROADMAP.md`。

1. **6.0** — 本地 PoC + Content-Type 设计（本轮）
2. **6.1** — `strapiClient` / `strapiAdapter` 骨架
3. **6.2** — `GET /api/content` 双源（`STRAPI_ENABLED`）
4. **6.3–6.8** — 分模块写入 Strapi
5. **6.9** — JSON CMS backup-only

---

## 8. 安全原则

1. **`STRAPI_API_TOKEN` 仅存在于 Render Express 环境变量**，不入 `.env` 前端、不入 `VITE_*`。
2. 浏览器只调用 `/api/*`，不调用 `https://strapi.../api/*`。
3. Strapi Public 角色默认关闭写权限；写入用 **Full access API Token** 或 **Custom role** 限 Express IP（后期）。
4. Admin session cookie 与 Strapi Token 分离：用户登录的是 Express，不是 Strapi Admin。

---

## 9. 媒体原则

| 场景 | 存储 |
|------|------|
| Hero 成片、品牌静态图 | `public/` + Vercel（已实施 5.4） |
| 案例 gallery、证书、后台上传 | Strapi Media → **Cloudinary / S3 / 阿里云 OSS** |
| Render 免费盘 | **禁止**依赖本地 `uploads/` 持久化 |
| PoC 本地 | SQLite + `public/uploads` 仅开发 |

Adapter 将 Strapi media URL 转为前台可用的绝对或根路径 URL。

---

## 10. 环境变量（未来，本轮不启用）

```env
# Express / Render only — 不要加入 VITE_
STRAPI_ENABLED=false
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=
STRAPI_TIMEOUT_MS=5000
```

---

## 11. 风险摘要

| 风险 | 缓解 |
|------|------|
| Strapi 与 Node 22+ 兼容性 | PoC 使用 Node 18–22 LTS |
| Render 免费 Postgres 30 天过期 | 生产用付费 DB 或外部 Neon |
| Adapter 与 JSON 结构漂移 | 契约测试 + `cms-linkage-verify` |
| 迁移期数据不一致 | 单写入源 + 只读 fallback |
| 媒体丢失 | 对象存储，不用 Render 磁盘 |

---

## 12. PoC 位置

同级目录（**不进入主仓库**）：

```text
E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-strapi-poc
```

PoC 验证记录见 `docs/STRAPI_CONTENT_MODEL_PLAN.md` 末尾 PoC 章节。
