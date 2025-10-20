// server/index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";
import { z } from "zod";
import { nanoid } from "nanoid";
import { openDb } from "./db.js";

dotenv.config();

const app = express();
const db = openDb();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// CORS with allowlist
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://patient-scheduler-front-end.vercel.app',
  'https://patient-scheduler-front-pxgcoegll-ashley-lees-projects.vercel.app',
  'https://patient-scheduler-front-r9kg6bc36-ashley-lees-projects.vercel.app',
  'https://patient-scheduler-front-8et5r1c58-ashley-lees-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 AI requests per windowMs
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(morgan("dev"));

// Optional friendly root for browser checks
app.get("/", (_req, res) => {
  res.type("text").send("AI Scheduling API running. Try /health or /api/providers");
});

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- Providers & Slots ----------
app.get("/api/providers", (_req, res) => {
  const providers = db
    .prepare(`SELECT * FROM providers ORDER BY rating DESC`)
    .all();

  const getSlots = db.prepare(`
    SELECT * FROM slots
    WHERE provider_id = ? AND status='open' AND datetime(start) > datetime('now')
    ORDER BY datetime(start) LIMIT 5
  `);

  const data = providers.map((p) => ({ ...p, slots: getSlots.all(p.id) }));
  res.json(data);
});

// Text search (doctor/specialty/location) – MVP
app.get("/api/search/providers", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const rows = db
    .prepare(
      `
      SELECT * FROM providers
      WHERE doctor LIKE @q OR specialty LIKE @q OR location LIKE @q
      ORDER BY rating DESC
    `
    )
    .all({ q: `%${q}%` });

  const getSlots = db.prepare(`
    SELECT * FROM slots
    WHERE provider_id = ? AND status='open' AND datetime(start) > datetime('now')
    ORDER BY datetime(start) LIMIT 5
  `);

  const data = rows.map((p) => ({ ...p, slots: getSlots.all(p.id) }));
  res.json(data);
});

// ---------- Appointments ----------
const CreateAppt = z.object({
  providerId: z.string().min(1),
  patientName: z.string().min(1),
  start: z.string().datetime(), // ISO
});

const ReschedBody = z.object({
  start: z.string().datetime(), // ISO
});

app.get("/api/appointments", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT a.*, p.doctor, p.location
      FROM appointments a
      JOIN providers p ON p.id = a.provider_id
      ORDER BY datetime(a.start) DESC
    `
    )
    .all();
  res.json(rows);
});

app.post("/api/appointments", (req, res) => {
  const parsed = CreateAppt.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { providerId, patientName, start } = parsed.data;

  // If a slot exists for this time, ensure it’s open (prevent double-book)
  const slot = db
    .prepare(`SELECT * FROM slots WHERE provider_id=? AND start=?`)
    .get(providerId, start);
  if (slot && slot.status !== "open")
    return res.status(409).json({ error: "Slot not open" });

  const now = new Date().toISOString();
  const id = nanoid(10);

  const tx = db.transaction(() => {
    if (slot) {
      db.prepare(`UPDATE slots SET status='booked' WHERE id=?`).run(slot.id);
    }
    db.prepare(
      `
      INSERT INTO appointments (id, provider_id, patient_name, start, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'confirmed', ?, ?)
    `
    ).run(id, providerId, patientName, start, now, now);
  });
  tx();

  const created = db
    .prepare(
      `
      SELECT a.*, p.doctor, p.location
      FROM appointments a
      JOIN providers p ON p.id = a.provider_id
      WHERE a.id=?
    `
    )
    .get(id);

  res.status(201).json(created);
});

app.patch("/api/appointments/:id/cancel", (req, res) => {
  const id = req.params.id;
  const appt = db.prepare(`SELECT * FROM appointments WHERE id=?`).get(id);
  if (!appt) return res.status(404).json({ error: "Not found" });

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE appointments SET status='cancelled', updated_at=? WHERE id=?`
    ).run(new Date().toISOString(), id);

    // Free slot if we track it
    db.prepare(
      `UPDATE slots SET status='open' WHERE provider_id=? AND start=?`
    ).run(appt.provider_id, appt.start);
  });
  tx();

  res.json({ ok: true });
});

app.patch("/api/appointments/:id/reschedule", (req, res) => {
  const id = req.params.id;
  const parsed = ReschedBody.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const appt = db.prepare(`SELECT * FROM appointments WHERE id=?`).get(id);
  if (!appt) return res.status(404).json({ error: "Not found" });

  const { start } = parsed.data;

  // Validate new slot availability if it exists in our table
  const newSlot = db
    .prepare(`SELECT * FROM slots WHERE provider_id=? AND start=?`)
    .get(appt.provider_id, start);
  if (newSlot && newSlot.status !== "open")
    return res.status(409).json({ error: "Slot not open" });

  const tx = db.transaction(() => {
    // free old slot
    db.prepare(
      `UPDATE slots SET status='open' WHERE provider_id=? AND start=?`
    ).run(appt.provider_id, appt.start);

    // book new slot if present
    if (newSlot) {
      db.prepare(`UPDATE slots SET status='booked' WHERE id=?`).run(newSlot.id);
    }

    db.prepare(
      `UPDATE appointments SET start=?, status='confirmed', updated_at=? WHERE id=?`
    ).run(start, new Date().toISOString(), id);
  });
  tx();

  const out = db
    .prepare(
      `
      SELECT a.*, p.doctor, p.location
      FROM appointments a
      JOIN providers p ON p.id = a.provider_id
      WHERE a.id=?
    `
    )
    .get(id);

  res.json(out);
});

