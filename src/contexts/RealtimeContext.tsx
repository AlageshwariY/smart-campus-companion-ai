import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from '../services/dbStore';

interface RealtimeContextType {
  isOnline: boolean;
  subscribeToTable: (tableName: string, callback: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

/** Generate a short unique ID to namespace channel names per-subscription */
const uid = () => Math.random().toString(36).slice(2, 9);

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

  /**
   * Subscribe to a Supabase table for postgres_changes events.
   *
   * KEY FIXES:
   * 1. `useCallback` with empty deps → stable function reference across renders.
   *    This prevents React from re-running consumer useEffects just because the
   *    context value changed on a RealtimeProvider re-render.
   *
   * 2. Every call gets a UNIQUE channel name (`public:<table>:<uid>`).
   *    This avoids the Supabase error:
   *      "cannot add 'postgres_changes' callbacks after subscribe()"
   *    which happens when two callers reuse the same channel name and the SDK
   *    tries to mutate an already-subscribed channel object.
   *
   * 3. The cleanup returned by the hook always calls supabase.removeChannel()
   *    so the channel is fully torn down before a new one is created.
   */
  const subscribeToTable = useCallback(
    (tableName: string, callback: (payload: any) => void): (() => void) => {
      if (isSupabaseConfigured && supabase) {
        // Unique channel name prevents collisions between components and re-renders
        const channelName = `public:${tableName}:${uid()}`;

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
              console.log(`[Supabase Realtime] Change in ${tableName}:`, payload);
              callback(payload);
            }
          )
          // .on() MUST be called before .subscribe() — this order is correct
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`[Supabase Realtime] Subscribed to ${channelName}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(`[Supabase Realtime] Channel error on ${channelName}`);
            }
          });

        return () => {
          if (supabase) {
            supabase.removeChannel(channel).catch(() => {
              // Ignore errors during cleanup (e.g. channel already removed)
            });
          }
        };
      } else {
        // Fallback: local dbStore pub/sub for offline / no-Supabase mode
        const unsubscribe = dbStore.subscribe((table, payload) => {
          if (table === tableName) {
            console.log(`[Local Realtime] Event on ${table}:`, payload);
            callback(payload);
          }
        });
        return unsubscribe;
      }
    },
    // Empty dependency array: subscribeToTable never changes reference.
    // supabase client and isSupabaseConfigured are module-level constants.
    []
  );

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
