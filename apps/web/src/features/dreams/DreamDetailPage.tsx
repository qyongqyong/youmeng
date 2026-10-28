import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Dream } from '@youmeng/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleLike } from './dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { formatCount, formatRelativeTime } from '../../lib/time';
import { displayTitle } from '../../lib/dream';
import { copyText, dreamShareUrl } from '../../lib/share';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';
import CommentSection from './CommentSection';
import DreamCard from './DreamCard';

function readingFor(dream: Dream) {
  const tags = dream.tags.join('、');
  if (dream.tags.some((tag) => ['运动', '偶像'].includes(tag))) {
    return `这场梦充满了行动力和期待感。${tags} 代表你正在靠近一个想实现的目标，也许是想赢下一场比赛，也许是想在某个重要时刻证明自己。`;
  }
  if (dream.tags.some((tag) => ['深海', '星空', '极地'].includes(tag))) {
    return `你似乎在梦里寻找更大的世界。${tags} 带着探索和自由的意味，安静下来时，你的想象力会带你去很远的地方。`;
  }
  if (dream.tags.some((tag) => ['童年', '治愈', '花海'].includes(tag))) {
    return `这是一场温柔的梦。${tags} 像是一封写给自己的信，提醒你保留柔软，也给忙碌的生活留一点可以呼吸的空间。`;
  }
  return `这场梦像一段还没有结束的故事。${tags || '独特的想象'} 让它拥有自己的颜色，也许你正在期待一个新的开始。`;
}

export default function DreamDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dream = useAppSelector((state) =>
    state.dreams.items.find((d) => d.id === id),
  );
  const user = useAppSelector((state) => state.auth.user);
  const liked = useAppSelector((state) =>
    id ? state.dreams.likedIds.includes(id) : false,
  );

  if (!dream) {
    return (
      <EmptyState
        icon="🌙"
        title="梦境不存在"
        hint="它可能已经被删除，或者链接有误。"
        action={
          <Link to="/" className="btn primary">
            回到梦圈
          </Link>
        }
      />
    );
  }

  const asset = dream.assets[0];
  const related = useAppSelector((state) =>
    state.dreams.items
      .filter(
        (item) =>
          item.id !== dream.id &&
          item.status === 'published' &&
          item.tags.some((tag) => dream.tags.includes(tag)),
      )
      .slice(0, 3),
  );

  return (
    <div className="detail-page">
      <button type="button" className="back" onClick={() => navigate(-1)}>
        <Icon name="arrow-left" size={18} /> 返回
      </button>

      <article className="detail">
        <div className="detail-visual">
          {asset ? (
            <img
              src={asset.poster ?? asset.url}
              alt={displayTitle(dream)}
              className={asset.type === 'video' ? 'clickable' : ''}
              onClick={() => {
                if (asset.type === 'video') {
                  dispatch(pushToast({ text: '视频播放（演示）', type: 'info' }));
                }
              }}
            />
          ) : (
            <div className="thumb-generating big">
              <span className="spinner" /> 正在生成…
            </div>
          )}
          {asset?.type === 'video' && (
            <span className="video-badge big">
              <Icon name="play" size={14} /> 视频 · {asset.duration ?? 0}s
            </span>
          )}
        </div>

        <div className="detail-content">
          <div className="detail-tags">
            {dream.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <h1>{displayTitle(dream)}</h1>
          <p className="detail-text">{dream.content}</p>

          <div className="detail-meta">
            <span className="author">
              <span className="avatar-xs">
                {dream.author.nickname.slice(-2)}
              </span>
              {dream.author.nickname}
            </span>
            <span className="time">{formatRelativeTime(dream.createdAt)}</span>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className={liked ? 'btn like-btn liked' : 'btn like-btn'}
              onClick={() => {
                if (!user) {
                  dispatch(
                    pushToast({ text: '登录后才能点赞', type: 'error' }),
                  );
                  navigate(
                    `/login?redirect=${encodeURIComponent(`/dream/${dream.id}`)}`,
                  );
                  return;
                }
                dispatch(toggleLike(dream.id));
              }}
            >
              <Icon name={liked ? 'heart-filled' : 'heart'} size={18} />
              {formatCount(dream.likeCount)} 喜欢
            </button>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                const ok = await copyText(dreamShareUrl(dream.id));
                dispatch(
                  pushToast({
                    text: ok ? '链接已复制' : '复制失败，请手动复制',
                    type: ok ? 'success' : 'error',
                  }),
                );
              }}
            >
              <Icon name="share" size={17} /> 分享
            </button>
          </div>

          <section className="reading-card">
            <div className="reading-head">
              <div>
                <span className="section-kicker">Dream reading</span>
                <h2>梦境解读</h2>
              </div>
              <span className="reading-badge"><Icon name="sparkles" size={13} /> AI 灵感</span>
            </div>
            <div className="emotion-row">
              <span className="emotion-label">梦境能量</span>
              <span className="energy-track"><i /></span>
              <span className="energy-value">温柔探索</span>
            </div>
            <p>{readingFor(dream)}</p>
            <small>仅供娱乐与自我记录，不构成心理或医疗建议。</small>
          </section>

          <CommentSection dreamId={dream.id} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <div><span className="section-kicker">More dreams</span><h2>相似的梦</h2></div>
            <span className="section-note">也许你会喜欢这些故事</span>
          </div>
          <div className="dream-grid related-grid">
            {related.map((item) => <DreamCard key={item.id} dream={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
