# Mobile Asset Audit — Round 6.5

> Reference folder: `E:\卓面应用\个人文件\Cursor\余`  
> **Read-only scan.** No files were moved, copied, renamed, or deleted.

## Summary

| Category | Count (top samples) | Notes |
|----------|---------------------|-------|
| Large videos (>5 MB) | 20+ | Mostly case source clips; already in `public/` for deployed cases |
| Images (jpg/png/webp) | Many | Case galleries, certificates, work photos |
| Reference-only videos | Several | Under `现场混音视频/` and `系统工程/` — **not in repo** |

## Video files (largest first)

| Approx. size | Location / note | Suggested use | public? |
|--------------|-----------------|---------------|---------|
| ~5–6 MB | `public/hero/desktop/hero-reel.mp4` | Hero carousel | ✓ already deployed |
| ~5–6 MB | `public/cases/*/video.mp4` | Case detail / hero source | ✓ already in repo |
| ~5–6 MB | `public/hero/source-clips/*.mp4` | Hero fallback clips | ✓ already in repo |
| Large | `现场混音视频/*.mp4` (reference folder) | Future video highlights cover only | ✗ confirm before import |
| Large | `系统工程/**/视频/*.mp4` (reference folder) | Case media / thumbnails | ✗ confirm before import |

## Image files

| Type | Examples | Suggested use | public? |
|------|----------|---------------|---------|
| Certificates | `public/certificates/cert-*.webp` | Home mobile rack / About | ✓ already deployed |
| Case gallery | `public/cases/*/gallery/*.webp` | Featured cases / detail | ✓ already deployed |
| Work photos | `public/images/about/work-*.jpg` | About page | ✓ already deployed |
| Reference PNG/JPG | `系统工程/**/图片/*` | Case detail if approved | ✗ user confirm |

## Video highlights (homepage mobile)

| Source | Status |
|--------|--------|
| WeChat Channel `socialLinks.wechatVideoUrl` | ✓ configured in mock/CMS |
| Douyin `socialLinks.douyinUrl` | ✗ empty (draft self-link only — not used) |
| Embedded case MP4 on homepage | ✗ not used (external links only per Round 6.5) |

## Recommendations

1. **Do not** auto-copy reference-folder videos into `public/` — several exceed comfortable mobile payload.
2. **Do not** fabricate Douyin public URLs — wait for confirmed profile link in CMS.
3. WeChat Channel card uses existing QR/poster image until dedicated cover is supplied.
4. For new case video covers, prefer gallery stills already in `public/cases/*/gallery/`.

## Actions taken in Round 6.5

- None — inventory only.
