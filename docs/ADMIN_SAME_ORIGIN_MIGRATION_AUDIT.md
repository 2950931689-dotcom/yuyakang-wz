# 8.7.1 /admin 同域迁移审计

> **YU YAKANG AUDIO**  
> 阶段：**仅审计**（8.7.1）— 不改 `vercel.json`、`src/`、`server/`  
> 目标：`https://www.yuyakang.top/admin/*` + `/api/*` 同域，去掉 Render / `api.yuyakang.top` 运行时依赖

---

## 1. 审计结论（Executive Summary）

| 项 | 状态 |
|----|------|
| **根因 #1** | `vercel.json` **redirect** 把 `/admin/*` → `https://api.yuyakang.top/admin/*` |
| **根因 #2** | 生产 `VITE_API_URL=https://api.yuyakang.top` 时，**非 /admin 页面**仍请求旧 API 域 |
| SPA `/admin` 路由 | ✅ 已在 `src/app/router.jsx`，与前台共用 `dist/index.html` |
| `/api/*` rewrite | ✅ 现有 SPA fallback **已排除** `api/`，不会把 API 当 HTML |
| 8.5–8.6 API | ✅ 已在 Vercel `api/` 函数，www 上 `/api/admin/*`、`/api/content`、`/api/upload/*` 已验证 |
| **阻塞** | 用户访问 `www.yuyakang.top/admin/login` 会先 **307 到 Render**，无法在同域加载后台 SPA |

**最小修复（8.7.2）：** 删除 `vercel.json` 的 admin redirect；生产 `resolveApiBase()` 强制同域 `""`；Vercel 清空 `VITE_API_URL`。

---

## 2. vercel.json 审计

当前 [`vercel.json`](../vercel.json)：

```json
{
  "rewrites": [
    {
      "source": "/((?!api/)(?!.*\\..*).*)",
      "destination": "/index.html"
    }
  ],
  "redirects": [
    {
      "source": "/admin/:path*",
      "destination": "https://api.yuyakang.top/admin/:path*",
      "permanent": false
    }
  ]
}
```

### 2.1 redirects

| 检查项 | 结果 |
|--------|------|
| `/admin` 是否指向 `api.yuyakang.top` | **是** — 307/308 到 Render |
| 是否影响 `/api` | **否** — redirect 仅匹配 `/admin/:path*` |
| 与目标架构冲突 | **严重** — 阻止 www 同域后台 |

Vercel 处理顺序：**redirects 优先于 rewrites**。因此 `/admin/login` **永远不会**落到 SPA rewrite。

### 2.2 rewrites

| 路径 | 预期 | 实际（redirect 移除后） |
|------|------|-------------------------|
| `/` | `index.html` | ✅ |
| `/cases/foo` | `index.html` | ✅ |
| `/admin/login` | `index.html` → React Router | ✅（移除 redirect 后） |
| `/admin` | `index.html` | ✅ |
| `/api/content` | Vercel Function | ✅ `(?!api/)` 排除 |
| `/api/admin/me` | Vercel Function | ✅ |
| `/assets/*.js` | 静态文件 | ✅ `(?!.*\\..*)` 排除带点路径 |

**结论：** rewrite 规则**已满足**同域 SPA + API；**唯一必须删的是 admin redirect**。

### 2.3 是否把 `/api` 指向外部

**否** — 无 external rewrite；`/api/*` 由 Vercel `api/` 目录 Serverless 处理。

---

## 3. /admin 路由审计

### 3.1 定义位置

[`src/app/router.jsx`](../src/app/router.jsx)：

```text
/admin/login          → AdminLoginPage（公开）
/admin/*              → AdminProtectedRoute → AdminLayout → 各 CMS 页
```

与前台路由在**同一** `BrowserRouter`、同一 `dist` 构建产物内。

### 3.2 登录 / 鉴权

| 组件 | 行为 |
|------|------|
| [`AdminAuthProvider`](../src/context/AdminAuthContext.jsx) | `checkHealth` + `adminMe`；无硬编码域名 |
| [`AdminLoginPage`](../src/pages/admin/AdminLoginPage.jsx) | 成功后 `navigate("/admin")`；无外部 URL |
| [`AdminProtectedRoute`](../src/components/admin/AdminProtectedRoute.jsx) | 未登录 → `/admin/login` |
| [`AdminLayout` / Sidebar](../src/components/admin/AdminSidebar.jsx) | logout → `/admin/login` |

**无** `api.yuyakang.top` 硬编码于 `src/`。

### 3.3 生产禁用 /admin？

**无** — 仅 Vercel redirect 导致用户「看起来」只能去 api 子域。

