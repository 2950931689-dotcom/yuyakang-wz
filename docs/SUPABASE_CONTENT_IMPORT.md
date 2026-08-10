# 8.3 Supabase Content Import

> **YU YAKANG AUDIO** — 将本地网站内容 JSON 导入 Supabase `site_content`  
> 前置：8.2 health 已 `supabase: "connected"`，表 `site_content` / `media_assets` / `bookings` 已存在  
> 本阶段：**仅导入脚本 + 文档**；不改前台读取、后台保存、上传逻辑

---

## 1. 本阶段目标

1. 审计本地内容数据源。
2. 提供 `scripts/import-to-supabase.mjs`：按顶层 section 拆行 upsert 到 `site_content`。
3. 默认 **dry-run**；显式 `--apply` 才写入。
4. **不**上传媒体到 Storage；**不**改 URL / slug / 字段结构。
5. **不**进入 8.4（`/api/content` 读 Supabase）。

---

## 2. 内容来源审计结果

| 路径 | 角色 | 备注 |
|------|------|------|
| `server/data/site-content.json` | **本地 Express CMS 运行时数据** | `.gitignore`；含后台保存后的真实内容；约 56KB；7 个案例；含 `homeSections` |
| `src/data/site-content.mock.json` | 前台 mock / API 不可用时的 fallback | 约 64KB；结构与 example 一致 |
| `server/data/site-content.example.json` | 仓库内示例 | 与 mock 同级完整度 |
| `src/lib/contentDefaults.js` | 结构兜底 / merge | **不可**当作导入真实内容 |
| `server/data/bookings.json` | 本地预约记录 | 本阶段**只审计、不导入** `bookings` 表 |

### 最终默认数据源

**`server/data/site-content.json`**（若文件存在）

理由：这是本地 CMS 实际读写的内容文件，最接近当前站点运营数据。  
若不存在（例如全新 clone），脚本自动回退到 `src/data/site-content.mock.json`，再回退 `server/data/site-content.example.json`。

可用 `--source` 显式指定。

---

## 3. `site_content` 导入策略

表结构：

| 列 | 说明 |
|----|------|
| `key` | 顶层 section 名（PK） |
| `data_json` | 该 section 的 JSON（不改结构） |
| `description` | `Imported from <sourcePath>` |
| `updated_at` | 导入时间 UTC |

将源 JSON **按顶层 key 拆成多行** upsert（`onConflict: key`）。

当前 `server/data/site-content.json` 顶层 key 示例：

```text
meta, siteSettings, profile, hero, certificates, services, cases,
seo, socialLinks, featuredVideos, tutorialSection, i18n,
location, serviceArea, display, homeSections
```

规则：

1. 不创造源文件中不存在的 section。  
2. 不重命名字段、不改 slug、不改图片/音频 URL。  
3. 不上传 Storage（images / audio / videos buckets 本阶段不动）。  
4. `bookings.json` 不写入 `bookings` 表（留给后续阶段，避免误导预约数据）。

---

## 4. 用法

### dry-run（默认，不写库）

```bash
node scripts/import-to-supabase.mjs --dry-run
# 或
npm run supabase:import:dry-run
```

指定源：

```bash
node scripts/import-to-supabase.mjs --dry-run --source server/data/site-content.json
```

dry-run **不要求** Supabase env（只读本地 JSON、打印计划）。

### apply（真正写入）

```bash
# 先在 .env.local 配置 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY（勿提交）
node scripts/import-to-supabase.mjs --apply
# 或
npm run supabase:import:apply
```

apply 前会写入本地备份：

```text
scripts/output/supabase-import-backup-YYYYMMDD-HHMMSS.json
```

备份含 `sourcePath`、`importedAt`、`sectionKeys`、`sections`、`rowCount`。  
**不要把备份文件和真实 key 提交到 Git。**

---

## 5. 本地环境变量

仅服务端 / 脚本使用（**禁止 `VITE_` 前缀**）：

| 变量 | 用途 |
|------|------|
| `SUPABASE_URL` | 新项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service role（仅本机 `.env.local` / Vercel） |

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

- 复制自 `.env.example`；真实值只放 `.env.local`。  
- **不要提交 `.env.local`。**  
- **不要把 service role key 写进文档、脚本或 commit。**

---

## 6. package.json scripts

```json
"supabase:import:dry-run": "node scripts/import-to-supabase.mjs --dry-run",
"supabase:import:apply": "node scripts/import-to-supabase.mjs --apply"
```

- **不会**在 `build` / `postinstall` / `dev` / Vercel 部署时自动执行。

---

## 7. 本阶段明确不做

1. 不改前台读取逻辑（仍走现有 Express / mock）。  
2. 不改后台保存逻辑。  
3. 不改上传逻辑。  
4. 不实现 `/api/content` 读 Supabase（那是 **8.4**）。  
5. 不 push / 不 tag（除非另有指令）。

---

## 8. apply 成功后如何在 Supabase 检查

1. 打开 Supabase Dashboard → **Table Editor** → `site_content`。  
2. 确认行数 ≈ dry-run 的 `planned rows`。  
3. 抽查 `key = cases` / `hero` / `siteSettings` 的 `data_json`。  
4. 确认 `description` 含 `Imported from ...`。  
5. Storage buckets 仍为空或未变（本阶段未上传文件）。

---

## 9. 下一阶段

1. **8.4** — `GET /api/content` 从 Supabase 组装 JSON（见 [SUPABASE_CONTENT_API.md](./SUPABASE_CONTENT_API.md)）
2. **8.5** — 后台 PATCH 写 Supabase

详见 [FREE_BACKEND_MIGRATION_ROADMAP.md](./FREE_BACKEND_MIGRATION_ROADMAP.md)。
