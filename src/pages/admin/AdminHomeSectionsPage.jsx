import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { DEFAULT_HOME_SECTIONS, deepMergeHomeSections } from "../../lib/homeSectionsDefaults";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";
import {
  AdminField,
  AdminFieldGroup,
  AdminInput,
  AdminSaveBar,
  AdminTextarea,
} from "../../components/admin/AdminForm";
import { AdminBilingualInput, AdminTabs } from "../../components/admin/AdminBilingualField";

const TABS = [
  ["profile", "个人介绍"],
  ["liveCases", "现场案例"],
  ["mixingCases", "混音案例"],
  ["videoHighlights", "社媒文案"],
  ["workflow", "合作流程标题"],
  ["soundCheck", "声音诊断标题"],
  ["services", "服务区标题"],
  ["bookingCta", "预约 CTA"],
];

function listToLines(value, lang) {
  if (Array.isArray(value)) return value.join("\n");
  if (value && typeof value === "object") {
    const list = value[lang] ?? [];
    return Array.isArray(list) ? list.join("\n") : "";
  }
  return "";
}

function linesToList(raw) {
  return String(raw || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ChromeFields({ section, onChange }) {
  return (
    <>
      <AdminBilingualInput
        label="Eyebrow"
        value={section.eyebrow}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <AdminBilingualInput
        label="标题"
        value={section.title}
        onChange={(v) => onChange({ title: v })}
      />
      <AdminBilingualInput
        label="副标题"
        value={section.subtitle}
        onChange={(v) => onChange({ subtitle: v })}
        multiline
        rows={3}
      />
    </>
  );
}

function BranchFields({ branches = [], onChange }) {
  const list = Array.isArray(branches) ? branches : [];
  return (
    <div className="admin-routing-list">
      {list.map((branch, index) => (
        <div key={branch.id || index} className="admin-form-grid admin-form-grid--bilingual">
          <AdminField label={`分支 ID (${branch.id})`}>
            <AdminInput className="admin-mono" value={branch.id ?? ""} disabled />
          </AdminField>
          <AdminBilingualInput
            label="分支标签"
            value={branch.label}
            onChange={(v) => {
              const next = list.map((b, i) => (i === index ? { ...b, label: v } : b));
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function PlatformCopyFields({ label, value, onChange }) {
  const field = value ?? {};
  return (
    <AdminFieldGroup eyebrow={label} title={label}>
      <AdminBilingualInput
        label="平台名"
        value={field.platform}
        onChange={(v) => onChange({ ...field, platform: v })}
      />
      <AdminBilingualInput
        label="卡片标题"
        value={field.title}
        onChange={(v) => onChange({ ...field, title: v })}
      />
      <AdminBilingualInput
        label="说明"
        value={field.description}
        onChange={(v) => onChange({ ...field, description: v })}
        multiline
        rows={3}
      />
      <AdminBilingualInput
        label="按钮文案"
        value={field.cta}
        onChange={(v) => onChange({ ...field, cta: v })}
      />
    </AdminFieldGroup>
  );
}

export default function AdminHomeSectionsPage() {
  const [tab, setTab] = useState("profile");

  const getInitial = useCallback(
    (content) =>
      deepMergeHomeSections(
        DEFAULT_HOME_SECTIONS,
        content?.homeSections && typeof content.homeSections === "object"
          ? content.homeSections
          : {}
      ),
    []
  );

  const { data, update, dirty, saving, save, reset, loading } = useSectionEditor(
    "homeSections",
    getInitial
  );

  if (loading || !data) {
    return <div className="admin-placeholder admin-mono">加载首页文案中…</div>;
  }

  const section = data[tab] ?? {};
  const patchSection = (patch) => {
    update({ [tab]: { ...section, ...patch } });
  };

  return (
    <>
      <AdminTopbar
        eyebrow="首页"
        title="首页文案（按模块）"
        description="顺序对齐前台：介绍 → 案例板块 → 社媒 → 流程/诊断标题 → 服务 → 预约 CTA"
        actions={
          <Link to="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">
            预览首页 ↗
          </Link>
        }
      />
      <AdminUnsavedGuard when={dirty} />

      <AdminTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "profile" && (
        <AdminFieldGroup eyebrow="01" title="个人介绍" description="首页 #profile 区块">
          <ChromeFields section={section} onChange={patchSection} />
          <AdminBilingualInput
            label="介绍正文"
            value={section.intro}
            onChange={(v) => patchSection({ intro: v })}
            multiline
            rows={8}
          />
          <div className="admin-form-grid admin-form-grid--bilingual">
            <AdminField label="身份标签 · 中文（每行一项）">
              <AdminTextarea
                rows={5}
                value={listToLines(section.roles, "cn")}
                onChange={(e) =>
                  patchSection({
                    roles: {
                      ...(typeof section.roles === "object" && !Array.isArray(section.roles)
                        ? section.roles
                        : {}),
                      cn: linesToList(e.target.value),
                      en:
                        (typeof section.roles === "object" && !Array.isArray(section.roles)
                          ? section.roles.en
                          : null) ?? linesToList(listToLines(section.roles, "en")),
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="身份标签 · EN（每行一项）">
              <AdminTextarea
                rows={5}
                value={listToLines(section.roles, "en")}
                onChange={(e) =>
                  patchSection({
                    roles: {
                      ...(typeof section.roles === "object" && !Array.isArray(section.roles)
                        ? section.roles
                        : {}),
                      en: linesToList(e.target.value),
                      cn:
                        (typeof section.roles === "object" && !Array.isArray(section.roles)
                          ? section.roles.cn
                          : null) ?? linesToList(listToLines(section.roles, "cn")),
                    },
                  })
                }
              />
            </AdminField>
          </div>
          <div className="admin-form-grid admin-form-grid--bilingual">
            <AdminField label="资质标签 · 中文（每行一项）">
              <AdminTextarea
                rows={6}
                value={listToLines(section.qualifications, "cn")}
                onChange={(e) =>
                  patchSection({
                    qualifications: {
                      ...(typeof section.qualifications === "object" &&
                      !Array.isArray(section.qualifications)
                        ? section.qualifications
                        : {}),
                      cn: linesToList(e.target.value),
                      en:
                        (typeof section.qualifications === "object" &&
                        !Array.isArray(section.qualifications)
                          ? section.qualifications.en
                          : null) ?? linesToList(listToLines(section.qualifications, "en")),
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="资质标签 · EN（每行一项）">
              <AdminTextarea
                rows={6}
                value={listToLines(section.qualifications, "en")}
                onChange={(e) =>
                  patchSection({
                    qualifications: {
                      ...(typeof section.qualifications === "object" &&
                      !Array.isArray(section.qualifications)
                        ? section.qualifications
                        : {}),
                      en: linesToList(e.target.value),
                      cn:
                        (typeof section.qualifications === "object" &&
                        !Array.isArray(section.qualifications)
                          ? section.qualifications.cn
                          : null) ?? linesToList(listToLines(section.qualifications, "cn")),
                    },
                  })
                }
              />
            </AdminField>
          </div>
        </AdminFieldGroup>
      )}

      {(tab === "liveCases" || tab === "mixingCases") && (
        <AdminFieldGroup
          eyebrow={tab === "liveCases" ? "02" : "03"}
          title={tab === "liveCases" ? "现场 / 系统案例板块" : "后期 / 混音案例板块"}
          description="标题与分支标签；案例条目仍在「案例管理」中编辑"
        >
          <ChromeFields section={section} onChange={patchSection} />
          <AdminBilingualInput
            label="板块短标签（筛选器用）"
            value={section.label}
            onChange={(v) => patchSection({ label: v })}
          />
          <AdminBilingualInput
            label="查看全部按钮"
            value={section.viewAllLabel}
            onChange={(v) => patchSection({ viewAllLabel: v })}
          />
          <AdminField label="默认分支 ID">
            <AdminInput
              className="admin-mono"
              value={section.defaultBranchId ?? ""}
              onChange={(e) => patchSection({ defaultBranchId: e.target.value })}
            />
          </AdminField>
          <BranchFields
            branches={section.branches}
            onChange={(branches) => patchSection({ branches })}
          />
        </AdminFieldGroup>
      )}

      {tab === "videoHighlights" && (
        <>
          <AdminFieldGroup eyebrow="04" title="社媒视频区块标题">
            <ChromeFields section={section} onChange={patchSection} />
            <AdminBilingualInput
              label="精选视频「观看」按钮"
              value={section.watchLabel}
              onChange={(v) => patchSection({ watchLabel: v })}
            />
          </AdminFieldGroup>
          <PlatformCopyFields
            label="视频号卡片文案"
            value={section.wechat}
            onChange={(v) => patchSection({ wechat: v })}
          />
          <PlatformCopyFields
            label="抖音卡片文案"
            value={section.douyin}
            onChange={(v) => patchSection({ douyin: v })}
          />
          <p className="admin-mixing-hint">
            封面滚动卡（跳转链接 · 封面图 · 预览视频）与抖音 / 视频号主页 URL，请到{" "}
            <Link to="/admin/social" className="admin-btn admin-btn--secondary admin-btn--sm">
              05 封面滚动 / 社媒
            </Link>{" "}
            管理；本页只改标题与平台文字卡文案。
          </p>
        </>
      )}

      {(tab === "workflow" || tab === "soundCheck" || tab === "services") && (
        <AdminFieldGroup
          eyebrow={tab === "workflow" ? "05" : tab === "soundCheck" ? "06" : "07"}
          title={
            tab === "workflow"
              ? "合作流程 · 区块标题"
              : tab === "soundCheck"
                ? "声音诊断 · 区块标题"
                : "服务区 · 区块标题"
          }
          description={
            tab === "services"
              ? "服务条目在「服务管理」编辑"
              : "步骤 / 问题卡片列表在「流程 / 诊断」编辑"
          }
        >
          <ChromeFields section={section} onChange={patchSection} />
        </AdminFieldGroup>
      )}

      {tab === "bookingCta" && (
        <AdminFieldGroup eyebrow="08" title="预约合作 CTA" description="首页 conversion 区左侧">
          <AdminBilingualInput
            label="Eyebrow / 代码"
            value={section.eyebrow}
            onChange={(v) => patchSection({ eyebrow: v })}
          />
          <AdminBilingualInput
            label="标题"
            value={section.title}
            onChange={(v) => patchSection({ title: v })}
          />
          <AdminBilingualInput
            label="正文"
            value={section.description}
            onChange={(v) => patchSection({ description: v })}
            multiline
            rows={5}
          />
          <AdminBilingualInput
            label="提示"
            value={section.hint}
            onChange={(v) => patchSection({ hint: v })}
            multiline
            rows={3}
          />
          <AdminBilingualInput
            label="主按钮"
            value={section.primaryCta}
            onChange={(v) => patchSection({ primaryCta: v })}
          />
          <AdminBilingualInput
            label="次按钮"
            value={section.secondaryCta}
            onChange={(v) => patchSection({ secondaryCta: v })}
          />
        </AdminFieldGroup>
      )}

      <AdminSaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </>
  );
}
