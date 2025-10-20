// Backend API URL
const API_BASE_URL = 'https://patient-scheduler-back-j82e4ubbr-ashley-lees-projects.vercel.app';

export async function fetchProviders() {
  const r = await fetch(`${API_BASE_URL}/api/providers`);
  if (!r.ok) throw new Error('providers failed');
  return r.json();
}

export async function fetchAppointments() {
  const r = await fetch(`${API_BASE_URL}/api/appointments`);
  if (!r.ok) throw new Error('appointments failed');
  return r.json();
}

export async function searchProviders(q) {
  const r = await fetch(`${API_BASE_URL}/api/search/providers?q=${encodeURIComponent(q)}`);
  if (!r.ok) throw new Error('search failed');
  return r.json();
}

export async function createAppointment({ providerId, patientName, start }) {
  const r = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ providerId, patientName, start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function cancelAppointment(id) {
  const r = await fetch(`${API_BASE_URL}/api/appointments/${id}/cancel`, { method: 'PATCH' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rescheduleAppointment(id, start) {
  const r = await fetch(`${API_BASE_URL}/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}