# Strapi 迁移路线图 — 方案 B

> YU YAKANG AUDIO · JSON CMS → Strapi 唯一数据源  
> 原则：分模块迁移、单写入源、可回滚、前台 contract 不变

---

## 总览

```text
6.0  PoC + 模型设计          ← 本轮（仅文档 + 本地 PoC）
6.1  strapiClient / Adapter  骨架
6.2  GET /api/content 双源
6.3  CommonTools 写入 Strapi
6.4  Contact / SocialLinks
6.5  Certificates / WorkPhotos
6.6  Profile / Services
6.7  Cases
6.8  Bookings
6.9  JSON CMS → backup-only
```

---

## 第 6.0 轮 — 本地 PoC + Content-Type 设计

**目标：**

- [x] 同级目录 `yuyakang-strapi-poc`（不进主仓库）
- [x] 文档：`STRAPI_OPTION_B_ARCHITECTURE.md`
- [x] 文档：`STRAPI_CONTENT_MODEL_PLAN.md`
- [x] 文档：`STRAPI_MIGRATION_ROADMAP.md`
- [ ] PoC：CommonTools + Smaart 测试数据 + REST 验证

**禁止：** 改前台、改 Express API、改 JSON 写入、部署生产。

**验收：** 主项目 `build` + `smoke` 仍通过。

---

## 第 6.1 轮 — Express Strapi Client / Adapter

**新增（主仓库）：**

```text
server/lib/strapiClient.js
server/lib/strapiAdapter.js
server/lib/strapiConfig.js   # 可选
```

**环境变量（`.env.example` 占位，`STRAPI_ENABLED=false`）：**

```env
STRAPI_ENABLED=false
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=
STRAPI_TIMEOUT_MS=5000
```

**任务：**

1. `strapiClient` — fetch collection/single，处理 Strapi v5 REST 路径与 Token header。
2. `strapiAdapter` — `normalizeCommonTools()` 等，单元测试对照 mock JSON。
3. **不修改** `GET /api/content` 行为（Adapter 仅被测试脚本调用）。

**验收：**

```bash
node scripts/strapi-adapter-smoke.mjs   # 新建，读本地 Strapi 或 fixture
```

---

## 第 6.2 轮 — GET /api/content 双源读取

**修改：** `server/index.js` 中 `GET /api/content` only。

```javascript
if (STRAPI_ENABLED === "true") {
  try {
    return res.json(await buildSiteContentFromStrapi(...));
  } catch (e) {
    console.warn("[strapi] fallback", e);
  }
}
return jsonCmsContent();
```

**环境：** 本地 `STRAPI_ENABLED=true` 验证；生产默认 `false`。

**验收：**

- Strapi 在线时 `/api/content` 结构与 JSON 版一致（深度对比 key）
- Strapi 宕机时 fallback JSON
- `cms-linkage-verify` 在双源模式下仍通过（或新增 strapi 模式 flag）

---

## 第 6.3 轮 — CommonTools 写入 Strapi

**首批试点模块** — 字段已与 Admin 对齐。

**流程：**

```text
/admin/common-tools
  → PATCH /api/content/section/siteSettings  （改前）
  → PATCH /api/admin/common-tools             （改后）
  → requireAdminAuth
  → strapiClient sync common-tools collection
  → GET /api/content 从 Strapi 读
  → /contact 显示工具链接
```

**JSON CMS：** 该 section 停止 PATCH；保留只读 fallback。

**验收：**

- Admin 保存 Smaart 后刷新 Contact 可见
- JSON 文件不再更新 `commonTools`
- 回滚：`STRAPI_ENABLED=false` 仍显示旧 JSON 数据

---

## 第 6.4 轮 — Contact / SocialLinks

- 迁移 `socialLinks` Single Type
- Admin Contact / Location 页改走 Express → Strapi
- `wechatId` 复制按钮、`contactNote` 双语

---

## 第 6.5 轮 — Certificates / WorkPhotos

- 媒体走 Strapi Media（PoC 本地；生产 Cloudinary）
- Adapter 输出 `imageUrl` / `coverUrl` 与现路径兼容
- 前台 About / Cases 证书区不变

---

## 第 6.6 轮 — Profile / Services

- Profile Single Type + Services Collection
- Hero / About 绑定 `getProfileIdentity()` 数据源切换为 Adapter 输出
- `siteSettings.processSteps` 可并入 SiteSettings Single Type

---

## 第 6.7 轮 — Cases

**最复杂模块：**

- gallery、signalFlow、hero slides 关联
- slug 唯一索引
- 大批量媒体 → CDN

**分步：**

1. 只读 Cases 从 Strapi
2. Admin Cases 写入 Strapi
3. Hero carousel caseSlug 关联验证

---

## 第 6.8 轮 — Bookings

- `POST /api/bookings` → Strapi Bookings collection
- Admin bookings 列表 PATCH status
- 敏感字段不暴露 Public API

---

## 第 6.9 轮 — JSON CMS backup-only

**最终状态：**

| 操作 | JSON CMS | Strapi |
|------|----------|--------|
| 读取 fallback | ✓ 只读 | ✓ 主 |
| Admin 写入 | ✗ | ✓ |
| 定时备份 | cron → git 或 S3 | Strapi 原生 |

**脚本：**

```bash
node scripts/export-strapi-to-json.mjs   # 灾难恢复
node scripts/import-json-to-strapi.mjs   # 一次性迁移（6.7 后）
```

---

## 回滚策略

| 级别 | 操作 |
|------|------|
| **L1 即时** | Render 设 `STRAPI_ENABLED=false` → 立即回 JSON |
| **L2 模块** | 单模块 feature flag `STRAPI_MODULES=commonTools,social` |
| **L3 数据** | 从 `server/backups/` 或 export 脚本恢复 JSON |
| **L4 代码** | git revert Adapter 相关 commit |

**禁止回滚到双写。**

---

## 验收标准（全迁移完成）

- [ ] `STRAPI_ENABLED=true` 生产 7 天无 fallback 告警
- [ ] 所有 Admin 保存路径零 JSON PATCH
- [ ] `npm run test:smoke` 21/21
- [ ] `cms-linkage-verify` 5/5
- [ ] Hero 视频、案例 gallery、证书图正常（CDN + public）
- [ ] Booking 提交进 Strapi Admin 可见
- [ ] Strapi Token 未出现在浏览器 Network
- [ ] JSON export 每日备份可恢复

---

## 风险登记

| 风险 | 影响 | 缓解 |
|------|------|------|
| Node 22 要求 | 本地/PoC 安装失败 | nvm use 22 |
| Adapter 双语映射错误 | 前台中英文错乱 | fixture 测试 |
| 媒体 URL 变化 | 404 | Adapter 统一 CDN 规则 |
| Render 免费 DB 过期 | 数据丢失 | 生产 Postgres 付费 |
| 迁移期双写 | 数据分叉 | 6.3 起禁 JSON PATCH |
| Cases 复杂度高 | 延期 | 6.7 单独一轮 |

---

## 下一步建议

**若 PoC 成功：** 进入 **6.1**（Adapter 骨架 + 本地 Strapi 联调）。

**若 PoC 未成功：** 先在本机 Node 22 完成 PoC，**仍可先提交 6.0 文档**；6.1 等 PoC REST 验证通过再开。

**不建议：** 跳过 PoC 直接改生产 `GET /api/content`。
