import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { pageRoutes } from '../types';

export default function AddTransactionPage() {
  const [params] = useSearchParams();
  const isIncome = params.get('type') === 'income';
  return <div className="page-stack">
    <div className="page-heading">
      <div><p className="eyebrow">Your money, clearly</p><h1>{isIncome ? 'Add income' : 'Add transaction'}</h1>
        <p>A small entry. A clearer picture.</p></div>
      <span className="badge">In development</span>
    </div>
    <section className="card placeholder-intro">
      <div className="placeholder-symbol"><Plus size={32} aria-hidden="true" /></div>
      <h2>Your transaction form will live here.</h2>
      <p>The shared form will record {isIncome ? 'income' : 'income or expenses'}, including an amount, category, date, and optional note. Saving is not available yet.</p>
      <Link className="button button--secondary" to={pageRoutes.transactions}>Back to transactions</Link>
    </section>
  </div>;
}
