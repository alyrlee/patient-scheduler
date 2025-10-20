import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA = path.join(__dirname, 'schema.sql');

export function openDb() {
  // Use in-memory database for serverless deployment
  const isVercel = process.env.VERCEL === '1';
  const dbPath = isVercel ? ':memory:' : (process.env.DB_PATH || './scheduler.db');
  
  const db = new Database(dbPath);
  const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);
  
  // Seed data for serverless deployment
  if (isVercel) {
    seedDatabase(db);
  }
  
  return db;
}

function seedDatabase(db) {
  // Insert sample providers
  const insertProvider = db.prepare(`
    INSERT OR IGNORE INTO providers (id, doctor, specialty, location, rating, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const providers = [
    ['1', 'Dr. Sarah Johnson', 'Cardiology', 'Dallas Medical Center', 4.8, 'Expert in heart disease treatment'],
    ['2', 'Dr. Michael Chen', 'Cardiology', 'Houston Heart Institute', 4.9, 'Specialist in interventional cardiology'],
    ['3', 'Dr. Emily Rodriguez', 'Cardiology', 'Austin Cardiac Care', 4.7, 'Focus on preventive cardiology']
  ];
  
  providers.forEach(provider => insertProvider.run(provider));
  
  // Insert sample slots
  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO slots (id, provider_id, start, end, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const now = new Date();
  const slots = [];
  
  // Generate slots for next 7 days
  for (let i = 0; i < 3; i++) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour < 17; hour++) {
        const start = new Date(now.getTime() + (day * 24 * 60 * 60 * 1000) + (hour * 60 * 60 * 1000));
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        
        slots.push([
          `slot-${i}-${day}-${hour}`,
          (i + 1).toString(),
          start.toISOString(),
          end.toISOString(),
          'open'
        ]);
      }
    }
  }
  
  slots.forEach(slot => insertSlot.run(slot));
}
