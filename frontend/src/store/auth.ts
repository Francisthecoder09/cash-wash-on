import { AuthResponse } from '../types';

const KEY = 'carwash-auth';

export const authStore = {
  get(): AuthResponse | null {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  },
  set(value: AuthResponse) {
    localStorage.setItem(KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
