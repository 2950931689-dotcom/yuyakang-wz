# Wild Live Case Update — Round 7.2

> 日期：2026-07-19  
> 范围：仅更新 `wild-live-shenzhen` 文案与标签（现有 schema）

## 1. 修改的案例 slug

`wild-live-shenzhen`

## 2. 原标题

- cn: `深圳南山 Wild Live`
- en: `Wild Live · Shenzhen`

## 3. 新标题

| 用途 | 字段 | 值 |
|------|------|-----|
| 首页卡片 / 详情 H1 | `title.cn` | `深圳南山 Wild Live` |
| 英文标题 | `title.en` | `Wild Live · Shenzhen Nanshan` |
| 详情正文导语 | `background.cn` 首段 | `深圳市南山区 Wild Live 场地音响系统改造与现场调音案例分享` |
| SEO | `seo.title.cn` | `深圳南山 Wild Live 场地音响系统改造与现场调音 \| YU YAKANG AUDIO` |

说明：现有 schema 仅有单一 `title` 字段。首页卡片需要短标题，故 H1 保持短标题；完整详情标题放入正文导语与 SEO，避免卡片溢出，且不新增 schema。

## 4. 首页摘要

`summary.cn`：

> 小型 Live 场地音响系统改造与现场调音，重点优化覆盖、低频控制与 PA / Monitor 工作流。

## 5. 详情正文放入了哪些字段

| 字段 | 内容 |
|------|------|
| `summary` | 短摘要（首页 / 列表） |
| `background` | 案例导语 + 项目说明 + 系统配置 + 前期规划原则 |
| `challenge` | 低频驻波问题 + 小尺寸点声源选型理由 |
| `solution` | 声学模拟摆位、测量调试、UNIT48 分区管理、WING RACK + Double Patch、乐队调音 |
| `result` | 综合优化结论 + Live 系统设计原则 |
| `role` | 场地音响系统改造与现场调音 |
| `services` | 系统改造 / 测量调试 / 现场乐队调音 |
| `equipment` | 音箱与处理器配置说明 |
| `toolsUsed` | UNIT48、WING RACK、Double Patch 等芯片标签 |
| `tags` | LIVE SYSTEM TUNING / FIELD SOUND REINFORCEMENT / PA / MONITOR WORKFLOW |
| `seo.keywords` | 技术关键词（中英） |

分类保持：`livehouse-system-tuning`（现场 Live）。

## 6. 是否修改 slug

否。

## 7. 是否新增案例

否。

## 8. 是否删除案例

否。

## 9. 是否修改案例分类

否（仍为 `livehouse-system-tuning`）。

## 10. 是否影响 Hero

仅同步 Hero 轮播中该 slide 的显示标题文案为「深圳南山 Wild Live」；**未改** 视频路径、时长、海报或 `HeroVideoCarousel.jsx`。

## 11. 是否影响首页视频

否（视频文件与逻辑未改）。

## 12. 是否影响 API / CMS / Strapi

否。仅更新 JSON 内容源：

- `src/data/site-content.mock.json`（入库）
- `server/data/site-content.example.json`（入库）
- `server/data/site-content.json`（本地运行时，**gitignore**，不提交）

## 13. 回滚方法

```powershell
git checkout HEAD -- src/data/site-content.mock.json server/data/site-content.example.json docs/WILD_LIVE_CASE_UPDATE.md
```

本地 `server/data/site-content.json` 可从 example 复制恢复，或从 git 历史中的 mock 同步。
