# 社媒与联系方式配置说明

> 更新日期：2026-07-05 · Schema v1.0.1

---

## 已写入 CMS 的数据

### socialLinks

| 字段 | 当前值 |
|---|---|
| `douyinUrl` | `""`（空，待填公开链接） |
| `douyinUrlDraft` | `https://www.douyin.com/user/self?from_tab_name=main&showTab=post` |
| `wechatVideoUrl` | `https://weixin.qq.com/sph/AgeXXBTfmy` |
| `wechatQrImage` | `/images/wechat-qr.jpg` |
| `phone` | `""` |
| `email` | `""` |
| `location.cn` | 江西南昌 |
| `location.en` | Nanchang, Jiangxi |

### hero.primaryButton

- 文案：观看代表视频 / Watch Video
- 链接（手机 + PC）：视频号 `https://weixin.qq.com/sph/AgeXXBTfmy`

### hero.secondaryButton

- 文案：查看案例作品 / View Cases
- 链接：`/cases`

---

## 微信二维码

- 文件路径：`public/images/wechat-qr.jpg`（约 100 KB）
- 来源：用户提供的 PNG 副本，未压缩
- 展示位置：Contact · Booking 提交成功 · 手机端底部 CTA · 首页预约区
- 后台：`/admin/social` 支持上传更换

---

## 抖音链接注意事项

当前 `douyinUrlDraft` 含 `/user/self`，**不是公开主页链接**。

获取正确链接步骤：
1. 抖音 App → 我的主页
2. 分享 → 复制主页链接
3. 填入后台 `douyinUrl`（正式字段）
4. 清空或保留 `douyinUrlDraft` 作备份

后台规则：检测到 `/user/self` 时显示黄色警告。

---

## 待用户补充（可选）

1. 抖音公开主页链接
2. 是否公开手机号
3. 是否公开邮箱

第一版建议：**仅微信二维码 + 预约表单**，不公开手机/邮箱。
