import { useCallback, useEffect, useRef, useState } from "react";

async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function useCopyFeedback(lang = "cn") {
  const [copiedKey, setCopiedKey] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async (key, text) => {
    const ok = await copyToClipboard(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopiedKey(ok ? key : `${key}-fail`);
    timerRef.current = setTimeout(() => setCopiedKey(null), 2200);
    return ok;
  }, []);

  const feedback = (key) => {
    if (copiedKey === key) return lang === "cn" ? "已复制" : "COPIED";
    if (copiedKey === `${key}-fail`) return lang === "cn" ? "请手动复制" : "Copy manually";
    return null;
  };

  return { copy, feedback, copiedKey };
}
