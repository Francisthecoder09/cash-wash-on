import { CustomerAccount } from '../types';

const KEY = 'customer-account-session';

function read(): CustomerAccount | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CustomerAccount) : null;
  } catch {
    return null;
  }
}

function write(value: CustomerAccount | null) {
  if (!value) {
    sessionStorage.removeItem(KEY);
    return;
  }
  sessionStorage.setItem(KEY, JSON.stringify(value));
}

export const customerAccountStore = {
  get(): CustomerAccount | null {
    return read();
  },
  set(value: CustomerAccount) {
    write(value);
  },
  clear() {
    write(null);
  },
};
