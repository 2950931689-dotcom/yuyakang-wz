# Case Detail Label Cleanup — Round 7.2

> 日期：2026-07-19  
> 范围：全案例详情页 UI 标题「项目难点」→「项目介绍」

## 1. 搜索到的「项目难点 / Challenge」显示位置

| 位置 | 类型 | 处理 |
|------|------|------|
| `src/components/cases/CaseProjectFile.jsx` | 前台详情 section 标题 + code `02 / CHALLENGE` | **已改 UI** |
| `src/components/cases/ProjectQuickView.jsx` | QuickView 卡片标题（当前未被路由引用） | **已改 UI**（一致性） |
| `src/data/site-content.mock.json` → `i18n.cases.challenge` | CMS i18n 显示文案 | **已改文案值**（非字段名） |
| `server/data/site-content.example.json` → `i18n.cases.challenge` | 同上 | **已改文案值** |
| `caseItem.challenge`（各案例 JSON） | **数据字段 / 正文** | **未改** |
| `AdminCaseEditor`「挑战」 | 后台编辑标签 | **未改**（非前台详情页） |
| `content.js` completeness `field: "challenge"` | 内部字段名提示 | **未改** |
| 历史 docs（CMS_SCHEMA 等） | 文档描述 | **未改**（本轮仅新增本说明） |

## 2. 修改了哪些 UI label

| 原显示 | 新显示 |
|--------|--------|
| 项目难点 | 项目介绍 |
| Challenge | Introduction |
| PROJECT CHALLENGE / `02 / CHALLENGE` | PROJECT INTRODUCTION / `02 / INTRODUCTION` |
| 现场问题 / On-Site Challenge（QuickView） | 项目介绍 / Introduction |

## 3. 是否修改了数据字段名

**否。** 仍读取 `caseItem.challenge`。

## 4. 是否修改了案例正文

**否。** 各案例 `challenge.cn/en` 正文未改写。

## 5. 是否影响后台保存

**否。** Admin 仍保存 `challenge` 字段；未改保存逻辑。

## 6. 是否影响 API / Strapi

**否。**

## 7. 是否影响首页 Hero

**否。**

## 8. 是否适用于全部案例

**是。** 标签来自 `CaseProjectFile` 共用组件，作用于全部 `/cases/:slug` 详情页，包括：

- echo-live-yunfu  
- wild-live-shenzhen  
- maca-live-guangning  
- shuimuhuaya-jingdezhen-2025  
- mix-gulou-v7  
- acoustic-simulation-tavern  
- ncnu-graduation-gala  

## 9. 回滚方法

```powershell
git checkout HEAD -- `
  src/components/cases/CaseProjectFile.jsx `
  src/components/cases/ProjectQuickView.jsx `
  src/data/site-content.mock.json `
  server/data/site-content.example.json `
  docs/CASE_DETAIL_LABEL_CLEANUP.md
```
