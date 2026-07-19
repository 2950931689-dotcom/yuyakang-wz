# Social Video Highlights — Round 7.6

> YU YAKANG AUDIO · 首页 04：抖音 / 视频号与精选视频  
> 日期：2026-07-19  
> 范围：前端首页模块 · **不抓取 · 不爬虫 · 不改 API / 后台**

---

## 1. 本阶段目标

整理首页 Mixing 案例之后的社媒模块：

1. 平台主页入口（抖音 / 视频号）  
2. 可选的手动精选视频卡片  
3. 无真实链接 / 无精选数据时安全隐藏，不破版  

---

## 2. 当前抖音链接状态

| 字段 | 值 | 首页行为 |
|------|-----|----------|
| `socialLinks.douyinUrl` | `""`（空） | **不显示**抖音主页入口 |
| `socialLinks.douyinUrlDraft` | `…/user/self?…` | **不作为**正式主页入口 |

---

## 3. 当前视频号链接状态

| 字段 | 值 | 首页行为 |
|------|-----|----------|
| `socialLinks.wechatVideoUrl` | `https://weixin.qq.com/sph/AgeXXBTfmy` | **显示**「打开视频号主页」 |
| `socialLinks.wechatQrImage` | `/images/wechat-qr.jpg` | **不用作**视频封面 |

---

## 4. douyinUrlDraft / self 链接处理

- 正式入口只读 `getOfficialDouyinUrl()` → 仅 `douyinUrl`，且排除 `/user/self`。  
- `getDouyinUrl()`（含 draft 回退）仍供 Contact / Tutorial 等使用，可配 draft 提示。  
- 首页 04 **不会**把 self draft 渲染成可点主页按钮。

---

## 5. 平台入口展示逻辑

1. `wechatVideoUrl` 非空 → 显示视频号卡片 + 外链按钮。  
2. `douyinUrl` 正式且非 self → 显示抖音卡片 + 外链按钮。  
3. 无有效平台 → 不渲染平台区。  
4. 平台与精选皆无 → 整个 `#video-highlights` 不渲染。  
5. 外链：`target="_blank"` `rel="noopener noreferrer"`（`ExternalLinkButton`）。  
6. **不**用微信二维码冒充视频封面。

---

## 6. featuredVideos 字段设计

轻量兼容数组（mock / example 为空 `[]`；`normalizeContent` 保证始终为数组）：

```json
{
  "id": "fv-01",
  "title": { "cn": "…", "en": "…" },
  "platform": "wechat-video",
  "description": { "cn": "…", "en": "…" },
  "coverImage": "/images/…",
  "url": "https://…",
  "enabled": true,
  "order": 1
}
```

读取：`getFeaturedVideos(content)`  

规则：`enabled === false` 或 `url` 空 → 跳过；`coverImage` 空 → 不显示封面区。

**未改后台保存 / API schema**；字段缺席时前端安全为空数组。

---

## 7. 无数据隐藏逻辑

| 情况 | 结果 |
|------|------|
| 仅有视频号 | 只显示平台入口 |
| 仅有正式抖音 | 只显示抖音入口 |
| 有平台 + featured | 平台区 + 精选区 |
| 两者皆无 | 整模块 `return null` |
| featured 为空数组 | 不显示精选区，无空白大块 |

---

## 8. 为什么本阶段不自动抓取最新视频

1. 抖音 / 视频号无稳定、简单的公开视频 API。  
2. 自动抓取常涉及登录、反爬、跨域与接口失效。  
3. 抓封面会拖累官网稳定性与维护成本。  
4. 个人站第一版采用**手动精选**更可控。  

---

## 9. 后续半自动更新前提

若要半自动：

1. 后台或本地录入 `featuredVideos`（标题、封面、外链）。  
2. 或自建中转数据源（非爬虫硬抓）。  
3. 明确封面资产存放与更新流程。  
4. 单独阶段设计，不混入 Hero / 案例详情。

---

## 10. PC / 手机展示策略

- 位置：Mixing 案例之后（`home-section--video-highlights`，手机 `order: 4`）。  
- PC：平台卡片网格 + 可选精选 16:9 封面。  
- 手机：单列、`min-width: 0`、`overflow-wrap`、按钮 ≥44px。  

---

## 11. 风险与回滚

| 风险 | 缓解 |
|------|------|
| API 无 `featuredVideos` | `normalizeContent` → `[]` |
| 误把 draft 当正式抖音 | `getOfficialDouyinUrl` |

回滚：恢复 `VideoHighlights.jsx` 与去掉 `featuredVideos` 合并即可。

---

## 12. 未改范围

Hero 视频、About、案例详情、Live/Mixing、合作流程、声音诊断、城市、API/Strapi/后台 → **未改**。
