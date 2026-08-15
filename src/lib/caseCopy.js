import { t } from "./content.js";

/** Normalize a bilingual `{ cn, en }` field from object or legacy string. */
export function normalizeBilingualField(value) {
  if (!value) return { cn: "", en: "" };
  if (typeof value === "string") return { cn: value.trim(), en: "" };
  return {
    cn: typeof value.cn === "string" ? value.cn.trim() : "",
    en: typeof value.en === "string" ? value.en.trim() : "",
  };
}

/** Ensure case.body is always `{ cn, en }`. */
export function normalizeCaseBody(caseItem) {
  return normalizeBilingualField(caseItem?.body);
}

function pickLocalized(caseItem, field, lang) {
  const value = t(caseItem?.[field], lang);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Unified case introduction for detail page.
 * Priority: body → legacy multi-field merge → single-field fallbacks.
 */
export function getCaseIntroductionText(caseItem, lang) {
  const body = pickLocalized(caseItem, "body", lang);
  if (body) return body;

  const summary = pickLocalized(caseItem, "summary", lang);
  const background = pickLocalized(caseItem, "background", lang);
  const challenge = pickLocalized(caseItem, "challenge", lang);
  const solution = pickLocalized(caseItem, "solution", lang);
  const result = pickLocalized(caseItem, "result", lang);
  const description = pickLocalized(caseItem, "description", lang);

  const narrative = [summary, background, challenge, solution, result].filter(Boolean);
  const uniqueCount = new Set(narrative).size;

  if (uniqueCount > 1) {
    const parts = [];
    const seen = new Set();
    for (const block of [summary, background, challenge, solution, result]) {
      if (!block || seen.has(block)) continue;
      seen.add(block);
      parts.push(block);
    }
    return parts.join("\n\n");
  }

  if (challenge) return challenge;
  return summary || background || description || "";
}

/**
 * Compose CN body text for admin when body.cn is empty (legacy cases).
 * Does not mutate stored fields.
 */
export function getCaseBodyCnDraft(caseItem) {
  const body = normalizeCaseBody(caseItem);
  if (body.cn) return body.cn;
  return getCaseIntroductionText(caseItem, "cn");
}
