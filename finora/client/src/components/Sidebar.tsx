import { useEffect, useRef } from 'react';
import { Info, PiggyBank, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../navigation';
import { pageRoutes } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = sidebarRef.current;
    sidebar?.querySelector<HTMLElement>('button, a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !sidebar) return;
      const elements = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)'))
        .filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onClose]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'app-nav-link' + (isActive ? ' app-nav-link--active' : '');

  return (
    <>
      {mobileOpen && <button className="app-scrim" tabIndex={-1} aria-label="Close navigation" onClick={onClose} />}
      <aside ref={sidebarRef} id="app-sidebar"
        className={'app-sidebar' + (mobileOpen ? ' app-sidebar--open' : '')}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined} aria-label="Main navigation">
        <div className="app-sidebar-heading">
          <span className="app-workspace-label">Personal finance</span>
          <button type="button" className="icon-button app-mobile-toggle" aria-label="Close navigation" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav className="app-nav" aria-label="Main">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === pageRoutes.dashboard} className={linkClass}>
              <Icon size={20} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-bottom">
          <div className="app-side-note">
            <PiggyBank size={28} aria-hidden="true" />
            <p>A little clarity.<br />A lot more possibility.</p>
            <small>Make room for what matters.</small>
          </div>
          <NavLink to={pageRoutes.about} className={linkClass}>
            <Info size={20} aria-hidden="true" /><span>About us</span>
          </NavLink>
          <div className="app-profile">
            <span className="app-avatar" aria-hidden="true">O</span>
            <div><strong>Omar</strong><span>Personal workspace</span></div>
          </div>
        </div>
      </aside>
    </>
  );
}
