import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { displayTitle } from '../../lib/dream';
import { formatCount } from '../../lib/time';
import Icon from '../../components/Icon';

const moodPalette = ['#a78bfa', '#f0abfc', '#7dd3fc', '#f9a8d4', '#86efac'];

export default function InsightsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const items = useAppSelector((state) => state.dreams.items);
  const likedIds = useAppSelector((state) => state.dreams.likedIds);

  const mine = user ? items.filter((dream) => dream.userId === user.id) : [];
  const source = mine.length ? mine : items;
  const tagCounts = Array.from(
    source.reduce((counts, dream) => {
      dream.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
      return counts;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalWords = source.reduce((sum, dream) => sum + dream.wordCount, 0);
  const totalLikes = source.reduce((sum, dream) => sum + dream.likeCount, 0);
  const longDreams = source.filter((dream) => dream.wordCount >= 80).length;
  const latest = [...source].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);
  const maxTagCount = Math.max(tagCounts[0]?.[1] ?? 1, 1);

  return (
    <div className="insights-page">
      <section className="insights-hero">
        <div>
          <span className="section-kicker"><Icon name="sparkles" size={14} /> Dream intelligence</span>
          <h1>{user ? `${user.nickname} 的梦境报告` : '你的梦境报告'}</h1>
          <p>把零散的梦，整理成一张能看见自己的情绪地图。</p>
        </div>
        <div className="insights-orb"><span>✦</span><small>本周<br />已更新</small></div>
      </section>

      {!user && (
        <section className="report-login-card">
          <div className="insight-icon"><Icon name="user" size={19} /></div>
          <div><h3>登录后，报告会只分析你的梦</h3><p>现在看到的是梦圈公开数据，登录即可开启个人档案。</p></div>
          <Link to="/login?redirect=/insights" className="btn primary small">去登录</Link>
        </section>
      )}

      <section className="report-stats">
        <div><span className="report-stat-icon"><Icon name="moon" size={17} /></span><strong>{source.length}</strong><small>记录梦境</small><em>持续积累中</em></div>
        <div><span className="report-stat-icon pink"><Icon name="heart-filled" size={17} /></span><strong>{formatCount(totalLikes)}</strong><small>收到共鸣</small><em>来自梦圈的回应</em></div>
        <div><span className="report-stat-icon cyan"><Icon name="sparkles" size={17} /></span><strong>{formatCount(totalWords)}</strong><small>写下字数</small><em>{longDreams} 个长梦境</em></div>
      </section>

      <section className="report-grid">
        <div className="report-card atmosphere-card">
          <div className="report-card-head"><div><span className="section-kicker">Your atmosphere</span><h2>梦境主题</h2></div><span className="report-badge">TOP {tagCounts.length}</span></div>
          {tagCounts.length ? <div className="theme-bars">{tagCounts.map(([tag, count], index) => <div className="theme-row" key={tag}><span>#{tag}</span><div className="theme-track"><i style={{ width: `${(count / maxTagCount) * 100}%`, background: moodPalette[index % moodPalette.length] }} /></div><b>{count}</b></div>)}</div> : <p className="report-empty">发布几个梦境后，这里会生成你的主题画像。</p>}
          <p className="report-footnote">最近，你的梦里最常出现的是 <strong>{tagCounts[0]?.[0] ?? '未知星球'}</strong>。</p>
        </div>

        <div className="report-card rhythm-card">
          <div className="report-card-head"><div><span className="section-kicker">Dream rhythm</span><h2>记录节奏</h2></div><Icon name="clock" size={20} /></div>
          <div className="rhythm-visual">{[2, 4, 3, 6, 5, 7, 4].map((height, index) => <div className="rhythm-day" key={index}><i style={{ height: `${height * 9}px` }} /><span>{['一', '二', '三', '四', '五', '六', '日'][index]}</span></div>)}</div>
          <p className="report-footnote">周末的想象力最活跃，继续保持你的记录习惯。</p>
        </div>
      </section>

      <section className="report-card recent-report">
        <div className="report-card-head"><div><span className="section-kicker">Recent memories</span><h2>最近的梦</h2></div><Link to="/" className="text-link">去梦圈看看 <span>→</span></Link></div>
        {latest.length ? <div className="recent-dream-list">{latest.map((dream, index) => <Link to={`/dream/${dream.id}`} className="recent-dream" key={dream.id}><span className="recent-index">0{index + 1}</span><div><strong>{displayTitle(dream)}</strong><p>{dream.content.slice(0, 58)}{dream.content.length > 58 ? '…' : ''}</p></div><span className="recent-arrow">↗</span></Link>)}</div> : <p className="report-empty">还没有梦境记录，去写下第一场梦吧。</p>}
      </section>

      <section className="report-cta"><div><span className="section-kicker">Keep exploring</span><h2>下一场梦，会带你去哪里？</h2><p>记录得越多，梦境报告就越懂你。</p></div><Link to="/compose" className="btn primary"><Icon name="plus" size={16} /> 写下新梦境</Link></section>
      {user && <p className="report-personal-note">已为你汇总 {source.length} 条个人梦境 · {likedIds.length} 个收藏回响</p>}
    </div>
  );
}
