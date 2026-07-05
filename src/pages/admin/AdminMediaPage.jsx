import { useCallback, useEffect, useMemo, useState } from "react";
import { getMedia, resolveUploadUrl, trashMedia, uploadFile } from "../../lib/api";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { getMediaUsageLabel } from "../../lib/mediaUsage";
import { commonActionText, mediaTypeText } from "../../lib/adminUi";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingState,
} from "../../components/admin/AdminForm";

const TYPE_FILTERS = ["all", "image", "video", "audio", "document", "other"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { content } = useContent();
  const { showToast, apiOnline } = useAdmin();
  const [files, setFiles] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMedia();
      setFiles(result.files ?? []);
    } catch (err) {
      showToast(err.message || commonActionText.loadFailed, "error");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file);
      showToast(commonActionText.uploadSuccess);
      await loadFiles();
    } catch (err) {
      showToast(err.message || commonActionText.uploadFailed, "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(commonActionText.copied);
    } catch {
      showToast(commonActionText.copyFailed, "error");
    }
  };

  const filteredFiles = useMemo(() => {
    if (typeFilter === "all") return files;
    return files.filter((f) => f.type === typeFilter);
  }, [files, typeFilter]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await trashMedia(deleteTarget.filename);
      showToast(commonActionText.trashMoved);
      setDeleteTarget(null);
      await loadFiles();
    } catch (err) {
      showToast(err.message || commonActionText.deleteFailed, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminTopbar
        eyebrow="媒体管理"
        title="媒体管理"
        description="上传 · 复制路径 · 移入回收站"
      />

      <div className="admin-dropzone">
        <span className="admin-panel-eyebrow">上传区域</span>
        <p className="admin-dropzone__hint">支持图片、视频、音频或文档，上传至 server/uploads</p>
        <label className={`admin-btn admin-btn--primary${apiOnline === false || uploading ? " is-disabled" : ""}`}>
          {uploading ? commonActionText.uploading : "选择文件"}
          <input
            type="file"
            hidden
            disabled={apiOnline === false || uploading}
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="admin-chip-row" style={{ marginBottom: 16 }}>
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-btn admin-btn--ghost admin-btn--sm admin-mono${typeFilter === t ? " is-active" : ""}`}
            onClick={() => setTypeFilter(t)}
          >
            {mediaTypeText[t] ?? t}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoadingState message="正在扫描媒体库..." />
      ) : filteredFiles.length === 0 ? (
        <AdminEmptyState code="媒体库" title="无匹配媒体" description="尝试切换筛选条件或上传文件" />
      ) : (
        <div className="admin-rack">
          {filteredFiles.map((file) => {
            const fullUrl = resolveUploadUrl(file.url);
            const typeLabel = mediaTypeText[file.type] ?? file.type;
            const usage = content ? getMediaUsageLabel(content, file.url) : "—";

            return (
              <article key={file.filename} className="admin-rack__slot">
                <div className="admin-rack__head">
                  <span className={`admin-tag admin-tag--type admin-tag--${file.type}`}>{typeLabel}</span>
                  <span className="admin-rack__size admin-mono">{formatSize(file.size)}</span>
                </div>
                <h3 className="admin-rack__name admin-mono">{file.filename}</h3>
                <p className="admin-rack__path admin-mono">{file.url}</p>
                <p className="admin-field__hint">{usage}</p>
                <p className="admin-rack__time admin-mono">
                  {new Date(file.uploadedAt).toLocaleString()}
                </p>
                <div className="admin-rack__actions">
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setPreview(file)}>
                    {commonActionText.preview}
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => copyUrl(fullUrl)}>
                    复制路径
                  </button>
                  <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteTarget(file)}>
                    移入回收站
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="admin-dialog-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <div className="admin-dialog admin-dialog--wide admin-dialog--monitor" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="admin-panel-eyebrow">视频预览</span>
            <h3 className="admin-mono">{preview.filename}</h3>
            <div className="admin-media-preview">
              {preview.type === "image" && (
                <img src={resolveUploadUrl(preview.url)} alt={preview.filename} />
              )}
              {preview.type === "video" && (
                <video controls src={resolveUploadUrl(preview.url)} />
              )}
              {preview.type === "audio" && (
                <audio controls src={resolveUploadUrl(preview.url)} />
              )}
              {preview.type !== "image" && preview.type !== "video" && preview.type !== "audio" && (
                <p className="admin-field__hint">此类型无法预览，请复制路径使用。</p>
              )}
            </div>
            <div className="admin-dialog__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPreview(null)}>
                {commonActionText.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="移入回收站"
        message={`确认将「${deleteTarget?.filename}」移入 _trash？`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirming={deleting}
      />
    </>
  );
}
