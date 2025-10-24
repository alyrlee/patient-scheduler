// API configuration for both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const baseHeaders = { 'Accept': 'application/json' };        // no Content-Type on GETs
const jsonHeaders = { ...baseHeaders, 'Content-Type': 'application/json' };

// Helper function to build API URLs
const apiUrl = (path) => `${API_BASE_URL}${path}`;

export async function fetchProviders() {
  const r = await fetch(apiUrl('/api/providers'), { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchAppointments() {
  const r = await fetch(apiUrl('/api/appointments'), { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function searchProviders(q) {
  const r = await fetch(apiUrl(`/api/search/providers?q=${encodeURIComponent(q)}`), { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createAppointment({ providerId, patientName, start }) {
  const r = await fetch(apiUrl('/api/appointments'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ providerId, patientName, start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function cancelAppointment(id) {
  const r = await fetch(apiUrl(`/api/appointments/${id}/cancel`), { 
    headers: baseHeaders,
    method: 'PATCH' 
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rescheduleAppointment(id, start) {
  const r = await fetch(apiUrl(`/api/appointments/${id}/reschedule`), {
    headers: jsonHeaders,
    method: 'PATCH',
    body: JSON.stringify({ start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function sendChatMessage(message) {
  const r = await fetch(apiUrl('/api/chat'), {
    headers: jsonHeaders,
    method: 'POST',
    body: JSON.stringify({ message })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}