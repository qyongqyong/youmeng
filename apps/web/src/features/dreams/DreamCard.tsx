import { useNavigate } from 'react-router-dom';
import type { Dream } from '@youmeng/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleLike } from './dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { formatCount, formatRelativeTime } from '../../lib/time';
import { displayTitle } from '../../lib/dream';
import { copyText, dreamShareUrl } from '../../lib/share';
import { assetUrl } from '../../lib/assetUrl';
import Icon from '../../components/Icon';

export default function DreamCard({ dream }: { dream: Dream }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const liked = useAppSelector((state) =>
    state.dreams.likedIds.includes(dream.id),
  );
  const asset = dream.assets[0];
  const generating = dream.status === 'generating';

  const open = () => {
    if (!generating) navigate(`/dream/${dream.id}`);
  };

  return (
    <article
      className={generating ? 'dream-card is-generating' : 'dream-card'}
      onClick={open}
    >
      <div className="thumb">
        {asset ? (
          <>
            <img
              src={assetUrl(asset.poster ?? asset.url)}
              alt={displayTitle(dream)}
              loading="lazy"
            />
            {asset.type === 'video' && (
              <span className="video-badge">
                <Icon name="play" size={11} /> {asset.duration ?? 0}s
              </span>
            )}
          </>
        ) : (
          <div className="thumb-generating">
            <span className="spinner" />
            正在生成梦境配图…
          </div>
        )}
        {dream.tags.length > 0 && (
          <div className="thumb-tags">
            {dream.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="dream-body">
        <h3 className="dream-title">{displayTitle(dream)}</h3>
        <p className="dream-excerpt">{dream.content}</p>

        <div className="dream-meta">
          <span className="author">
            <span className="avatar-xs">{dream.author.nickname.slice(-2)}</span>
            {dream.author.nickname}
          </span>
          <span className="time">{formatRelativeTime(dream.createdAt)}</span>
        </div>

        <div className="dream-actions">
          <button
            type="button"
            className={liked ? 'act liked' : 'act'}
            disabled={generating}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                dispatch(pushToast({ text: '登录后才能点赞', type: 'error' }));
                navigate('/login');
                return;
              }
              dispatch(toggleLike(dream.id));
            }}
          >
            <Icon name={liked ? 'heart-filled' : 'heart'} size={18} />
            {formatCount(dream.likeCount)}
          </button>

          <span className="act static">
            <Icon name="message" size={18} />
            {formatCount(dream.commentCount)}
          </span>

          <button
            type="button"
            className="act"
            title="分享"
            onClick={async (e) => {
              e.stopPropagation();
              const ok = await copyText(dreamShareUrl(dream.id));
              dispatch(
                pushToast({
                  text: ok ? '链接已复制' : '复制失败，请手动复制',
                  type: ok ? 'success' : 'error',
                }),
              );
            }}
          >
            <Icon name="share" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
