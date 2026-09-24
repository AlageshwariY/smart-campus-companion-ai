import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from '../services/dbStore';

interface RealtimeContextType {
  isOnline: boolean;
  subscribeToTable: (tableName: string, callback: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const subscribeToTable = (tableName: string, callback: (payload: any) => void): (() => void) => {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            console.log(`[Supabase Realtime] Change detected in ${tableName}:`, payload);
            callback(payload);
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      // Fallback BroadcastChannel / dbStore listener
      const unsubscribe = dbStore.subscribe((table, payload) => {
        if (table === tableName) {
          console.log(`[Local Realtime] Event on ${table}:`, payload);
          callback(payload);
        }
      });
      return unsubscribe;
    }
  };

  return (
    <RealtimeContext.Provider value={{ isOnline, subscribeToTable }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within a RealtimeProvider');
  return context;
};
