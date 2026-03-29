import { AuthResponse } from '../types';

const KEY = 'carwash-auth';

function getStorage() {
  return window.sessionStorage;
}

export const authStore = {
  get(): AuthResponse | null {
    const sessionRaw = getStorage().getItem(KEY);
    if (sessionRaw) {
      return JSON.parse(sessionRaw) as AuthResponse;
    }

    const legacyRaw = window.localStorage.getItem(KEY);
    if (!legacyRaw) {
      return null;
    }

    const parsed = JSON.parse(legacyRaw) as AuthResponse;
    getStorage().setItem(KEY, legacyRaw);
    window.localStorage.removeItem(KEY);
    return parsed;
  },
  set(value: AuthResponse) {
    const serialized = JSON.stringify(value);
    getStorage().setItem(KEY, serialized);
    window.localStorage.removeItem(KEY);
  },
  clear() {
    getStorage().removeItem(KEY);
    window.localStorage.removeItem(KEY);
  }
};
