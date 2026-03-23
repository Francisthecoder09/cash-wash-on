import { authStore } from '../store/auth';
import { offlineDb } from '../utils/offlineDb';
import { API_BASE_URL } from '../utils/constants';

type Method = 'GET' | 'POST';

async function request<T>(path: string, method: Method = 'GET', body?: unknown, allowQueue = false): Promise<T> {
  const auth = authStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  if (!navigator.onLine && method === 'POST' && allowQueue && auth?.token) {
    await offlineDb.queue.add({
      url: path,
      method: 'POST',
      body,
      token: auth.token,
      createdAt: new Date().toISOString()
    });
    return Promise.resolve({ queued: true } as T);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Request failed');
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return (await response.blob()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown, allowQueue = false) => request<T>(path, 'POST', body, allowQueue)
};
