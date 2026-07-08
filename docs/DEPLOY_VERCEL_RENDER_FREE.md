# 免费上线：Vercel + Render（yuyakang.top）

> 参考陈吖猫项目 `Vercel 官网 + API 同域后台` 模式，后端改用 **Render 免费 Web Service**。

## 架构

```text
www.yuyakang.top / yuyakang.top   →  Vercel（官网，只读）
api.yuyakang.top                  →  Render（Express API + /admin 后台）

编辑内容请访问：https://api.yuyakang.top/admin/login
不要依赖 www.yuyakang.top/admin（Vercel 会重定向到 api 子域）
```

## 1. GitHub

推送 `main` 分支到 GitHub（仓库已连接 Vercel / Render）。

## 2. Vercel（前台）

1. Import Project → 选仓库
2. Framework: Vite（或读取 `vercel.json`）
3. **Environment Variables**

```env
VITE_API_URL=https://api.yuyakang.top
```

4. Deploy
5. Domains → 添加 `yuyakang.top`、`www.yuyakang.top`

## 3. Render（API + 后台）

1. Dashboard → New → Blueprint（或 Web Service）
2. 连接同一 GitHub 仓库
3. 使用仓库内 `render.yaml`（或手动配置）：
   - **Build:** `npm install && npm run build`
   - **Start:** `NODE_ENV=production API_ONLY=true node server/index.js`
   - **Health:** `/api/health`
   - **Plan:** Free

4. **Environment Variables**（在 Dashboard 手动填写密钥）：

```env
NODE_ENV=production
API_ONLY=true
HOST=0.0.0.0
PUBLIC_SITE_URL=https://www.yuyakang.top
ALLOWED_ORIGINS=https://yuyakang.top,https://www.yuyakang.top

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...   # node scripts/generate-admin-password-hash.mjs
ADMIN_SESSION_SECRET=...  # 随机长字符串
ADMIN_SESSION_MAX_AGE=86400000
```

5. Custom Domain → `api.yuyakang.top`

## 4. 阿里云 DNS（yuyakang.top）

| 主机记录 | 类型 | 指向 |
|----------|------|------|
| `@` | 按 Vercel 文档 | Vercel |
| `www` | CNAME | Vercel 提供的地址 |
| `api` | CNAME | Render 提供的地址 |

## 5. 首次上线数据

- 若服务器无 `site-content.json`，启动时会从 `server/data/site-content.example.json` 复制
- **建议：** 上线前在本地编辑好内容，将 `server/data/site-content.json` 通过 Render 付费磁盘或手动部署流程同步（免费盘无持久化，见下）

## 6. 免费 Render 限制（必知）

| 限制 | 影响 |
|------|------|
| 15 分钟无访问休眠 | 首次打开 API/后台约 30–60 秒冷启动 |
| 无持久磁盘 | **重启后 JSON / uploads 可能丢失** |
| 750 小时/月 | 单服务约够 24/7，超额当月暂停 |

**免费期建议：**

- 内容改动不频繁 → 可接受
- 重要媒体 → 先用 `public/` 静态资源或外链（Cloudinary 等）
- 稳定运营后 → Render Starter（约 $7/月）开持久磁盘

## 7. 验收 Checklist

- [ ] https://www.yuyakang.top 首页与视频正常
- [ ] https://api.yuyakang.top/api/health → `ok: true`, `mode: api-only`
- [ ] https://api.yuyakang.top/admin/login 可登录
- [ ] 登录后保存内容，刷新 www 前台可见
- [ ] Booking 提交成功
- [ ] www.yuyakang.top/admin 重定向到 api 子域

## 8. 本地模拟生产

```bash
npm run build
# Windows PowerShell:
$env:NODE_ENV="production"; $env:API_ONLY="true"; node server/index.js
# 访问 http://localhost:3001/admin/login
```

## 9. 以后升级 Strapi

免费阶段用 Express JSON CMS。有预算后再迁 Strapi，域名结构可保持不变（`api` 子域）。
