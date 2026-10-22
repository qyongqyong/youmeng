import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../auth/authSlice';
import { clearLikes } from '../dreams/dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { clearDemoData } from '../../lib/storage';
import { formatCount } from '../../lib/time';
import Icon from '../../components/Icon';
import DreamCard from '../dreams/DreamCard';

function maskPhone(phone: string) {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const credits = useAppSelector((state) => state.auth.credits);
  const items = useAppSelector((state) => state.dreams.items);
  const likedIds = useAppSelector((state) => state.dreams.likedIds);

  const resetDemo = () => {
    if (
      window.confirm(
        '确定重置演示数据吗？将清空登录状态与所有发布、点赞、评论记录。',
      )
    ) {
      clearDemoData();
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="gate">
        <div className="gate-icon">
          <Icon name="user" size={28} />
        </div>
        <h2>还没有登录</h2>
        <p>登录后可以查看你的梦境、额度与获赞情况。</p>
        <Link to="/login?redirect=/me" className="btn primary">
          去登录
        </Link>
        <button type="button" className="btn ghost" onClick={resetDemo}>
          重置演示数据
        </button>
      </div>
    );
  }

  const mine = items.filter((d) => d.userId === user.id);
  const likesReceived = mine.reduce((sum, d) => sum + d.likeCount, 0);

  return (
    <div className="profile-page">
      <section className="profile-head">
        <div className="profile-avatar">{user.nickname.slice(-2)}</div>
        <div className="profile-info">
          <h1>{user.nickname}</h1>
          <p className="profile-phone">{maskPhone(user.phone)}</p>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            dispatch(logout());
            dispatch(clearLikes());
            dispatch(pushToast({ text: '已退出登录', type: 'info' }));
          }}
        >
          退出
        </button>
      </section>

      <section className="stat-grid">
        <div className="stat">
          <span className="stat-num">{credits}</span>
          <span className="stat-label">剩余额度</span>
        </div>
        <div className="stat">
          <span className="stat-num">{mine.length}</span>
          <span className="stat-label">发布梦境</span>
        </div>
        <div className="stat">
          <span className="stat-num">{formatCount(likesReceived)}</span>
          <span className="stat-label">获得喜欢</span>
        </div>
        <div className="stat">
          <span className="stat-num">{likedIds.length}</span>
          <span className="stat-label">点过喜欢</span>
        </div>
      </section>

      <section className="profile-dreams">
        <h2 className="section-title">我的梦境</h2>
        {mine.length === 0 ? (
          <div className="gate slim">
            <p>还没有发布过梦境。</p>
            <Link to="/compose" className="btn primary">
              去发布第一个
            </Link>
          </div>
        ) : (
          <div className="dream-grid">
            {mine.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        )}
      </section>

      <section className="profile-footer">
        <button type="button" className="btn ghost" onClick={resetDemo}>
          重置演示数据
        </button>
      </section>
    </div>
  );
}
