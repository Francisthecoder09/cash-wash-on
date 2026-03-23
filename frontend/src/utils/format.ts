export const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value))
    : 'Pending';

export const formatDurationMinutes = (start?: string, end?: string) => {
  if (!start) return '--';
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
