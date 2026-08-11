# 8.6.2 Supabase Storage Signed Upload API

> **YU YAKANG AUDIO** · `yuyakang-cms-prod`  
> 阶段：后端 Signed Upload（**不改 `src/`、不改后台 UI**）  
> 前置：8.6.1 上传审计 · buckets：`images` / `audio` / `videos`

---

## 1. 为什么 Signed Upload

Vercel Serverless 请求体约 **4.5 MB**，无法承载 Express 20–300 MB 直传。  
流程：**admin sign → 浏览器直传 Supabase Storage → admin complete 登记 `media_assets`**。

---

## 2. 接口

### 2.1 `POST /api/upload/sign`

**Auth：** `yy_admin_session`（`requireAdminSession`）

**Body：**

```json
{
  "filename": "cover.webp",
  "mimeType": "image/webp",
  "size": 12345,
  "context": "cms",
  "usage": "case-cover"
}
```

`context` / `usage` 可选，写入 `media_assets.metadata`。

**Success 200：**

```json
{
  "ok": true,
  "bucket": "images",
  "path": "cms/2026/08/1735689600000-cover.webp",
  "token": "...",
  "signedUrl": "...",
  "publicUrl": "https://<ref>.supabase.co/storage/v1/object/public/images/...",
  "file": {
    "url": "publicUrl",
    "filename": "cover.webp",
    "size": 12345,
    "mimeType": "image/webp",
    "type": "image",
    "uploadedAt": "ISO8601"
  }
}
```

**Headers：** `X-Upload-Target: supabase-storage`, `X-Upload-Bucket`

客户端下一步（8.6.3 由 `uploadFile` 封装）：

```js
await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file);
```

或使用 `signedUrl` + PUT（依 SDK 版本）。

---

### 2.2 `POST /api/upload/complete`

**Auth：** 同上

**Body：**

```json
{
  "bucket": "images",
  "path": "cms/2026/08/1735689600000-cover.webp",
  "filename": "cover.webp",
  "mimeType": "image/webp",
  "size": 12345,
  "type": "image",
  "publicUrl": "ignored — server recomputes"
}
```

**Success 201：**

```json
{
  "ok": true,
  "file": {
    "url": "https://...",
    "filename": "cover.webp",
    "size": 12345,
    "mimeType": "image/webp",
    "type": "image",
    "uploadedAt": "ISO8601"
  },
  "asset": {
    "id": "uuid",
    "bucket": "images",
    "path": "cms/2026/08/..."
  }
}
```

与旧 Express `POST /api/upload` 的 **`file` 对象兼容**，供 8.6.3 写入 CMS。

---

## 3. Bucket / MIME / 大小

| MIME | Bucket | 上限 |
|------|--------|------|
| image/* | `images` | 20 MB |
| audio/* | `audio` | 30 MB |
| video/* | `videos` | 300 MB |
| application/pdf | `images`（`documents/YYYY/MM/...`） | 50 MB |

白名单与 [`server/lib/upload.js`](../server/lib/upload.js) 一致。

---

## 4. Storage path

| 类型 | 模式 |
|------|------|
| 默认 | `cms/YYYY/MM/{timestamp}-{safeFilename}` |
| PDF | `documents/YYYY/MM/{timestamp}-{safeFilename}` |

- 禁止 `..`、绝对路径、反斜杠  
- 文件名 NFKD + 字符清洗（与 Express 同类）

---

## 5. publicUrl

服务端生成，**不信任**客户端 `publicUrl`：

```text
{SUPABASE_URL}/storage/v1/object/public/{bucket}/{encodedPath}
```

---

## 6. media_assets

`complete` 成功后 insert：

| 列 | 来源 |
|----|------|
| type | image/video/audio/document |
| title | filename |
| url | publicUrl |
| thumbnail_url | 图片同 url，其他 null |
| bucket, path, mime_type, size | body |
| metadata | `{ filename, uploadedAt, source: "signed-upload", context?, usage? }` |

**insert 失败：** 返回 500，`best-effort` 删除 Storage 对象，不返回 SQL/stack。

---

## 7. 错误码

| 状态 | 场景 |
|------|------|
| 401 | 未登录 |
| 400 | 参数 / MIME / 大小 / path / 对象不存在 |
| 405 | 非 POST |
| 503 | Supabase env 缺失 |
| 500 | 签名失败 / media_assets 失败 |

---

## 8. 文件

| 文件 | 作用 |
|------|------|
| `api/upload/sign.js` | 签名 |
| `api/upload/complete.js` | 完成 + media_assets |
| `api/_lib/uploadConfig.js` | MIME / 大小 / bucket |
| `api/_lib/uploadValidate.js` | 校验 + path |
| `api/_lib/uploadStorage.js` | signed URL + publicUrl |
| `api/_lib/mediaAssets.js` | DB insert + rollback |

---

## 9. 本地测试

```bash
npm run build

# 单元测试（helper）
node scripts/upload-signed-smoke.mjs

# 端到端（需 .env.local + admin session）
npx vercel dev
# POST /api/admin/login → POST /api/upload/sign
```

---

## 10. 下一阶段 8.6.3

修改 `src/lib/api.js` `uploadFile()`：

1. `POST /api/upload/sign`
2. `uploadToSignedUrl` 直传 Storage
3. `POST /api/upload/complete`
4. 返回 `{ file }` 与现逻辑一致

---

*8.6.2 · 不改 src / 不改 Express upload*
