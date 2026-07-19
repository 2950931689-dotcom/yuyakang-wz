# Mixing Audio Modules — 贴唱 / 分轨

> YU YAKANG AUDIO  
> 更新日期：2026-07-19  
> 范围：混音案例详情前台 + 后台案例编辑 · 复用 `/api/upload`

---

## 1. 目标

混音类案例详情以 **贴唱**、**分轨** 两个模块为主：

1. 前台：播放/暂停合一按键 + 可拖拽细进度条  
2. 后台：两模块各自加减音频、改名、上传文件  

混音案例 **不再显示**「项目详细信息」「项目媒体机架」。

现场 Live 等非混音案例：布局不变（仍保留项目详细信息 + 媒体机架）。

---

## 2. 前台结构

### 混音类（`mixing-post-production` | `recording-editing`）

1. **贴唱 / 分轨**（`MixingAudioSection`）  
2. 项目介绍（若有）  
3. CTA  

### 其它类别

1. 项目详细信息  
2. 项目媒体机架  
3. 项目介绍  
4. CTA  

---

## 3. 显示条件

| 条件 | 行为 |
|------|------|
| 混音类 | 始终渲染贴唱 + 分轨两个区块外壳 |
| `enabled === true` 且轨有 `audioUrl` | 显示可播播放器 |
| `enabled === false` 或无轨 | 区块显示「暂无…音频」空态 |

---

## 4. 数据结构

```js
mixingAudioModules: {
  enabled: boolean,
  vocalTune: { title, description, tracks: Track[] },   // 贴唱
  multitrack: { title, description, tracks: Track[] }    // 分轨
}
Track: { id, name, description, audioUrl, duration?, order, enabled }
```

实现：`src/lib/mixingAudio.js`  
`getMixingDetailModules()` — 混音详情布局  
`getVisibleMixingAudioModules()` — 严格「有可播轨」校验（兼容旧逻辑）

---

## 5. 播放器

- `MixingAudioPlayer.jsx`：`HTMLAudioElement` + 自定义细时间轴（pointer 拖拽）  
- 播放/暂停同一按钮  
- 同页 `activeTrackId` 互斥  
- 失败：「音频暂不可用」

---

## 6. 后台

路径：`/admin/cases` → 标签 **贴唱 / 分轨** → `AdminMixingAudioPanel`

| 能力 | 说明 |
|------|------|
| 开启前台展示 | `enabled` |
| 贴唱 / 分轨 | 各自标题、说明 |
| 新增 / 删除 / 上移下移 | 每条轨 |
| 改名 | `name` |
| 上传 | `AdminMediaField` → `POST /api/upload`（音频 ≤ 30MB） |
| 新增轨时 | 自动将 `enabled` 设为 `true` |

保存：`PATCH /api/content/section/cases`；`normalizeCaseForSave` 规范化字段。

「项目媒体」标签对混音类会提示：详情页不展示媒体机架，试听请用贴唱/分轨。

---

## 7. 示例案例

`mix-gulou-v7`：已开启贴唱参考轨 → `/audio/mix-gulou-v7.mp3`（文件缺失则错误态）。

---

## 8. 未改范围

- Hero 视频逻辑 / `HeroVideoCarousel.jsx`  
- Live 案例详情结构  
- Booking / Contact / 城市展示  
- 新增 npm 依赖  

---

## 9. 回滚

1. `CaseProjectFile` 恢复始终渲染 Project Data + Media Rack  
2. 或 `git revert` 本阶段相关 commit  
