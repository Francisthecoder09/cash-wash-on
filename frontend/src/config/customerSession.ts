const DEFAULT_WARNING_MINUTES = 14;
const DEFAULT_TIMEOUT_MINUTES = 15;

function parseMinutes(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const timeoutMinutes = parseMinutes(import.meta.env.VITE_CUSTOMER_SESSION_TIMEOUT_MINUTES, DEFAULT_TIMEOUT_MINUTES);
const warningMinutesRaw = parseMinutes(import.meta.env.VITE_CUSTOMER_SESSION_WARNING_MINUTES, DEFAULT_WARNING_MINUTES);
const warningMinutes = Math.min(warningMinutesRaw, Math.max(1, timeoutMinutes - 1));

export const customerSessionConfig = {
  warningMinutes,
  timeoutMinutes,
  warningMs: warningMinutes * 60 * 1000,
  timeoutMs: timeoutMinutes * 60 * 1000,
} as const;
