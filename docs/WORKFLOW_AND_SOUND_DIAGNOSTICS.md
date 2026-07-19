# Workflow + Sound Diagnostics — Round 7.7

> YU YAKANG AUDIO · 首页 05 合作流程 + 06 现场声音问题诊断  
> 日期：2026-07-19  
> 范围：首页文案与展示微调 · **未改社媒 / About / 案例详情 / 城市 / API 后台**

---

## 1. 本阶段目标

把首页后半部分两个模块说清楚：

1. **05 合作流程** — 五步协作路径  
2. **06 现场声音问题诊断** — 八类常见问题速览  

不夸张、不编造项目，仅整理既有模块内容与编号。

---

## 2. 合作流程最终五步

1. 沟通需求  
2. 判断现场 / 素材情况  
3. 制定声音方案  
4. 执行调试 / 混音制作  
5. 交付与复盘  

数据：`siteSettings.processSteps`（mock / example 已同步）  
回退：`HOME_WORKFLOW_STEPS`（`homeContent.js`）  
组件：`WorkflowSection` · `sectionIndex={5}`

---

## 3. 声音诊断最终八项

1. 人声不清  
2. 现场啸叫  
3. 低频发轰  
4. 声音刺耳  
5. 覆盖不均匀  
6. 舞台监听混乱  
7. 设备连接复杂  
8. 增益结构不稳定  

数据：`siteSettings.soundIssues`（新增于 mock / example）  
回退：`SOUND_ISSUES`（`homeContent.js`，首页用）  
组件：`SoundIssueSection` · `sectionIndex={6}`  

**未改** Booking 表单的 `bookingContent.SOUND_ISSUES` / `getBookingSoundIssues`。

---

## 4. 首页顺序关系

```
… → 04 社媒视频 → 05 合作流程 → 06 声音诊断 → 服务 → CTA
```

手机 flex order 保持：`process` = 6，`sound-check` = 7（相对其它模块，不倒退 6.5/7.3 阅读流）。

---

## 5. 样式调整

- 合作流程 PC 栅格：`4` 列 → `5` 列（适配五步）  
- 声音诊断 PC：`3` 列 → `4` 列（适配八项）  
- 卡片 `min-width: 0` + `overflow-wrap`，防手机撑破  

---

## 6. 未改范围

社媒视频、About、案例详情、Live/Mixing、城市显示、Hero 视频、API/Strapi/后台保存 → **未改**。

---

## 7. 风险与回滚

| 风险 | 说明 |
|------|------|
| API 仍返回旧 processSteps | 前台显示旧五步文案，直至 CMS 更新；fallback 仅无数组时生效 |
| Booking 问题选项不同 | 有意分离，避免破坏预约表单 |

回滚：恢复 mock/example `processSteps`、删除 `soundIssues`，并还原 `homeContent` / 组件标题序号。
