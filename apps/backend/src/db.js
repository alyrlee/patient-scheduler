// Database configuration for both development and production
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For Vercel serverless functions, use in-memory database
// In production, you should use a proper database like PostgreSQL
const isVercel = process.env.VERCEL === "1";

let db;

if (isVercel) {
  // In-memory database for Vercel (not persistent)
  db = new Database(":memory:");
  console.log("🗄️ Using in-memory database for Vercel deployment");
} else {
  // File-based database for development
  const dbPath = path.join(__dirname, "../database/scheduler.db");
  db = new Database(dbPath);
  console.log("🗄️ Using file-based database:", dbPath);
}

// Enable foreign keys
db.pragma("foreign_keys = ON");

export function openDb() {
  return db;
}

// Initialize database schema if needed
export function initDb() {
  if (isVercel) {
    // Create tables for in-memory database
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS providers (
        id TEXT PRIMARY KEY,
        doctor TEXT NOT NULL,
        specialty TEXT NOT NULL,
        location TEXT NOT NULL,
        rating REAL DEFAULT 0,
        bio TEXT
      );
      
      CREATE TABLE IF NOT EXISTS slots (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      );
      
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      );
    `);
    
    // Insert sample data for Vercel
    const providers = [
      { id: "prov_1", doctor: "Dr. Sarah Johnson", specialty: "Cardiology", location: "Dallas", rating: 4.8 },
      { id: "prov_2", doctor: "Dr. Michael Chen", specialty: "Cardiology", location: "Plano", rating: 4.9 },
      { id: "prov_3", doctor: "Dr. Emily Rodriguez", specialty: "Cardiology", location: "Frisco", rating: 4.7 }
    ];
    
    providers.forEach(provider => {
      db.prepare(`
        INSERT OR IGNORE INTO providers (id, doctor, specialty, location, rating)
        VALUES (?, ?, ?, ?, ?)
      `).run(provider.id, provider.doctor, provider.specialty, provider.location, provider.rating);
    });
    
    console.log("✅ Database initialized with sample data");
  }
}