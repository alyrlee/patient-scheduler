-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- providers
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  doctor TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  rating REAL NOT NULL,
  bio TEXT
);

-- slots (discrete bookable times)
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  start TEXT NOT NULL,  -- ISO datetime
  end TEXT NOT NULL,    -- ISO datetime
  status TEXT NOT NULL DEFAULT 'open', -- open | held | booked
  FOREIGN KEY(provider_id) REFERENCES providers(id)
);

-- appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  start TEXT NOT NULL,   -- ISO datetime
  status TEXT NOT NULL CHECK (status IN ('confirmed','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(provider_id) REFERENCES providers(id)
);

CREATE INDEX IF NOT EXISTS idx_slots_provider ON slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_appts_provider ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appts_start    ON appointments(start);
