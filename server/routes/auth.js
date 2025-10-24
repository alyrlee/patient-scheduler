import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import sqlite from "better-sqlite3";

const router = Router();
const db = sqlite("database.sqlite");
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional()
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function signJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(process.env.COOKIE_NAME || "ps_token", token, {
    httpOnly: true,
    sameSite: isProd ? "strict" : "lax",
    secure: isProd,       // true on HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);
    const emailLower = email.toLowerCase();

    // Check user exists
    const existing = await db.user.findUnique({ where: { email: emailLower }});
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email: emailLower, password_hash, name: name || null, role: "patient" }
    });

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const emailLower = email.toLowerCase();

    const user = await db.user.findUnique({ where: { email: emailLower }});
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "ps_token", { path: "/" });
  res.status(204).end();
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "ps_token"];
    if (!token) return res.status(401).json({ error: "Unauthenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.user.findUnique({ where: { id: payload.sub }});
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
});

export default router;
