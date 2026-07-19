# Case Section Split — Round 7.3

> 日期：2026-07-19  
> 目标：首页「精选案例」拆为 **现场 Live** 与 **后期 / 混音** 两区；声学模拟移出首页主线但保留数据与 `/cases`。

## 1. 本阶段目标

1. 首页 Live 区块：现场 / 巡演 /（精选）活动扩声  
2. 首页 Mixing 区块：混音 / 录音后期  
3. `acoustic-simulation-tavern` 不出现在首页两区  
4. `/cases` 与详情页完整保留声学模拟  
5. 不改 CMS schema、featured、Hero、API、Strapi、城市、社媒、流程  
6. 保持 7.2「项目介绍」标签  

## 2. Live 区块筛选规则

`getHomeLiveCases(content)`：

- `visible !== false`
- `featured === true` 或 `isFeatured === true`
- `category` ∈  
  - `livehouse-system-tuning`  
  - `tour-system-engineering`  
  - `event-sound-reinforcement`  

排除（因不在 allowlist）：

- `mixing-post-production`  
- `recording-editing`  
- `acoustic-simulation`  

## 3. Mixing 区块筛选规则

`getHomeMixingCases(content)`：

- `visible !== false`
- `featured === true` 或 `isFeatured === true`
- `category` ∈  
  - `mixing-post-production`  
  - `recording-editing`  

## 4. Acoustic 案例处理方式

| 项 | 处理 |
|----|------|
| 数据 | 保留 |
| slug / 正文 / 详情 | 不变 |
| `/cases` 筛选「声学模拟」 | 不变 |
| `/cases/acoustic-simulation-tavern` | 可访问 |
| 首页 Live / Mixing | **筛选排除**（不改 `featured`） |

## 5. 是否修改 featured

**否。**

## 6. 是否新增字段

**否。**

## 7. 是否改 CMS schema

**否。**

## 8. 是否保留 /cases 声学模拟筛选

**是。** `/cases` 仍用原 `CATEGORY_FILTERS` + `getCases`。

## 9. 水木年华 / 巡演系统归属

`shuimuhuaya-jingdezhen-2025`（`tour-system-engineering` + featured）→ **Live 区块**。

## 10. mix-gulou-v7 少案例 / 无封面

- Mixing 区仅显示真实数据（当前 1 条）  
- 不编造案例 / 试听  
- 无封面时沿用 `CaseCard` 既有 `MediaFallback`  

## 11. 保持「项目介绍」标题

本阶段未改 `CaseProjectFile`。详情页仍为「项目介绍」/ `02 / INTRODUCTION`，不恢复「项目难点」。

## 12. 实现方案

**方案 A+C：**

- `getHomeLiveCases` / `getHomeMixingCases`（`content.js`）  
- `FeaturedCases` 增加 `variant: "live" | "mixing"`，复用 `CaseCard`  
- `HomePage` 两个 section：`#live-cases` / `#mixing-cases`  
- `mobile.css` order：证书 → Live → Mixing → 视频 → CTA → …  

## 13. 风险与回滚

| 风险 | 缓解 |
|------|------|
| Mixing 仅一条显得空 | 接受；EmptyState 仅在零条时出现 |
| 手机 order 错乱 | 显式 1–8 order |

回滚：

```powershell
git checkout HEAD -- `
  src/lib/content.js `
  src/components/home/FeaturedCases.jsx `
  src/pages/HomePage.jsx `
  src/styles/mobile.css `
  docs/CASE_SECTION_SPLIT.md
```

## 14. 本轮首页 Live / Mixing 实际列表（mock）

**Live：**

1. echo-live-yunfu  
2. wild-live-shenzhen  
3. maca-live-guangning  
4. shuimuhuaya-jingdezhen-2025  

**Mixing：**

1. mix-gulou-v7  

**首页不展示：** acoustic-simulation-tavern、ncnu-graduation-gala（featured: false）
