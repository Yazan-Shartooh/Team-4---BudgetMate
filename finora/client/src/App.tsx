import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import BudgetsPage from './pages/BudgetsPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { getPageTitle } from './navigation';
import { pageRoutes } from './types';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const previousLocation = useRef(location.key);

  const closeNavigation = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const handleResize = () => {
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener('change', handleResize);
    return () => media.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('navigation-open', mobileOpen);
    return () => document.body.classList.remove('navigation-open');
  }, [mobileOpen]);

  useEffect(() => {
    document.title = 'Finora | ' + getPageTitle(location.pathname);
    if (previousLocation.current !== location.key) {
      setMobileOpen(false);
      previousLocation.current = location.key;
      const frame = requestAnimationFrame(() => {
        mainRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [location.key, location.pathname]);

  return (
    <div className="app-shell">
      <a className="app-skip-link" href="#main-content">Skip to main content</a>
      <div inert={mobileOpen}>
        <Navbar mobileOpen={mobileOpen} onMenuToggle={() => setMobileOpen((open) => !open)} menuButtonRef={menuButtonRef} />
      </div>
      <Sidebar mobileOpen={mobileOpen} onClose={closeNavigation} />
      <main ref={mainRef} id="main-content" className="app-main" tabIndex={-1} inert={mobileOpen}>
        <div className="app-content">
          <Routes>
            <Route path={pageRoutes.dashboard} element={<DashboardPage />} />
            <Route path={pageRoutes.income} element={<IncomePage />} />
            <Route path={pageRoutes.transactions} element={<TransactionsPage />} />
            <Route path={pageRoutes.addTransaction} element={<AddTransactionPage />} />
            <Route path={pageRoutes.budgets} element={<BudgetsPage />} />
            <Route path={pageRoutes.report} element={<MonthlyReportPage />} />
            <Route path={pageRoutes.about} element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </main>
    </div>
  );
}
