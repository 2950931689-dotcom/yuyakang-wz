# YU YAKANG AUDIO — 素材整理规则与命名规范

> 原始素材目录（只读）：`E:\卓面应用\个人文件\Cursor\余`  
> 网站素材目录（可写）：`public/`  
> 执行脚本：`scripts/copy-assets-from-source.mjs`（默认 dry-run）

---

## 1. 核心原则

1. **绝不修改**原始资料目录中的任何文件
2. **绝不移动**原始素材
3. **绝不删除**任何文件
4. 所有网站用素材均为 **复制副本** 或 **转码副本**
5. 脚本默认 **dry-run**，需 `--execute` 才真正写入
6. 目标文件已存在时 **自动跳过** 或 **追加序号后缀**

---

## 2. 目录映射

| 原始路径 | 网站路径 | 处理方式 |
|---|---|---|
| `系统工程，调音案例/{项目}/图片/*` | `public/cases/{slug}/gallery/` | 复制 → WebP 优化 |
| `系统工程，调音案例/{项目}/视频/*.mp4` | `public/cases/{slug}/video.mp4` | 复制（首个视频） |
| `后期混音案例/贴唱/*.mp3` | `public/audio/{slug}.mp3` | 复制或转码 |
| `后期混音案例/多轨混音/*.mp3` | `public/audio/{slug}.mp3` | 复制 |
| `后期混音案例/多轨混音/*.wav` | `public/audio/{slug}.mp3` | WAV→MP3 转码 |
| `后期混音案例/实录视频/*.mp4` | `public/cases/mix-recording-reel/` | 复制 |
| `相关证书/*.jpg` | `public/certificates/` | 复制 → WebP |
| `声学模拟制作案例/*.png` | `public/cases/{slug}/` | 复制 → WebP |
| `零散的工作照/*.jpg` | `public/images/about/` | 复制 → WebP |
| 微信二维码（用户提供） | `public/images/wechat-qr.jpg` | **直接放置，禁止 WebP/压缩** |
| Hero 源片段（6 段） | `public/hero/source-clips/` | 复制（混剪前） |
| Hero 成品 | `public/hero/desktop/` · `public/hero/mobile/` | 人工/ffmpeg 混剪后放置 |

---

## 3. 命名规范

### 通用规则

- 全小写
- 英文 slug，连字符分隔
- 禁止空格、中文、微信 hash 名进入 `public/`
- 图片：`{slug}-gallery-{nn}.webp`
- 缩略图：`{slug}-thumb.webp`
- 音频：`{slug}.mp3`
- 视频：`video.mp4` 或 `{slug}-video.mp4`

### 首批案例 Slug 映射

| 原始文件夹 | Slug | 封面建议 |
|---|---|---|
| 云浮市 ECHO.回声 Live （系统工程+调音） | `echo-live-yunfu` | gallery-01 |
| 深圳南山 Wild Live （系统工程+调音） | `wild-live-shenzhen` | gallery-01 |
| 肇庆广宁 Maca音乐客厅 Live （系统工程+调音） | `maca-live-guangning` | gallery-01 |
| 水木年华25周年全国巡回演唱会 景德镇站 （系统工程） | `shuimuhuaya-jingdezhen-2025` | gallery-01 |
| 后期混音案例/多轨混音/鼓楼 v7.mp3 | `mix-gulou-v7` | 无图，用波形 |
| 声学模拟制作案例/酒馆.png | `acoustic-simulation-tavern` | 原 PNG |

### Hero 源片段映射

| 源 | 目标副本名 |
|---|---|
| ECHO.回声 Live 视频 | `hero-source-echo-live.mp4` |
| Wild Live 视频 | `hero-source-wild-live.mp4` |
| Maca 音乐客厅 视频 | `hero-source-maca-live.mp4` |
| 水木年华景德镇站 视频 | `hero-source-shuimuhuaya-jdz.mp4` |
| 南昌师范学院毕业晚会 视频 | `hero-source-ncnu-graduation.mp4` |
| 后期混音实录（首个） | `hero-source-mix-recording.mp4` |

