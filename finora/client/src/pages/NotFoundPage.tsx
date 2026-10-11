import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageRoutes } from '../types';

export default function NotFoundPage() {
  return <section className="card placeholder-intro not-found-page">
    <div className="placeholder-symbol"><Compass size={32} aria-hidden="true" /></div>
    <p className="eyebrow">404 · A little off track</p>
    <h1>We couldn’t find that page.</h1>
    <p>Head back to your dashboard to find your way.</p>
    <Link className="button button--primary" to={pageRoutes.dashboard}>Back to dashboard</Link>
  </section>;
}
