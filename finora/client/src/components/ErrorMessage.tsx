import type { ErrorMessageProps } from '../types';
export default function ErrorMessage({ message, onRetry, pending = false }: ErrorMessageProps) {
  return <div className="feedback feedback--error"><p role="alert">{message}</p>
    {onRetry && <button type="button" className="button button--secondary" disabled={pending} onClick={onRetry}>{pending ? 'Retrying…' : 'Try again'}</button>}
  </div>;
}
