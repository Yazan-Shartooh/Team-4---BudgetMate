import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RefObject } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { pageRoutes } from '../types';

interface NavbarProps {
  mobileOpen: boolean;
  onMenuToggle: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export default function Navbar({ mobileOpen, onMenuToggle, menuButtonRef }: NavbarProps) {
  return (
    <header className="app-topbar">
      <div className="app-brand-group">
        <button ref={menuButtonRef} type="button" className="icon-button app-mobile-toggle"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen} aria-controls="app-sidebar" onClick={onMenuToggle}>
          <Menu size={22} aria-hidden="true" />
        </button>
        <Link className="app-brand" to={pageRoutes.dashboard} aria-label="Finora home">
          <img src="/finora-icon.svg" alt="" width="38" height="38" />
          <img className="app-wordmark" src="/finora-wordmark.svg" alt="Finora" width="104" height="28" />
        </Link>
      </div>
      <Breadcrumbs />
      <div className="app-topbar-actions">
        <Link className="button button--primary app-add-transaction" to={pageRoutes.addTransaction}>
          <Plus size={18} aria-hidden="true" /><span>Add transaction</span>
        </Link>
        <span className="app-avatar" aria-label="Omar's personal workspace">O</span>
      </div>
    </header>
  );
}
