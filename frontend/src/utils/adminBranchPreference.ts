const KEY = 'car-wash-admin-branch-view';

export function getAdminBranchPreference(defaultBranchId?: number | null) {
  const fallback = String(defaultBranchId ?? '');
  const saved = localStorage.getItem(KEY);
  return saved || fallback;
}

export function saveAdminBranchPreference(value: string) {
  localStorage.setItem(KEY, value);
}
