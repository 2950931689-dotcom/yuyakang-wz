import { useState } from "react";
import { resolveUploadUrl, uploadFile } from "../../lib/api";
import { AdminField, AdminInput } from "./AdminForm";

export function AdminMediaField({ label, value, onChange, accept = "image/*", hint }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onChange(result.file.url);
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = value?.startsWith("/uploads/")
    ? resolveUploadUrl(value)
    : value;

  return (
    <AdminField label={label} hint={hint}>
      <AdminInput className="admin-mono" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <div className="admin-media-field">
        {previewUrl && accept.includes("image") && (
          <img src={previewUrl} alt="" className="admin-media-field__preview" />
        )}
        {previewUrl && accept.includes("video") && (
          <video src={previewUrl} className="admin-media-field__preview" controls muted />
        )}
        <label className="admin-btn admin-btn--ghost admin-btn--sm">
          {uploading ? "上传中…" : "上传替换"}
          <input type="file" accept={accept} hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
        </label>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm">
            预览
          </a>
        )}
      </div>
    </AdminField>
  );
}
