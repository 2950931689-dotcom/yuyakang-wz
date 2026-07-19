# Case Plate Taxonomy — 两大板块 / 四小分支

> YU YAKANG AUDIO · 2026-07-19  
> 范围：首页精选案例 + `/cases` 筛选；不改案例详情、混音播放器、Hero

---

## 1. 结构

### 板块 1：现场 / 系统

| 分支 | branchId | CMS `category` |
|------|----------|----------------|
| 系统工程 | `system-engineering` | `tour-system-engineering` |
| 现场调音 | `live-tuning` | `livehouse-system-tuning` + `event-sound-reinforcement` |

### 板块 2：后期 / 混音

| 分支 | branchId | CMS `category` |
|------|----------|----------------|
| 多轨混音 | `multitrack-mixing` | `mixing-post-production` |
| 贴唱混音 | `vocal-mixing` | `recording-editing` |

### 「全部」

含所有可见案例，**包括** `acoustic-simulation`。声学模拟不进入两大板块。

---

## 2. 展示规则

| 页面 | 行为 |
|------|------|
| 首页 | 仍两个大区块；每块内 tab 切换分支（不拆四个长区块） |
| `/cases` | 顶层：全部 \| 现场/系统 \| 后期/混音；选中板块后再显示两分支 tab |
| URL | `/cases?plate=live\|mixing&branch=…` |

默认分支：板块1 → `live-tuning`；板块2 → `multitrack-mixing`。

---

## 3. 与详情「贴唱 / 分轨」的区别

| 概念 | 层级 | 说明 |
|------|------|------|
| 列表「贴唱混音 / 多轨混音」 | 案例类型分支 | `case.category` |
| 详情「贴唱 / 分轨」播放器 | 单案音频模块 | `mixingAudioModules` |

二者独立，本阶段未改播放器。

---

## 4. 实现文件

- `src/lib/content.js` — `CASE_PLATES`、`getCases({ plateId, branchId })`、`getHomePlateCases`
- `src/lib/caseAdmin.js` — 后台分类文案对齐
- `src/components/home/FeaturedCases.jsx`
- `src/components/cases/CaseFilter.jsx`
- `src/pages/CasesPage.jsx`
- `src/styles/components.css` — `.case-branch-tabs`

---

## 5. 未改范围

- 案例详情减法结构 / `CaseProjectFile`
- 混音贴唱·分轨播放器
- `HeroVideoCarousel` / Hero 视频逻辑
- 未删除任何案例；未改 CMS category ID（仅展示映射）

---

## 6. 回滚

`git revert` 本阶段 commit，或恢复 `CATEGORY_FILTERS` 扁平筛选与旧 `FeaturedCases`。
