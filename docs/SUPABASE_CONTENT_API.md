# 8.4 Supabase Content API — GET /api/content

> **YU YAKANG AUDIO**  
> 前置：8.3 已将内容导入 `site_content`（16 rows）  
> 本阶段：**Vercel Serverless 读 Supabase 组装 content JSON**；不改前台、不改后台保存、不改上传

---

## 1. 本阶段目标

实现 `GET /api/content`：

1. 优先从 Supabase `public.site_content` 读取 `key` + `data_json`。
2. 组装为与旧 Express 相同的**完整 content 对象**（顶层 section 键）。
3. Supabase 不可用 → 安全 fallback 本地 JSON，避免前台黑屏。
4. **不**写入 Supabase；**不**改 `src/`（除非极小兼容，本阶段未改）。

---

## 2. 数据链路

```text
Browser GET /api/content
  → Vercel api/content.js
  → contentReader.loadSiteContent()
       ├─ readContentFromSupabase()  [优先]
       │    select key, data_json from site_content
       │    content[key] = data_json
       └─ loadFallbackContent()      [失败时]
            server/data/site-content.json → mock → example
  → res.json(content)   // 与 Express 相同，无 { data } 包装
```

响应头（成功）：

| Header | 值 |
|--------|-----|
| `Content-Type` | `application/json; charset=utf-8` |
| `Cache-Control` | `no-store` |
| `X-Content-Source` | `supabase` \| `fallback` |
| `X-Content-Sections` | 如 `16` |

---

## 3. 旧格式审计结论

| 项 | 结论 |
|----|------|
| Express `GET /api/content` | `res.json(content)` — **直接返回完整对象** |
| 前台 `fetchContent()` | `request("/api/content")` → 解析 JSON 为 content |
| `normalizeContent()` | **在前端** `getContent()` 内对 API 结果 merge mock 默认值 |
| API 失败 | `getContent()` catch → `normalizeContent(mockData)`；ContentContext 二次 fallback |
| 有效 payload | 需 `cases[]`、`siteSettings.siteName` 等（见 `isValidSiteContent`） |

**因此新 API 必须返回与 Express 相同的顶层 shape，不要包一层 `{ content: ... }`。**

---

## 4. site_content 组装策略

```js
// 每行: { key: "hero", data_json: { ... } }
content[row.key] = row.data_json;
```

导入阶段（8.3）已写入 16 keys：`meta`, `siteSettings`, `hero`, `cases`, …  
组装后 `cases.length === 7`（与本地 CMS 一致）。

---

## 5. Fallback 策略

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | Supabase | env 齐全且查询成功 + 通过 `isValidSiteContent` |
| 2 | `server/data/site-content.json` | 本地 CMS（Vercel 上通常不存在，gitignore） |
| 3 | `src/data/site-content.mock.json` | 仓库内 mock，**Vercel 生产 fallback 主力** |
| 4 | `server/data/site-content.example.json` | 最后兜底 |

均失败 → `503`：

```json
{ "error": "Content source unavailable", "source": "not_configured" | "supabase_error" | "error" }
```

不返回 HTML；错误不含 stack / 密钥。

---

## 6. 本阶段不做

- 后台 PATCH/PUT 写 Supabase（**8.5**）
- Storage 媒体上传
- `/admin` 同域迁移
- 改 Hero / 案例 UI / 混音播放器

---

## 7. 本地测试

### 无 Supabase env（fallback）

```bash
# 临时清 env 或在不配置 .env.local 的环境
node --input-type=module -e "
import { loadSiteContent } from './api/_lib/contentReader.js';
const r = await loadSiteContent();
console.log(r.source, r.sectionCount, r.content?.cases?.length);
"
```

应得到 `fallback`，`cases.length === 7`。

### 有 Supabase env

`.env.local` 配置 `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`（勿提交）。

```bash
npx vercel dev
# 访问 http://localhost:3000/api/content
# 检查 X-Content-Source: supabase
```

或 Node 直接测 reader（需自行 load `.env.local`）。

### build

```bash
npm run build
```

---

## 8. 线上测试

push + Vercel 部署后：

```text
https://www.yuyakang.top/api/content?t=1735689600
```

检查：

1. JSON 非 HTML  
2. 含 `cases`, `hero`, `siteSettings`, `homeSections`  
3. `cases.length === 7`  
4. 响应头 `X-Content-Source: supabase`（env 正确时）

---

## 9. 下一阶段：8.5

`PATCH /api/content/section/:key` 写回 Supabase `site_content`，替换 Express 保存路径。

详见 [FREE_BACKEND_MIGRATION_ROADMAP.md](./FREE_BACKEND_MIGRATION_ROADMAP.md)。

---

## 10. 文件

| 文件 | 作用 |
|------|------|
| `api/content.js` | Vercel GET handler |
| `api/_lib/contentReader.js` | Supabase 读取 + 组装 + 编排 |
| `api/_lib/contentFallback.js` | 本地 JSON fallback |
| `api/_lib/supabaseServer.js` | 已有 admin client（复用） |

**不得**被 `src/` import；service role 仅服务端 runtime。
