# Case Detail Simplification

> YU YAKANG AUDIO · 案例详情页减法整理  
> 日期：2026-07-19  
> 范围：前台展示结构 · **不删数据 · 不改正文 · 不改 API**

---

## 1. 本阶段目标

把案例详情页从「工程报告式多段档案」收成三个核心区块：

1. 项目详细信息  
2. 项目媒体机架  
3. 项目介绍  

去掉概览 / 背景 / 方案 / 效果 / 设备 / 信号链等拆分标题，降低阅读负担。

---

## 2. 保留模块

| 模块 | 实现 |
|------|------|
| 案例 Hero | `CaseDetailHero`（标题、类型、角色、时间、地点、关键词等） |
| 项目详细信息 | `ProjectConsole`（PROJECT DATA） |
| 项目媒体机架 | 视频 / 图片 / 音频（有则显示；全无则空状态） |
| 项目介绍 | 单一正文区，标题「项目介绍」/ `PROJECT INTRODUCTION` |
| CTA | 预约类似项目 / 返回案例列表 |

---

## 3. 隐藏模块（前台不渲染）

以下模块**仅从前台详情页移除展示**，数据字段仍保留在 CMS JSON：

- 项目概览 / OVERVIEW  
- 项目背景 / BACKGROUND  
- 解决方案 / SOLUTION  
- 最终效果 / RESULT  
- 客户反馈（原 FEEDBACK 段）  
- 使用设备与软件 / TOOLS  
- 系统信号链 / SIGNAL FLOW（`SystemSignalFlow`）  
- 媒体区「系统快照」（原 tools 摘要）  
- `PROJECT FILE DETAIL` / 「完整项目档案」重标题  
- 独立「我的角色」长文段（角色仍在 Hero / ProjectConsole meta）

未删除的组件文件：`SystemSignalFlow.jsx`、`ProjectQuickView.jsx`（当前详情页不挂载）。

---

## 4. 是否删除数据

**否。** 未删案例、未删字段、未删媒体文件。

---

## 5. 是否改写正文

**否。** 不润色、不压缩、不重写 `challenge` / `background` / `solution` 等原文。

---

## 6. 项目介绍正文来源规则

实现：`getCaseIntroductionText(caseItem, lang)`（`CaseProjectFile.jsx`）

1. 若 `summary` / `background` / `challenge` / `solution` / `result` 中有 **多于一段** 非空且不完全相同的正文 → 按该顺序去重后拼成一个「项目介绍」区域（段与段之间空行）。  
2. 否则若有 `challenge` → 使用 `challenge`。  
3. 否则依次回退：`summary` → `background` → `description` → `body`。  
4. 全空 → 不渲染介绍区（不显示 undefined）。

标题固定为「项目介绍」+ `PROJECT INTRODUCTION`（延续 7.2，不恢复「项目难点」）。

---

## 7. 是否作用于全部案例

**是。** 所有 `/cases/:slug` 共用 `CaseDetailPage` → `CaseProjectFile`。

含：echo-live-yunfu、wild-live-shenzhen、maca-live-guangning、shuimuhuaya-jingdezhen-2025、mix-gulou-v7、acoustic-simulation-tavern、ncnu-graduation-gala 等。

---

## 8. PC 展示策略

- DOM 顺序：Hero → 详细信息 → 媒体机架 → 项目介绍 → CTA  
- 去掉多段工程档案标题，阅读层级更短  
- 介绍区使用现有 `case-file__prose`，落在 `container--narrow` 内利于阅读  

---

## 9. 手机展示策略

- 取消 `mobile-defer`（原先手机端会隐藏「项目详细信息」）  
- 取消媒体区强制置顶 / 隐藏小标题的特殊逻辑  
- 顺序与 PC 一致：信息 → 媒体 → 介绍  
- 媒体与正文 `max-width: 100%`，避免横向溢出  

---

## 10. 风险与回滚

| 风险 | 说明 |
|------|------|
| 长文合并后较长 | Wild Live 等会把多字段拼进一个介绍区；原文未改，仅少了中间标题 |
| 后台仍编辑多字段 | 正常；前台只读合并结果 |

回滚：恢复上一版 `CaseProjectFile.jsx` 与 `mobile.css` 中 case-file 相关规则。

---

## 11. 未改范围

- 首页 Live / Mixing 拆分  
- Hero 视频 / `HeroVideoCarousel.jsx`  
- API / Strapi / 后台保存  
- 案例 slug / category / featured  
- 案例 JSON 正文与字段  
