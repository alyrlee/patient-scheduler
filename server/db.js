import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA = path.join(__dirname, 'schema.sql');
const SEED_DB_PATH = path.join(__dirname, 'database.sqlite');
const TMP_DB_PATH = '/tmp/database.sqlite';

// cache across cold starts in the same lambda container
let _db;               // module-level
let _seeded = false;

export function openDb() {
  if (_db) return _db;

  // IMPORTANT: Vercel Serverless = ephemeral; use in-memory
  const isVercel = process.env.VERCEL === '1';
  
  let dbPath;
  if (isVercel) {
    dbPath = ':memory:';
  } else {
    // Use /tmp/database.sqlite for runtime database
    dbPath = TMP_DB_PATH;
    
    // On first boot, copy seed database to /tmp if it doesn't exist
    try {
      if (!fs.existsSync(TMP_DB_PATH)) {
        if (fs.existsSync(SEED_DB_PATH)) {
          fs.copyFileSync(SEED_DB_PATH, TMP_DB_PATH);
          console.log('Copied seed database to /tmp/database.sqlite');
        }
      }
    } catch (error) {
      console.log('Could not copy seed database, using in-memory database:', error.message);
      dbPath = ':memory:';
    }
  }

  let db;
  try {
    console.log("🗄️ Creating database connection to:", dbPath);
    db = new Database(dbPath);
    console.log("✅ Database connection created");
    
    // Only run schema if using in-memory database (Vercel)
    if (isVercel || dbPath === ':memory:') {
      console.log("📋 Running schema for in-memory database...");
      const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
      console.log("📄 Schema SQL loaded, length:", schemaSql.length);
      db.exec('PRAGMA foreign_keys = ON;');
      console.log("🔗 Foreign keys enabled");
      db.exec(schemaSql);
      console.log("✅ Schema executed successfully");
      
      // Verify users table was created
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log("📊 Tables in database:", tables.map(t => t.name));
      
      const usersTable = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
      console.log("👥 Users table schema:", usersTable?.sql || 'NOT FOUND');
    } else {
      console.log("📁 Using file-based database, enabling foreign keys only");
      // For file-based database, just ensure foreign keys are enabled
      db.exec('PRAGMA foreign_keys = ON;');
      console.log("🔗 Foreign keys enabled");
    }
  } catch (error) {
    console.error('💥 Database initialization error:', error);
    console.log("🔄 Falling back to in-memory database...");
    // Fallback to in-memory database
    db = new Database(':memory:');
    const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(schemaSql);
    console.log("✅ Fallback database initialized");
  }

  if (isVercel && !_seeded) {
    seedDatabase(db);
    _seeded = true;
  }

  _db = db;
  return db;
}

function seedDatabase(db) {
  const insertProvider = db.prepare(`
    INSERT OR IGNORE INTO providers (id, doctor, specialty, location, rating, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const providers = [
    ['p1', 'Dr. Amy Kim', 'Cardiology', 'Dallas', 4.8, 'Expert in heart disease treatment'],
    ['p2', 'Dr. Ravi Patel', 'Cardiology', 'Plano', 4.7, 'Specialist in interventional cardiology'],
    ['p3', 'Dr. Sophia Nguyen', 'Cardiology', 'Frisco', 4.9, 'Focus on preventive cardiology']
  ];
  providers.forEach(p => insertProvider.run(p));

  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO slots (id, provider_id, start, end, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const startOfDay = (offsetDays, hour) => {
    const d = new Date();
    d.setUTCMinutes(0, 0, 0);              // zero minutes/seconds
    d.setUTCHours(9, 0, 0, 0);             // start at 09:00 UTC
    d.setUTCDate(d.getUTCDate() + offsetDays);
    d.setUTCHours(hour, 0, 0, 0);
    return d;
  };

  const providersIds = ['p1', 'p2', 'p3'];
  for (const pid of providersIds) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour < 17; hour++) {
        const s = startOfDay(day, hour);
        const e = new Date(s.getTime() + 60 * 60 * 1000);
        const id = `slot-${pid}-${day}-${hour}`;
        insertSlot.run([id, pid, s.toISOString(), e.toISOString(), 'open']);
      }
    }
  }
}
