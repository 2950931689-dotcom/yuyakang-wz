# YU YAKANG AUDIO — 部署架构规划

> 状态：规划文档 · 2026-07-05  
> **本文档仅描述部署方案，不包含真实部署操作。**  
> 当前开发阶段仍使用本地 Express + JSON CMS；Strapi 为生产目标架构。

---

## 1. 总体部署架构

```text
                    ┌─────────────────────────────────────────┐
                    │              GitHub                        │
                    │  · 前端仓库（React + Vite）                │
                    │  · Strapi 后端仓库（可 mono / 独立 repo）   │
                    │  · main 分支 → 生产部署                    │
                    └───────────────┬───────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌────────────────┐   ┌─────────────────┐   ┌──────────────────┐
     │     Vercel      │   │  Vercel（可选）  │   │  阿里云 ECS /     │
     │  前端官网 SPA    │   │  /admin 自制后台 │   │  其他 Node 服务器  │
     │  yuyakangaudio  │   │  （第二版）      │   │  Strapi CMS       │
     │  .com           │   │                 │   │  :1337 内网       │
     └────────┬────────┘   └────────┬────────┘   └────────┬─────────┘
              │                     │                     │
              │    VITE_API_URL     │                     │
              └─────────────────────┴─────────────────────┘
                                    │
                                    ▼
                         https://api.yuyakangaudio.com
                                    │
              ┌─────────────────────┴─────────────────────┐
              │           阿里云 DNS 解析                   │
              │  @ / www → Vercel                           │
              │  api     → Strapi（经 Nginx 443 → 1337）    │
              │  admin   → Strapi Admin / 自制后台（第二版）  │
              └───────────────────────────────────────────┘
```

### 1.1 GitHub

| 职责 | 说明 |
|---|---|
| 代码托管 | 保存前端源码；Strapi 可同 monorepo 或独立仓库 |
| 分支策略 | `main` → 生产；`develop` → 预发（可选） |
| CI（可选） | PR 检查 lint / build；不强制在本阶段实现 |

**推荐仓库结构（二选一）：**

```text
方案 A — 单仓库 monorepo
yuyakang-audio/
├── apps/web/          # Vite 前端
├── apps/strapi/       # Strapi 后端
└── docs/

方案 B — 双仓库
yuyakang-audio-site/   # 前端 → Vercel
yuyakang-audio-cms/    # Strapi → ECS
```

### 1.2 Vercel

| 职责 | 说明 |
|---|---|
| 部署对象 | React + Vite 静态站点（SSG/SPA） |
| 包含页面 | `/` 首页、`/cases`、`/about`、`/services`、`/booking`、`/contact` |
| 自制后台 | 第二版可将 `/admin/*` 一并部署在同一 Vercel 项目 |
| API 请求 | 通过 `VITE_API_URL` 指向 Strapi（`https://api.yuyakangaudio.com`） |
| 不负责 | 长期运行的 Node 服务、文件上传存储、数据库 |

**构建配置要点：**

```text
Framework Preset: Vite
Build Command:    npm run build
Output Directory: dist
Install Command:  npm install
```

### 1.3 Strapi（Headless CMS）

| 职责 | 说明 |
|---|---|
| 内容管理 | 个人资料、案例、证书、工作照、首页视频、服务、SEO、社媒链接 |
| 预约数据 | Booking 表单提交写入 Strapi（或 Webhook 至独立服务） |
| 媒体上传 | Strapi Media Library；生产建议 OSS |
| 后台 | **第一版：Strapi 自带 Admin**；第二版：自制 `/admin` 调用 Strapi REST API |
| 部署位置 | 阿里云 ECS 或其他稳定 Node 服务器（**不建议 Vercel**） |

### 1.4 阿里云 DNS

| 记录 | 指向 | 说明 |
|---|---|---|
| `@` | Vercel | 根域名 |
| `www` | Vercel | 主站 |
| `api` | ECS 公网 IP / 负载均衡 | Strapi API，**必须经 Nginx 443** |
| `admin` | Strapi Admin 或 Vercel | 见域名规划 |

> **重要：** DNS 只能解析到 IP 或 CNAME，**不能带端口**。  
> `http://服务器IP:1337` 必须通过 Nginx 反代为 `https://api.yuyakangaudio.com`。

---

## 2. 域名结构规划

占位主域名：**`yuyakangaudio.com`**

| 记录 | 主机记录 | 类型 | 指向 | 说明 |
|---|---|---|---|---|
| 根域名 | `@` | A / ALIAS | Vercel | 主站 |
| www | `www` | CNAME | Vercel | 主站 |
| API | `api` | A | ECS 公网 IP | Strapi REST API |
| 后台 | `admin` | A / CNAME | ECS 或 Vercel | 见下表 |

