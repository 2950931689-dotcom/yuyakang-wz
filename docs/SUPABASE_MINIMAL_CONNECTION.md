# 8.2 Supabase Minimal Connection

> **YU YAKANG AUDIO** — Supabase 最小接入 + `/api/health`  
> 前置：`aa338bb` — Free Backend Migration Audit  
> 阶段：**仅 health 检查**，不做内容迁移、后台保存、上传迁移

---

## 1. 本阶段新增内容

| 文件 | 说明 |
|------|------|
| `api/_lib/supabaseServer.js` | 服务端 Supabase admin client（service role） |
| `api/health.js` | Vercel Serverless `GET /api/health` |
| `vercel.json` | SPA rewrite 排除 `/api/*`，避免命中 `index.html` |
| `.env.example` | 补充 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` |
| `package.json` | 新增依赖 `@supabase/supabase-js` |

**未改动：** 前台页面、后台页面、Hero、案例、混音播放器、Express `server/`、`render.yaml`。

---

## 2. Vercel 环境变量

在 **Vercel Dashboard → Project → Settings → Environment Variables** 配置（Production / Preview 均需）：

| 变量 | 作用 | 前缀限制 |
|------|------|----------|
| `SUPABASE_URL` | Supabase 项目 URL | **禁止 `VITE_`** |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端读写 DB/Storage | **禁止 `VITE_`** |
| `ADMIN_USERNAME` | 后台登录（后续阶段） | 已有 |
| `ADMIN_PASSWORD_HASH` | 后台密码 hash | 已有 |
| `ADMIN_SESSION_SECRET` | Session HMAC | 已有 |

可选（Express 本地 / Render 遗留）：

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 前台构建时 API 基址；同域迁移后可留空 |
| `ADMIN_SESSION_MAX_AGE` | Session 有效期 ms |

**切勿**将 `SUPABASE_SERVICE_ROLE_KEY` 加入 `VITE_` 或提交到 Git。

---

## 3. 本地 `.env.local` 填写方式

复制 `.env.example` 为 `.env.local`（已在 `.gitignore`，勿提交）：

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...
ADMIN_SESSION_SECRET=...
```

- 从 Supabase Dashboard → **Settings → API** 获取 URL 与 **service_role** key（非 anon key）。
- 本地测试 Vercel Function 需安装 Vercel CLI 并运行 `vercel dev`（见下文）。
- `npm run dev` 仅启动 Vite + Express，**不会**挂载 `api/health.js`。

---

## 4. `/api/health` 返回说明

**仅支持 `GET`**，其他方法返回 `405`。

所有响应均含 `diagnostics`（安全元数据，**不含密钥**）：

| 字段 | 说明 |
|------|------|
| `hasSupabaseUrl` | 是否配置了 URL |
| `hasServiceRoleKey` | 是否配置了 service role key |
| `supabaseHost` | URL 的 hostname（如 `xxx.supabase.co`） |
| `urlLooksValid` | URL 能否被解析 |
| `urlProtocol` | 如 `https:` |
| `urlHasPath` | URL 是否带多余 path（应为 `false`） |
| `serviceRoleKeyLooksLikeJwt` | key 是否符合 JWT 三段式 |
| `serviceRoleKeyLength` | key 字符长度（非内容） |
| `nodeEnv` | `process.env.NODE_ENV` 或 `null` |

### 成功（Supabase SDK 可连接）

HTTP `200`

```json
{
  "ok": true,
  "mode": "vercel-supabase",
  "runtime": "vercel-function",
  "supabase": "connected",
  "directFetchCheck": {
    "attempted": true,
    "urlHost": "xxx.supabase.co",
    "path": "/rest/v1/",
    "status": 401,
    "reachable": true,
    "shortMessage": "No API key found in request"
  },
  "sdkCheck": { "attempted": true, "success": true },
  "tables": {
    "site_content": true,
    "media_assets": true,
    "bookings": false
  },
  "tableErrors": {
    "bookings": "relation does not exist"
  },
  "diagnostics": { "...": "见上表" },
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

- `tables.*` 为 `false` 表示表不存在或不可读；**表缺失仍返回 `supabase: "connected"`**。
- **`bookings` 为 `false` 不导致 `ok: false`**。
- `tableErrors` 仅在存在表级问题时出现。

### 网络诊断：`directFetchCheck`（无 key）

- 直接 `GET ${SUPABASE_URL}/rest/v1/`，**不带** Authorization / apikey / service role。
- 用于判断 **Vercel Function 能否连到 Supabase host**。
- 常见可达结果：`status: 401`，`reachable: true`，`shortMessage: "No API key found in request"`（与浏览器打开 Data API 一致）。
- `shortMessage` 最多约 120 字符，已脱敏；**不返回完整响应体**。
- 若 `reachable: false` → `supabase: "network_error"`。

### SDK 诊断：`sdkCheck`

- 使用 service role 的 Supabase JS client 做只读探测。
- 与 `directFetchCheck` **相互独立**：SDK 失败不影响 directFetch 结果。
- 若 host 可达但 SDK 失败 → `supabase: "sdk_error"`，同时返回两者。
- 可含安全的 `causeName` / `causeCode` / `causeMessage`（如 `ECONNRESET`），不含 stack。

### 环境变量缺失

HTTP `503` — `supabase: "not_configured"`

```json
{
  "missing": ["SUPABASE_URL"]
}
```

或 `["SUPABASE_SERVICE_ROLE_KEY"]`，或两者兼有。

### URL / Key 格式错误

HTTP `503`

| `supabase` | `error` 示例 | 如何判断 |
|------------|--------------|----------|
| `invalid_url` | `Invalid SUPABASE_URL` | URL 无法解析 |
| `invalid_url` | `SUPABASE_URL must start with https://` | 协议不是 https |
| `invalid_url` | `SUPABASE_URL host does not look like a Supabase project host` | host 不以 `.supabase.co` 结尾 |
| `invalid_url` | `SUPABASE_URL should not include a path` | 含 `/rest/v1/` 等 path / query / hash |
| `invalid_key_shape` | `SUPABASE_SERVICE_ROLE_KEY does not look like a JWT` | 非字符串、长度过短、或不是两段点号的 JWT 形状（**不 decode payload**） |

