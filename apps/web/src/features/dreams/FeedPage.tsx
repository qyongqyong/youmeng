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
  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((d) => d.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  return (
    <div className="feed-page">
      <section className="hero">
        <div className="hero-eyebrow">
          <Icon name="sparkles" size={16} /> AI 梦境生成
        </div>
        <h1 className="hero-title">
          把梦境，变成<span className="grad-text">看得见的画面</span>
        </h1>
        <p className="hero-sub">
          用文字记录你的梦，AI 为你生成配图；较长的梦境，还可以生成短视频。
        </p>
        <div className="hero-cta">
          <Link to="/compose" className="btn primary">
            <Icon name="plus" size={16} /> 发布我的梦境
          </Link>
          <span className="hero-stat">
            {items.length} 个梦境 · {formatCount(totalLikes)} 次共鸣
          </span>
        </div>
      </section>

      <div className="feed-toolbar">
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
