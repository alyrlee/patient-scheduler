// server/app.js - Express app without listen()
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import { z } from "zod";
import { nanoid } from "nanoid";
import { openDb } from "./db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

export function createApp() {
  const app = express();
  const db = openDb();

  // Safe, lazy OpenAI client getter (avoids crashing if env missing)
  const getOpenAI = () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    return new OpenAI({ apiKey: key });
  };

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  }));

  // CORS removed - browser is now same-origin with frontend via proxy
  // No CORS needed since all browser requests go through frontend domain

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(limiter);
  
  // Auth routes
  app.use("/api/auth", authRoutes);

  app.get("/", (_req, res) => res.type("text").send("AI Scheduling API running. Try /health or /api/providers"));
  app.get("/health", (_req, res) => {
    console.log("Health check requested");
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // --- Providers & Slots ---
  app.get("/api/providers", (_req, res) => {
    try {
      console.log("Fetching providers");
      const providers = db.prepare(`SELECT * FROM providers ORDER BY rating DESC`).all();
      const getSlots = db.prepare(`
        SELECT * FROM slots
        WHERE provider_id = ? AND status='open' AND datetime(start) > datetime('now')
        ORDER BY datetime(start) LIMIT 5`);
      const result = providers.map(p => ({ ...p, slots: getSlots.all(p.id) }));
      console.log(`Found ${result.length} providers`);
      res.json(result);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  app.get("/api/search/providers", (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const rows = db.prepare(`
      SELECT * FROM providers
      WHERE doctor LIKE @q OR specialty LIKE @q OR location LIKE @q
      ORDER BY rating DESC`).all({ q: `%${q}%` });
    const getSlots = db.prepare(`
      SELECT * FROM slots
      WHERE provider_id = ? AND status='open' AND datetime(start) > datetime('now')
      ORDER BY datetime(start) LIMIT 5`);
    res.json(rows.map(p => ({ ...p, slots: getSlots.all(p.id) })));
  });

  // --- Appointments ---
  const CreateAppt = z.object({ providerId: z.string().min(1), patientName: z.string().min(1), start: z.string().datetime() });
  const ReschedBody = z.object({ start: z.string().datetime() });

  app.get("/api/appointments", (_req, res) => {
    try {
      console.log("Fetching appointments");
      const rows = db.prepare(`
        SELECT a.*, p.doctor, p.location
        FROM appointments a JOIN providers p ON p.id = a.provider_id
        ORDER BY datetime(a.start) DESC`).all();
      console.log(`Found ${rows.length} appointments`);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", (req, res) => {
    const parsed = CreateAppt.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { providerId, patientName, start } = parsed.data;
    const slot = db.prepare(`SELECT * FROM slots WHERE provider_id=? AND start=?`).get(providerId, start);
    if (slot && slot.status !== "open") return res.status(409).json({ error: "Slot not open" });

    const now = new Date().toISOString();
    const id = nanoid(10);

    const tx = db.transaction(() => {
      if (slot) db.prepare(`UPDATE slots SET status='booked' WHERE id=?`).run(slot.id);
      db.prepare(`
        INSERT INTO appointments (id, provider_id, patient_name, start, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'confirmed', ?, ?)
      `).run(id, providerId, patientName, start, now, now);
    }); tx();

    const created = db.prepare(`
      SELECT a.*, p.doctor, p.location
      FROM appointments a JOIN providers p ON p.id = a.provider_id
      WHERE a.id=?`).get(id);

    res.status(201).json(created);
  });

  app.patch("/api/appointments/:id/cancel", (req, res) => {
    const id = req.params.id;
    const appt = db.prepare(`SELECT * FROM appointments WHERE id=?`).get(id);
    if (!appt) return res.status(404).json({ error: "Not found" });

    const tx = db.transaction(() => {
      db.prepare(`UPDATE appointments SET status='cancelled', updated_at=? WHERE id=?`)
        .run(new Date().toISOString(), id);
      db.prepare(`UPDATE slots SET status='open' WHERE provider_id=? AND start=?`)
        .run(appt.provider_id, appt.start);
    }); tx();

    res.json({ ok: true });
  });

  app.patch("/api/appointments/:id/reschedule", (req, res) => {
    const id = req.params.id;
    const parsed = ReschedBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const appt = db.prepare(`SELECT * FROM appointments WHERE id=?`).get(id);
    if (!appt) return res.status(404).json({ error: "Not found" });

    const { start } = parsed.data;
    const newSlot = db.prepare(`SELECT * FROM slots WHERE provider_id=? AND start=?`).get(appt.provider_id, start);
    if (newSlot && newSlot.status !== "open") return res.status(409).json({ error: "Slot not open" });

    const tx = db.transaction(() => {
      db.prepare(`UPDATE slots SET status='open' WHERE provider_id=? AND start=?`).run(appt.provider_id, appt.start);
      if (newSlot) db.prepare(`UPDATE slots SET status='booked' WHERE id=?`).run(newSlot.id);
      db.prepare(`UPDATE appointments SET start=?, status='confirmed', updated_at=? WHERE id=?`)
        .run(start, new Date().toISOString(), id);
    }); tx();

    const out = db.prepare(`
      SELECT a.*, p.doctor, p.location
      FROM appointments a JOIN providers p ON p.id = a.provider_id
      WHERE a.id=?`).get(id);
    res.json(out);
  });

  // ---- naive intent ----
  function parseIntent(text) {
    const t = text.toLowerCase();
    const intent =
      /(cancel|drop)/.test(t) ? "cancel" :
      /(reschedule|move|change)/.test(t) ? "reschedule" :
      /(book|schedule|appointment|see|visit)/.test(t) ? "book" : "search";
    const providers = db.prepare(`SELECT * FROM providers`).all();
    const provider = providers.find(p => t.includes(p.doctor.split(" ")[1].toLowerCase())) || null;
    const dayHint = /(mon|tue|wed|thu|fri|monday|tuesday|wednesday|thursday|friday)/.exec(t)?.[0] || null;
    return { intent, provider, dayHint };
  }

  // ---- AI Chat ----
  app.post("/api/chat", aiLimiter, async (req, res) => {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    try {
      const providers = db.prepare(`SELECT * FROM providers ORDER BY rating DESC`).all();
      const providerList = providers
        .map(p => `${p.doctor} (${p.specialty}, ${p.location}) - Rating: ${p.rating}`).join("\n");

      const systemPrompt = `You are an AI assistant for a cardiology appointment scheduling system.\n\nAvailable providers:\n${providerList}\n\nAssist with: booking, rescheduling, cancellations, and provider info. Keep answers concise.`;

      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500, temperature: 0.7
      });

      return res.json({
        reply: completion.choices[0].message.content,
        intent: "ai_response",
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("OpenAI error:", e?.message || e);
      // fall through to simple intent
    }

    const { intent, provider } = parseIntent(message);
    const openSlots = db.prepare(`
      SELECT * FROM slots WHERE status='open' AND datetime(start) > datetime('now')
      ORDER BY datetime(start) LIMIT 20`).all();

    if (intent === "book" && provider && openSlots.length) {
      const slots = openSlots.filter(s => s.provider_id === provider.id).slice(0, 3)
        .map(s => ({ start: s.start, label: new Date(s.start).toLocaleString() }));
      return res.json({
        reply: slots.length
          ? `Available with ${provider.doctor}: ${slots.map(s => s.label).join(", ")}.`
          : `Sorry, ${provider.doctor} has no open slots right now.`,
        intent: "book",
        candidates: { providerId: provider.id, slots }
      });
    }

    const q = message.replace(/^(find|search)\s*/i, "").trim();
    const rows = db.prepare(`
      SELECT * FROM providers
      WHERE doctor LIKE @q OR specialty LIKE @q OR location LIKE @q
      ORDER BY rating DESC`).all({ q: `%${q}%` });
    const results = rows.slice(0, 5).map(p => ({ id: p.id, doctor: p.doctor, location: p.location }));
    return res.json({
      reply: results.length
        ? `Found ${results.length} matching providers (e.g., ${results.map(r => r.doctor).join(", ")}).`
        : `No matches for "${q}".`,
      intent: "search",
      results
    });
  });

  // Global error handler
  app.use((err, req, res, _next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

// Export the app for Vercel serverless functions
export default createApp();
