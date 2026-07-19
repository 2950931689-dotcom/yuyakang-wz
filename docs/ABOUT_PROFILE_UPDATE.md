# About Profile Update — Round 7.5

> YU YAKANG AUDIO · About 完整个人介绍与能力结构  
> 日期：2026-07-19  
> 范围：About 页前端结构与文案 · **未改首页 / 案例详情 / API / 后台 / 城市显示**

---

## 1. 本阶段目标

将 `/about` 从偏隐喻的控制台展示，整理为清晰的专业档案：

1. 完整个人介绍（长于首页短版）  
2. 分组能力结构（录音混音 / 系统工程 / 现场调音 / 软件工具 / 调音台）  
3. 保留证书图架与现场工作照  
4. 文案真实、克制，非求职简历堆砌  

---

## 2. About 页最终结构

| # | 模块 | 组件 |
|---|------|------|
| 01 | 专业身份 + 完整介绍 | `EngineerIdentity` |
| 02 | 证书与资质（标签 + 证书图） | `CertificationRack` |
| 03 | 录音 / 混音能力 | `AboutCapabilityModules` |
| 04 | 音响工程 / 系统调试能力 | 同上 |
| 05 | 现场调音能力 | 同上 |
| 06 | 常用软件与工具 | 同上 |
| 07 | 调音台与系统经验 | 同上 |
| 08 | 现场工作记录 | `FieldRecord` |
| 09 | 工作方法论 | `WorkPhilosophy` |
| — | 预约 CTA | `AboutCTA` |

已从前台 About 移除：`SignalIdentity`、`ControlSurface`（文件保留，未删）。

---

## 3. 个人资料来源

- 用户提供的完整履历素材（本阶段需求文）  
- `src/lib/aboutContent.js`：`ABOUT_FULL_INTRO`、`ABOUT_IDENTITY_TAGS`、`ABOUT_CREDENTIAL_TAGS`、`ABOUT_CAPABILITY_MODULES`  
- `profile.bio`（mock / example 已同步为 About 长介绍，双段落）  
- `content.certificates` → 证书图架  
- `profile.workPhotos` → 现场工作记录  

---

## 4. 首页短版 vs About 完整版

| | 首页（7.4 / `1ded785`） | About（7.5） |
|--|------------------------|--------------|
| 长度 | 一段短介绍 | 两段完整介绍 |
| 能力 | 身份 + 资质标签 + 证书图 | 五组能力模块 + 证书 + 工作照 |
| 文案文件 | `homeContent.js` | `aboutContent.js` |
| 本阶段 | **未改** | 本阶段更新 |

---

## 5–11. 各模块内容摘要

**01 专业身份**  
dBsource 音响系统工程师 · 中国录音师协会会员 · 录音技术专业背景 · 现场调音 / 后期混音 / 音响系统工程  

**顶部介绍（最终文案）**  
见 `ABOUT_FULL_INTRO` / `profile.bio`：身份与认证段落 + 完整声音流程段落。  

**02 证书与资质**  
初级录音师 · 华汇 DiGiCo 高级技术培训 · VOS 认证音响系统工程师 · 中国录音师协会会员 + 证书图片 rack  

**03 录音 / 混音**  
制式 AB/MS/ORTF/Decca Tree · Cubase/Pro Tools/Studio One · Melodyne · Waves/FabFilter/Slate/Ozone/Valhalla/RX · 人声器乐录音 · 修唱修节奏 · 齿音/口水音/噪声 · 前后级与接口  

**04 音响工程**  
Smaart · VOS4/VOS Pro · EASE Focus · 频响/相位/延时 · 线阵超低模拟 · 处理器 · EQ/延时/限幅/增益  

**05 现场调音**  
FOH / Monitor / OB · 路由母线 · 动态滤波空间效果 · 分轨录音 · PA/Monitor 搭建 · 传声器增益  

**06 软件工具**  
DAW / 插件 / Melodyne / 测量 / EASE Focus  

**07 调音台**  
DiGiCo SD/Quantum · Yamaha TF/CL/QL/PM/DM/MG · Behringer X32/WING · Midas M32/Pro/HD · PreSonus StudioLive · A&H Qu/SQ/dLive/Avantis · Soundcraft Vi/Si  

---

## 12. 是否新增字段

**否（API schema）。**  
仅前端常量 + 更新 mock/example 中已有 `profile.bio` 正文。未新增后台字段、未改保存逻辑。

---

## 13. 是否改 API / 后台

**否。**

---

## 14. 是否改城市显示

**否。** About 侧栏仍可能显示 `LOCATION`（如江西南昌），留待后续「取消城市显示」阶段。

---

## 15. PC / 手机策略

- PC：分节标题 + 短 lead + 标签芯片；证书图架保留  
- 手机：单列；标签 `flex-wrap` + `overflow-wrap: anywhere`；面板 `min-width: 0`  

---

## 16. 风险与回滚

| 风险 | 说明 |
|------|------|
| API 仍返回旧短 bio | `getAboutIntroParagraphs` 会优先显示 CMS bio；fallback 为 `ABOUT_FULL_INTRO` |
| 旧 Signal/Control 组件闲置 | 文件保留，可随时挂回 |

回滚：恢复 `AboutPage.jsx` / `EngineerIdentity.jsx` / `CertificationRack` About 标题，并去掉 `AboutCapabilityModules`。

---

## 17. 未改范围确认

首页结构、Hero 视频、案例详情减法、Live/Mixing 拆分、社媒、流程、诊断、城市清理、API/Strapi/后台 → **均未改**。
