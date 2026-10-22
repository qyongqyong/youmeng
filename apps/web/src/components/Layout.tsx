import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="page">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
