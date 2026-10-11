import { useEffect, useState } from 'react';
import type { Notification, ToastQueueProps } from '../types';

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (notification.kind === 'error' || hovered || focused) return;
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, notification.kind, hovered, focused, onDismiss]);
  return <div className={`toast toast--${notification.kind}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <p role={notification.kind === 'error' ? 'alert' : 'status'}>{notification.message}</p>
    <button type="button" className="icon-button" aria-label={`Dismiss: ${notification.message}`} onClick={() => onDismiss(notification.id)}>×</button>
  </div>;
}
export default function ToastQueue({ notifications, onDismiss }: ToastQueueProps) {
  return <div className="toast-queue" aria-label="Notifications">{notifications.slice(0, 3).map((notification) =>
    <Toast key={notification.id} notification={notification} onDismiss={onDismiss} />)}</div>;
}
