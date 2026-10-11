import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getPageTitle } from '../navigation';
import { pageRoutes } from '../types';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  return (
    <nav className="app-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to={pageRoutes.dashboard}><Home size={16} aria-hidden="true" /><span>Home</span></Link></li>
        <li><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{getPageTitle(pathname)}</span></li>
      </ol>
    </nav>
  );
}
