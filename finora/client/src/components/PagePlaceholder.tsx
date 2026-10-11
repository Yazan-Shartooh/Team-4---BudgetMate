import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  heading: string;
  message: string;
  features: { title: string; description: string }[];
  action?: { to: string; label: string };
}

export default function PagePlaceholder({ title, description, icon: Icon, heading, message, features, action }: PagePlaceholderProps) {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">Your money, clearly</p><h1>{title}</h1><p>{description}</p></div>
        <span className="badge">In development</span>
      </div>
      <section className="card placeholder-intro" aria-label={title + ' preview'}>
        <div className="placeholder-symbol"><Icon size={32} aria-hidden="true" /></div>
        <p className="eyebrow">A place for the bigger picture</p>
        <h2>{heading}</h2>
        <p>{message}</p>
        {action && <Link className="button button--primary" to={action.to}>{action.label}<ArrowUpRight size={17} aria-hidden="true" /></Link>}
      </section>
      <div className="feature-grid">
        {features.map((feature, index) => (
          <section className="card feature-card" key={feature.title}>
            <span className="feature-number" aria-hidden="true">0{index + 1}</span>
            <h2>{feature.title}</h2><p>{feature.description}</p>
          </section>
        ))}
      </div>
      <p className="placeholder-note">This view is a placeholder. Financial data and actions will be connected in the next implementation steps.</p>
    </div>
  );
}
