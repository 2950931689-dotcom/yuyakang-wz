# Admin Media Management Plan

> YU YAKANG AUDIO — 后台媒体管理规划（V1 字段 + V1.5 上传）

## 1. 后台需支持的媒体字段

| 区域 | 字段 | 类型 |
|---|---|---|
| Hero 轮播 | `hero.slides[]` | video, poster, title, caseSlug, startTime, duration, enabled |
| 案例 | `cases[].coverUrl`, `images[]`, `videoUrl`, `audioUrl` | 路径字符串 |
| 证书 | `certificates[].imageUrl` | 路径 |
| 工作照 | `profile.workPhotos[]` | imageUrl, title, description, order |
| 微信 | `socialLinks.wechatQrImage` | 路径 |
| SEO | `seo.ogImageUrl` | 路径 |

## 2. 页面使用关系

| 页面 | 媒体来源 |
|---|---|
| 首页 Hero | `hero.slides` 或单视频 fallback |
| 案例列表 | `cases[].coverUrl` |
| 案例详情 | `images[]`, `videoUrl`, `audioUrl` |
| 关于 | `certificates[]`, `profile.workPhotos[]` |
| 联系 | `socialLinks.wechatQrImage` |

## 3. 上传文件保存位置

```text
public/
  hero/slides/          # 预生成 Hero 短片段（可选）
  cases/{slug}/         # 案例 gallery / video
  certificates/         # 证书扫描图
  images/about/         # 工作照
  images/wechat-qr.jpg  # 微信二维码
```

运行时 CMS 写入 `server/data/site-content.json`，只存路径，不存二进制。

## 4. 避免覆盖旧文件

- 上传时使用 `{slug}-{timestamp}.{ext}` 或 `{id}-v2.{ext}`
- 写入 JSON 前备份到 `server/backups/`
- 旧文件移入 `public/_archive/` 而非直接删除（V1.5）

## 5. 生成 display / thumb / poster

| 类型 | 策略 |
|---|---|
| 案例 gallery | 原图 + 可选 thumb（400px webp） |
| 案例 video | 原 mp4 + poster 首帧 jpg |
| Hero slide | `scripts/prepare-hero-clips.mjs` 截取 3–5s |
| 证书 | jpg/webp，max-width 1200 |

## 6. 替换首页视频

1. Admin 编辑 `hero.slides[]`
2. 调整 `video` / `poster` / `duration` / `enabled`
3. 保存 → PUT `/api/content` → 备份 + 写入 JSON
4. 可选：运行 `prepare-hero-clips.mjs --execute` 生成轻量片段

## 7. 替换案例图片/视频

1. 上传新文件到 `public/cases/{slug}/`
2. 更新 `cases[].images[]` / `videoUrl` / `coverUrl`
3. 前台 MediaLightbox 自动读取新路径

## 8. 替换证书 / 工作照

- 证书：`certificates[]` 增删改 + `imageUrl`
- 工作照：`profile.workPhotos[]` 增删改 + `order`

## 9. 未使用媒体

- Admin 列表标记「JSON 未引用」文件（V1.5）
- 定期清理 `_archive/`（手动确认）

## 10. 版本路线

### V1（当前）

- JSON 字段完整
- 前台 MediaLightbox 预览
- Hero 案例视频轮播
- 手动替换 `public/` 文件 + 编辑 JSON

### V1.5

- Admin 媒体表单（路径输入 + 文件选择）
- 上传至 `public/uploads/`
- 自动备份 + 安全写入

### V2

- 缩略图 / poster 自动生成
- Hero clips ffmpeg 一键生成
- 未引用媒体扫描
