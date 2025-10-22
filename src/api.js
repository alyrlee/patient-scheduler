// Use relative URLs for proxy approach - no CORS needed
const baseHeaders = { 'Accept': 'application/json' };        // no Content-Type on GETs
const jsonHeaders = { ...baseHeaders, 'Content-Type': 'application/json' };

export async function fetchProviders() {
  const r = await fetch('/api/providers', { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchAppointments() {
  const r = await fetch('/api/appointments', { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function searchProviders(q) {
  const r = await fetch(`/api/search/providers?q=${encodeURIComponent(q)}`, { headers: baseHeaders });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createAppointment({ providerId, patientName, start }) {
  const r = await fetch('/api/appointments', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ providerId, patientName, start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function cancelAppointment(id) {
  const r = await fetch(`/api/appointments/${id}/cancel`, { 
    headers: baseHeaders,
    method: 'PATCH' 
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rescheduleAppointment(id, start) {
  const r = await fetch(`/api/appointments/${id}/reschedule`, {
    headers: jsonHeaders,
    method: 'PATCH',
    body: JSON.stringify({ start })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function sendChatMessage(message) {
  const r = await fetch('/api/chat', {
    headers: jsonHeaders,
    method: 'POST',
    body: JSON.stringify({ message })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}