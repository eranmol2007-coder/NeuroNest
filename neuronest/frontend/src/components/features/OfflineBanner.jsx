import React from 'react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

export default function OfflineBanner() {
  const { isOnline } = useOfflineSync();
  if (isOnline) return null;

  return (
    <div role="status" className="fixed top-16 left-0 right-0 z-40 px-4 py-2.5 text-center text-xs font-medium tracking-wider backdrop-blur-xl border-b bg-brand-500/10 text-brand-400 border-brand-500/20">
      <span>Offline — changes sync automatically</span>
    </div>
  );
}