// ---- Simple intent+entities (MVP) ----
function parseIntent(text) {
  const t = text.toLowerCase();
  const intent =
    /(cancel|drop)/.test(t) ? 'cancel' :
    /(reschedule|move|change)/.test(t) ? 'reschedule' :
    /(book|schedule|appointment|see|visit)/.test(t) ? 'book' : 'search';

  // crude doctor match by last name
  const providers = db.prepare(`SELECT * FROM providers`).all();
  const provider = providers.find(p => t.includes(p.doctor.split(' ')[1].toLowerCase())) || null;

  // date/time hint (weekday)
  const dayHint = /(mon|tue|wed|thu|fri|monday|tuesday|wednesday|thursday|friday)/.exec(t)?.[0] || null;

  return { intent, provider, dayHint };
}

// ---------- AI Chat Endpoint ----------
app.post('/api/chat', aiLimiter, async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  // Try OpenAI first, fallback to simple intent parsing
  try {
    const providers = db.prepare(`SELECT * FROM providers ORDER BY rating DESC`).all();
    const providerList = providers.map(p => `${p.doctor} (${p.specialty}, ${p.location}) - Rating: ${p.rating}`).join('\n');

    const systemPrompt = `You are an AI assistant for a cardiology appointment scheduling system. 
    
Available providers:
${providerList}

You can help users:
1. Book appointments with cardiology providers
2. Reschedule existing appointments  
3. Cancel appointments
4. Answer questions about available providers and services

Be helpful, professional, and healthcare-focused. Keep responses concise and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    return res.json({ 
      reply: aiResponse,
      intent: 'ai_response',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to simple intent parsing
  }

  const { intent, provider, dayHint } = parseIntent(message);

  // Context fetchers
  const listProviders = db.prepare(`SELECT * FROM providers ORDER BY rating DESC`).all();
  const openSlots = db.prepare(`
    SELECT * FROM slots
    WHERE status = 'open' AND datetime(start) > datetime('now')
    ORDER BY datetime(start)
    LIMIT 20
  `).all();

  // Intent handlers
  if (intent === 'book' && provider && openSlots.length > 0) {
    const slots = openSlots
      .filter(s => s.provider_id === provider.id)
      .slice(0, 3)
      .map(s => ({ start: s.start, label: new Date(s.start).toLocaleString() }));
    
    if (slots.length === 0) {
      return res.json({
        reply: `Sorry, ${provider.doctor} has no available slots right now.`,
        intent: 'book',
        candidates: { providerId: provider.id, slots: [] }
      });
    }

    return res.json({
      reply: `I found ${slots.length} available slots with ${provider.doctor}: ${slots.map(s => s.label).join(', ')}. Would you like to book one?`,
      intent: 'book',
      candidates: { providerId: provider.id, slots }
    });
  }

  if (intent === 'cancel') {
    const appts = db.prepare(`
      SELECT a.*, p.doctor, p.location 
      FROM appointments a 
      JOIN providers p ON a.provider_id = p.id 
      WHERE a.status != 'cancelled' 
      ORDER BY a.start DESC 
      LIMIT 5
    `).all();
    
    if (appts.length === 0) {
      return res.json({
        reply: "You don't have any active appointments to cancel.",
        intent: 'cancel',
        candidates: { appointmentId: null }
      });
    }

    const appt = appts[0]; // Use most recent
    return res.json({
      reply: `I found your appointment with ${appt.doctor} on ${new Date(appt.start).toLocaleString()}. Would you like to cancel it?`,
      intent: 'cancel',
      candidates: { appointmentId: appt.id }
    });
  }

  if (intent === 'reschedule') {
    const appts = db.prepare(`
      SELECT a.*, p.doctor, p.location 
      FROM appointments a 
      JOIN providers p ON a.provider_id = p.id 
      WHERE a.status != 'cancelled' 
      ORDER BY a.start DESC 
      LIMIT 5
    `).all();
    
    if (appts.length === 0) {
      return res.json({
        reply: "You don't have any active appointments to reschedule.",
        intent: 'reschedule',
        candidates: { appointmentId: null }
      });
    }

    const appt = appts[0];
    const slots = openSlots
      .filter(s => s.provider_id === appt.provider_id)
      .slice(0, 3)
      .map(s => ({ start: s.start, label: new Date(s.start).toLocaleString() }));

    if (slots.length === 0) {
      return res.json({
        reply: `Sorry, no available slots to reschedule your appointment with ${appt.doctor}.`,
        intent: 'reschedule',
        candidates: { appointmentId: appt.id, slots: [] }
      });
    }

    return res.json({
      reply: `I can reschedule your appointment with ${appt.doctor}. Available slots: ${slots.map(s => s.label).join(', ')}. Which would you prefer?`,
      intent: 'reschedule',
      candidates: { appointmentId: appt.id, slots }
    });
  }

  // search/fallback
  const q = message.replace(/^(find|search)\s*/i, '').trim();
  const rows = db.prepare(`
    SELECT * FROM providers WHERE doctor LIKE @q OR specialty LIKE @q OR location LIKE @q
    ORDER BY rating DESC
  `).all({ q: `%${q}%` });
  const results = rows.slice(0, 5).map(p => ({ id: p.id, doctor: p.doctor, location: p.location }));
  return res.json({
    reply: results.length
      ? `I found ${results.length} matching providers. For example: ${results.map(r => r.doctor).join(', ')}.`
      : `I didn't find a provider that matches "${q}".`,
    intent: 'search',
    results
  });
});

// ---------- Start ----------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API on http://localhost:${port}`);
});
