export const API_BASE_URL = window.__APP_CONFIG__?.apiBaseUrl ?? 'http://localhost:8080/api';
export const WS_URL = window.__APP_CONFIG__?.wsUrl ?? 'http://localhost:8080/ws';

export const statusColors = {
  REGISTERED: '#64748b',
  WASHING: '#eab308',
  INTERIOR: '#f59e0b',
  INSPECTION: '#ef4444',
  COMPLETED: '#16a34a'
} as const;