| 域名 | 用途 | 第一版指向 | 第二版指向 |
|---|---|---|---|
| `yuyakangaudio.com` | 官网首页 | Vercel | Vercel |
| `www.yuyakangaudio.com` | 官网（www） | Vercel CNAME | Vercel CNAME |
| `api.yuyakangaudio.com` | Headless API | ECS + Nginx → Strapi `:1337` | 同左 |
| `admin.yuyakangaudio.com` | 后台入口 | Strapi Admin（Nginx 反代至 `:1337/admin`） | 自制后台（Vercel `/admin`） |

> **DNS 不能解析端口。** 若 Strapi 监听 `http://127.0.0.1:1337`，必须通过 Nginx：  
> `https://api.yuyakangaudio.com` → `http://127.0.0.1:1337`

### 2.1 Nginx 反向代理示例（ECS）

```nginx
# /etc/nginx/sites-available/api.yuyakangaudio.com

server {
    listen 443 ssl http2;
    server_name api.yuyakangaudio.com;

    ssl_certificate     /etc/letsencrypt/live/api.yuyakangaudio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yuyakangaudio.com/privkey.pem;

    client_max_body_size 100M;  # 媒体上传

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2.2 Vercel 域名配置

```text
Vercel Project → Settings → Domains
  · yuyakangaudio.com
  · www.yuyakangaudio.com

阿里云 DNS：
  @   → A     → Vercel 提供的 IP（或 ALIAS）
  www → CNAME → cname.vercel-dns.com
```

---

## 3. 环境变量规划

### 3.1 前端（Vercel）

| 变量 | 示例值 | 说明 |
|---|---|---|
| `VITE_API_URL` | `https://api.yuyakangaudio.com` | Strapi API 根地址，**不含** trailing slash |

本地开发 `.env.example`（已有 Express 阶段可并存）：

```env
# 开发阶段（Express JSON CMS）
VITE_API_URL=http://localhost:3001

# 生产阶段（Strapi）
VITE_API_URL=https://api.yuyakangaudio.com
```

> Vite 环境变量在 **构建时** 注入，修改后需重新 deploy。

### 3.2 Strapi（ECS / 服务器）

生产环境变量模板（**值留空，部署时填入，勿提交 Git**）：

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=
DATABASE_CLIENT=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
PUBLIC_URL=https://api.yuyakangaudio.com
```

本地 / 测试可选 SQLite（**仅适合开发测试，不适合生产**）：

```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

正式生产推荐 PostgreSQL 或 MySQL：

```env
# PostgreSQL（推荐）
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=yuyakang_strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=<secure-password>

# 或 MySQL
# DATABASE_CLIENT=mysql
# DATABASE_HOST=127.0.0.1
# DATABASE_PORT=3306
# DATABASE_NAME=yuyakang_strapi
# DATABASE_USERNAME=strapi
# DATABASE_PASSWORD=<secure-password>
```

| 数据库 | 适用场景 | 说明 |
|---|---|---|
| SQLite | 本地 / 临时测试 | **不适合生产**，无并发保障，备份困难 |
| PostgreSQL | **生产推荐** | Strapi 官方推荐，稳定 |
| MySQL | 生产可选 | 阿里云 RDS 常见 |

### 3.3 Strapi CORS（生产）

```env
# config/middlewares.js 或环境配置
# 允许前端域名跨域
CORS_ORIGIN=https://yuyakangaudio.com,https://www.yuyakangaudio.com
```

---

## 4. Strapi Content Types 规划

> 与当前 JSON CMS（`docs/CMS_SCHEMA.md`）字段对齐，便于迁移。

### 4.1 Profile（Single Type）

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | Component i18n | 姓名 |
| `title` | Component i18n | 职业头衔 |
| `bio` | Component i18n | 个人简介 |
| `avatar` | Media | 头像 |
| `affiliation` | Component i18n | 机构 / 会员身份 |
| `location` | Component i18n | 常驻地 |
| `workPhotos` | Repeatable Component | 工作照列表 |
| `certificates` | Relation → Certificate[] | 证书（或独立 Collection 关联） |
| `skills` | Repeatable Component | 能力分组（对应 JSON CMS `skillGroups`） |
| `contact` | Component | 邮箱 / 电话（可选） |

**workPhotos 组件：**

| 字段 | 类型 |
|---|---|
| `title` | Component i18n |
| `description` | Component i18n |
| `image` | Media |
| `sortOrder` | Integer |

