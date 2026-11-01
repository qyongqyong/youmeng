import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { assetUrl } from '../../lib/assetUrl';
import { displayTitle } from '../../lib/dream';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';

export default function InspirationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = useAppSelector((state) => state.inspirations.items.find((entry) => entry.id === id));

  if (!item) return <EmptyState icon="💡" title="灵感不存在" hint="它可能还在生成，或者链接已经失效。" action={<Link to="/inspirations" className="btn primary">回到灵感专栏</Link>} />;
  const asset = item.assets[0];

  return (
    <div className="detail-page inspiration-detail-page">
      <button type="button" className="back" onClick={() => navigate(-1)}><Icon name="arrow-left" size={18} /> 返回灵感专栏</button>
      <article className="detail">
        <div className="detail-visual">{asset ? <img src={assetUrl(asset.poster ?? asset.url)} alt={displayTitle(item)} /> : <div className="thumb-generating big"><span className="spinner" /> 正在生成…</div>}</div>
        <div className="detail-content">
          <div className="detail-tags">{item.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
          <span className="section-kicker">Idea note</span>
          <h1>{displayTitle(item)}</h1>
          <p className="detail-text">{item.content}</p>
          <div className="detail-meta"><span className="author"><span className="avatar-xs">{item.author.nickname.slice(-2)}</span>{item.author.nickname}</span><span className="time">灵感专栏</span></div>
          <Link to="/inspiration/compose" className="btn primary"><Icon name="sparkles" size={16} /> 也发布一个想法</Link>
        </div>
      </article>
    </div>
  );
}
