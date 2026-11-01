import { Link, useLocation } from 'react-router-dom';

export default function PublishTabs() {
  const location = useLocation();
  const inspirationActive = location.pathname === '/compose' && location.search.includes('type=inspiration');
  return (
    <div className="publish-switcher" aria-label="选择发布类型">
      <Link to="/compose" className={inspirationActive ? 'publish-switch' : 'publish-switch active'}>
        梦境
      </Link>
      <Link to="/compose?type=inspiration" className={inspirationActive ? 'publish-switch active' : 'publish-switch'}>
        灵感
      </Link>
    </div>
  );
}
