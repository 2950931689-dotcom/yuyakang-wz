/**
 * Admin API smoke test — run while server is on :3001
 * Usage: node scripts/admin-api-test.mjs
 */
const BASE = "http://localhost:3001";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

function pass(name) {
  console.log(`✓ ${name}`);
}

function fail(name, detail) {
  console.log(`✗ ${name} — ${detail}`);
  process.exitCode = 1;
}

async function main() {
  const health = await req("/api/health");
  health.ok ? pass("GET /api/health") : fail("GET /api/health", health.status);

  const content = await req("/api/content");
  content.ok ? pass("GET /api/content") : fail("GET /api/content", content.status);

  const heroPatch = await req("/api/content/section/hero", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        ...content.data.hero,
        slideDuration: 6,
      },
    }),
  });
  heroPatch.ok && heroPatch.data?.ok
    ? pass("PATCH /api/content/section/hero")
    : fail("PATCH hero", JSON.stringify(heroPatch.data));

  const locationPatch = await req("/api/content/section/location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { cn: "江西南昌", en: "Nanchang, Jiangxi" },
    }),
  });
  locationPatch.ok && locationPatch.data?.ok
    ? pass("PATCH /api/content/section/location")
    : fail("PATCH location", JSON.stringify(locationPatch.data));

  const media = await req("/api/media");
  media.ok && media.data?.ok ? pass("GET /api/media") : fail("GET /api/media", media.status);

  const badSection = await req("/api/content/section/invalid", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: {} }),
  });
  badSection.status === 400 ? pass("PATCH invalid section → 400") : fail("invalid section", badSection.status);

  // restore hero duration
  await req("/api/content/section/hero", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        ...content.data.hero,
        slideDuration: content.data.hero?.slideDuration ?? 5,
      },
    }),
  });

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
