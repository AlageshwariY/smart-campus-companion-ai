import React from 'react';
import { WifiOff } from 'lucide-react';
import { useRealtime } from '../../contexts/RealtimeContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useRealtime();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-lg backdrop-blur-md sticky top-0 z-50 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>Connection lost. Trying to reconnect…</span>
    </div>
  );
};
