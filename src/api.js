// Backend API URL - use environment variable or fallback for DEV only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

// Common fetch options
const common = { 
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  } 
};

export async function fetchProviders() {
  const r = await fetch(`${API_BASE_URL}/api/providers`, common);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchAppointments() {
  const r = await fetch(`${API_BASE_URL}/api/appointments`, common);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function searchProviders(q) {
  const r = await fetch(`${API_BASE_URL}/api/search/providers?q=${encodeURIComponent(q)}`, common);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createAppointment({ providerId, patientName, start }) {
  const r = await fetch(`${API_BASE_URL}/api/appointments`, {
    ...common,
    method: 'POST',
    body: JSON.stringify({ providerId, patientName, start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function cancelAppointment(id) {
  const r = await fetch(`${API_BASE_URL}/api/appointments/${id}/cancel`, { 
    ...common,
    method: 'PATCH' 
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rescheduleAppointment(id, start) {
  const r = await fetch(`${API_BASE_URL}/api/appointments/${id}/reschedule`, {
    ...common,
    method: 'PATCH',
    body: JSON.stringify({ start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function sendChatMessage(message) {
  const r = await fetch(`${API_BASE_URL}/api/chat`, {
    ...common,
    method: 'POST',
    body: JSON.stringify({ message })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}