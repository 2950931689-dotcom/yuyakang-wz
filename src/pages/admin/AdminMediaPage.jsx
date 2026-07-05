import { useCallback, useEffect, useMemo, useState } from "react";
import { getMedia, resolveUploadUrl, trashMedia, uploadFile } from "../../lib/api";
import { useContent } from "../../context/ContentContext";
import { useAdmin } from "../../context/AdminContext";
import { getMediaUsageLabel } from "../../lib/mediaUsage";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  AdminConfirmDialog,
  AdminEmptyState,
} from "../../components/admin/AdminForm";

const TYPE_FILTERS = ["all", "image", "video", "audio", "document", "other"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS = {
  image: "IMAGE",
  video: "VIDEO",
  audio: "AUDIO",
  document: "DOCUMENT",
  other: "OTHER",
};

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
      showToast(err.message || "Failed to load media", "error");
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
      showToast("File ingested to rack");
      await loadFiles();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Path copied");
    } catch {
      showToast("Copy failed", "error");
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
      showToast("Moved to _trash");
      setDeleteTarget(null);
      await loadFiles();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminTopbar
        eyebrow="Media Rack"
        title="媒体素材机架"
        description="SOURCE FILE · COPY PATH · MOVE TO TRASH"
      />

      <div className="admin-dropzone">
        <span className="admin-panel-eyebrow">Input Rack</span>
        <p className="admin-dropzone__hint">Ingest image, video, audio or document to server/uploads</p>
        <label className={`admin-btn admin-btn--primary${apiOnline === false || uploading ? " is-disabled" : ""}`}>
          {uploading ? "Ingesting…" : "Select File"}
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
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-placeholder admin-mono">SCANNING RACK…</div>
      ) : filteredFiles.length === 0 ? (
        <AdminEmptyState code="MEDIA RACK" title="无匹配媒体" description="Try another filter or ingest a file" />
      ) : (
        <div className="admin-rack">
          {filteredFiles.map((file) => {
            const fullUrl = resolveUploadUrl(file.url);
            const typeKey = TYPE_LABELS[file.type] ?? "OTHER";
            const usage = content ? getMediaUsageLabel(content, file.url) : "—";

            return (
              <article key={file.filename} className="admin-rack__slot">
                <div className="admin-rack__head">
                  <span className={`admin-tag admin-tag--type admin-tag--${file.type}`}>{typeKey}</span>
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
                    Preview
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => copyUrl(fullUrl)}>
                    Copy Path
                  </button>
                  <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteTarget(file)}>
                    Move to Trash
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
            <span className="admin-panel-eyebrow">Monitor</span>
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
                <p className="admin-field__hint">Preview unavailable — copy path instead.</p>
              )}
            </div>
            <div className="admin-dialog__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Move to Trash"
        message={`Move "${deleteTarget?.filename}" to _trash?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirming={deleting}
      />
    </>
  );
}
