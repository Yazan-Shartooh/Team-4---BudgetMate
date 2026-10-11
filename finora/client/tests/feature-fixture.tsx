// Isolated browser-test entry. Production main.tsx/store wiring are unchanged.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createAppStore } from '../src/store/store';
import transactions, { fetchTransactions } from '../src/store/transactionsSlice';
import budgets, { fetchBudgets } from '../src/store/budgetsSlice';
import TransactionsPage from '../src/pages/TransactionsPage';
import BudgetsPage from '../src/pages/BudgetsPage';
import MonthlyReportPage from '../src/pages/MonthlyReportPage';
import BudgetTable from '../src/components/BudgetTable';
import { useAppSelector } from '../src/store/hooks';
import { getCurrentMonth, selectBudgetUsage } from '../src/store/selectors';
import '../src/index.css';

const store = createAppStore({ transactions, budgets });
void store.dispatch(fetchTransactions());
void store.dispatch(fetchBudgets());
export function Fixture() {
  const [page, setPage] = useState('transactions');
  const rows = useAppSelector((state) => selectBudgetUsage(state, getCurrentMonth()));
  return <main className="page-stack"><nav aria-label="Test pages">
    <button type="button" className="button" onClick={() => setPage('transactions')}>Transactions test</button>
    <button type="button" className="button" onClick={() => setPage('budgets')}>Budgets test</button>
    <button type="button" className="button" onClick={() => setPage('readonly')}>Read-only test</button>
    <button type="button" className="button" onClick={() => setPage('report')}>Report test</button>
  </nav>{page === 'transactions' ? <TransactionsPage /> : page === 'budgets' ? <BudgetsPage /> : page === 'report' ? <MonthlyReportPage /> : <BudgetTable rows={rows} readOnly />}</main>;
}
createRoot(document.getElementById('root')!).render(<Provider store={store}><Fixture /></Provider>);
