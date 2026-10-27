import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { formatCount } from '../../lib/time';
import { displayTitle } from '../../lib/dream';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';
import DreamCard from './DreamCard';
import SkeletonCard from './SkeletonCard';
import { setSearch, setTab, type FeedTab } from './dreamsSlice';

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { items, search, tab } = useAppSelector((state) => state.dreams);
  const [booting, setBooting] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setVisibleCount(6);
  }, [search, tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (q) {
      list = list.filter(
        (d) =>
          displayTitle(d).toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) =>
      tab === 'hot'
        ? b.likeCount - a.likeCount
        : +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [items, search, tab]);

  const visible = filtered.slice(0, visibleCount);
  const totalLikes = items.reduce((sum, d) => sum + d.likeCount, 0);
  const featured = useMemo(
    () =>
      [...items]
        .filter((dream) => dream.status === 'published')
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 3),
    [items],
  );
  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((d) => d.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  return (
    <div className="feed-page">
      <section className="hero hero-expanded">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <Icon name="sparkles" size={16} /> AI 梦境生成 · 梦圈公开分享
          </div>
          <h1 className="hero-title">
            有梦，有故事。<span className="grad-text">把梦境照进现实</span>
          </h1>
          <p className="hero-sub">
            用文字记录你的梦，AI 为你生成配图；较长的梦境，还可以生成短视频。
            在这里，每个奇妙的梦都值得被看见。
          </p>
          <div className="hero-cta">
            <Link to="/compose" className="btn primary">
              <Icon name="plus" size={16} /> 发布我的梦境
            </Link>
            <span className="hero-stat">
              {items.length} 个梦境 · {formatCount(totalLikes)} 次共鸣
            </span>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit-glow" />
          <span className="orbit-ring ring-one" />
          <span className="orbit-ring ring-two" />
          <span className="orbit-star star-one">✦</span>
          <span className="orbit-star star-two">✧</span>
          <div className="orbit-moon"><Icon name="moon" size={38} /></div>
          <span className="orbit-caption">今晚，梦见什么？</span>
        </div>
      </section>

      <section className="pulse-grid" aria-label="梦圈概览">
        <div className="pulse-card pulse-main">
          <span className="pulse-icon"><Icon name="moon" size={18} /></span>
          <div><strong>{items.length}</strong><span>公开梦境</span></div>
          <small>每一个故事都在发光</small>
        </div>
        <div className="pulse-card">
          <span className="pulse-icon pink"><Icon name="heart-filled" size={18} /></span>
          <div><strong>{formatCount(totalLikes)}</strong><span>今日共鸣</span></div>
          <small>来自梦圈的喜欢</small>
        </div>
        <div className="pulse-card">
          <span className="pulse-icon cyan"><Icon name="sparkles" size={18} /></span>
          <div><strong>AI</strong><span>灵感引擎</span></div>
          <small>文字生成视觉故事</small>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-kicker">有梦的三步</div>
        <div className="steps">
          <div className="step"><span>01</span><div><strong>写下梦</strong><p>不必斟酌，记下脑海里的第一幕。</p></div></div>
          <div className="step"><span>02</span><div><strong>生成画面</strong><p>AI 将文字变成配图或短视频。</p></div></div>
          <div className="step"><span>03</span><div><strong>分享共鸣</strong><p>发布到梦圈，遇见做过相同梦的人。</p></div></div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-heading">
            <div><span className="section-kicker">Dream picks</span><h2>今日精选</h2></div>
            <span className="section-note">正在被最多人记住的梦</span>
          </div>
          <div className="featured-row">
            {featured.map((dream, index) => (
              <Link key={dream.id} to={`/dream/${dream.id}`} className="featured-item">
                <span className="featured-index">0{index + 1}</span>
                <span className="featured-title">{displayTitle(dream)}</span>
                <span className="featured-likes"><Icon name="heart-filled" size={13} /> {formatCount(dream.likeCount)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="feed-toolbar">
        <div className="feed-heading">
          <span className="section-kicker">梦圈动态</span>
          <h2>探索大家的梦</h2>
        </div>
        <div className="feed-controls">
          <div className="tabs">
          {(['latest', 'hot'] as FeedTab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? 'tab-btn active' : 'tab-btn'}
              onClick={() => dispatch(setTab(t))}
            >
              {t === 'latest' ? '最新' : '热门'}
            </button>
          ))}
          </div>
          <label className="search">
            <Icon name="search" size={17} />
            <input
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="搜索梦境、标签…"
            />
          </label>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-row">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={search === tag ? 'chip-btn active' : 'chip-btn'}
              onClick={() => dispatch(setSearch(search === tag ? '' : tag))}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {booting ? (
        <div className="dream-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="没有找到相关梦境"
          hint="换个关键词试试，或者去发布你的第一个梦境。"
          action={
            <Link to="/compose" className="btn primary">
              发布梦境
            </Link>
          }
        />
      ) : (
        <>
          <div className="dream-grid">
            {visible.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="load-more">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setVisibleCount((n) => n + 6)}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
