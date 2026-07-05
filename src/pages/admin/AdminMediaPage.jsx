import { useCallback, useEffect, useState } from "react";
import { getMedia, resolveUploadUrl, trashMedia, uploadFile } from "../../lib/api";
import { useAdmin } from "../../context/AdminContext";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  AdminConfirmDialog,
  AdminEmptyState,
} from "../../components/admin/AdminForm";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeLabel(type) {
  const map = {
    image: "图片",
    video: "视频",
    audio: "音频",
    document: "文档",
    other: "其他",
  };
  return map[type] ?? type;
}

export default function AdminMediaPage() {
  const { showToast, apiOnline } = useAdmin();
  const [files, setFiles] = useState([]);
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
      showToast(err.message || "读取媒体失败", "error");
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
      showToast("上传成功");
      await loadFiles();
    } catch (err) {
      showToast(err.message || "上传失败", "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL 已复制");
    } catch {
      showToast("复制失败", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await trashMedia(deleteTarget.filename);
      showToast("文件已移动到 _trash");
      setDeleteTarget(null);
      await loadFiles();
    } catch (err) {
      showToast(err.message || "删除失败", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminTopbar
        title="媒体管理"
        description="上传与管理 server/uploads 中的媒体文件"
        actions={
          <label className="admin-btn admin-btn--primary admin-btn--sm">
            {uploading ? "上传中…" : "上传文件"}
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
        }
      />

      {loading ? (
        <div className="admin-placeholder">Loading…</div>
      ) : files.length === 0 ? (
        <AdminEmptyState title="暂无上传媒体" description="点击右上角上传图片、视频或音频文件" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>文件名</th>
                <th>类型</th>
                <th>大小</th>
                <th>URL</th>
                <th>上传时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const fullUrl = resolveUploadUrl(file.url);
                return (
                  <tr key={file.filename}>
                    <td>{file.filename}</td>
                    <td>{typeLabel(file.type)}</td>
                    <td>{formatSize(file.size)}</td>
                    <td className="admin-table__mono">{file.url}</td>
                    <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => copyUrl(fullUrl)}>
                          复制
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setPreview(file)}>
                          预览
                        </button>
                        <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteTarget(file)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="admin-dialog-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <div className="admin-dialog admin-dialog--wide" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{preview.filename}</h3>
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
                <p className="admin-field__hint">此类型暂不支持预览，请复制 URL 使用。</p>
              )}
            </div>
            <div className="admin-dialog__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPreview(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="移动到回收站"
        message={`确定将「${deleteTarget?.filename}」移动到 _trash 吗？`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirming={deleting}
      />
    </>
  );
}
