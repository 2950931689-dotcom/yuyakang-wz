# Homepage Profile + Certificates — Round 7.4

> YU YAKANG AUDIO · 首页 01：个人介绍 + 专业证书  
> 日期：2026-07-19  
> 范围：前端首页模块整合 · 未改 API / Strapi / Hero 视频 / 案例拆分

---

## 1. 本阶段目标

1. 首页出现清晰的短版个人介绍（非 About 完整简历）。
2. PC 端与手机端均展示专业证书 rack。
3. 手机端证书（及个人介绍）继续靠前（Hero 之后）。
4. 复用 `content.certificates` 与 `CertificationRack`。
5. 消除重复的「专业背书 / 证书 / 个人介绍」模块。

---

## 2. 首页最终短版个人介绍

**中文：**

余雅康，dBsource 音响系统工程师，中国录音师协会会员，录音技术专业背景，持有初级录音师、华汇 DiGiCo 高级技术培训与 VOS 音响系统工程师认证。工作覆盖现场扩声、FOH / Monitor / OB 调音、系统测量调试、录音与后期混音，能够从音乐制作、录音到现场扩声系统搭建中理解声音的完整流程。

**英文：** 见 `src/lib/homeContent.js` → `HOME_PROFILE_INTRO.en`。

文案放在前端常量，不改 CMS schema / API。

---

## 3. 资质标签

| 中文 | 英文 |
|------|------|
| 中国录音师协会会员 | China Recording Engineers Association |
| 录音技术专业 | Recording Technology Background |
| 初级录音师证书 | Junior Recording Engineer |
| 华汇 DiGiCo 高级技术培训 | Huahui DiGiCo Advanced Training |
| VOS 认证音响系统工程师 | VOS Certified Sound System Engineer |

身份标签：`dBsource 音响系统工程师` · `现场调音师` · `后期混音师` · `音响系统工程师`

---

## 4. 留到 About（7.5）的完整简历信息

- `skillGroups`（DAW、插件、录音制式、调音台清单等）
- `tools` / ToolRack
- `experience` 时间线与占位条目
- `ProfileArchive` 长 bio、完整技能分组
- 工作照 `workPhotos`
- 哲学 / 控制台参数等 About 专属模块

---

## 5. 证书数据来源

- `content.certificates`（mock / API）
- 读取：`getVisibleCertificates(content)`
- 原图路径：`public/certificates`（本阶段未改）

---

## 6. 是否复用 CertificationRack

是。`HomeProfileSection` 以 `embedded` 模式嵌入 `CertificationRack`：

- 保留证书网格、`object-fit: contain`、点击 lightbox
- 嵌入时隐藏 About 页的 SectionTitle，改用轻量「专业证书」标题
- About 页调用方式不变（`embedded` 默认 `false`）

---

## 7. HomeMobileCertificates

**已删除并合并**进 `HomeProfileSection`。

不再存在仅手机 DOM 的独立证书 section。

---

## 8. CredentialsSection

**已删除并由 `HomeProfileSection` 替代。**

原「专业背书」文字列表不再单独出现在首页，避免与个人介绍重复。

`getHomeCredentials` 仍保留在 `cmsBinding.js`（供其他潜在用途），首页不再调用。

---

## 9. PC 展示策略

- Hero 下方单一 `#profile` / `home-section--profile`
- 含：SectionTitle「个人介绍」→ 姓名/品牌 → 身份标签 → 短文 → 资质标签 → 证书 rack
- 证书对 PC 可见（不再 `mobile-only-block`）

---

## 10. 手机展示策略

- 同一 `#profile` 模块（无第二套证书 DOM）
- CSS flex `order: 1`：`home-section--profile`
- 其后：Live → Mixing → Video → Conversion → Process → Sound → Services
- 证书图单列、`object-fit: contain`，不裁切文字

---

## 11. 与 7.3 Live / Mixing 的顺序关系

```
Hero
→ 01 个人介绍 + 专业证书   (#profile)
→ 02 现场 Live 精选案例   (#live-cases)
→ 03 后期 / 混音案例      (#mixing-cases)
→ 04 视频 / 社媒入口
→ 05 合作流程
→ 06 现场声音问题诊断
→ 服务 / CTA
```

未改 `getHomeLiveCases` / `getHomeMixingCases` 筛选规则。

---

## 12. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 文案与 CMS bio 不完全一致 | 首页用 `homeContent` 常量；About 仍用 profile.bio |
| 删除旧组件导致外部引用 | 仓库内仅 HomePage 引用；已切换 |
| 手机 order 回退 | 仅把 `--certificates` 改为 `--profile`，序号不变 |

回滚：恢复 `CredentialsSection` + `HomeMobileCertificates` 挂载，并还原 `HomePage.jsx` / mobile order 类名。

---

## 13. 方案选择

**方案 C**：新增 `HomeProfileSection`，整合原 Credentials 能力标签思路与证书 rack，首页不再保留独立「专业背书」模块。