### 3.4 刷新 /admin/cases 是否会 404？

- **当前（有 redirect）：** 浏览器被送到 `api.yuyakang.top` — 取决于 Render 是否存活  
- **修复后：** Vercel rewrite → `index.html` → React Router ✅

---

## 4. /api 路由审计

### 4.1 已迁移至 Vercel 的 API

| 路径 | 文件 |
|------|------|
| `GET /api/health` | `api/health.js` |
| `GET /api/content` | `api/content.js` |
| `PATCH /api/content/section/:key` | `api/content/section/[key].js` |
| `POST /api/admin/login` | `api/admin/login.js` |
| `GET /api/admin/me` | `api/admin/me.js` |
| `POST /api/admin/logout` | `api/admin/logout.js` |
| `POST /api/upload/sign` | `api/upload/sign.js` |
| `POST /api/upload/complete` | `api/upload/complete.js` |

### 4.2 仍在 Express / Render 的 API（同域后可能 404）

| 路径 | 说明 |
|------|------|
| `POST /api/upload`（multipart 旧） | 已被 signed upload 替代 |
| `GET /api/media` | Admin 媒体库列表 — **8.7+ 待迁** |
| `DELETE /api/media/:filename` | 媒体软删 — **待迁** |
| `GET/POST/PATCH /api/bookings` | 预约 CRUD — **待迁** |
| `PATCH /api/admin/common-tools` | Strapi（默认关闭） |

**影响：** 同域后 `/admin/bookings`、媒体库 trash 等仍可能失败，**不影响** login / content / upload 主链路。

---

## 5. src/lib/api.js — API base 审计

[`resolveApiBase()`](../src/lib/api.js) 逻辑（生产）：

```javascript
if (window.location.pathname.startsWith("/admin")) {
  return "";  // 同域相对路径
}
if (envBase && window.location.origin === envBase) {
  return "";
}
return envBase;  // 可能为 https://api.yuyakang.top
```

| 场景 | `API_URL` | 请求目标 |
|------|-----------|----------|
| 生产 `/admin/*` | `""` | ✅ `www.yuyakang.top/api/...` |
| 生产 `www` 首页，`VITE_API_URL` 空 | `""` | ✅ 同域 |
| 生产 `www` 首页，`VITE_API_URL=api.yuyakang.top` | **旧 API 域** | ❌ 跨域 Render |
| DEV + Vite proxy | `http://localhost:3001` 或空 | 本地 Express |

### 5.1 各 API 是否走同域（admin 页内）

在 `/admin/*` 下（redirect 移除后）：

| 调用 | 路径 | 同域 |
|------|------|------|
| login / me / logout | `/api/admin/*` | ✅ |
| fetchContent（reload） | `/api/content` | ✅ |
| saveContentSection | `/api/content/section/:key` | ✅ |
| uploadFile sign/complete | `/api/upload/sign|complete` | ✅ |
| Storage PUT | `*.supabase.co` | ✅ 直传（预期） |

### 5.2 resolveUploadUrl

```javascript
if (url.startsWith("http://") || url.startsWith("https://")) return url;
if (url.startsWith("/uploads/")) return API_URL ? `${API_URL}${url}` : url;
```

- Supabase `https://` URL：**原样返回** ✅  
- 旧 `/uploads/`：admin 页 `API_URL=""` → 相对 `/uploads/...`（Vercel 无静态 uploads，历史内容需迁移或保留 Render 只读 — **非 8.7.1 范围**）

---

## 6. api.yuyakang.top / Render 依赖搜索

### 6.1 运行时关键（P0）

| 位置 | 依赖 |
|------|------|
| **`vercel.json`** | redirect `/admin` → `api.yuyakang.top` |
| **Vercel 构建 env** | `VITE_API_URL=https://api.yuyakang.top`（若仍配置） |
| **`src/lib/api.js`** | 非 admin 页可能用 `envBase` |

### 6.2 非运行时（文档 / 脚本 / 本地）

| 位置 | 说明 |
|------|------|
| `docs/DEPLOY_VERCEL_RENDER_FREE.md` | 旧双域架构说明 |
| `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` | 仍写 api 子域后台 |
| `scripts/production-check.mjs` | 默认 `PROD_API_URL=api.yuyakang.top` |
| `render.yaml` | Render 部署（保留作回滚，不删） |
| `server/index.js` | 本地 / Render Express（不删） |

### 6.3 src/ 内搜索结果

- **无** `api.yuyakang.top` 字符串  
- **无** `window.location` 指向外部 API（仅 `/admin/login` 相对跳转）

---

## 7. VITE_API_URL 风险判断

