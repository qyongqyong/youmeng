import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { formatCount } from '../../lib/time';
import { displayTitle } from '../../lib/dream';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';
import DreamCard from '../dreams/DreamCard';
import SkeletonCard from '../dreams/SkeletonCard';
import {
  hydrateInspirations,
  setInspirationSearch,
  setInspirationTab,
  type InspirationFeedTab,
} from './inspirationsSlice';

export default function InspirationPage() {
  const dispatch = useAppDispatch();
  const { items, search, tab } = useAppSelector((state) => state.inspirations);
  const [booting, setBooting] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 500);
    dispatch(hydrateInspirations());
    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => setVisibleCount(6), [search, tab]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = query
      ? items.filter((item) =>
          displayTitle(item).toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
      : items;
    return [...matched].sort((a, b) =>
      tab === 'hot'
        ? b.likeCount - a.likeCount
        : +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [items, search, tab]);

  const tags = Array.from(new Set(items.flatMap((item) => item.tags)));
  const totalLikes = items.reduce((sum, item) => sum + item.likeCount, 0);

  return (
    <div className="inspiration-page">
      <section className="inspiration-hero">
        <div>
          <div className="hero-eyebrow"><Icon name="sparkles" size={16} /> AI 奇思妙想 · 灵感专栏</div>
          <h1>把脑海里的<br /><span className="grad-text">奇思妙想画出来</span></h1>
          <p>一句话，一个设定，或者一个不合常理的问题。AI 会把它变成漫图，也可以继续生成一段短视频。</p>
          <Link to="/inspiration/compose" className="btn primary"><Icon name="plus" size={16} /> 发布一个想法</Link>
        </div>
        <div className="inspiration-orbit" aria-hidden="true">
          <span>✦</span><strong>IDEA</strong><small>从一个念头开始</small>
        </div>
      </section>

      <section className="pulse-grid" aria-label="灵感专栏概览">
        <div className="pulse-card pulse-main"><span className="pulse-icon"><Icon name="sparkles" size={18} /></span><div><strong>{items.length}</strong><span>个灵感</span></div><small>每个念头都值得展开</small></div>
        <div className="pulse-card"><span className="pulse-icon pink"><Icon name="heart-filled" size={18} /></span><div><strong>{formatCount(totalLikes)}</strong><span>次共鸣</span></div><small>来自灵感的回应</small></div>
        <div className="pulse-card"><span className="pulse-icon cyan"><Icon name="play" size={18} /></span><div><strong>漫图+</strong><span>短视频</span></div><small>文字生成视觉故事</small></div>
      </section>

      <div className="feed-toolbar">
        <div className="feed-heading"><span className="section-kicker">Idea stream</span><h2>探索大家的脑洞</h2></div>
        <div className="feed-controls">
          <div className="tabs">
            {(['latest', 'hot'] as InspirationFeedTab[]).map((value) => (
              <button key={value} type="button" className={tab === value ? 'tab-btn active' : 'tab-btn'} onClick={() => dispatch(setInspirationTab(value))}>{value === 'latest' ? '最新' : '热门'}</button>
            ))}
          </div>
          <label className="search"><Icon name="search" size={17} /><input value={search} onChange={(event) => dispatch(setInspirationSearch(event.target.value))} placeholder="搜索想法、标签…" /></label>
        </div>
      </div>

      {tags.length > 0 && <div className="tag-row">{tags.map((tag) => <button key={tag} type="button" className={search === tag ? 'chip-btn active' : 'chip-btn'} onClick={() => dispatch(setInspirationSearch(search === tag ? '' : tag))}>#{tag}</button>)}</div>}

      {booting ? <div className="dream-grid">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div> : filtered.length === 0 ? <EmptyState icon="💡" title="还没有找到这个想法" hint="换个关键词，或者发布一个全新的脑洞。" action={<Link to="/inspiration/compose" className="btn primary">发布想法</Link>} /> : <><div className="dream-grid">{filtered.slice(0, visibleCount).map((item) => <DreamCard key={item.id} dream={item} collection="inspirations" />)}</div>{visibleCount < filtered.length && <div className="load-more"><button type="button" className="btn ghost" onClick={() => setVisibleCount((count) => count + 6)}>加载更多</button></div>}</>}
    </div>
  );
}
