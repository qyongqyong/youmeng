import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateProfile } from '../auth/authSlice';
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
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [avatar, setAvatar] = useState('🌙');
  const [bio, setBio] = useState('');
  const [activeList, setActiveList] = useState<'mine' | 'liked'>('mine');
  const [checkedIn, setCheckedIn] = useState(() => {
    try {
      return localStorage.getItem('youmeng:checkin') === new Date().toDateString();
    } catch {
      return false;
    }
  });

  const beginEditing = () => {
    setNickname(user?.nickname ?? '');
    setGender(user?.gender ?? 'unknown');
    setAvatar(user?.avatar ?? '🌙');
    setBio(user?.bio ?? '');
    setEditing(true);
  };

  const saveProfile = () => {
    const nextNickname = nickname.trim();
    if (!nextNickname) {
      dispatch(pushToast({ text: '昵称不能为空', type: 'error' }));
      return;
    }
    dispatch(
      updateProfile({
        nickname: nextNickname.slice(0, 20),
        gender,
        avatar,
        bio: bio.trim().slice(0, 60),
      }),
    );
    setEditing(false);
    dispatch(pushToast({ text: '个人资料已保存', type: 'success' }));
  };

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
  const liked = items.filter((d) => likedIds.includes(d.id));
  const likesReceived = mine.reduce((sum, d) => sum + d.likeCount, 0);
  const visibleDreams = activeList === 'mine' ? mine : liked;
  const preferenceTags = Array.from(
    mine.reduce((counts, dream) => {
      dream.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
      return counts;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const checkIn = () => {
    try {
      localStorage.setItem('youmeng:checkin', new Date().toDateString());
    } catch {
      // 忽略隐私模式下的存储限制
    }
    setCheckedIn(true);
    dispatch(pushToast({ text: '今日梦境记录已打卡，继续保持 ✨', type: 'success' }));
  };

  return (
    <div className="profile-page">
      <section className="profile-head">
        <div className="profile-avatar">{user.avatar ?? user.nickname.slice(-2)}</div>
        <div className="profile-info">
          <h1>{user.nickname}</h1>
          <p className="profile-phone">
            {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置'}
            <span> · </span>{maskPhone(user.phone)}
          </p>
          <p className="profile-bio">{user.bio || '还没有写个人介绍。'}</p>
        </div>
        <div className="profile-head-actions">
          <button type="button" className="btn small" onClick={beginEditing}>编辑资料</button>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              dispatch(logout());
              dispatch(clearLikes());
              dispatch(pushToast({ text: '已退出登录', type: 'info' }));
            }}
          >退出</button>
        </div>
      </section>

      {editing && (
        <section className="profile-editor">
          <div className="editor-heading">
            <div><span className="section-kicker">Profile settings</span><h2>编辑个人资料</h2></div>
            <button type="button" className="icon-btn" aria-label="关闭" onClick={() => setEditing(false)}><Icon name="close" size={18} /></button>
          </div>
          <div className="avatar-picker">
            <span className="editor-label">选择头像</span>
            <div className="avatar-options">
              {['🌙', '🌌', '🌊', '🌸', '🪐', '☁️'].map((item) => (
                <button key={item} type="button" className={avatar === item ? 'avatar-option active' : 'avatar-option'} onClick={() => setAvatar(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="profile-form-grid">
            <label className="field"><span>昵称</span><input value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} placeholder="给自己取一个名字" /></label>
            <label className="field"><span>性别</span><select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}><option value="unknown">暂不设置</option><option value="male">男</option><option value="female">女</option></select></label>
          </div>
          <label className="field"><span>个人介绍 <em>{bio.length}/60</em></span><textarea value={bio} maxLength={60} rows={3} onChange={(e) => setBio(e.target.value)} placeholder="介绍一下现在的你，或许会遇见同频的人……" /></label>
          <div className="editor-actions"><button type="button" className="btn ghost" onClick={() => setEditing(false)}>取消</button><button type="button" className="btn primary" onClick={saveProfile}>保存资料</button></div>
        </section>
      )}

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

      <section className="profile-insights">
        <div className="checkin-card">
          <div className="insight-icon"><Icon name="sparkles" size={18} /></div>
          <div className="insight-copy">
            <span className="section-kicker">Dream habit</span>
            <h3>今天也来记录一个梦</h3>
            <p>{checkedIn ? '今天的梦已经被你认真收藏。' : '连续记录，慢慢看见自己的梦境轨迹。'}</p>
          </div>
          <button type="button" className={checkedIn ? 'btn small checked' : 'btn primary small'} onClick={checkIn} disabled={checkedIn}>
            {checkedIn ? '已打卡' : '今日打卡'}
          </button>
        </div>
        <div className="preference-card">
          <div className="insight-copy">
            <span className="section-kicker">Your atmosphere</span>
            <h3>我的梦境偏好</h3>
          </div>
          {preferenceTags.length > 0 ? (
            <div className="preference-tags">
              {preferenceTags.map(([tag, count]) => <span key={tag}>#{tag}<b>{count}</b></span>)}
            </div>
          ) : <p className="preference-empty">发布梦境后，这里会出现你的专属主题。</p>}
        </div>
      </section>

      <Link to="/insights" className="profile-report-banner">
        <span className="report-banner-icon"><Icon name="sparkles" size={19} /></span>
        <span><small>PERSONAL DREAM REPORT</small><strong>查看我的梦境报告</strong><em>主题、节奏与最近的梦，都整理好了</em></span>
        <b>→</b>
      </Link>

      <section className="profile-dreams">
        <div className="profile-list-head">
          <div>
            <span className="section-kicker">My dream library</span>
            <h2 className="section-title">梦境收藏夹</h2>
          </div>
          <div className="profile-tabs">
            <button type="button" className={activeList === 'mine' ? 'profile-tab active' : 'profile-tab'} onClick={() => setActiveList('mine')}>我的梦境 <small>{mine.length}</small></button>
            <button type="button" className={activeList === 'liked' ? 'profile-tab active' : 'profile-tab'} onClick={() => setActiveList('liked')}>喜欢的梦 <small>{liked.length}</small></button>
          </div>
        </div>
        {visibleDreams.length === 0 ? (
          <div className="gate slim">
            <p>{activeList === 'mine' ? '还没有发布过梦境。' : '还没有喜欢过梦境。'}</p>
            <Link to={activeList === 'mine' ? '/compose' : '/'} className="btn primary">
              {activeList === 'mine' ? '去发布第一个' : '去梦圈逛逛'}
            </Link>
          </div>
        ) : (
          <div className="dream-grid">
            {visibleDreams.map((dream) => (
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
