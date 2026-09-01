import { useState, useEffect, useCallback, useRef } from 'react';
import { flushOutbox, getOutboxCount } from '../services/offlineSync';

/**
 * Tracks browser online/offline state, keeps a live count of pending
 * (unsynced) actions, and automatically flushes the outbox whenever the
 * connection comes back. Any component can call refreshPendingCount()
 * after queuing a new action to update the "X changes waiting to sync"
 * indicator immediately.
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getOutboxCount();
    setPendingCount(count);
  }, []);

  const runSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await flushOutbox();
      setLastSyncResult(result);
      await refreshPendingCount();
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      runSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also attempt a sync on mount in case there's a leftover queue from
    // a previous session that never got flushed (e.g. tab closed offline).
    if (navigator.onLine) runSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOnline, pendingCount, isSyncing, lastSyncResult, refreshPendingCount, runSync };
}

