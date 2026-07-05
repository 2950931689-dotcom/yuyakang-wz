# YU YAKANG AUDIO

余雅康个人调音师品牌官网 — 项目仓库

> 阶段：第 0 步 · 骨架 + 文档 + Schema + 安全脚本  
> 原始素材（只读）：`E:\卓面应用\个人文件\Cursor\余`

## 文档

| 文件 | 说明 |
|---|---|
| [docs/PROJECT_REQUIREMENTS.md](docs/PROJECT_REQUIREMENTS.md) | 需求冻结 |
| [docs/ASSET_PLAN.md](docs/ASSET_PLAN.md) | 素材规则与命名 |
| [docs/CMS_SCHEMA.md](docs/CMS_SCHEMA.md) | JSON CMS 字段说明 |
| [docs/ROUTES_AND_PAGES.md](docs/ROUTES_AND_PAGES.md) | 路由与页面 |
| [docs/UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) | UI Token 与组件规范 |
| [docs/DEVELOPMENT_CHECKLIST.md](docs/DEVELOPMENT_CHECKLIST.md) | 开发清单 |
| [docs/SOCIAL_CONTACT.md](docs/SOCIAL_CONTACT.md) | 社媒与联系方式 |

## 数据

- `server/data/site-content.example.json` — CMS 示例（含 6 个首批案例骨架）
- `server/data/bookings.example.json` — 预约数据示例

## 已配置联系方式

- 微信二维码：`public/images/wechat-qr.jpg`
- 视频号（Hero 按钮 1）：见 `socialLinks.wechatVideoUrl`
- 抖音：草稿见 `socialLinks.douyinUrlDraft`（待换公开链接）
- 后台社媒管理：规划路径 `/admin/social`

## 素材脚本（默认 dry-run）

```bash
# 预览复制清单
node scripts/copy-assets-from-source.mjs

# 确认后执行
node scripts/copy-assets-from-source.mjs --execute

# 音频转码预览 / 执行
node scripts/prepare-audio.mjs
node scripts/prepare-audio.mjs --execute

# 图片优化（需先 npm install sharp）
node scripts/optimize-images.mjs
node scripts/optimize-images.mjs --execute
```

## 技术路线（V1 方案 A）

React + Vite · React Router · Express · JSON CMS · 原生 CSS · Lucide · Motion · wavesurfer.js

## 当前不做

- npm install
- React 页面开发
- 修改原始素材目录
