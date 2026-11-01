import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LONG_DREAM_THRESHOLD } from '@youmeng/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createInspiration } from './inspirationsSlice';
import { pushToast } from '../ui/uiSlice';
import { spendCredit } from '../auth/authSlice';
import Icon from '../../components/Icon';

const prompts = [
  '如果城市的影子会在夜里偷偷换班……',
  '发明一种只给勇气充电的自动售货机……',
  '一座漂浮在海上的学校，第一堂课是……',
  '如果每个人都能把一个小愿望做成一张票……',
];

interface InspirationComposePageProps {
  embedded?: boolean;
}

export default function InspirationComposePage({ embedded = false }: InspirationComposePageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const credits = useAppSelector((state) => state.auth.credits);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'image' | 'video'>('image');

  if (!user) {
    return <div className="gate"><div className="gate-icon"><Icon name="sparkles" size={28} /></div><h2>登录后发布灵感</h2><p>登录后可以把脑海里的奇思妙想生成视觉故事。</p><Link to="/login?redirect=/inspiration/compose" className="btn primary">去登录</Link></div>;
  }

  const submit = async () => {
    if (!content.trim()) {
      dispatch(pushToast({ text: '先写下你的奇思妙想', type: 'error' }));
      return;
    }
    if (credits <= 0) {
      dispatch(pushToast({ text: '生成额度不足（演示：重新登录可重置）', type: 'error' }));
      return;
    }
    dispatch(spendCredit());
    dispatch(pushToast({ text: mode === 'video' ? '已提交，正在生成灵感视觉…' : '已提交，正在生成灵感漫图…', type: 'success' }));
    try {
      await dispatch(createInspiration({ content: content.trim(), author: { id: user.id, nickname: user.nickname } })).unwrap();
      navigate('/inspirations');
    } catch (error) {
      dispatch(pushToast({ text: error instanceof Error ? error.message : '生成失败，请稍后重试', type: 'error' }));
    }
  };

  return (
    <div className={embedded ? 'inspiration-compose-page embedded-compose' : 'compose-page inspiration-compose-page'}>
      <div className="compose-head"><span className="section-kicker">Idea lab</span><h1>发布一个奇思妙想</h1><p>不用解释它是否合理，先把念头写下来。AI 会把它变成一张漫图，也为短视频创作保留空间。</p></div>
      <div className="compose-card">
        <div className="inspiration-block"><div className="inspiration-head"><span><Icon name="sparkles" size={15} /> 从一个设定开始</span><small>点击填入</small></div><div className="inspiration-list">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setContent(prompt)}>{prompt}</button>)}</div></div>
        <label className="field"><span>你的想法</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} placeholder="比如：如果月亮有一间便利店，凌晨三点会卖什么？" /></label>
        <div className="visual-mode"><span>生成形式</span><div className="visual-mode-options"><button type="button" className={mode === 'image' ? 'visual-mode-card active' : 'visual-mode-card'} onClick={() => setMode('image')}><Icon name="sparkles" size={18} /><span>灵感漫图</span><small>一张画面，定格脑洞</small></button><button type="button" className={mode === 'video' ? 'visual-mode-card active' : 'visual-mode-card'} onClick={() => setMode('video')}><Icon name="play" size={18} /><span>短视频构想</span><small>适合较长设定，先生成视觉封面</small></button></div></div>
        <div className="compose-hint"><span>{content.length} 字</span><span className="long-hint active">{content.length > LONG_DREAM_THRESHOLD ? '长设定会保留更多镜头线索' : `超过 ${LONG_DREAM_THRESHOLD} 字更适合视频构想`}</span></div>
        <div className="public-note"><Icon name="sparkles" size={15} /> 发布后会出现在灵感专栏，和大家交换脑洞。</div>
        <div className="compose-foot"><span className="credits"><Icon name="sparkles" size={15} /> 剩余额度 {credits} 次</span><button type="button" className="btn primary" onClick={submit}><Icon name="sparkles" size={16} /> 生成并发布</button></div>
      </div>
    </div>
  );
}
