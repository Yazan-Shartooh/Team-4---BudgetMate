import { ArrowDownLeft, ArrowLeftRight, ChartNoAxesCombined, LayoutDashboard, Plus, Wallet } from 'lucide-react';
import { pageRoutes } from './types';

export const navigationItems = [
  { to: pageRoutes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: pageRoutes.income, label: 'Income', icon: ArrowDownLeft },
  { to: pageRoutes.transactions, label: 'Transactions', icon: ArrowLeftRight },
 
  { to: pageRoutes.budgets, label: 'Budgets', icon: Wallet },
  { to: pageRoutes.report, label: 'Monthly report', icon: ChartNoAxesCombined },
];

export function getPageTitle(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  
  if (path === pageRoutes.about) return 'About us';
  return navigationItems.find((item) => item.to === path)?.label ?? 'Page not found';
}
