const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  let response
  try { response = await fetch(`${API_BASE}${path}`, options) }
  catch { throw new Error('Cannot reach the server. Please check your internet connection and try again.') }
  const data = await response.json().catch(() => ({ message: 'Unexpected server response.' }))
  if (!response.ok) throw new Error(data.message || 'Request failed.')
  return data
}

const json = (method, body, headers = {}) => ({ method, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body || {}) })

// Customer calls: bookingId + private token (from the e-mail link)
export const bookingApi = {
  config: () => apiRequest('/bookings/config'),
  create: (formData) => apiRequest('/bookings', { method: 'POST', body: formData }),
  get: (id, t) => apiRequest(`/bookings/${id}`, { headers: { 'x-booking-token': t } }),
  reupload: (id, t, formData) => apiRequest(`/bookings/${id}/document`, { method: 'PUT', headers: { 'x-booking-token': t }, body: formData }),
  pay: (id, t) => apiRequest(`/bookings/${id}/pay`, json('POST', {}, { 'x-booking-token': t })),
  verify: (id, t, payload) => apiRequest(`/bookings/${id}/verify-payment`, json('POST', payload, { 'x-booking-token': t })),
  cancel: (id, t, reason) => apiRequest(`/bookings/${id}/cancel`, json('POST', { reason }, { 'x-booking-token': t })),
  resendLink: (bookingId, email) => apiRequest('/bookings/resend-link', json('POST', { bookingId, email })),
  ticketUrl: (id, t) => `${API_BASE}/bookings/${id}/ticket.pdf?t=${encodeURIComponent(t)}`,
}

// Staff calls: x-admin-api-key
export function adminApi(key) {
  const h = { 'x-admin-api-key': key }
  return {
    list: (status, q) => apiRequest(`/admin/bookings?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) })}`, { headers: h }),
    review: (id, status, note) => apiRequest(`/admin/bookings/${id}/document`, json('PATCH', { status, note }, h)),
    cancel: (id, reason, refundPercent) => apiRequest(`/admin/bookings/${id}/cancel`, json('POST', { reason, ...(refundPercent !== undefined ? { refundPercent } : {}) }, h)),
    retryRefund: (id) => apiRequest(`/admin/bookings/${id}/retry-refund`, json('POST', {}, h)),
    async documentBlobUrl(id) {
      const r = await fetch(`${API_BASE}/admin/bookings/${id}/document`, { headers: h })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Could not load document.')
      return URL.createObjectURL(await r.blob())
    },
  }
}

export const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true)
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => resolve(true); s.onerror = () => resolve(false)
  document.body.appendChild(s)
})