### 4.2 Case（Collection Type）

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | Component i18n | 案例标题 |
| `slug` | UID | URL 唯一标识 |
| `category` | Enumeration | livehouse / system / mixing / event / acoustic |
| `summary` | Component i18n | 一句话摘要 |
| `background` | Component i18n | 项目背景 |
| `challenge` | Component i18n | 项目难点 |
| `solution` | Component i18n | 解决方案 |
| `result` | Component i18n | 最终效果 |
| `location` | Component i18n | 地点 |
| `role` | Component i18n | 担任角色 |
| `toolsUsed` | Component i18n | 设备 / 软件 |
| `coverImage` | Media | 列表封面 |
| `galleryImages` | Media[] | 现场图集 |
| `videos` | Media / JSON | 案例视频 |
| `audio` | Media | 音频试听 |
| `isFeatured` | Boolean | 首页精选 |
| `showInHero` | Boolean | 是否出现在 Hero 轮播 |
| `heroVideo` | Media | Hero 专用视频片段 |
| `heroPoster` | Media | Hero poster |
| `heroStartTime` | Decimal | 轮播起始秒 |
| `heroDuration` | Integer | 轮播播放秒数（3–5） |
| `sortOrder` | Integer | 排序 |
| `visible` | Boolean | 是否公开 |
| `seoTitle` | Component i18n | SEO 标题 |
| `seoDescription` | Component i18n | SEO 描述 |

### 4.3 Service（Collection Type）

| 字段 | 类型 |
|---|---|
| `title` | Component i18n |
| `slug` | UID |
| `summary` | Component i18n |
| `description` | Component i18n |
| `features` | Repeatable Component i18n |
| `sortOrder` | Integer |
| `isActive` | Boolean |

### 4.4 Certificate（Collection Type）

| 字段 | 类型 |
|---|---|
| `title` | Component i18n |
| `issuer` | Component i18n |
| `date` | String / Date |
| `image` | Media |
| `description` | Component i18n |
| `sortOrder` | Integer |
| `isFeatured` | Boolean |
| `visible` | Boolean |

### 4.5 Booking（Collection Type）

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | String | 客户称呼 |
| `wechat` | String | 微信 |
| `phone` | String | 手机 |
| `email` | Email | 邮箱 |
| `serviceType` | String | 服务类型 slug |
| `city` | String | 城市 |
| `projectDate` | Date | 项目日期 |
| `venueSize` | String | 场地规模 |
| `budgetRange` | String | 预算范围 |
| `referenceLink` | String | 参考链接 |
| `message` | Text | 需求描述 |
| `status` | Enumeration | new / contacted / quoted / confirmed / completed / cancelled |
| `internalNote` | Text | 内部备注 |

> Booking 创建接口需配置 Strapi Public Role 权限或 Custom Controller + Rate Limit。

### 4.6 SiteSetting（Single Type）

| 字段 | 类型 | 说明 |
|---|---|---|
| `siteName` | Component i18n | 站点名 |
| `tagline` | Component i18n | 副标题 |
| `logo` | Media | Logo（V2 图形） |
| `favicon` | Media | Favicon |
| `heroMode` | Enumeration | singleVideo / caseVideoCarousel |
| `heroSlides` | Repeatable Component | 轮播配置 |
| `douyinUrl` | String | 抖音公开主页 |
| `douyinUrlDraft` | String | 抖音草稿链接 |
| `wechatVideoUrl` | String | 视频号 |
| `wechatQrImage` | Media | 微信二维码 |
| `contactNote` | Component i18n | 联系说明 |
| `location` | Component i18n | 常驻地 |
| `seoTitle` | Component i18n | 全局 SEO 标题 |
| `seoDescription` | Component i18n | 全局 SEO 描述 |
| `ogImage` | Media | 分享图 |
| `processSteps` | Repeatable Component | 首页工作流程 |

**heroSlides 组件：**

| 字段 | 类型 |
|---|---|
| `caseSlug` | String |
| `title` | Component i18n |
| `video` | Media |
| `poster` | Media |
| `startTime` | Decimal |
| `duration` | Integer |
| `enabled` | Boolean |

### 4.7 共享 Component：i18n

```text
Component: localeString
  · cn (Text)
  · en (Text)
```

所有面向用户的文案字段复用此 Component，与当前 JSON CMS 的 `{ cn, en }` 结构一致。

---

## 5. 部署阶段任务清单

### 第 1 阶段：本地开发 ✅（当前进行中）

