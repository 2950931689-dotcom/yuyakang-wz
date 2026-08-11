# /admin 同域上线验收 Checklist

> **YU YAKANG AUDIO** · `https://www.yuyakang.top`  
> 前置：8.7.2 同域修复已 deploy；Vercel `VITE_API_URL` 已留空

---

## 路由与 API 基址

| # | 检查项 | 预期 |
|---|--------|------|
| 1 | 打开 `/admin/login` | **不跳转** `api.yuyakang.top`，显示登录页 |
| 2 | `GET /api/admin/me`（未登录） | JSON `{ authenticated: false }`，**非 HTML** |
| 3 | 登录成功 | 进入 `/admin` dashboard |
| 4 | 刷新 `/admin/cases` | 不 404，React 路由正常 |
| 5 | DevTools Network | 所有 API 为 `www.yuyakang.top/api/...`，无 `api.yuyakang.top` |

---

## 内容与保存

| # | 检查项 | 预期 |
|---|--------|------|
| 6 | `GET /api/content` | JSON，Header `X-Content-Source: supabase`（或 fallback） |
| 7 | PATCH `siteSettings` | 200，`{ ok: true, sectionKey, data }` |
| 8 | 案例保存 | `/admin/cases` 保存成功 |

---

## 上传与 Storage

| # | 检查项 | 预期 |
|---|--------|------|
| 9 | 后台上传小图（如 webp） | sign → Storage PUT → complete 全 2xx |
| 10 | public URL | 浏览器直接打开 Supabase public URL → **200** |
| 11 | `media_assets` | complete 后 DB 有新行 |
| 12 | 证书 / SEO / 音频上传 | 各类型 sign/complete 成功（按需抽测） |

---

## 素材库（8.7+ media API）

| # | 检查项 | 预期 |
|---|--------|------|
| 13 | `/admin/media` 列表 | `GET /api/media` → `{ ok: true, files: [...] }` |
| 14 | 删除测试素材 | `DELETE /api/media/:filename` → Storage 对象 + DB 行均删除 |
| 15 | Header | `X-Media-Source: supabase` |

**本地 smoke（需已登录 cookie 或 vercel dev）：**

```bash
# 列表（需 session cookie）
curl -sS -b "yy_admin_session=YOUR_TOKEN" https://www.yuyakang.top/api/media

# 删除（慎用，仅测试文件）
curl -sS -X DELETE -b "yy_admin_session=YOUR_TOKEN" \
  "https://www.yuyakang.top/api/media/test.webp"
```

---

## Known issues（本阶段可接受）

| 项 | 说明 |
|----|------|
| **预约 `/admin/bookings`** | Vercel 尚无 `/api/bookings` — 列表/更新失败；**不影响**登录、内容、上传、素材库主链路 |
| **前台预约表单** | `POST /api/bookings` 同域 404 直至 bookings 迁移（P1） |
| **旧 `/uploads/` 历史文件** | 未批量迁移 — 见后续 **9.0** |
| **Dashboard 预约计数** | 失败时静默为 0 |

---

## 环境变量（Vercel Production）

- [ ] `VITE_API_URL` **留空或未配置**
- [ ] `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` / `ADMIN_SESSION_SECRET` 已配置

---

## 回滚

1. 恢复 `vercel.json` admin redirect（仅紧急）
2. 恢复 `VITE_API_URL=https://api.yuyakang.top` + redeploy
3. Render 仍可用时可临时回退 API 子域

---

*8.7 同域验收 · 不含真实密钥*
