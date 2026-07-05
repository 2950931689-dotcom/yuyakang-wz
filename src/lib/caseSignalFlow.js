import { t } from "./content";
import { getCaseKeywordTags } from "./homeContent";

export const SIGNAL_FLOW_NODES = [
  {
    id: "input",
    label: "INPUT",
    labelCn: "输入源",
    desc: {
      cn: "话筒、乐器、播放器与现场输入信号。",
      en: "Microphones, instruments, playback and live input sources.",
    },
  },
  {
    id: "console",
    label: "CONSOLE",
    labelCn: "调音台",
    desc: {
      cn: "FOH / Monitor 混音与路由控制。",
      en: "FOH and monitor mixing with routing control.",
    },
  },
  {
    id: "processor",
    label: "PROCESSOR",
    labelCn: "处理器",
    desc: {
      cn: "EQ、延时、分频与压限处理。",
      en: "EQ, delay, crossover and limiting.",
    },
  },
  {
    id: "amplifier",
    label: "AMPLIFIER",
    labelCn: "功放",
    desc: {
      cn: "功放通道管理与系统驱动。",
      en: "Amplifier channels and system drive.",
    },
  },
  {
    id: "output",
    label: "OUTPUT",
    labelCn: "输出",
    desc: {
      cn: "Main PA、超低、补声与监听系统。",
      en: "Main PA, subs, fills and monitor systems.",
    },
  },
];

export function getCaseSystemSummary(caseItem, lang = "cn") {
  const keywords = getCaseKeywordTags(caseItem, lang);
  if (keywords.length) return keywords.join(" / ");

  const equipment = t(caseItem?.equipment, lang);
  if (
    equipment &&
    !equipment.includes("[TODO]") &&
    !equipment.includes("待补充")
  ) {
    return equipment.length > 96 ? `${equipment.slice(0, 96)}…` : equipment;
  }

  return null;
}

export function getSignalFlowToolsHint(caseItem, lang = "cn") {
  if (Array.isArray(caseItem?.toolsUsed) && caseItem.toolsUsed.length) {
    return caseItem.toolsUsed.slice(0, 6).join(" · ");
  }

  const equipment = t(caseItem?.equipment, lang);
  if (
    equipment &&
    !equipment.includes("[TODO]") &&
    !equipment.includes("待补充")
  ) {
    return equipment.length > 120 ? `${equipment.slice(0, 120)}…` : equipment;
  }

  return null;
}
