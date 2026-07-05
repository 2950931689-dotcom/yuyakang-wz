import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import path from "node:path";
import {
  DATA_DIR,
  ensureDataFiles,
  readJson,
  writeJson,
} from "./lib/jsonStore.js";
import {
  validateBookingCreate,
  validateBookingPatch,
  validateSiteContent,
} from "./lib/validate.js";

const PORT = Number(process.env.PORT) || 3001;
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "2mb" }));

app.use((err, _req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS not allowed" });
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
    res.status(500).json({ error: "Failed to read site content" });
  }
});

app.put("/api/content", async (req, res) => {
  try {
    const validation = validateSiteContent(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const nextContent = {
      ...req.body,
      meta: {
        ...(req.body.meta ?? {}),
        updatedAt: new Date().toISOString(),
      },
    };

    await writeJson(SITE_CONTENT_PATH, nextContent, { backup: true });
    res.json(nextContent);
  } catch (err) {
    console.error("PUT /api/content", err);
    res.status(500).json({ error: "Failed to save site content" });
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
    res.status(500).json({ error: "Failed to read bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const validation = validateBookingCreate(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
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
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const validation = validateBookingPatch(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const list = await readJson(BOOKINGS_PATH, []);
    const index = list.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Booking not found" });
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
    res.status(500).json({ error: "Failed to update booking" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

await ensureDataFiles();

app.listen(PORT, () => {
  console.log(`YU YAKANG AUDIO CMS API → http://localhost:${PORT}`);
});
