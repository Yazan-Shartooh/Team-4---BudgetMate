import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { useNotifications } from '../context/NotificationContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearTransactionMutationState, createTransaction } from '../store/transactionsSlice';
import { pageRoutes } from '../types';

export default function AddTransactionPage() {
  const [params] = useSearchParams();
  const isIncome = params.get('type') === 'income';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const data = useAppSelector((state) => state.transactions);
  useEffect(() => { dispatch(clearTransactionMutationState()); }, [dispatch]);
  return <div className="page-stack">
    <div className="page-heading"><div><p className="eyebrow">Your money, clearly</p>
      <h1>{isIncome ? 'Add income' : 'Add transaction'}</h1><p>A small entry. A clearer picture.</p></div></div>
    <section className="card transactions-entry" aria-label="New transaction">
      <TransactionForm key={isIncome ? 'income' : 'expense'} initialType={isIncome ? 'income' : 'expense'}
        pending={data.fetch.status === 'pending' || data.mutation.status === 'pending'} error={data.mutation.error}
        onCancel={() => navigate(pageRoutes.transactions)} onSubmit={async (input) => {
          await dispatch(createTransaction(input)).unwrap();
          notify({ kind: 'success', message: 'Transaction added.' });
          navigate(pageRoutes.transactions);
        }} />
    </section>
  </div>;
}
