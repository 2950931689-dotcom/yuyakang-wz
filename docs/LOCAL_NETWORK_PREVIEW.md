# 本地局域网预览指南

> YU YAKANG AUDIO · 手机 / 平板同 Wi-Fi 访问开发环境

---

## 1. 启动局域网预览

在项目根目录运行：

```bash
npm run dev
```

启动后终端会显示：

```text
[client]  Local:   http://localhost:5173/
[client]  Network: http://192.168.x.x:5173/

[server]  YU YAKANG AUDIO CMS API → http://localhost:3001
[server]    Network (API direct):
[server]      http://192.168.x.x:3001
```

- **Local**：本机浏览器访问
- **Network**：同一 Wi-Fi 下的手机 / 平板访问（IP 以终端输出为准，不要写死在代码里）

---

## 2. 查看电脑局域网 IP（Windows）

打开 PowerShell 或 CMD：

```bash
ipconfig
```

找到当前 Wi-Fi 适配器的 **IPv4 地址**，例如：

```text
无线局域网适配器 WLAN:
   IPv4 地址 . . . . . . . . . . . . : 192.168.1.105
```

手机浏览器访问：

```text
http://192.168.1.105:5173
```

---

## 3. 手机如何访问

1. 电脑与手机连接 **同一 Wi-Fi**（不要用手机流量）
2. 电脑运行 `npm run dev`
3. 手机浏览器输入 Network 地址，例如 `http://192.168.x.x:5173`
4. 测试首页 Hero、案例、Booking、后台等页面

---

## 4. API 地址说明（重要）

### 方式 A：电脑本机预览（推荐默认）

无需额外配置。开发模式下前端通过 Vite 代理访问 API：

```text
浏览器 → http://localhost:5173/api/*  →  代理到  http://127.0.0.1:3001
```

`.env` 可留空或使用：

```env
VITE_API_URL=http://localhost:3001
```

### 方式 B：手机局域网预览（推荐默认，无需改 env）

**默认已支持。** 手机访问 `http://192.168.x.x:5173` 时，请求走同一地址的 `/api` 路径，由电脑上的 Vite 代理到本机 API，**不会**错误指向手机自己的 `localhost`。

一般 **不需要** 设置 `VITE_API_URL=http://手机能访问的IP:3001`。

### 方式 C：手机直连 API（可选，高级）

若绕过 Vite、单独调试 API，可在电脑 `.env.local` 中设置（将 IP 换成你电脑的局域网 IP）：

```env
VITE_API_URL=http://192.168.x.x:3001
```

修改后需 **重启** `npm run dev`。此方式需确保 Express 已监听 `0.0.0.0:3001` 且防火墙放行。

---

## 5. Windows 防火墙

首次运行时 Windows 可能弹出防火墙提示，请允许 **Node.js** 专用网络 / 专用网络访问。

若手机无法连接：

1. 打开 **Windows 安全中心 → 防火墙和网络保护 → 允许应用通过防火墙**
2. 勾选 **Node.js JavaScript Runtime**（专用 + 公用，视网络环境而定）
3. 或临时关闭防火墙测试（仅开发环境，不建议长期关闭）

---

## 6. 前提条件

| 条件 | 说明 |
|---|---|
| 同一 Wi-Fi | 电脑与手机必须在同一局域网 |
| 端口未被占用 | 5173（前端）、3001（API） |
| dev 服务已启动 | `npm run dev` 保持运行 |

---

## 7. 打不开时的排查步骤

1. **确认 IP 正确**：重新运行 `ipconfig`，使用当前 IPv4
2. **确认 dev 在跑**：电脑浏览器先打开 `http://localhost:5173`
3. **看 Network 行**：以 Vite 输出的 Network 地址为准
4. **防火墙**：允许 Node.js 或暂时关闭防火墙测试
5. **路由器 AP 隔离**：部分公共 Wi-Fi 禁止设备互访，换家用路由器测试
6. **API 失败 / 空白页**：打开浏览器开发者工具（远程调试）看 Network；若 `/api/content` 失败，检查 API 终端是否有 500
7. **CORS 403**：局域网 IP 访问时 server 已允许私有网段 origin；若仍失败，重启 dev
8. **Hero 视频卡顿**：手机端 Hero 使用 poster 模式 + 结束叠化，属性能降级，非错误

---

## 8. 相关配置

| 文件 | 作用 |
|---|---|
| `vite.config.js` | `host: 0.0.0.0`，`/api` 与 `/uploads` 代理 |
| `package.json` | `dev:client`: `vite --host 0.0.0.0` |
| `server/index.js` | API 监听 `0.0.0.0:3001`，启动时打印 Network API 地址 |
| `.env.example` | `VITE_API_URL` 示例 |

---

## 9. 变更记录

| 日期 | 说明 |
|---|---|
| 2026-07-05 | Round 3.1.7：局域网 host + Vite 代理 + 本文档 |
