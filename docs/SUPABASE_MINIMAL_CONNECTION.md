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

### 成功（Supabase 可连接）

```json
{
  "ok": true,
  "mode": "vercel-supabase",
  "runtime": "vercel-function",
  "supabase": "connected",
  "tables": {
    "site_content": true,
    "media_assets": true,
    "bookings": true
  },
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

`tables.*` 为 `false` 表示表不存在或不可读；**`bookings` 为 `false` 不会导致 `ok: false`**。

### 环境变量缺失

HTTP `503`

```json
{
  "ok": false,
  "mode": "vercel-supabase",
  "runtime": "vercel-function",
  "supabase": "not_configured",
  "missing": ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  "timestamp": "..."
}
```

### Supabase 连接失败

HTTP `503`

```json
{
  "ok": false,
  "mode": "vercel-supabase",
  "runtime": "vercel-function",
  "supabase": "error",
  "error": "简短错误信息",
  "timestamp": "..."
}
```

不返回密钥、连接串或完整堆栈。

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

## 8. 下一阶段：8.3 内容数据导入

1. 确认 `site_content`、`media_assets` 表就绪；若 `bookings` 为 `false`，先执行上文 bookings SQL。
2. 编写 `scripts/import-to-supabase.mjs`，将 `server/data/site-content.json`（或 example/mock）导入 `site_content`。
3. 实现 `GET /api/content` serverless，读 Supabase 组装 JSON，保留 mock fallback。
4. **仍不**改前台组件结构。

详见 [FREE_BACKEND_MIGRATION_ROADMAP.md](./FREE_BACKEND_MIGRATION_ROADMAP.md) § 8.3。
