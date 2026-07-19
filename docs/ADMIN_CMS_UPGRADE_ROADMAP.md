# Admin CMS Upgrade Roadmap — 分阶段改造路线

> 配合：`docs/ADMIN_CMS_UPGRADE_AUDIT.md`  
> 阶段编号：8.0 → 8.8  

---

## 8.0 后台 CMS 升级审计

| 项 | 内容 |
|----|------|
| 目标 | 盘点页面、模块、后台能力、上传、缺口与模型建议 |
| 修改范围 | **仅文档** |
| 风险 | 低 |
| 数据迁移 | 否 |
| 后台 UI | 否 |
| API | 否 |
| 验收 | 两份文档齐备；build/smoke 不因本阶段变差；无代码改动提交 |

---

## 8.1 统一内容模型

| 项 | 内容 |
|----|------|
| 目标 | 建立 `pages` / `sections` / `cases` / `media` / `globalSettings` **兼容层**；前台仍可读旧 JSON |
| 修改范围 | `content.js` / `contentDefaults` / adapter；可选 mock 字段；**不改视觉** |
| 风险 | 中 — fallback 错误会导致模块空白 |
| 数据迁移 | **软迁移**：运行时 normalize；不强制改写生产 JSON |
| 后台 UI | 可选只读「模型调试」；不要求完整编辑器 |
| API | 尽量仍用现有 `PATCH /api/content/section/:key`；新 key 进 allowlist |
| 验收 | mock + API 均可渲染；旧字段齐全时行为与现网一致；smoke 21/21 |

---

## 8.2 媒体库升级

| 项 | 内容 |
|----|------|
| 目标 | 统一图片/音频/视频/封面/缩略图/poster 的上传、选择、软删、引用提示 |
| 修改范围 | `AdminMediaPage`、upload 响应扩展、`mediaLibrary` 索引文件或 section |
| 风险 | 中高 — 孤儿文件、路径错误、大文件磁盘 |
| 数据迁移 | 扫描 `uploads` 生成索引；案例 URL 回填 `mediaId`（可选） |
| 后台 UI | **是** — 选择器替换裸 URL 输入（渐进） |
| API | 扩展 upload/list/trash；可选 replace |
| 验收 | 上传三类媒体成功；选择后写入相对 URL；trash 不破坏未引用检查提示；gitignore 覆盖 uploads |

---

## 8.3 首页模块后台化

| 项 | 内容 |
|----|------|
| 目标 | 首页每模块：标题、eyebrow、说明、排序、显隐、按钮、媒体、案例来源 |
| 修改范围 | Home 组件读 section；新增 Admin Home Modules；迁出 `homeContent` 硬编码 |
| 风险 | 中 — DOM 顺序与 mobile CSS order 耦合 |
| 数据迁移 | 将默认文案写入 siteSettings/sections 初始值 |
| 后台 UI | **是** |
| API | section keys 或单一 `homeSections` |
| 验收 | 改标题/显隐/顺序后首页生效；Hero 视频逻辑不变；mobile 顺序仍正确 |

---

## 8.4 案例管理升级

| 项 | 内容 |
|----|------|
| 目标 | 两大板块、四小分支一等字段；封面/缩略图；媒体；混音音频；排序；首页展示 |
| 修改范围 | case 模型 + AdminCaseEditor + CasesPage/FeaturedCases 读 `caseGroup/Branch` |
| 风险 | 中 — 与旧 category 双写；筛选回归 |
| 数据迁移 | **是** — 由 category 回填 group/branch；保留 category |
| 后台 UI | **是** — 分组选择器 |
| API | 仍 cases section；normalize 增强 |
| 验收 | 首页两板块 + 分支 tab；/cases 筛选；声学模拟仅全部；混音详情播放器不回归；不删案例 |

---

## 8.5 About 页面后台化

| 项 | 内容 |
|----|------|
| 目标 | 介绍、证书、能力模块、工具、调音台经验、方法论可改 |
| 修改范围 | 迁出 `aboutContent.js` 硬编码；Admin About 或扩展 Profile |
| 风险 | 低中 — 文案结构变化 |
| 数据迁移 | 默认模块写入 CMS |
| 后台 UI | **是** |
| API | `profile` 扩展或 `aboutSections` |
| 验收 | About 全模块可改；证书 rack 仍正常；空模块不崩溃 |

---

## 8.6 Contact / Booking / Footer 后台化

| 项 | 内容 |
|----|------|
| 目标 | 联系方式、QR、Booking 文案/选项、Footer、CTA 可改 |
| 修改范围 | contactContent/bookingContent 迁出；Footer 字段 UI；**保留 Booking city 与提交协议** |
| 风险 | 中 — 表单字段乱改会破坏 bookings |
| 数据迁移 | 默认文案入 CMS |
| 后台 UI | **是**（Booking 仅文案/选项，不开放删 city） |
| API | social / siteSettings / 新 bookingConfig |
| 验收 | Contact/Footer/Booking 文案可改；提交仍成功；city 仍在 |

---

## 8.7 后台预览 / 保存安全

| 项 | 内容 |
|----|------|
| 目标 | 保存前预览、备份列表、恢复上一版、字段校验、空内容保护 |
| 修改范围 | Admin 预览抽屉；backup list/restore API；校验增强 |
| 风险 | 中 — restore 误操作 |
| 数据迁移 | 否 |
| 后台 UI | **是** |
| API | list/restore backups；可选 draft |
| 验收 | 可恢复某一备份；必填校验拦截空 title；预览与前台一致 |

---

## 8.8 最终 QA + Push

| 项 | 内容 |
|----|------|
| 目标 | 全站 PC/手机、后台、上传、案例、混音音频、smoke；再决定 push |
| 修改范围 | 仅缺陷修复 |
| 风险 | 发布风险 — 分批 push |
| 数据迁移 | 生产内容备份 |
| 后台 UI | 否 |
| API | 否 |
| 验收 | build + smoke 全绿；人工清单通过；再 tag/push（需明确指令） |

---

## 建议执行顺序（摘要）

```text
8.0 审计（本文档）
  → 清理/提交 plate-branch 工作区改动（独立 commit）
  → 8.1 兼容层模型
  → 8.2 媒体库
  → 8.4 案例 group/branch（与首页强相关，可紧接 8.1）
  → 8.3 首页模块后台化
  → 8.5 About
  → 8.6 Contact/Booking/Footer
  → 8.7 预览与安全
  → 8.8 QA（+ 明确指令后 push）
```

**说明：** 8.4 可与 8.3 对调；若 plate/branch 前端已在工作区完成，8.4 的前半（展示层）可能已部分落地，后台一等字段仍属 8.4。

---

## 最大风险点（路线级）

1. **无兼容层的硬切换** → 生产空白页  
2. **整 section PATCH 互踩** → 丢失编辑  
3. **上传目录与无状态部署** → 媒体丢失  
4. **误删案例/媒体无恢复 UI** → 内容事故  

缓解：分阶段、双读旧字段、自动备份 + 8.7 恢复、对象存储远期方案。
