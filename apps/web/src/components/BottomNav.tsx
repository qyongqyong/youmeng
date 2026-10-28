import { NavLink } from 'react-router-dom';
import Icon, { type IconName } from './Icon';

const items: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: '梦圈', icon: 'moon' },
  { to: '/compose', label: '发布', icon: 'sparkles' },
  { to: '/me', label: '我的', icon: 'user' },
  { to: '/insights', label: '报告', icon: 'sparkles' },
];

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
