# 案例项目文案 — 后台 UI（8.8.2+）

> 统一 `body.cn` / `body.en` 编辑；旧拆分字段保留只读兼容。无自动翻译。

---

## 后台 Tab：项目文案

| 项 | 说明 |
|----|------|
| 中文 | 12 行 textarea → `body.cn` |
| 英文 | 「编辑英文版本」展开后手动编辑 → `body.en` |
| 加载 CN | `body.cn` 优先；空则用 `getCaseBodyCnDraft()` 合并旧字段 |
| 加载 EN | `body.en` 原样显示，不自动生成 |
| 保存 | `normalizeCaseForSave` → `body` + `syncCaseSummaryFromBody` |

## 保存映射

| 字段 | 规则 |
|------|------|
| `body.cn` | 用户输入全文 |
| `body.en` | 用户手动输入/粘贴 |
| `summary.cn` | `body.cn` 首段，最多 120 字 |
| `summary.en` | 仅当 `body.en` 非空时同步（首段，最多 180 字） |
| `background/challenge/…` | **不覆盖、不删除** |

## 前台

详情页 `getCaseIntroductionText()` 已优先 `body`（8.8.1）。列表卡片仍读 `summary`。

---

*手动中英维护 · 无翻译 API*
