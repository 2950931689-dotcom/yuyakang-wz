# Production Deployment Checklist — YU YAKANG AUDIO

> Round 6.4 · Vercel 前台 + Render API · 域名 yuyakang.top

## 架构

```text
www.yuyakang.top / yuyakang.top  →  Vercel（React 静态前台）
api.yuyakang.top                 →  Render（Express API + /admin 后台）
```

- 内容编辑：https://api.yuyakang.top/admin/login
- `www.yuyakang.top/admin` → 重定向到 api 子域（见 `vercel.json`）

---

## 1. Vercel 前台检查

| # | 检查项 | 期望 |
|---|--------|------|
| 1 | 已部署最新 `master` | 含 6.2 / 6.3 移动端 CSS |
| 2 | `VITE_API_URL` | `https://api.yuyakang.top` |
| 3 | 首页 `/` | 200，Hero 视频可播 |
| 4 | SPA 深链 `/about` `/cases` `/contact` | 200（rewrite → index.html） |
| 5 | 静态素材 `/hero/*` `/cases/*` `/certificates/*` | 200（带扩展名路径不走 SPA） |
| 6 | 移动端 CSS | `index-*.css` 体积含 6.3 polish |
| 7 | 390px 无横向滚动 | DevTools 或真机 |

**不要放在 Vercel：** `STRAPI_API_TOKEN`、`ADMIN_SESSION_SECRET`、`ADMIN_PASSWORD_HASH`

---

## 2. Render API 检查

```bash
curl https://api.yuyakang.top/api/health
curl https://api.yuyakang.top/api/content
```

| 期望 | 说明 |
|------|------|
| HTTP 200 | 非 HTML 错误页 |
| `ok: true` | health 正常 |
| `mode: "api-only"` | API_ONLY 模式 |
| `strapi.enabled: false` | 生产未部署 Strapi 时必须关闭 |

**冷启动：** Render 免费 tier 休眠后首次访问约 30–60 秒，503/超时属预期，需重试。

---

## 3. 环境变量清单

### Vercel（构建时）

```env
VITE_API_URL=https://api.yuyakang.top
```

### Render（运行时）

```env
NODE_ENV=production
API_ONLY=true
HOST=0.0.0.0
PUBLIC_SITE_URL=https://www.yuyakang.top
ALLOWED_ORIGINS=https://yuyakang.top,https://www.yuyakang.top

ADMIN_USERNAME=...
ADMIN_PASSWORD_HASH=...
ADMIN_SESSION_SECRET=...
ADMIN_SESSION_MAX_AGE=86400000

STRAPI_ENABLED=false
STRAPI_WRITE_ENABLED=false
STRAPI_BASE_URL=
STRAPI_API_TOKEN=
STRAPI_TIMEOUT_MS=5000
```

---

## 4. CORS

`server/index.js` 使用 `ALLOWED_ORIGINS` + 本地 LAN 开发回退。

生产必须包含：

- `https://yuyakang.top`
- `https://www.yuyakang.top`

管理接口 `PATCH/POST` 需 `requireAdminAuth`；公开 `GET /api/content` 可读。

---

## 5. 素材路径

关键路径（须在 `public/` 且进入 Vercel `dist/`）：

| 类型 | 路径 |
|------|------|
| Hero 桌面视频 | `/hero/desktop/hero-reel.mp4` |
| Hero 手机视频 | `/hero/mobile/hero-reel-mobile.mp4` |
| Hero poster | `/hero/desktop/hero-poster.webp` |
| 证书 | `/certificates/cert-01.webp` 等 |
| 案例 | `/cases/{slug}/gallery/*.webp` |
| 微信二维码 | `/images/wechat-qr.jpg` |

`.webp` 与 `.jpg` 成对存在时，内容 JSON 应引用 **webp**（与 `site-content.json` 一致）。

---

## 6. Hero 视频

- **不要改** `HeroVideoCarousel.jsx`
- 检查 Git 是否跟踪 `public/hero/**`
- 检查 Vercel 线上 `/hero/desktop/hero-reel.mp4` 是否 200
- 手机端使用 `mobileVideoUrl`

---

## 7. CommonTools 生产策略

未部署生产 Strapi 时：

- `STRAPI_ENABLED=false`
- `STRAPI_WRITE_ENABLED=false`
- `/contact` 显示 JSON CMS 中的 `siteSettings.commonTools`
- 后台保存走 JSON CMS（非 Strapi）

---

## 8. 后台登录风险

- Cookie：`Secure` + `HttpOnly` + `SameSite=Lax`（生产 HTTPS）
- 登录域：`api.yuyakang.top`（非 www）
- 未登录写接口 → 401
- 勿在日志/health 输出真实 token 或密码

---

## 9. Render 免费盘风险

| 风险 | 说明 |
|------|------|
| 休眠 | 15 分钟无访问后冷启动 |
| 无持久磁盘 | `site-content.json` / `uploads/` 重启可能丢失 |
| 媒体 | 长期上传应走对象存储，静态品牌素材放 `public/` + Git |

---

## 10. 自动化检查脚本

```powershell
$env:PROD_SITE_URL="https://www.yuyakang.top"
$env:PROD_API_URL="https://api.yuyakang.top"
node scripts/production-check.mjs
```

---

## 11. 回滚策略

### Vercel 失败

1. Vercel Dashboard → 回滚上一 Deployment
2. 检查 Build Logs、`VITE_API_URL`
3. 检查 `vercel.json` SPA rewrite 是否误拦截静态素材

### Render API 失败

1. Render Logs → PORT / 启动命令
2. 确认 `ADMIN_*` 已配置
3. 设置 `STRAPI_ENABLED=false` 后重新部署

### 素材 404

1. 确认 `public/` 文件在 Git
2. 本地 `npm run build:web` 后检查 `dist/hero/...`
3. 检查路径大小写与扩展名

---

## 12. 验收清单（上线前）

- [ ] https://www.yuyakang.top 首页正常
- [ ] https://www.yuyakang.top/about 深链 200
- [ ] Hero 视频线上 200
- [ ] https://api.yuyakang.top/api/health 200
- [ ] https://api.yuyakang.top/api/content 200
- [ ] https://api.yuyakang.top/admin/login 可打开
- [ ] `/contact` Common Tools 显示
- [ ] 390 / 430 / 768 无横向滚动
- [ ] 生产 Strapi 保持关闭（除非已部署 Strapi 生产）
