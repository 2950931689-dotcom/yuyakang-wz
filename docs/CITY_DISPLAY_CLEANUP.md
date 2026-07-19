# City Display Cleanup — 取消站点常驻城市展示

## 1. 本阶段目标

取消个人品牌站点层面的「常驻城市 / 所在城市 / Based in / LOCATION」前台展示。

**不是**删除案例项目地点、Booking 表单城市字段、联系方式、预约入口，也不是删除 `location` 数据字段或后台编辑能力。

## 2. 搜索到的城市 / location 显示位置

| 位置 | 类型 | 处理 |
|------|------|------|
| `Footer.jsx` | 站点常驻城市（`display.showOnFooter`） | 默认关闭；仅 `=== true` 时显示 |
| `ContactConsole.jsx` | 服务城市 / 服务范围 meta + LOCATION 参数 | meta 仅 `showOnContact === true`；LOCATION 参数移除 |
| `ContactRoutingHero.jsx` | LOCATION 路由参数 | 移除 LOCATION 参数 |
| `EngineerIdentity.jsx` | About 侧栏 LOCATION | 移除 LOCATION 参数 |
| `CredentialStrip.jsx` | 首页「常驻地」 | 仅 `showOnHome === true`（组件当前未挂首页） |
| `content.js` `DEFAULT_LOCATION_DISPLAY` | 默认显示开关 | 全部改为 `false` |
| mock / example / `server/data/site-content.json` | `display.showOn*` | 全部改为 `false` |
| `AdminLocationPage.jsx` | 后台编辑 + 开关默认值 | 保留页面；默认开关 `false`；勾选语义 `=== true` |
| `CaseCard` / `CaseDetailHero` / `ProjectConsole` / `ProjectQuickView` | **案例项目地点** | **保留，未改** |
| Booking 表单 `city` | 用户填写城市 | **保留，未改** |
| `profile.location` / `content.location` / `socialLinks.location` | 数据字段 | **保留，未删** |

## 3. 属于站点常驻城市的

- `content.location` / `socialLinks.location` / `profile.location` 用于品牌「我在哪里」
- Footer 版权行旁的城市
- Contact「服务城市 / Base City」与「服务范围」
- Contact / About 中的 `LOCATION` 参数行
- CredentialStrip「常驻地 / Based in」（若启用）

## 4. 属于案例项目地点的

- `case.location` / 案例卡片与详情中的地点
- Wild Live「深圳南山」、云浮 / 广宁 / 景德镇等项目地点
- 案例后台「地点」字段

## 5. 隐藏了哪些站点常驻城市展示

1. Footer 常驻城市后缀（默认关闭）
2. Contact 服务城市 / 服务范围 meta（默认关闭）
3. Contact 控制台 / Routing Hero 的 LOCATION 参数行
4. About `EngineerIdentity` 的 LOCATION 参数行
5. 首页 CredentialStrip 常驻地（默认关闭；且未挂载）

## 6. 保留了哪些案例项目地点

- `/cases` 卡片地点
- `/cases/*` 详情地点（含 Wild Live、Echo Live、MACA、混音案例等）
- 案例数据与后台地点字段

## 7. 是否删除数据字段

**否。** `location`、`serviceArea`、`display`、`profile.location`、`socialLinks.location` 均保留。仅默认不前台展示。

## 8. 是否影响 Booking 表单 city 字段

**否。**

## 9. 是否影响 Contact 页面

仅隐藏站点常驻城市相关展示；联系方式、预约入口、联系说明保留。

## 10. 是否影响 Footer

仅隐藏常驻城市后缀；品牌名与版权保留。

## 11. 是否影响后台

`AdminLocationPage` 保留。默认显示开关改为 `false`，勾选语义改为显式 `true` 才开启。不改保存协议 / API。

## 12. 是否影响混音音频模块

**否。**

## 13. PC / 手机展示策略

全断点统一：站点常驻城市默认不显示。案例项目地点在 PC / 手机均继续显示。无新增断点逻辑。

## 14. 风险和回滚方式

**风险：** 若线上 CMS 仍把 `display.showOn* = true`，Footer / Contact meta / CredentialStrip 可能再次显示城市；About LOCATION 与 Contact LOCATION 参数已硬移除，不受开关影响。

**回滚：**

1. 将 `display.showOn*` 改回 `true`（恢复 Footer / Contact meta / CredentialStrip）
2. 从 git 恢复 `EngineerIdentity` / `ContactConsole` / `ContactRoutingHero` 中的 LOCATION 参数
3. 或 `git revert` 本阶段 commit