| 任务 | 状态 |
|---|---|
| Vite 前端页面与交互 | 已完成大部分 |
| Express + JSON CMS 本地 API | 已完成 |
| mock fallback | 已完成 |
| 媒体预览 / Hero 轮播 | 已完成 |
| 内容文案补齐 | 进行中 |

### 第 2 阶段：接入 Strapi

| # | 任务 |
|---|---|
| 2.1 | 初始化 Strapi 项目（`apps/strapi` 或独立仓库） |
| 2.2 | 按本文档创建 Content Types + i18n Component |
| 2.3 | 配置 Public / Authenticated 角色 API 权限 |
| 2.4 | 编写迁移脚本：JSON → Strapi（cases / profile / certificates） |
| 2.5 | 前端 `api.js` 增加 Strapi adapter，保留 mock fallback |
| 2.6 | Booking POST 改指向 Strapi 或 Webhook |
| 2.7 | 本地联调：`VITE_API_URL=http://localhost:1337` |

### 第 3 阶段：部署前端到 Vercel

| # | 任务 |
|---|---|
| 3.1 | GitHub 推送 `main` |
| 3.2 | Vercel Import Project → 连接仓库 |
| 3.3 | 设置 `VITE_API_URL=https://api.yuyakangaudio.com`（或 staging API） |
| 3.4 | 验证 build 成功 |
| 3.5 | 绑定 `yuyakangaudio.com` / `www` |
| 3.6 | 验收：`/` `/cases` `/booking` `/contact` 页面 |

### 第 4 阶段：部署 Strapi 后端

| # | 任务 |
|---|---|
| 4.1 | 购买 / 配置阿里云 ECS（2C4G 起步，按媒体量扩容） |
| 4.2 | 安装 Node.js 20 LTS、PM2、Nginx |
| 4.3 | 配置 PostgreSQL（RDS 或 ECS 自建） |
| 4.4 | 部署 Strapi，`PUBLIC_URL=https://api.yuyakangaudio.com` |
| 4.5 | 配置上传目录或阿里云 OSS 插件 |
| 4.6 | Nginx 反向代理 + Let's Encrypt HTTPS |
| 4.7 | PM2 守护进程 + 日志轮转 |
| 4.8 | 数据库定时备份 |

### 第 5 阶段：阿里云 DNS 解析

| # | 任务 |
|---|---|
| 5.1 | `@` A/ALIAS → Vercel |
| 5.2 | `www` CNAME → Vercel |
| 5.3 | `api` A → ECS 公网 IP |
| 5.4 | `admin` → Strapi Admin（第一版）或 Vercel（第二版） |
| 5.5 | 等待 DNS 生效（TTL 600s 建议） |
| 5.6 | 验证 HTTPS 证书链完整 |

### 第 6 阶段：生产验收

| # | 检查项 |
|---|---|
| 6.1 | 首页 Hero 轮播视频来自 CMS |
| 6.2 | 案例列表 / 详情文案与媒体正常 |
| 6.3 | 图片 / 视频 CDN 或 OSS 加载速度 |
| 6.4 | Booking 表单提交成功写入 Strapi |
| 6.5 | Strapi Admin 修改内容后前台刷新可见 |
| 6.6 | SEO title / description / ogImage 正确 |
| 6.7 | 手机端布局与交互 |
| 6.8 | Console 无红色报错 |
| 6.9 | API 失败时 mock fallback 行为（可选保留） |

---

## 6. 与当前 JSON CMS 的迁移关系

```text
当前（开发）                    目标（生产）
─────────────────────────────────────────────────
server/data/site-content.json  →  Strapi Single/Collection Types
server/data/bookings.json      →  Strapi Booking Collection
public/ 静态媒体路径            →  Strapi Media Library + OSS
Express /api/*                 →  Strapi REST /api/*
src/data/site-content.mock.json →  保留为 offline fallback
/admin 自制只读页              →  第一版 Strapi Admin；第二版自制编辑器
```

迁移原则：

1. 字段名与 `docs/CMS_SCHEMA.md` 保持一致，减少前端改动。
2. 先只读 API 切换，Booking 写入最后迁移。
3. 媒体文件先保留 `public/` 路径，逐步迁入 OSS。

---

## 7. 风险提醒

