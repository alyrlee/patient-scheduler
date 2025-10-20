// define tools that the agent can call over  DB or HTTP routes
import { openDb } from "../db.js";

const db = openDb();

export async function toolSearchProviders({ q }) {
  const rows = db.prepare(`
    SELECT * FROM providers WHERE doctor LIKE @q OR specialty LIKE @q OR location LIKE @q
    ORDER BY rating DESC LIMIT 10
  `).all({ q: `%${q}%` });
  return rows;
}

export async function toolGetOpenSlots({ providerId }) {
  return db.prepare(`
    SELECT * FROM slots
    WHERE provider_id=? AND status='open' AND datetime(start) > datetime('now')
    ORDER BY datetime(start) LIMIT 5
  `).all(providerId);
}

export async function toolCreateAppointment({ providerId, patientName, start }) {
  // you can call your existing Express handler or do it inline via DB tx
  // here, inline is simplest:
  // ... replicate your /api/appointments logic ...
}

export async function toolCancelAppointment({ appointmentId }) {
  // replicate /api/appointments/:id/cancel logic
}

export async function toolRescheduleAppointment({ appointmentId, start }) {
  // replicate /api/appointments/:id/reschedule logic
}

// (Later) EHR/FHIR tools:
// export async function toolFhirSearchPractitioner({ name }) {...}
// export async function toolFhirCreateAppointment({...}) {...}