### 证书

| 源 | 目标 |
|---|---|
| 微信图片_20260702220305_290_140.jpg | `cert-01.webp` |
| 微信图片_20260702220306_291_140.jpg | `cert-02.webp` |
| 微信图片_20260702220713_292_140.jpg | `cert-03.webp` |

---

## 4. 转码与压缩建议

### 音频

| 格式 | 条件 | 目标 |
|---|---|---|
| WAV | > 10 MB | MP3 192 kbps，≤ 5 MB |
| MP3 | 已 < 15 MB | 直接复制 |
| 试听用 | 所有 | 单声道可选，192 kbps stereo |

执行脚本：`scripts/prepare-audio.mjs`

### 图片

| 规格 | 宽度 | 质量 | 用途 |
|---|---|---|---|
| display | max 1920px | WebP 82% | 案例详情 / 画廊 |
| thumb | max 640px | WebP 78% | 列表卡片 |

执行脚本：`scripts/optimize-images.mjs`

### 视频

| 用途 | 目标大小 | 编码建议 |
|---|---|---|
| Hero 桌面 | ≤ 8 MB | H.264, 1080p, CRF 28 |
| Hero 手机 | ≤ 4 MB | H.264, 720p, CRF 30 |
| 案例详情 | ≤ 10 MB | 保持原分辨率或 1080p |

> 视频转码不在 V0 脚本范围内，需 ffmpeg 人工命令或后续 `prepare-video.mjs`。

---

## 5. 素材 → 页面对照

| 页面 | 使用素材 |
|---|---|
| 首页 Hero | hero-reel.mp4 + hero-poster.webp |
| 首页背书 | cert-01~03, about/work-*.webp |
| 首页精选 | 6 个案例 thumb + 标题 |
| 案例列表 | 全部案例 thumb |
| 案例详情 | gallery + video + audio |
| About | 工作照 + 证书 + Bio 文字 |
| Booking / Contact / 提交成功 | `public/images/wechat-qr.jpg` |

---

## 6. 缺失素材追踪

| 缺失项 | 影响 | 行动 |
|---|---|---|
| 5 份案例文案.txt 全空 | 案例详情无法上线 | 按 CMS_SCHEMA 字段补写 |
| 南昌师范学院无图片 | 该案例仅 Hero 用，不上首批 6 案例 | 后续补图 |
| 微信二维码 | Booking / Contact | ✅ 已放置 `public/images/wechat-qr.jpg` |
| 抖音公开主页 | Contact | ⚠️ self 草稿待换 |
| Hero 按钮 1 链接 | 首页 Hero | ✅ 视频号链接已写入 CMS |
| Hero 混剪成品 | 首页首屏 | 6 源片段复制后人工剪辑 |
| 英文文案 | i18n | 与中文同步编写 |
| 客户反馈 | 案例详情 | 可选，后补 |

---

## 7. 脚本执行流程（推荐顺序）

```bash
# 1. 预览复制清单（不写入）
node scripts/copy-assets-from-source.mjs

# 2. 确认后执行复制
node scripts/copy-assets-from-source.mjs --execute

# 3. 预览音频转码
node scripts/prepare-audio.mjs

# 4. 确认后转码
node scripts/prepare-audio.mjs --execute

# 5. 预览图片优化
node scripts/optimize-images.mjs

# 6. 确认后优化
node scripts/optimize-images.mjs --execute
```

---

## 8. 重复文件处理

| 文件 | 处理 |
|---|---|
| `巨龙的土壤FinalMix.mp3` vs `巨龙的土壤FinalMix(1).mp3` | 保留一个，另一个标记 skip |
| 微信 hash 命名 MP4 | 复制时重命名为语义化 slug |

---

## 9. 安全校验清单

执行 `--execute` 前确认：

- [ ] dry-run 输出清单无误
- [ ] 未包含原始目录的删除/移动操作
- [ ] 目标路径均在 `yuyakang-audio-site/public/` 内
- [ ] 已备份 `server/data/site-content.json`（上线后）
