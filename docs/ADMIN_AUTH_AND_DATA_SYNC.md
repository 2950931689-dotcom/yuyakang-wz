# Admin Auth & Data Sync — Round 5.3

YU YAKANG AUDIO 使用 **React + Vite 前台**、**自制 Admin 后台**、**Express API**、**JSON CMS 文件** 架构。本轮在现有 JSON CMS 上增加管理员登录、写入接口保护与前后台数据同步验证。

## 架构

```
前台 (公开)                后台 (需登录)
    │                          │
    ├─ GET /api/content        ├─ PATCH /api/content/section/*
    ├─ POST /api/bookings      ├─ POST /api/upload
    └─ 无需 cookie             ├─ GET/PATCH /api/bookings (admin)
                               └─ credentials: include + httpOnly cookie
                                        │
                                        ▼
                              server/data/site-content.json
                              server/data/bookings.json
                              server/uploads/
```

## Auth API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 登录，设置 httpOnly session cookie |
| GET | `/api/admin/me` | 检查登录状态（401 = 未登录） |
| POST | `/api/admin/logout` | 清除 session cookie |

### 登录请求

```json
{ "username": "admin", "password": "your-password" }
```

成功：`{ ok: true, authenticated: true, user: { username: "admin" } }`

失败：`401` + `{ ok: false, message: "账号或密码错误" }`

## 环境变量

复制 `.env.example` 为 `.env.local`（不要提交）：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...
ADMIN_SESSION_SECRET=replace-with-random-secret
ADMIN_SESSION_MAX_AGE=86400000
```

### 生成密码 hash

```bash
node scripts/generate-admin-password-hash.mjs "your-password"
```

将输出的 `ADMIN_PASSWORD_HASH=...` 写入 `.env.local`。

验证脚本额外需要（仅本地，勿提交）：

```env
ADMIN_TEST_PASSWORD=your-password
```

## 启动开发环境

```bash
npm run dev
```

- 前台：http://localhost:5173
- API：http://localhost:3001
- 后台：http://localhost:5173/admin/login

服务器启动时会提示 `Admin auth: enabled` 或 `NOT configured`。

## 公开接口（无需登录）

- `GET /api/health`
- `GET /api/content`
- `POST /api/bookings`（用户预约提交）

## 受保护接口（requireAdminAuth）

- `PUT /api/content`
- `PATCH /api/content/section/:sectionKey`
- `POST /api/upload`
- `GET /api/media`
- `DELETE /api/media/:filename`
- `GET /api/bookings`
- `PATCH /api/bookings/:id`

## 数据同步流程

1. 管理员登录后台
2. 编辑内容并保存 → `PATCH /api/content/section/:key`（带 cookie）
3. 后端写入 `server/data/site-content.json` 并备份
4. 后台 `reloadContent()` 重新 GET 最新数据
5. 前台刷新页面 → 公开 `GET /api/content` → 显示最新内容

**原则：** 保存成功后必须以服务端数据为准（PATCH 响应 + 重新 GET），不能仅本地 setState。

## 验证脚本

```bash
# 需 ADMIN_TEST_PASSWORD 与服务器 ADMIN_PASSWORD_HASH 匹配
ADMIN_TEST_PASSWORD=your-password node scripts/admin-auth-verify.mjs
ADMIN_TEST_PASSWORD=your-password node scripts/cms-linkage-verify.mjs
npm run test:smoke
```

## 发版前验收 Checklist

- [ ] 未登录访问 `/admin` → 跳转 `/admin/login`
- [ ] 错误密码 → 401 / 错误提示
- [ ] 正确密码 → 进入后台，刷新仍保持登录
- [ ] 退出登录 → 无法访问后台写接口
- [ ] Common Tools 保存后 `/contact` 前台同步
- [ ] Booking 公开提交仍可用
- [ ] 前台首页视频正常
- [ ] 生产环境 `NODE_ENV=production` 时 cookie `Secure`

## 未来 Strapi 迁移注意

当前 auth 为 JSON CMS 阶段方案（单管理员、env 密码 hash、signed httpOnly cookie）。迁移 Strapi 时可替换为 Strapi users-permissions 或自定义 admin auth，前台公开读取逻辑可保持不变。
