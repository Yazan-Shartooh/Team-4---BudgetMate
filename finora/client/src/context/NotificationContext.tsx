import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Notification, NotificationContextValue } from '../types';
import ToastQueue from '../components/ToastQueue';

const NotificationContext = createContext<NotificationContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('Wrap this feature in NotificationProvider.');
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const parent = useContext(NotificationContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);
  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${++nextId.current}`;
    setNotifications((items) => [...items, { ...notification, id }]);
  }, []);
  const dismiss = useCallback((id: string) => setNotifications((items) => items.filter((item) => item.id !== id)), []);
  const value = useMemo(() => ({ notifications, notify, dismiss }), [notifications, notify, dismiss]);
  // Page boundaries work now and reuse the app-wide provider when Molham adds it.
  if (parent) return children;
  return <NotificationContext.Provider value={value}>{children}<ToastQueue notifications={notifications} onDismiss={dismiss} /></NotificationContext.Provider>;
}
