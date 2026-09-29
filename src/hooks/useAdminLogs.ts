import { useState, useCallback } from 'react';

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface AdminLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  details?: string;
}

const MAX_LOGS = 200;

// Stockage global pour persister les logs entre les re-renders du modal
let globalLogs: AdminLogEntry[] = [];

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>(globalLogs);

  const addLog = useCallback(
    (level: LogLevel, category: string, message: string, details?: string) => {
      const entry: AdminLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        level,
        category,
        message,
        details,
      };
      globalLogs = [entry, ...globalLogs].slice(0, MAX_LOGS);
      setLogs([...globalLogs]);
    },
    []
  );

  const logInfo = useCallback(
    (category: string, message: string, details?: string) =>
      addLog('info', category, message, details),
    [addLog]
  );
  const logSuccess = useCallback(
    (category: string, message: string, details?: string) =>
      addLog('success', category, message, details),
    [addLog]
  );
  const logWarning = useCallback(
    (category: string, message: string, details?: string) =>
      addLog('warning', category, message, details),
    [addLog]
  );
  const logError = useCallback(
    (category: string, message: string, details?: string) =>
      addLog('error', category, message, details),
    [addLog]
  );

  const clearLogs = useCallback(() => {
    globalLogs = [];
    setLogs([]);
  }, []);

  return { logs, logInfo, logSuccess, logWarning, logError, clearLogs };
}
