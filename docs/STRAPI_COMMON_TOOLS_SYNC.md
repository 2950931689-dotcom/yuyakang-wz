# Strapi CommonTools 同步 — Round 6.1

> 本轮仅打通 **CommonTools** 模块，其余内容仍来自 JSON CMS。

---

## 1. 范围

| 模块 | 读取 | 写入 |
|------|------|------|
| CommonTools | Strapi 优先（可 fallback JSON） | Strapi（需 `STRAPI_WRITE_ENABLED`） |
| Profile / Cases / … | JSON CMS | JSON CMS |

---

## 2. 读数据策略

```text
GET /api/content
  → read site-content.json（baseline）
  → if STRAPI_ENABLED=true:
       fetch Strapi /api/common-tools
       merge → siteSettings.commonTools
       filter enabled !== false
  → on Strapi error: warn + return JSON baseline
```

前台 `/contact` 仍通过 `getCommonTools(content)` 读取，**不直连 Strapi**。

---

## 3. 写数据策略

```text
/admin/common-tools 保存
  → if STRAPI_WRITE_ENABLED=true:
       PATCH /api/admin/common-tools (requireAdminAuth)
       → syncCommonToolsToStrapi()
  → else:
       PATCH /api/content/section/siteSettings（原 JSON CMS）
```

**同步策略（MVP）：**

| 操作 | Strapi 行为 |
|------|-------------|
| 新增 | `POST /api/common-tools` |
| 更新 | `PUT /api/common-tools/:documentId` |
| 后台删除 | `enabled=false`（软删除，不物理 delete） |

后台删除的项不会出现在 `GET /api/content`（仅返回 `enabled=true`），但 Strapi 库中仍保留记录。

---

## 4. JSON CMS Fallback

| 条件 | 行为 |
|------|------|
| `STRAPI_ENABLED=false` | 完全按原 JSON CMS |
| Strapi 宕机 / 超时 | `GET /api/content` 回退 JSON |
| `STRAPI_WRITE_ENABLED=false` | 读取可走 Strapi，写入仍走 JSON |

JSON 文件 **不会被删除**，也 **不会** 在 Strapi 写入模式下自动更新 CommonTools 字段。

---

## 5. 环境变量

在 `.env.local`（勿提交）：

```env
STRAPI_ENABLED=false
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=your-full-access-token
STRAPI_TIMEOUT_MS=5000
STRAPI_WRITE_ENABLED=false
```

| 变量 | 说明 |
|------|------|
| `STRAPI_ENABLED` | `true` 时 GET 合并 Strapi CommonTools |
| `STRAPI_WRITE_ENABLED` | `true` 时后台保存写 Strapi（需同时 enabled + token） |
| `STRAPI_API_TOKEN` | 仅 Express 使用，**不要** 加入 `VITE_*` |

### 创建 Strapi API Token

1. 打开 `http://localhost:1337/admin`
2. Settings → API Tokens → Create new API Token
3. Type: **Full access**（PoC）或 Custom（仅 common-tool CRUD）
4. 复制 token 到 `.env.local`

---

## 6. 启动顺序

**终端 1 — Strapi PoC：**

```powershell
cd "E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-strapi-poc"
npm run develop
```

**终端 2 — 主项目：**

```powershell
cd "E:\卓面应用\个人文件\Cursor\余\软件开发\yuyakang-audio-site"
# .env.local 配置 STRAPI_* 后
npm run dev
```

---

## 7. 验证

```powershell
npm run build
npm run test:smoke
node scripts/cms-linkage-verify.mjs
node scripts/strapi-common-tools-verify.mjs
```

### 人工验收

1. `STRAPI_ENABLED=false` → `/contact` 显示 JSON 工具；后台保存提示「已保存到 JSON CMS」
2. `STRAPI_ENABLED=true`, `WRITE=false` → `/contact` 显示 Strapi 数据；保存仍走 JSON
3. 两者 `true` + token → 后台新增工具 → 保存 → `/contact` 可见 → 删除 → 保存 → 恢复

---

## 8. 回滚

```env
STRAPI_ENABLED=false
STRAPI_WRITE_ENABLED=false
```

重启 Express 即可回到纯 JSON CMS，无需改代码。

---

## 9. 下一步

建议迁移顺序（见 `STRAPI_MIGRATION_ROADMAP.md`）：

1. **6.2** — 双源读取框架完善 + 健康检查
2. **SocialLinks** — Contact 页微信/抖音
3. **Certificates / WorkPhotos**
4. **Profile / Services / Cases**

---

## 10. 相关文件

| 文件 | 职责 |
|------|------|
| `server/lib/strapiClient.js` | Strapi REST 客户端 |
| `server/lib/strapiAdapter.js` | CommonTools normalize |
| `server/lib/strapiCommonToolsSync.js` | 写入同步 |
| `server/lib/siteContent.js` | GET /api/content 合并 |
| `PATCH /api/admin/common-tools` | 受保护写入 |
| `scripts/strapi-common-tools-verify.mjs` | 自动化验证 |
