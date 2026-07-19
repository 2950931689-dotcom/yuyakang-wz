# Mixing Audio Modules

> YU YAKANG AUDIO · 混音案例贴唱 / 分轨音频模块  
> 日期：2026-07-19  
> 范围：案例详情前台播放器 + 后台案例编辑 · 复用既有 `/api/upload`

---

## 1. 本阶段目标

为混音类案例增加「混音案例」音频区：

1. 贴唱  
2. 分轨  

每条音频支持自定义薄播放器（播放/暂停、细进度条、拖拽、时间显示），同页仅一条播放。

---

## 2. 前端显示位置

`CaseProjectFile` 顺序：

1. 项目详细信息  
2. 项目媒体机架  
3. **混音案例音频模块**（仅混音类且 enabled + 有可播轨）  
4. 项目介绍  
5. CTA  

---

## 3. 哪些案例会显示

同时满足：

1. `category` ∈ `mixing-post-production` | `recording-editing`  
2. `mixingAudioModules.enabled === true`  
3. 贴唱或分轨中至少一条：`enabled !== false` 且 `audioUrl` 非空  

Live / 声学模拟等类别：**不显示**。

当前 mock：`mix-gulou-v7` 已开启，贴唱含一条指向既有 `/audio/mix-gulou-v7.mp3` 的参考轨（若文件未部署则显示「音频暂不可用」）。

---

## 4–6. 数据结构

```js
mixingAudioModules: {
  enabled: boolean,
  vocalTune: { title, description, tracks: Track[] },
  multitrack: { title, description, tracks: Track[] }
}
Track: { id, name, description, audioUrl, duration?, order, enabled }
```

实现：`src/lib/mixingAudio.js`  
旧案例无字段：不报错、不显示。  
保留原 `caseItem.audioUrl`（媒体机架占位逻辑不变）。

---

## 7–8. 播放器交互

组件：

- `MixingAudioSection.jsx`  
- `MixingAudioPlayer.jsx`（`HTMLAudioElement` + `input[type=range]`）  

规则：播放新轨时 `activeTrackId` 切换，其它轨 pause；ended 复位；卸载 pause；不自动播放、不循环；失败提示「音频暂不可用」。

---

## 9. 后台编辑能力

路径：`/admin/cases` → `AdminCaseEditor` 新标签 **混音音频** → `AdminMixingAudioPanel`

支持：开关模块、编辑贴唱/分轨标题与说明、增删改轨、上移/下移、上传或手填 URL。

保存：仍 `PATCH /api/content/section/cases` 整表 cases；`normalizeCaseForSave` 规范化 `mixingAudioModules`。

---

## 10–11. 音频上传

复用现有 `POST /api/upload`（需登录）→ `/uploads/{filename}`。

扩展 MIME：`audio/mpeg|mp3|wav|x-wav|aac|mp4|ogg`。  
音频大小上限改为 **30MB**。  

未做独立云存储；未把音频写入 JSON base64。

若本地无 `public/audio/mix-gulou-v7.mp3`，前台会走错误态，后台可上传替换 URL。

---

## 12–14. API / 字段 / 旧案例

| 项 | 结果 |
|----|------|
| 改 API 路由结构 | 否（仅扩展 upload MIME/大小） |
| 后台保存流程 | 沿用 cases section；normalize 新增字段 |
| 新增字段 | `caseItem.mixingAudioModules` |
| 旧案例 | 兼容；Live 不受影响 |

---

## 15. PC / 手机

PC：贴唱 / 分轨可两列。  
手机：单列；进度条全宽；防横向溢出。

---

## 16. 风险与回滚

| 风险 | 说明 |
|------|------|
| 参考 mp3 未部署 | 错误态提示，不崩 |
| 多轨同时播 | 由 activeTrackId 互斥 |

回滚：移除 Mixing* 组件挂载与 admin 标签；删除/忽略 `mixingAudioModules`。
