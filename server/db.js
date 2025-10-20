import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './scheduler.db';
const SCHEMA = path.join(__dirname, 'schema.sql');

export function openDb() {
  const db = new Database(DB_PATH);
  const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);
  return db;
}
