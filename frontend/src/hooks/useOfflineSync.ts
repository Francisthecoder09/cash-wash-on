import { useEffect, useState } from 'react';
import { offlineDb } from '../utils/offlineDb';
import { API_BASE_URL } from '../utils/constants';

export const useOfflineSync = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const refresh = async () => setPendingCount(await offlineDb.queue.count());
    refresh();

    const sync = async () => {
      if (!navigator.onLine) return;
      const queued = await offlineDb.queue.toArray();
      for (const item of queued) {
        try {
          await fetch(`${API_BASE_URL}${item.url}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${item.token}`
            },
            body: JSON.stringify(item.body)
          });
          if (item.id) {
            await offlineDb.queue.delete(item.id);
          }
        } catch {
          break;
        }
      }
      refresh();
    };

    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, []);

  return { pendingCount };
};
