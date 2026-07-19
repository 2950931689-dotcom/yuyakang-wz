# Homepage Restructure Plan — Round 7.1

> YU YAKANG AUDIO · 首页结构重排  
> 日期：2026-07-19  
> 前置：`docs/HOMEPAGE_RESTRUCTURE_AUDIT.md`（7.0）

---

## 1. 7.1 实际调整了哪些 section 顺序

| 改动 | 说明 |
|------|------|
| DOM 重排 | `HomePage.jsx`：案例 / 视频提前，流程与诊断跟随，服务后置 |
| 精选视频 PC 可见 | `VideoHighlights` 去掉 `mobile-only-block` |
| 手机 CSS order | 服务与流程/诊断顺序对齐新 DOM；保留 CTA 在流程之前（6.5 优势） |
| 视频卡片样式 | 提升为 PC+手机共用样式，避免 PC 无样式 |

**未改：** Hero、案例数据、featured 标记、CMS schema、城市显示、About/Cases/Contact、API/Strapi/后台。

---

## 2. PC 首页调整前后顺序

### 调整前（7.0 审计）

1. Hero  
2. CredentialsSection（专业背书）  
3. HomeMobileCertificates（隐藏）  
4. ServicePreview  
5. WorkflowSection  
6. FeaturedCases  
7. VideoHighlights（隐藏）  
8. SoundIssueSection  
9. BookingCTA + TutorialSection  

### 调整后（7.1）

1. Hero  
2. CredentialsSection（临时专业介绍区）  
3. HomeMobileCertificates（仍仅手机；证书全端留给 7.3）  
4. FeaturedCases（仍为单一精选列表）  
5. VideoHighlights（**PC 可见**；无数据则整段不渲染）  
6. WorkflowSection（合作流程 → 靠近最终 05）  
7. SoundIssueSection（声音诊断 → 靠近最终 06）  
8. ServicePreview（**后置**辅助内容）  
9. BookingCTA + TutorialSection  

---

## 3. 手机首页调整前后顺序

### 调整前（6.5）

1. Hero  
2. 专业证书  
3. 精选案例  
4. 精选视频  
5. 预约 / 教程  
6. 服务  
7. 合作流程  
8. 声音诊断  

### 调整后（7.1）

1. Hero  
2. 专业证书  
3. 精选案例  
4. 精选视频  
5. 预约 / 教程（**保留 6.5：CTA 仍在流程前**）  
6. 合作流程  
7. 声音诊断  
8. 服务（后置）  

相对 6.5：仅把「服务」与「流程/诊断」对调位置（服务更后），核心阅读主线不变。

---

## 4. 最终目标本阶段没有做的部分

| 最终目标 | 7.1 状态 |
|----------|----------|
| 01 个人介绍 + 专业证书（全端） | 未做；保留 PC 文字背书 + 手机证书图 |
| 02 现场 Live 精选（独立区） | 未拆；仍用统一 FeaturedCases |
| 03 后期 / 混音独立区 | 未拆 |
| 04 抖音正式链接 / 视频条目 CMS | 未做；沿用现有外链逻辑 |
| 05 合作流程 | **已移位** |
| 06 声音诊断 | **已移位** |
| 07 取消所在城市 | **未做** |

---

## 5. 为什么本阶段不拆 Live / Mixing 案例

1. 7.0 审计标明需产品确认（如水木年华是否算 Live）。  
2. 拆分会改筛选 helper / FeaturedCases API，超出「只重排」范围。  
3. 声学模拟仍在 featured 混池中；拆分时再统一规则，避免两次改同一组件。  

→ 留给 **7.2**。

---

## 6. 为什么本阶段不清理城市字段

1. 城市出现在 Footer / Contact / About / display 开关等多处。  
2. 易与案例「项目地点」混淆误删。  
3. 与首页顺序无关，应单独验收。  

→ 留给 **7.5**（或后续城市专项）。

---

## 7. 为什么本阶段不改 CMS schema

1. 重排只需 JSX + CSS。  
2. 新增 `caseType` / `homeSection` / 视频条目数组会牵动 admin、mock、server、Strapi 适配。  
3. 抖音正式 URL 仍缺，不必为此先改 schema。  

---

## 8. 下一阶段 7.2 建议

**主题：Featured Cases Split — Live vs Mixing（仍不删声学模拟数据）**

建议：

1. 首页拆两个区块：现场 Live / 后期混音。  
2. 用现有 `category` 过滤（`livehouse-system-tuning` + 可选 tour；`mixing-post-production`）。  
3. 声学模拟：从首页 featured 展示中排除（`featured: false` **或** 代码过滤），数据保留。  
4. 确认水木年华归属后再定 filter。  
5. 仍不改 HeroVideoCarousel、CMS schema（除非必要）、城市、Strapi。  

---

## 9. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 手机 order 与 DOM 冲突导致错序 | 已显式设置 1–7；390/430 人工核对 |
| PC 突然出现视频模块 | 无链接时 `return null`；有视频号则显示外链卡 |
| 服务后置影响锚点 `#services` | id 保留，仅位置变化 |

**回滚：** 还原 `HomePage.jsx`、`VideoHighlights.jsx`（加回 `mobile-only-block`）、`mobile.css` 中 7.1 order/样式块；或 `git revert` 本 commit。

---

## 10. 修改文件清单（7.1）

- `src/pages/HomePage.jsx`
- `src/components/home/VideoHighlights.jsx`
- `src/styles/mobile.css`
- `docs/HOMEPAGE_RESTRUCTURE_PLAN.md`（本文件）
- （可选同批）`docs/HOMEPAGE_RESTRUCTURE_AUDIT.md`（7.0 审计，此前未入库）
