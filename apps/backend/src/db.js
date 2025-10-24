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
    
    // Insert comprehensive sample data for Vercel
    const providers = [
      // Cardiology
      { id: 'p1',  doctor: 'Dr. Amy Kim',         specialty: 'Cardiology',   location: 'Dallas',  rating: 4.8 },
      { id: 'p2',  doctor: 'Dr. Ravi Patel',      specialty: 'Cardiology',   location: 'Plano',   rating: 4.7 },
      { id: 'p3',  doctor: 'Dr. Sophia Nguyen',   specialty: 'Cardiology',   location: 'Frisco',  rating: 4.9 },

      // Oncology
      { id: 'p4',  doctor: 'Dr. Marcus Alvarez',  specialty: 'Oncology',     location: 'Dallas',  rating: 4.6 },
      { id: 'p5',  doctor: 'Dr. Lila Shah',       specialty: 'Oncology',     location: 'Plano',   rating: 4.8 },

      // Pediatrics
      { id: 'p6',  doctor: 'Dr. Hannah Brooks',   specialty: 'Pediatrics',   location: 'Frisco',  rating: 4.9 },
      { id: 'p7',  doctor: 'Dr. Omar Haddad',     specialty: 'Pediatrics',   location: 'Dallas',  rating: 4.7 },

      // Orthopedics
      { id: 'p8',  doctor: 'Dr. Jordan Lee',      specialty: 'Orthopedics',  location: 'Plano',   rating: 4.6 },
      { id: 'p9',  doctor: 'Dr. Priya Menon',     specialty: 'Orthopedics',  location: 'Frisco',  rating: 4.8 },

      // Dermatology
      { id: 'p10', doctor: 'Dr. Brian O\'Connell', specialty: 'Dermatology',  location: 'Plano',   rating: 4.7 },
      { id: 'p11', doctor: 'Dr. Keiko Tanaka',    specialty: 'Dermatology',  location: 'Dallas',  rating: 4.8 },

      // Neurology
      { id: 'p12', doctor: 'Dr. Elena Garcia',    specialty: 'Neurology',    location: 'Frisco',  rating: 4.7 },
      { id: 'p13', doctor: 'Dr. Thomas Reed',     specialty: 'Neurology',    location: 'Dallas',  rating: 4.9 },
    ];
    
    // Insert providers
    providers.forEach(provider => {
      db.prepare(`
        INSERT OR IGNORE INTO providers (id, doctor, specialty, location, rating)
        VALUES (?, ?, ?, ?, ?)
      `).run(provider.id, provider.doctor, provider.specialty, provider.location, provider.rating);
    });

    // Generate time slots for the next 5 days
    const base = new Date();
    const timeSlots = ['10:00', '13:00', '15:30'];
    
    for (let d = 0; d < 5; d++) {
      for (const time of timeSlots) {
        const day = new Date(base);
        day.setDate(base.getDate() + d + 1);
        const [hh, mm] = time.split(':');
        day.setHours(hh, mm, 0, 0);
        
        providers.forEach(provider => {
          const slotId = `slot_${provider.id}_${day.getTime()}`;
          db.prepare(`
            INSERT OR IGNORE INTO slots (id, provider_id, start, status)
            VALUES (?, ?, ?, ?)
          `).run(slotId, provider.id, day.toISOString(), 'open');
        });
      }
    }
    
    console.log("✅ Database initialized with sample data");
  }
}