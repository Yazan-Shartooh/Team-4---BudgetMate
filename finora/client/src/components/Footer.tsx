import { Link } from 'react-router-dom';
import { pageRoutes } from '../types';

export default function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Finora</span>
      <span>Your money, clearly.</span>
      <Link to={pageRoutes.about}>About us</Link>
    </footer>
  );
}
