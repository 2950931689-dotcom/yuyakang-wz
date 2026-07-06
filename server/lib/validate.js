const BOOKING_STATUSES = new Set([
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
]);

export const ALLOWED_SECTION_KEYS = new Set([
  "hero",
  "profile",
  "location",
  "serviceArea",
  "display",
  "services",
  "cases",
  "certificates",
  "socialLinks",
  "seo",
  "tutorialSection",
  "siteSettings",
]);

export function validateSiteContent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const hasSection =
    body.siteSettings ||
    body.profile ||
    body.hero ||
    body.cases ||
    body.services ||
    body.certificates;

  if (!hasSection) {
    return { ok: false, error: "Missing required content sections" };
  }

  if (body.cases !== undefined && !Array.isArray(body.cases)) {
    return { ok: false, error: "cases must be an array" };
  }
  if (body.services !== undefined && !Array.isArray(body.services)) {
    return { ok: false, error: "services must be an array" };
  }
  if (body.certificates !== undefined && !Array.isArray(body.certificates)) {
    return { ok: false, error: "certificates must be an array" };
  }
  if (body.siteSettings !== undefined && (typeof body.siteSettings !== "object" || Array.isArray(body.siteSettings))) {
    return { ok: false, error: "siteSettings must be an object" };
  }

  return { ok: true };
}

export function validateBookingCreate(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const name = String(body.name ?? "").trim();
  const wechat = String(body.wechat ?? "").trim();
  const serviceType = String(body.serviceType ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name && !wechat) {
    errors.push("name or wechat is required");
  }
  if (!serviceType) errors.push("serviceType is required");
  if (!message) errors.push("message is required");

  if (errors.length) {
    return { ok: false, error: errors.join("; ") };
  }

  return {
    ok: true,
    data: {
      name,
      wechat,
      phone: String(body.phone ?? "").trim(),
      email: String(body.email ?? "").trim(),
      serviceType,
      city: String(body.city ?? "").trim(),
      projectDate: String(body.projectDate ?? "").trim(),
      venueSize: String(body.venueSize ?? "").trim(),
      budgetRange: String(body.budgetRange ?? "").trim(),
      referenceLink: String(body.referenceLink ?? "").trim(),
      message,
    },
  };
}

export function validateBookingPatch(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const patch = {};

  if (body.status !== undefined) {
    if (!BOOKING_STATUSES.has(body.status)) {
      return { ok: false, error: `Invalid status. Allowed: ${[...BOOKING_STATUSES].join(", ")}` };
    }
    patch.status = body.status;
  }

  if (body.internalNote !== undefined) {
    patch.internalNote = String(body.internalNote);
  }

  if (!Object.keys(patch).length) {
    return { ok: false, error: "No valid fields to update" };
  }

  return { ok: true, data: patch };
}

export function validateSectionPatch(sectionKey, body) {
  if (!ALLOWED_SECTION_KEYS.has(sectionKey)) {
    return {
      ok: false,
      error: `Invalid sectionKey. Allowed: ${[...ALLOWED_SECTION_KEYS].join(", ")}`,
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  if (body.data === undefined) {
    return { ok: false, error: "Missing required field: data" };
  }

  return { ok: true, data: body.data };
}

export { BOOKING_STATUSES };
