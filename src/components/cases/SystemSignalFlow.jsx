import { useState } from "react";
import { SIGNAL_FLOW_NODES, getSignalFlowToolsHint } from "../../lib/caseSignalFlow";

export default function SystemSignalFlow({ caseItem, lang }) {
  const [activeId, setActiveId] = useState(null);
  const toolsHint = getSignalFlowToolsHint(caseItem, lang);
  const activeNode = SIGNAL_FLOW_NODES.find((n) => n.id === activeId);

  return (
    <section className="signal-flow case-file__section">
      <header className="case-file__section-head">
        <span className="case-file__section-code">SIGNAL FLOW</span>
        <h2 className="case-file__section-title">
          {lang === "cn" ? "系统信号链路" : "System Signal Flow"}
        </h2>
        <p className="signal-flow__lead">
          {lang === "cn"
            ? "输入源 → 调音台 → 处理器 → 功放 → 主扩 / 超低 / 监听"
            : "Input → Console → Processor → Amplifier → PA / Sub / Monitor"}
        </p>
      </header>

      <div className="signal-flow__track" aria-hidden="true">
        <span className="signal-flow__track-dot" />
      </div>

      <ol className="signal-flow__nodes">
        {SIGNAL_FLOW_NODES.map((node, index) => (
          <li key={node.id} className="signal-flow__item">
            {index > 0 && <span className="signal-flow__connector" aria-hidden="true" />}
            <button
              type="button"
              className={`signal-flow__node${activeId === node.id ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(node.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(node.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="signal-flow__node-code">{node.label}</span>
              <span className="signal-flow__node-title">
                {lang === "cn" ? node.labelCn : node.label}
              </span>
              <span className="signal-flow__node-desc">{node.desc[lang]}</span>
              {node.id === "console" && toolsHint && (
                <span className="signal-flow__node-tools">{toolsHint}</span>
              )}
            </button>
          </li>
        ))}
      </ol>

      {activeNode && (
        <p className="signal-flow__hint sr-only" aria-live="polite">
          {activeNode.desc[lang]}
        </p>
      )}
    </section>
  );
}
