// server/api/index.js (Vercel serverless function)
import { createApp } from "../app.js";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

const app = createApp();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

// health check already exists per README; keep it
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

// Example protected route wrapper
function requireAuth(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME || "ps_token"];
  if (!token) return res.status(401).json({ error: "Unauthenticated" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
}

app.get("/api/appointments/my", requireAuth, async (req, res) => {
  const appointments = await db.appointment.findMany({ where: { userId: req.user.sub }});
  res.json(appointments);
});

app.listen(4000, () => console.log("API on :4000"));


// Export the app for Vercel serverless functions
export default app;