对应 `diagnostics`：path 错误时 `urlHasPath: true` 且 `urlLooksValid: false`。

### Supabase 已连接但表缺失

HTTP `200` — `supabase: "connected"`，`ok: true`

- `tables.site_content` / `media_assets` / `bookings` 各自独立为 `true`/`false`
- 缺失表写入 `tableErrors`，例如 `"relation does not exist"` 或 `"permission denied"`
- **不要把表缺失当成 fetch failed / network_error**
- **`bookings: false` 不阻塞本阶段**（仍可 `ok: true`）

### 网络失败 / SDK 失败

| `supabase` | 含义 | HTTP |
|------------|------|------|
| `network_error` | `directFetchCheck.reachable === false` | 503 |
| `sdk_error` | host 可达，但 SDK 查询失败 | 503 |

```json
{
  "ok": false,
  "supabase": "sdk_error",
  "directFetchCheck": { "reachable": true, "status": 401 },
  "sdkCheck": { "success": false, "errorMessage": "fetch failed" }
}
```

**禁止返回：** 密钥原文、密钥前后缀、Authorization / apikey header、完整 env、完整 stack、JWT payload、完整响应体。

**只有 `supabase: "connected"`（且核心表就绪）后才进入 8.3 内容导入。**
---

## 5. 数据表检查方式

health 对每个表执行只读探测：`SELECT` + `head: true`（不写数据）。

| 表 | 预期 | health 行为 |
|----|------|-------------|
| `site_content` | 8.2 前应已创建 | 存在 → `true`；缺失 → `false` |
| `media_assets` | 8.2 前应已创建 | 同上 |
| `bookings` | 可能尚未创建 | 缺失 → `false`，**health 仍可为 `ok: true`** |

### 参考 SQL（在 Supabase SQL Editor 手动执行，勿自动写生产数据）

**site_content**

```sql
create table if not exists public.site_content (
  key text primary key,
  data_json jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
```

**media_assets**

```sql
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  url text,
  thumbnail_url text,
  bucket text,
  path text,
  mime_type text,
  size bigint,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;
```

**bookings**（8.3 前建议补建）

```sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  city text,
  service text,
  message text,
  status text not null default 'pending',
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
```

写入由 Vercel API 使用 **service role** 完成；RLS 可先开启并拒绝 anon 写。

---

## 6. 本地测试 `/api/health`

| 方式 | 命令 | 说明 |
|------|------|------|
| Vercel CLI | `npx vercel dev` | 需 `.env.local` 含 Supabase 变量；访问 `http://localhost:3000/api/health` |
| 生产/Preview | Vercel 部署后 | `https://www.yuyakang.top/api/health`（8.2 合并并部署后） |
| `npm run dev` | 不适用 | 走 Vite + Express，不含 `api/health.js` |

---

## 7. 安全要点

1. `api/_lib/supabaseServer.js` **不得**被 `src/` 引用。
2. `SUPABASE_SERVICE_ROLE_KEY` 仅 Vercel 运行时 env。
3. 构建产物 `dist/` 中不应出现 `SUPABASE_SERVICE_ROLE_KEY` 字符串。
4. `.env.local` 已在 `.gitignore`。

---

## 8. 下一步（部署后复测，再决定是否进 8.3 / 8.4）

1. 将含 diagnostics 的 commit **push 到 master**（需你明确指令；本阶段默认不 push）。
2. 等待 Vercel 自动部署。
3. 重新打开 `https://www.yuyakang.top/api/health`。
4. 根据返回判断：
   - `not_configured` → 补 Vercel 环境变量
   - `invalid_url` / `invalid_key_shape` → 修正 URL 或 service role key 格式（URL 不要带 `/rest/v1/`）
   - `connected` + 某表 `false` → 在 SQL Editor 建表（bookings false 可暂缓）
   - `error` / `network_error` / `sdk_error` → 查网络 / 密钥 / 项目状态
5. **确认 `supabase: "connected"` 且 `site_content` 可读后**，进入 **8.3 内容导入**：
   - 文档：[SUPABASE_CONTENT_IMPORT.md](./SUPABASE_CONTENT_IMPORT.md)
   - 脚本：`npm run supabase:import:dry-run` → 确认后再 `--apply`
6. 导入验证通过后再进入 **8.4**（`/api/content` 读 Supabase）。

详见 [FREE_BACKEND_MIGRATION_ROADMAP.md](./FREE_BACKEND_MIGRATION_ROADMAP.md) § 8.3–8.4。
