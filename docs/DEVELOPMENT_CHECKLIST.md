# YU YAKANG AUDIO — 开发清单

---

## 第 0 步：素材整理与数据结构 ✅

- [x] 项目目录结构
- [x] docs/ 五份文档
- [x] site-content.example.json
- [x] bookings.example.json
- [x] copy-assets-from-source.mjs（dry-run 默认）
- [x] prepare-audio.mjs（dry-run 默认）
- [x] optimize-images.mjs（dry-run 默认）
- [ ] 用户确认 dry-run 清单
- [ ] 执行 copy-assets --execute
- [ ] Hero 6 段源片段混剪（人工/ffmpeg）
- [ ] 补写 6 个案例文案（中英文）
- [x] 微信二维码 → `public/images/wechat-qr.jpg`
- [x] 视频号链接写入 CMS
- [x] 抖音 self 草稿链接 + 后台警告规则
- [ ] 抖音公开主页链接（替换 douyinUrlDraft）
- [ ] 执行 prepare-audio / optimize-images

---

## 第 1 步：前端静态页面

- [ ] npm init + Vite + React + TypeScript
- [ ] tokens.css / base.css / components.css
- [ ] 路由壳：7 个前台页面 + Layout
- [ ] Header / Footer / MobileNav / LanguageSwitch
- [ ] 首页 6 区块静态结构（占位数据读 example JSON）
- [ ] 案例列表 + 详情静态页
- [ ] About / Services / Booking / Contact 静态页
- [ ] 响应式断点测试

---

## 第 2 步：JSON CMS + Express API

- [ ] server/index.js
- [ ] site-content.json（从 example 复制）
- [ ] GET /api/content
- [ ] GET /api/cases / :slug
- [ ] POST /api/bookings
- [ ] Admin 简单密码 auth
- [ ] PUT /api/admin/content/:section
- [ ] POST /api/admin/upload

---

## 第 3 步：首页 Hero + 案例系统

- [ ] Hero 视频播放（desktop/mobile 分支）
- [ ] 抖音按钮跳转逻辑
- [ ] 案例分类筛选
- [ ] CaseCard + CaseDetail 叙事区块
- [ ] wavesurfer 音频播放器
- [ ] 图片 Lightbox

---

## 第 4 步：预约表单

- [ ] BookingForm 字段对齐 CMS
- [ ] 提交 → bookings.json
- [ ] 成功 / 错误反馈
- [ ] 微信 QR 展示

---

## 第 5 步：中英文切换

- [ ] i18n Context
- [ ] UI 文案 + CMS 双语字段切换
- [ ] localStorage 持久化

---

## 第 6 步：SEO + Admin + 部署

- [ ] meta / og 标签
- [ ] Admin 基础 CRUD 页面
- [ ] Vercel + Railway 部署
- [ ] 域名 + HTTPS

---

## V1.5 后台增强（后续）

- [ ] Tailwind CSS（仅 Admin）
- [ ] shadcn/ui 组件复制改造
- [ ] Admin 表单体验优化

---

## 内容待办（阻塞上线）

| 项 | 负责 | 状态 |
|---|---|---|
| 6 案例完整文案 | 余雅康 | ⬜ |
| 个人 Bio 中英文 | 余雅康 | ⬜ |
| 证书名称/机构/年份 | 余雅康 | ⬜ |
| 微信二维码 PNG | 余雅康 | ✅ |
| 视频号 URL | 余雅康 | ✅ |
| 抖音公开主页 URL | 余雅康 | ⚠️ self 草稿待换 |
| Hero 混剪成品 | 余雅康 / 剪辑 | ⬜ |
| 联系邮箱 / 电话 | 余雅康 | ⬜ |
