import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Comment } from '@youmeng/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addComment } from './dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { formatRelativeTime } from '../../lib/time';
import Icon from '../../components/Icon';

const EMPTY_COMMENTS: Comment[] = [];

export default function CommentSection({ dreamId }: { dreamId: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const comments = useAppSelector(
    (state) => state.dreams.comments[dreamId] ?? EMPTY_COMMENTS,
  );
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    if (!user) {
      dispatch(pushToast({ text: '登录后才能评论', type: 'error' }));
      navigate(`/login?redirect=${encodeURIComponent(`/dream/${dreamId}`)}`);
      return;
    }
    dispatch(
      addComment({
        dreamId,
        content: text.trim(),
        author: { id: user.id, nickname: user.nickname },
      }),
    );
    setText('');
    dispatch(pushToast({ text: '评论已发布', type: 'success' }));
  };

  return (
    <section className="comments">
      <h3 className="comments-title">
        评论 <span>{comments.length}</span>
      </h3>

      <div className="comment-list">
        {comments.length === 0 && (
          <p className="comment-empty">还没有评论，来说点什么吧。</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <span className="avatar-xs">{comment.nickname.slice(-2)}</span>
            <div className="comment-body">
              <div className="comment-head">
                <span className="comment-author">{comment.nickname}</span>
                <span className="comment-time">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="comment-text">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={user ? '说点什么…' : '登录后参与评论'}
        />
        <button type="button" className="btn primary" onClick={submit}>
          <Icon name="send" size={16} />
        </button>
      </div>
    </section>
  );
}
