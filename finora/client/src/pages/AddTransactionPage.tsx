import { useNavigate, useSearchParams } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import ErrorMessage from '../components/ErrorMessage';
import LoadingMessage from '../components/LoadingMessage';
import { useNotifications } from '../context/NotificationContext';
import { useFinance } from '../store/hooks';
import { pageRoutes } from '../types';

export default function AddTransactionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useFinance();
  const { notify } = useNotifications();
  const isIncome = params.get('type') === 'income';
  const destination = isIncome ? pageRoutes.income : pageRoutes.transactions;
  return <section className="page-stack" aria-labelledby="add-transaction-title">
    <div className="page-heading">
      <div><p className="eyebrow">Your money, clearly</p>
        <h1 id="add-transaction-title">{isIncome ? 'Add income' : 'Add transaction'}</h1>
        <p>A small entry. A clearer picture.</p></div>
    </div>
    {state.transactions.fetch.status === 'failed' && <ErrorMessage
      message={state.transactions.fetch.error?.message ?? 'Unable to load transactions.'}
      onRetry={() => void actions.fetchTransactions()} />}
    {(state.transactions.fetch.status === 'idle' || state.transactions.fetch.status === 'pending') &&
      <LoadingMessage message="Loading transactions…" />}
    <div className="card transactions-entry">
      <TransactionForm initialType={isIncome ? 'income' : 'expense'}
        pending={state.transactions.mutation.status === 'pending' || state.transactions.fetch.status !== 'succeeded'} error={null}
        onCancel={() => navigate(destination)}
        onSubmit={async (input) => {
          await actions.createTransaction(input);
          notify({ kind: 'success', message: 'Transaction added.' });
          navigate(destination);
        }} />
    </div>
  </section>;
}