| # | 风险 | 说明 |
|---|---|---|
| 1 | **Vercel 不适合跑 Strapi** | Vercel 为 Serverless / 静态托管，无持久进程与本地磁盘，Strapi 需部署在 ECS 等长期运行环境 |
| 2 | **必须有稳定存储** | SQLite 或 ephemeral 磁盘会导致数据与上传文件丢失；生产必须用 PostgreSQL/MySQL + 持久化 upload 目录或 OSS |
| 3 | **DNS 不能解析端口** | `api.domain.com:1337` 不可行；必须通过 Nginx / 平台负载均衡将 443 转发至 1337 |
| 4 | **VITE_API_URL 必须正确** | 构建时注入，错误值会导致生产环境请求 localhost 或 404；每次改 API 域名需重新 deploy |
| 5 | **自制后台需权限控制** | 若第二版 `/admin` 调用 Strapi API，必须使用 API Token / JWT，禁止 Public 写权限暴露 |
| 6 | **第一版先用 Strapi Admin** | 避免过早重写 CMS；当前 JSON CMS 自制 `/admin` 可作为过渡只读面板 |
| 7 | **媒体文件需 OSS 规划** | ECS 本地 `public/uploads` 在扩容 / 迁移时易丢失；建议 V1.5 接入阿里云 OSS Strapi 插件 |
| 8 | **CORS 与 CSP** | 生产需限制 Strapi CORS 为前端域名；Vercel 侧注意 CSP 是否阻挡 API 请求 |
| 9 | **Booking  spam** | 公开 POST 需 Rate Limit、honeypot 或 Cloudflare |
| 10 | **密钥泄露** | `APP_KEYS` 等禁止提交 Git；使用 ECS 环境变量或密钥管理服务 |

---

## 8. 相关文档

| 文档 | 说明 |
|---|---|
| [CMS_SCHEMA.md](./CMS_SCHEMA.md) | 当前 JSON CMS 字段（迁移对照） |
| [ADMIN_MEDIA_MANAGEMENT_PLAN.md](./ADMIN_MEDIA_MANAGEMENT_PLAN.md) | 媒体管理 V1 / V1.5 规划 |
| [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) | 项目需求冻结 |
| [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) | 开发阶段清单 |

---

## 9. 项目配置规划（仅文档，尚未创建文件）

> 以下为上线前需准备的配置文件规划，**本轮不生成部署脚本、不执行部署**。

### 9.1 Vercel 项目设置

| 配置项 | 规划值 |
|---|---|
| Root Directory | `.`（或 `apps/web` 若 monorepo） |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | 20.x |

**计划新增 `vercel.json`（上线前）：**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

用于 React Router SPA 路由：`/cases`、`/booking` 等刷新不 404。

### 9.2 环境变量文件规划

| 文件 | 用途 | 是否提交 Git |
|---|---|---|
| `.env.example` | 本地开发模板 | ✅ 提交 |
| `.env` | 本地实际值 | ❌ gitignore |
| Vercel Dashboard | 生产 `VITE_API_URL` | 平台配置 |

### 9.3 Strapi 项目结构规划（独立仓库或 monorepo）

```text
apps/strapi/                 # 未来 Strapi 项目
├── config/
│   ├── database.js
│   ├── server.js            # PUBLIC_URL, HOST, PORT
│   └── middlewares.js         # CORS
├── src/api/                 # Content Types
├── public/uploads/          # 媒体（生产改 OSS）
└── .env                     # 密钥，不提交
```

### 9.4 ECS + Nginx 配置清单（上线前）

| 文件 / 服务 | 用途 |
|---|---|
| `/etc/nginx/sites-available/api.yuyakangaudio.com` | API 反代 |
| `/etc/nginx/sites-available/admin.yuyakangaudio.com` | 可选：Admin 独立子域 |
| `pm2 ecosystem.config.js` | Strapi 进程守护 |
| Let's Encrypt certbot | HTTPS 证书 |
| 阿里云 RDS PostgreSQL | 生产数据库 |
| 阿里云 OSS + Strapi 插件 | 媒体持久化（V1.5） |

### 9.5 阿里云 DNS 记录规划

| 主机记录 | 记录类型 | 记录值 | TTL |
|---|---|---|---|
| `@` | A / ALIAS | Vercel 提供 | 600 |
| `www` | CNAME | `cname.vercel-dns.com` | 600 |
| `api` | A | ECS 公网 IP | 600 |
| `admin` | A 或 CNAME | ECS IP 或 Vercel | 600 |

---

## 10. 本轮范围说明

本文档 **仅包含**：

1. 部署方案文档
2. 环境变量规划
3. 域名解析规划
4. Strapi 数据模型规划
5. 阶段任务清单

**不包含：**

- 真实部署操作
- 部署脚本（`deploy.sh` 等）
- 前端页面修改
- Express API 逻辑修改
- Strapi 项目初始化

---

*文档版本：1.0.1 · 2026-07-05*
