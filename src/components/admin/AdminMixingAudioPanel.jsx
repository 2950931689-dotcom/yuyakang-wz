import {
  createDefaultMixingAudioModules,
  createEmptyMixingTrack,
  isMixingAudioCase,
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
      <AdminField label="音频名称（可修改）">
        <AdminInput
          value={track.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="例如：贴唱作品 A / 分轨 Demo"
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
        label="上传音频文件 / 或填写 URL"
        value={track.audioUrl ?? ""}
        onChange={(v) => onChange({ audioUrl: v })}
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
        hint="支持 mp3 / wav / aac / ogg 等，单文件建议 ≤ 30MB。上传后自动填入 URL，也可手填 /audio/... 或 /uploads/..."
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
    onGroupChange({ ...group, tracks: next }, { autoEnable: true });
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
    <AdminFieldGroup
      eyebrow={label}
      title={`${label}模块`}
      description={`在此${label}模块中新增、删除、改名并上传音频。前台对应「${label}」区块。`}
    >
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
      {tracks.length === 0 ? (
        <p className="admin-mixing-empty">暂无音频，点击下方按钮新增。</p>
      ) : null}
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
        + 新增{label}音频
      </button>
    </AdminFieldGroup>
  );
}

/** Admin panel for caseItem.mixingAudioModules — 贴唱 / 分轨 */
export default function AdminMixingAudioPanel({ caseItem, onChange }) {
  const modules = normalizeMixingAudioModules(
    caseItem.mixingAudioModules ?? createDefaultMixingAudioModules()
  );
  const isMixing = isMixingAudioCase(caseItem);

  const updateModules = (patch, options = {}) => {
    const next = normalizeMixingAudioModules({ ...modules, ...patch });
    if (options.autoEnable && next.enabled !== true) {
      next.enabled = true;
    }
    onChange({ mixingAudioModules: next });
  };

  return (
    <div className="admin-mixing-audio">
      <AdminFieldGroup
        eyebrow="MIXING MODULES"
        title="贴唱 / 分轨音频"
        description={
          isMixing
            ? "混音类案例详情页不再显示「项目详细信息」与「项目媒体机架」，只展示本页的贴唱与分轨模块。请开启开关并上传音频。"
            : "当前案例分类不是混音后期 / 录音编辑：前台不会显示贴唱 / 分轨。可先切换分类，或在此预填内容。"
        }
      >
        {!isMixing ? (
          <p className="admin-mixing-hint">
            建议分类选择「混音后期」或「录音编辑」后，前台才会用贴唱 / 分轨替换项目详情与媒体机架。
          </p>
        ) : null}
        <AdminToggle
          label="开启贴唱 / 分轨前台展示"
          checked={modules.enabled === true}
          onChange={(e) => updateModules({ enabled: e.target.checked })}
        />
      </AdminFieldGroup>

      <GroupEditor
        groupKey="vocalTune"
        group={modules.vocalTune}
        label="贴唱"
        onGroupChange={(vocalTune, options) => updateModules({ vocalTune }, options)}
      />
      <GroupEditor
        groupKey="multitrack"
        group={modules.multitrack}
        label="分轨"
        onGroupChange={(multitrack, options) => updateModules({ multitrack }, options)}
      />
    </div>
  );
}
