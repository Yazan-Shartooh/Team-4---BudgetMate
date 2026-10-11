import type { LoadingMessageProps } from '../types';
export default function LoadingMessage({ message = 'Loading your data…' }: LoadingMessageProps) {
  return <p className="feedback feedback--loading" role="status">{message}</p>;
}
