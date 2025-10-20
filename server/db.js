import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA = path.join(__dirname, 'schema.sql');

// cache across cold starts in the same lambda container
let _db;               // module-level
let _seeded = false;

export function openDb() {
  if (_db) return _db;

  // IMPORTANT: Vercel Serverless = ephemeral; use in-memory
  const isVercel = process.env.VERCEL === '1';
  const dbPath = isVercel ? ':memory:' : (process.env.DB_PATH || './scheduler.db');

  const db = new Database(dbPath);

  const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);

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
    ['1', 'Dr. Sarah Johnson', 'Cardiology', 'Dallas Medical Center', 4.8, 'Expert in heart disease treatment'],
    ['2', 'Dr. Michael Chen', 'Cardiology', 'Houston Heart Institute', 4.9, 'Specialist in interventional cardiology'],
    ['3', 'Dr. Emily Rodriguez', 'Cardiology', 'Austin Cardiac Care', 4.7, 'Focus on preventive cardiology']
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

  const providersIds = ['1', '2', '3'];
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