| 问题 | 结论 |
|------|------|
| 生产是否还需要？ | **不需要**（同域 `/api`） |
| 若仍为 `api.yuyakang.top` | 前台 `fetchContent` 等会打到 Render，与 Supabase Vercel API **分叉** |
| 若设为 `https://www.yuyakang.top` | 与 `origin === envBase` 时得 `""`，可工作但冗余 |
| **推荐** | Vercel **删除或留空** `VITE_API_URL`；`api.js` 生产强制 `""` 双保险 |

---

## 8. 当前线上 /admin 为何可能打不开

1. 用户打开 `https://www.yuyakang.top/admin/login`  
2. Vercel **redirect** → `https://api.yuyakang.top/admin/login`  
3. Render 已弃用 / 500 / 绑卡问题 → **后台不可用**  
4. 即使用户在 api 子域登录，Cookie 在 `api.yuyakang.top`，与 www **不同源**，前台 www 上的 session 不共享  

即使 Vercel API 已全部就绪，**redirect 一条即可让整个 www/admin 入口失效**。

---

## 9. 最小修复方案（8.7.2）

### 9.1 必改（P0）

| # | 文件 / 配置 | 改动 |
|---|-------------|------|
| 1 | **`vercel.json`** | **删除**整个 `redirects` 数组（或仅删 `/admin` 那条） |
| 2 | **`src/lib/api.js`** | 生产环境 `resolveApiBase()` → 始终返回 `""`（保留 DEV 用 `VITE_API_URL` 连本地 Express） |
| 3 | **Vercel Dashboard** | 删除或清空 **`VITE_API_URL`**（避免构建嵌入旧域） |

### 9.2 建议改（P1，非阻塞）

| # | 文件 | 改动 |
|---|------|------|
| 4 | `.env.example` | 注明生产 Vercel 留空 `VITE_API_URL` |
| 5 | `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` 等 | 更新后台入口为 www（8.7.2 或单独 docs commit） |

### 9.3 不需要改

| 项 | 原因 |
|----|------|
| `src/app/router.jsx` | 路由已完整 |
| Admin 页面 / 组件 UI | 无硬编码 API 域 |
| `HeroVideoCarousel` / 案例 UI | 无 admin 依赖 |
| Supabase / upload 逻辑 | 已同域可用 |
| `server/index.js` | 保留本地 dev + 紧急回滚 |
| `render.yaml` | 标记弃用即可，不删 |

---

## 10. Cookie / Session 同域

| 项 | 修复后 |
|----|--------|
| 登录 POST | `www.yuyakang.top/api/admin/login` |
| Set-Cookie | `Path=/`, `SameSite=Lax`, prod `Secure` |
| 后续 PATCH / upload sign | 同域 `credentials: include` ✅ |
| 旧 api 子域 Cookie | 不迁移；用户需 **重新登录** www |

---

## 11. 测试方案

### 11.1 本地（8.7.2 后）

```bash
npm run build
# 确认 dist/index.html 存在
npx vercel dev
# http://localhost:3000/admin/login
# http://localhost:3000/api/admin/me
```

### 11.2 线上验收

| # | 检查 |
|---|------|
| 1 | `https://www.yuyakang.top/admin/login` **不跳转** api 子域，显示登录页 |
| 2 | `https://www.yuyakang.top/api/admin/me` → JSON（非 HTML） |
| 3 | 登录成功 → `/admin` dashboard |
| 4 | Network：API 均为 `www.yuyakang.top/api/...`，**无** `api.yuyakang.top` |
| 5 | PATCH section、upload sign/complete 仍成功 |
| 6 | 刷新 `/admin/cases` 不 404 |
| 7 | 前台 `/` content 仍来自同域 `/api/content` |

### 11.3 build（8.7.1）

**未执行**（仅文档审计）。

---

## 12. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 去掉 redirect 后 `/admin` 白屏 | 确认 rewrite 存在；build 含 admin 路由 |
| `/api` 返回 HTML | 已有 `(?!api/)`；部署后 curl 验证 |
| `VITE_API_URL` 未清 | 与 `api.js` 强制同域双保险 |
| bookings/media API 404 | 文档已知；8.7 后续迁或临时禁用菜单 |
| 回滚 | 恢复 `vercel.json` redirect + 恢复 `VITE_API_URL` +  redeploy |

---

## 13. 与路线图关系

| 阶段 | 内容 |
|------|------|
| **8.7.1** | 本文档 ✅ |
| **8.7.2** | 删 redirect + `api.js` 同域 + Vercel env |
| **8.7.3+** | bookings / media API 迁 Supabase；更新部署文档 |

---

*8.7.1 · 仅审计 · 无代码变更*
