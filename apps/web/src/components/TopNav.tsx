import { Link, NavLink } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Icon from './Icon';

const links = [
  { to: '/', label: '梦圈' },
  { to: '/compose', label: '发布' },
  { to: '/me', label: '我的' },
];

export default function TopNav() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Icon name="moon" size={22} />
          </span>
          <span className="brand-text">有梦</span>
        </Link>

        <nav className="topnav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'navlink active' : 'navlink'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-user">
          {user ? (
            <Link to="/me" className="avatar-sm" title={user.nickname}>
              {user.nickname.slice(-2)}
            </Link>
          ) : (
            <Link to="/login" className="btn small">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
