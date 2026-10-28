import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LONG_DREAM_THRESHOLD } from '@youmeng/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createDream } from './dreamsSlice';
import { pushToast } from '../ui/uiSlice';
import { spendCredit } from '../auth/authSlice';
import Icon from '../../components/Icon';

const inspirationPrompts = [
  '我梦见自己去了一个从未去过的地方',
  '我梦见和喜欢的人在海边散步',
  '我梦见参加了一场奇妙的演唱会',
  '我梦见回到了小时候的家',
];

export default function ComposePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const credits = useAppSelector((state) => state.auth.credits);
  const [content, setContent] = useState('');

  if (!user) {
    return (
      <div className="gate">
        <div className="gate-icon">
          <Icon name="sparkles" size={28} />
        </div>
        <h2>登录后发布梦境</h2>
        <p>登录即可获得 5 次免费生成额度，分享你的梦境。</p>
        <Link to="/login?redirect=/compose" className="btn primary">
          去登录
        </Link>
      </div>
    );
  }

  const isLong = content.length > LONG_DREAM_THRESHOLD;

  const submit = async () => {
    if (!content.trim()) {
      dispatch(pushToast({ text: '请描述你的梦境', type: 'error' }));
      return;
    }
    if (credits <= 0) {
      dispatch(
        pushToast({
          text: '生成额度不足（演示：重新登录可重置）',
          type: 'error',
        }),
      );
      return;
    }

    dispatch(spendCredit());
    dispatch(pushToast({ text: '已提交，正在生成梦境配图…', type: 'success' }));
    try {
      await dispatch(
        createDream({
          content: content.trim(),
          author: { id: user.id, nickname: user.nickname },
        }),
      ).unwrap();
      navigate('/');
    } catch (error) {
      dispatch(pushToast({ text: error instanceof Error ? error.message : '生成失败，请稍后重试', type: 'error' }));
    }
  };

  return (
    <div className="compose-page">
      <div className="compose-head">
        <h1>发布梦境</h1>
        <p>不用起标题，直接描述你梦见了什么，AI 会为它生成画面。</p>
      </div>

      <div className="compose-card">
        <div className="inspiration-block">
          <div className="inspiration-head">
            <span><Icon name="sparkles" size={15} /> 没有灵感？从一句话开始</span>
            <small>点击填入</small>
          </div>
          <div className="inspiration-list">
            {inspirationPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => setContent(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>梦境描述</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="把你梦见的画面写下来，越具体，生成的画面越贴近……"
          />
        </label>

        <div className="compose-hint">
          <span>{content.length} 字</span>
          <span className={isLong ? 'long-hint active' : 'long-hint'}>
            {isLong
              ? '这篇会被额外生成短视频'
              : `超过 ${LONG_DREAM_THRESHOLD} 字可生成短视频`}
          </span>
        </div>

        <div className="public-note">
          <Icon name="moon" size={15} /> 发布后将公开展示在梦圈，和大家分享你的故事。
        </div>

        <div className="compose-foot">
          <span className="credits">
            <Icon name="sparkles" size={15} /> 剩余额度 {credits} 次
          </span>
          <button type="button" className="btn primary" onClick={submit}>
            <Icon name="sparkles" size={16} /> 生成并发布
          </button>
        </div>
      </div>
    </div>
  );
}
