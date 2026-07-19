import {
  createDefaultMixingAudioModules,
  createEmptyMixingTrack,
  normalizeMixingAudioModules,
} from "../../lib/mixingAudio";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminTextarea,
  AdminToggle,
} from "./AdminForm";
import { AdminBilingualInput } from "./AdminBilingualField";
import { AdminMediaField } from "./AdminMediaField";

function TrackEditor({ track, index, total, onChange, onRemove, onMove }) {
  return (
    <div className="admin-mixing-track">
      <div className="admin-mixing-track__head">
        <span className="admin-mixing-track__index">#{index + 1}</span>
        <div className="admin-mixing-track__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            上移
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={index >= total - 1}
            onClick={() => onMove(1)}
          >
            下移
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={onRemove}
          >
            删除
          </button>
        </div>
      </div>
      <AdminToggle
        label="启用此音频"
        checked={track.enabled !== false}
        onChange={(e) => onChange({ enabled: e.target.checked })}
      />
      <AdminField label="音频名称">
        <AdminInput
          value={track.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="例如：贴唱作品 A"
        />
      </AdminField>
      <AdminField label="说明（可选）">
        <AdminTextarea
          rows={2}
          value={track.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </AdminField>
      <AdminMediaField
        label="音频文件 / URL"
        value={track.audioUrl ?? ""}
        onChange={(v) => onChange({ audioUrl: v })}
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
        hint="上传后自动填入 URL，也可手动填写 /audio/... 或 /uploads/..."
      />
    </div>
  );
}

function GroupEditor({ groupKey, group, label, onGroupChange }) {
  const tracks = Array.isArray(group?.tracks) ? group.tracks : [];

  const patchTrack = (index, patch) => {
    const next = tracks.map((t, i) => (i === index ? { ...t, ...patch } : t));
    onGroupChange({ ...group, tracks: next });
  };

  const addTrack = () => {
    const next = [
      ...tracks,
      createEmptyMixingTrack(tracks.length + 1, groupKey === "vocalTune" ? "vocal" : "multi"),
    ];
    onGroupChange({ ...group, tracks: next });
  };

  const removeTrack = (index) => {
    const next = tracks
      .filter((_, i) => i !== index)
      .map((t, i) => ({ ...t, order: i + 1 }));
    onGroupChange({ ...group, tracks: next });
  };

  const moveTrack = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= tracks.length) return;
    const next = [...tracks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onGroupChange({
      ...group,
      tracks: next.map((t, i) => ({ ...t, order: i + 1 })),
    });
  };

  return (
    <AdminFieldGroup eyebrow={label} title={`${label}音频列表`}>
      <AdminBilingualInput
        label="模块标题"
        value={group?.title ?? { cn: "", en: "" }}
        onChange={(v) => onGroupChange({ ...group, title: v })}
      />
      <AdminBilingualInput
        label="模块说明（可选）"
        value={group?.description ?? { cn: "", en: "" }}
        onChange={(v) => onGroupChange({ ...group, description: v })}
        multiline
        rows={2}
      />
      {tracks.map((track, index) => (
        <TrackEditor
          key={track.id || index}
          track={track}
          index={index}
          total={tracks.length}
          onChange={(patch) => patchTrack(index, patch)}
          onRemove={() => removeTrack(index)}
          onMove={(delta) => moveTrack(index, delta)}
        />
      ))}
      <button type="button" className="admin-btn admin-btn--secondary" onClick={addTrack}>
        新增{label}音频
      </button>
    </AdminFieldGroup>
  );
}

/** Admin panel for caseItem.mixingAudioModules */
export default function AdminMixingAudioPanel({ caseItem, onChange }) {
  const modules = normalizeMixingAudioModules(
    caseItem.mixingAudioModules ?? createDefaultMixingAudioModules()
  );

  const updateModules = (patch) => {
    onChange({
      mixingAudioModules: normalizeMixingAudioModules({ ...modules, ...patch }),
    });
  };

  return (
    <div className="admin-mixing-audio">
      <AdminFieldGroup
        eyebrow="MIXING AUDIO"
        title="混音案例音频模块"
        description="仅对混音后期 / 录音编辑类案例在前台显示。贴唱与分轨可分别管理多条音频。"
      >
        <AdminToggle
          label="开启混音音频模块"
          checked={modules.enabled === true}
          onChange={(e) => updateModules({ enabled: e.target.checked })}
        />
      </AdminFieldGroup>

      <GroupEditor
        groupKey="vocalTune"
        group={modules.vocalTune}
        label="贴唱"
        onGroupChange={(vocalTune) => updateModules({ vocalTune })}
      />
      <GroupEditor
        groupKey="multitrack"
        group={modules.multitrack}
        label="分轨"
        onGroupChange={(multitrack) => updateModules({ multitrack })}
      />
    </div>
  );
}
