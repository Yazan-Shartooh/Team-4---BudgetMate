import type { EmptyStateProps } from '../types';
export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return <div className="feedback feedback--empty" role="status"><h3>{title}</h3>
    {description && <p>{description}</p>}{action}</div>;
}
