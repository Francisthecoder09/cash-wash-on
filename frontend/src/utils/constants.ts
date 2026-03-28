const browserOrigin = window.location.origin;
const localBackendOrigin =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8083'
    : browserOrigin;

export const API_ORIGIN = import.meta.env.VITE_API_URL ?? window.__APP_CONFIG__?.apiBaseUrl?.replace(/\/api$/, '') ?? localBackendOrigin;
export const API_BASE_URL = window.__APP_CONFIG__?.apiBaseUrl ?? `${API_ORIGIN}/api`;
export const WS_URL = window.__APP_CONFIG__?.wsUrl ?? `${API_ORIGIN}/ws`;

export const statusColors = {
  REGISTERED: '#64748b',
  WASHING: '#eab308',
  INTERIOR: '#f59e0b',
  INSPECTION: '#ef4444',
  COMPLETED: '#16a34a'
} as const;
