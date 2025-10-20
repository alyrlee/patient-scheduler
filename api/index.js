// Vercel API entry point
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";
import { z } from "zod";
import { nanoid } from "nanoid";
import { openDb } from "../db.js";

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
  'http://localhost:5174',
  'https://patient-scheduler-frontend.vercel.app',
  'https://patient-scheduler-front-end.vercel.app',
  'https://patient-scheduler-front-cyfh0j7s5-ashley-lees-projects.vercel.app',
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

// Handle CORS preflight requests
app.options("*", cors());

// Optional friendly root for browser checks
app.get("/", (_req, res) => {
  res.type("text").send("AI Scheduling API running. Try /health or /api/providers");
});

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- Providers & Slots ----------
app.get("/api/providers", (_req, res) => {
  const providers = db
    .prepare(`SELECT * FROM providers ORDER BY rating DESC`)
    .all();
  res.json(providers);
});

app.get("/api/search/providers", (req, res) => {
  const q = req.query.q || "";
  const providers = db
    .prepare(
      `SELECT * FROM providers WHERE doctor LIKE ? OR specialty LIKE ? OR location LIKE ? ORDER BY rating DESC`
    )
    .all(`%${q}%`, `%${q}%`, `%${q}%`);
  res.json(providers);
});

app.get("/api/providers/:id/slots", (req, res) => {
  const { id } = req.params;
  const slots = db
    .prepare(
      `SELECT * FROM slots WHERE provider_id = ? AND status = 'open' ORDER BY start ASC`
    )
    .all(id);
  res.json(slots);
});

// ---------- Appointments ----------
app.get("/api/appointments", (_req, res) => {
  const appointments = db
    .prepare(`SELECT * FROM appointments ORDER BY start DESC`)
    .all();
  res.json(appointments);
});

app.post("/api/appointments", (req, res) => {
  const { providerId, patientName, start } = req.body;
  
  if (!providerId || !patientName || !start) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const id = nanoid();
  const now = new Date();
  const startTime = new Date(start);
  
  // Check if slot is available
  const slot = db
    .prepare(`SELECT * FROM slots WHERE provider_id = ? AND start = ? AND status = 'open'`)
    .get(providerId, start);
  
  if (!slot) {
    return res.status(400).json({ error: "Time slot not available" });
  }

  // Get provider info
  const provider = db
    .prepare(`SELECT * FROM providers WHERE id = ?`)
    .get(providerId);
  
  if (!provider) {
    return res.status(400).json({ error: "Provider not found" });
  }

  // Create appointment
  const appointment = {
    id,
    patient_name: patientName,
    doctor: provider.doctor,
    location: provider.location,
    start: startTime.toISOString(),
    time: startTime.toLocaleString(),
    status: 'confirmed',
    provider_id: providerId
  };

  db.prepare(`
    INSERT INTO appointments (id, patient_name, doctor, location, start, time, status, provider_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    appointment.id,
    appointment.patient_name,
    appointment.doctor,
    appointment.location,
    appointment.start,
    appointment.time,
    appointment.status,
    appointment.provider_id
  );

  // Mark slot as booked
  db.prepare(`UPDATE slots SET status = 'booked' WHERE id = ?`).run(slot.id);

  res.json(appointment);
});

app.patch("/api/appointments/:id/cancel", (req, res) => {
  const { id } = req.params;
  
  const appointment = db
    .prepare(`SELECT * FROM appointments WHERE id = ?`)
    .get(id);
  
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // Update appointment status
  db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).run(id);

  // Free up the slot
  db.prepare(`UPDATE slots SET status = 'open' WHERE provider_id = ? AND start = ?`).run(appointment.provider_id, appointment.start);

  res.json({ ok: true });
});

app.patch("/api/appointments/:id/reschedule", (req, res) => {
  const { id } = req.params;
  const { start } = req.body;
  
  if (!start) {
    return res.status(400).json({ error: "Missing start time" });
  }

  const appointment = db
    .prepare(`SELECT * FROM appointments WHERE id = ?`)
    .get(id);
  
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const newStartTime = new Date(start);
  
  // Check if new slot is available
  const slot = db
    .prepare(`SELECT * FROM slots WHERE provider_id = ? AND start = ? AND status = 'open'`)
    .get(appointment.provider_id, start);
  
  if (!slot) {
    return res.status(400).json({ error: "New time slot not available" });
  }

  // Update appointment
  db.prepare(`
    UPDATE appointments 
    SET start = ?, time = ?
    WHERE id = ?
  `).run(
    newStartTime.toISOString(),
    newStartTime.toLocaleString(),
    id
  );

  // Update slots
  const tx = db.transaction(() => {
    // Free old slot
    db.prepare(`UPDATE slots SET status = 'open' WHERE provider_id = ? AND start = ?`).run(appointment.provider_id, appointment.start);
    // Book new slot
    db.prepare(`UPDATE slots SET status = 'booked' WHERE id = ?`).run(slot.id);
  });
  tx();

  res.json({ ok: true });
});

// ---------- AI Chat ----------
app.post("/api/chat", aiLimiter, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get current data for context
    const providers = db.prepare(`SELECT * FROM providers`).all();
    const appointments = db.prepare(`SELECT * FROM appointments WHERE status != 'cancelled'`).all();
    
    const context = {
      providers: providers.map(p => ({
        id: p.id,
        doctor: p.doctor,
        specialty: p.specialty,
        location: p.location,
        rating: p.rating
      })),
      appointments: appointments.map(a => ({
        id: a.id,
        patient: a.patient_name,
        doctor: a.doctor,
        time: a.time,
        status: a.status
      }))
    };

    const systemPrompt = `You are an AI assistant for a patient scheduling system. You help patients book, cancel, and reschedule appointments with cardiologists.

Available providers:
${context.providers.map(p => `- ${p.doctor} (${p.specialty}) at ${p.location} - Rating: ${p.rating}/5`).join('\n')}

Current appointments:
${context.appointments.map(a => `- ${a.patient} with ${a.doctor} at ${a.time} (${a.status})`).join('\n')}

You can help with:
1. Booking new appointments
2. Canceling existing appointments  
3. Rescheduling appointments
4. Finding available providers
5. Checking appointment status

Always be helpful, professional, and clear. If you need to book an appointment, ask for the patient's name and preferred time.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    res.json({ response });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: "AI service temporarily unavailable",
      fallback: "Please try again later or contact support."
    });
  }
});

// Export the serverless handler for Vercel
export default serverless(app);
