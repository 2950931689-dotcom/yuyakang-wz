import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import {
  DATA_DIR,
  UPLOADS_DIR,
  ensureDataFiles,
  readJson,
  updateJsonSection,
  writeJson,
  writeJsonSafe,
  backupJson,
} from "./lib/jsonStore.js";
import { listMediaFiles, moveUploadToTrash } from "./lib/mediaStore.js";
import {
  uploadMiddleware,
  validateUploadedFile,
  buildUploadResponse,
} from "./lib/upload.js";
import {
  validateBookingCreate,
  validateBookingPatch,
  validateSiteContent,
  validateSectionPatch,
} from "./lib/validate.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isPrivateLanOrigin(origin) {
  try {
    const { hostname, port } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    const isPrivate =
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (!isPrivate) return false;
    return !port || port === "5173" || port === "4173";
  } catch {
    return false;
  }
}

function getLanAddresses() {
  const nets = os.networkInterfaces();
  const addrs = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        addrs.push(net.address);
      }
    }
  }
  return addrs;
}

const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || isPrivateLanOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

app.use((err, _req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ ok: false, error: "CORS not allowed" });
  }
  return next(err);
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "YU YAKANG AUDIO CMS API",
    time: new Date().toISOString(),
  });
});

app.get("/api/content", async (_req, res) => {
  try {
    const content = await readJson(SITE_CONTENT_PATH);
    res.json(content);
  } catch (err) {
    console.error("GET /api/content", err);
    res.status(500).json({ ok: false, error: "Failed to read site content" });
  }
});

app.put("/api/content", async (req, res) => {
  try {
    const validation = validateSiteContent(req.body);
    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const nextContent = {
      ...req.body,
      meta: {
        ...(req.body.meta ?? {}),
        updatedAt: new Date().toISOString(),
      },
    };

    await backupJson(SITE_CONTENT_PATH);
    await writeJsonSafe(SITE_CONTENT_PATH, nextContent);
    res.json(nextContent);
  } catch (err) {
    console.error("PUT /api/content", err);
    res.status(500).json({ ok: false, error: "Failed to save site content" });
  }
});

app.patch("/api/content/section/:sectionKey", async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const validation = validateSectionPatch(sectionKey, req.body);

    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const { section, updatedAt } = await updateJsonSection(
      SITE_CONTENT_PATH,
      sectionKey,
      validation.data
    );

    res.json({
      ok: true,
      sectionKey,
      data: section,
      updatedAt,
    });
  } catch (err) {
    console.error("PATCH /api/content/section/:sectionKey", err);
    res.status(500).json({ ok: false, error: "Failed to save section" });
  }
});

app.post("/api/upload", (req, res) => {
  uploadMiddleware.single("file")(req, res, (err) => {
    if (err) {
      console.error("POST /api/upload", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, error: "File too large" });
      }
      if (err.code === "UNSUPPORTED_TYPE") {
        return res.status(400).json({ ok: false, error: err.message });
      }
      return res.status(400).json({ ok: false, error: err.message || "Upload failed" });
    }

    try {
      const validation = validateUploadedFile(req.file);
      if (!validation.ok) {
        return res.status(validation.status).json({ ok: false, error: validation.error });
      }

      res.status(201).json(buildUploadResponse(req.file));
    } catch (uploadErr) {
      console.error("POST /api/upload response", uploadErr);
      res.status(500).json({ ok: false, error: "Upload failed" });
    }
  });
});

app.get("/api/media", async (_req, res) => {
  try {
    const files = await listMediaFiles();
    res.json({ ok: true, files });
  } catch (err) {
    console.error("GET /api/media", err);
    res.status(500).json({ ok: false, error: "Failed to list media" });
  }
});

app.delete("/api/media/:filename", async (req, res) => {
  try {
    await moveUploadToTrash(req.params.filename);
    res.json({ ok: true, message: "文件已移动到 _trash" });
  } catch (err) {
    console.error("DELETE /api/media/:filename", err);
    const status = err.message?.includes("Invalid") ? 400 : 500;
    res.status(status).json({
      ok: false,
      error: err.message || "Failed to move file to trash",
    });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    let list = await readJson(BOOKINGS_PATH, []);

    if (!Array.isArray(list)) list = [];

    const { status, serviceType, limit } = req.query;

    if (status) {
      list = list.filter((b) => b.status === status);
    }
    if (serviceType) {
      list = list.filter((b) => b.serviceType === serviceType);
    }

    list = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const max = limit ? Math.min(Number(limit) || 20, 100) : undefined;
    if (max) list = list.slice(0, max);

    res.json(list);
  } catch (err) {
    console.error("GET /api/bookings", err);
    res.status(500).json({ ok: false, error: "Failed to read bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const validation = validateBookingCreate(req.body);
    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const list = await readJson(BOOKINGS_PATH, []);
    const now = new Date().toISOString();

    const booking = {
      id: randomUUID(),
      ...validation.data,
      status: "new",
      internalNote: "",
      createdAt: now,
      updatedAt: now,
    };

    list.push(booking);
    await writeJson(BOOKINGS_PATH, list, { backup: true });

    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /api/bookings", err);
    res.status(500).json({ ok: false, error: "Failed to create booking" });
  }
});

app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const validation = validateBookingPatch(req.body);
    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const list = await readJson(BOOKINGS_PATH, []);
    const index = list.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ ok: false, error: "Booking not found" });
    }

    const updated = {
      ...list[index],
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    await writeJson(BOOKINGS_PATH, list, { backup: true });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/bookings/:id", err);
    res.status(500).json({ ok: false, error: "Failed to update booking" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

await ensureDataFiles();

app.listen(PORT, HOST, () => {
  console.log(`YU YAKANG AUDIO CMS API → http://localhost:${PORT}`);
  const lan = getLanAddresses();
  if (lan.length) {
    console.log("  Network (API direct):");
    for (const ip of lan) {
      console.log(`    http://${ip}:${PORT}`);
    }
  }
  console.log("  Dev tip: frontend proxies /api → localhost:3001 (see docs/LOCAL_NETWORK_PREVIEW.md)");
});
