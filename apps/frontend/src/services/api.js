// API configuration for both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const baseHeaders = { 'Accept': 'application/json' };        // no Content-Type on GETs
const jsonHeaders = { ...baseHeaders, 'Content-Type': 'application/json' };

// Helper function to build API URLs
const apiUrl = (path) => `${API_BASE_URL}${path}`;

// Enhanced fetch with 429 error handling and backoff
async function fetchWithRetry(url, options = {}, retries = 3) {
  const response = await fetch(url, options);
  
  if (response.status === 429 && retries > 0) {
    // Get retry-after header or use exponential backoff
    const retryAfter = response.headers.get('retry-after');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, 3 - retries) * 1000;
    
    console.warn(`Rate limited. Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return fetchWithRetry(url, options, retries - 1);
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText);
    error.status = response.status;
    error.retryAfter = response.headers.get('retry-after');
    throw error;
  }
  
  return response;
}

export async function fetchProviders() {
  const r = await fetchWithRetry(apiUrl('/api/providers'), { headers: baseHeaders });
  return r.json();
}

export async function fetchAppointments() {
  const r = await fetchWithRetry(apiUrl('/api/appointments'), { headers: baseHeaders });
  return r.json();
}

export async function searchProviders(q) {
  const r = await fetchWithRetry(apiUrl(`/api/search/providers?q=${encodeURIComponent(q)}`), { headers: baseHeaders });
  return r.json();
}

export async function createAppointment({ providerId, patientName, start }) {
  const r = await fetchWithRetry(apiUrl('/api/appointments'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ providerId, patientName, start })
  });
  return r.json();
}

export async function cancelAppointment(id) {
  const r = await fetchWithRetry(apiUrl(`/api/appointments/${id}/cancel`), { 
    headers: baseHeaders,
    method: 'PATCH' 
  });
  return r.json();
}

export async function rescheduleAppointment(id, start) {
  const r = await fetchWithRetry(apiUrl(`/api/appointments/${id}/reschedule`), {
    headers: jsonHeaders,
    method: 'PATCH',
    body: JSON.stringify({ start })
  });
  return r.json();
}

export async function sendChatMessage(message) {
  const r = await fetchWithRetry(apiUrl('/api/chat'), {
    headers: jsonHeaders,
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return r.json();
}