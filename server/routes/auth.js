import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { openDb } from "../db.js";

const router = Router();
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
  console.log("🔐 SIGNUP REQUEST:", {
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log("📝 Validating request body...");
    const { email, password, name } = signupSchema.parse(req.body);
    console.log("✅ Request validation passed:", { email, name: name || 'not provided' });
    
    const emailLower = email.toLowerCase();
    console.log("🗄️ Opening database connection...");
    const db = openDb();
    console.log("✅ Database connection opened");

    console.log("🔍 Checking for existing user with email:", emailLower);
    // Check user exists
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(emailLower);
    if (existing) {
      console.log("❌ User already exists:", existing);
      return res.status(409).json({ error: "Email already in use" });
    }
    console.log("✅ No existing user found");

    console.log("🔐 Hashing password...");
    const password_hash = await bcrypt.hash(password, 12);
    console.log("✅ Password hashed successfully");
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    console.log("🆔 Generated user ID:", userId);
    console.log("⏰ Timestamps:", { created_at: now, updated_at: now });
    
    console.log("💾 Inserting user into database...");
    const insertResult = db.prepare(`
      INSERT INTO users (id, name, email, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name || null, emailLower, password_hash, now, now);
    
    console.log("📊 Database insert result:", {
      changes: insertResult.changes,
      lastInsertRowid: insertResult.lastInsertRowid
    });
    
    if (insertResult.changes === 0) {
      console.log("❌ Failed to create user - no changes made");
      return res.status(500).json({ error: "Failed to create user" });
    }
    console.log("✅ User created successfully");

    console.log("🎫 Generating JWT token...");
    const token = signJwt({ sub: userId, email: emailLower, role: "patient" });
    console.log("✅ JWT token generated");
    
    console.log("🍪 Setting authentication cookie...");
    setAuthCookie(res, token);
    console.log("✅ Cookie set successfully");

    const response = { id: userId, email: emailLower, name: name || null, role: "patient" };
    console.log("🎉 SIGNUP SUCCESS:", response);
    
    res.status(201).json(response);
  } catch (err) {
    console.error("💥 SIGNUP ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      issues: err?.issues,
      timestamp: new Date().toISOString()
    });
    
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  console.log("🔑 LOGIN REQUEST:", {
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log("📝 Validating request body...");
    const { email, password } = loginSchema.parse(req.body);
    console.log("✅ Request validation passed:", { email });
    
    const emailLower = email.toLowerCase();
    console.log("🗄️ Opening database connection...");
    const db = openDb();
    console.log("✅ Database connection opened");

    console.log("🔍 Looking up user with email:", emailLower);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(emailLower);
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("✅ User found:", { id: user.id, email: user.email, name: user.name });

    console.log("🔐 Verifying password...");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("❌ Password verification failed");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("✅ Password verified successfully");

    console.log("🎫 Generating JWT token...");
    const token = signJwt({ sub: user.id, email: user.email, role: "patient" });
    console.log("✅ JWT token generated");
    
    console.log("🍪 Setting authentication cookie...");
    setAuthCookie(res, token);
    console.log("✅ Cookie set successfully");

    const response = { id: user.id, email: user.email, name: user.name, role: "patient" };
    console.log("🎉 LOGIN SUCCESS:", response);
    
    res.json(response);
  } catch (err) {
    console.error("💥 LOGIN ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      issues: err?.issues,
      timestamp: new Date().toISOString()
    });
    
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "ps_token", { path: "/" });
  res.status(204).end();
});

router.get("/me", async (req, res) => {
  console.log("👤 ME REQUEST:", {
    cookies: req.cookies,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "ps_token"];
    if (!token) {
      console.log("❌ No authentication token found");
      return res.status(401).json({ error: "Unauthenticated" });
    }
    console.log("✅ Authentication token found");

    console.log("🔍 Verifying JWT token...");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT token verified:", { sub: payload.sub, email: payload.email, role: payload.role });
    
    console.log("🗄️ Opening database connection...");
    const db = openDb();
    console.log("✅ Database connection opened");
    
    console.log("🔍 Looking up user with ID:", payload.sub);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ error: "Unauthenticated" });
    }
    console.log("✅ User found:", { id: user.id, email: user.email, name: user.name });

    const response = { id: user.id, email: user.email, name: user.name, role: "patient" };
    console.log("🎉 ME SUCCESS:", response);
    
    res.json(response);
  } catch (err) {
    console.error("💥 ME ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      timestamp: new Date().toISOString()
    });
    return res.status(401).json({ error: "Unauthenticated" });
  }
});

export default router;
