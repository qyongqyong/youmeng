import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleLike } from './dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { formatCount, formatRelativeTime } from '../../lib/time';
import { displayTitle } from '../../lib/dream';
import { copyText, dreamShareUrl } from '../../lib/share';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';
import CommentSection from './CommentSection';

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

          <CommentSection dreamId={dream.id} />
        </div>
      </article>
    </div>
  );
}
