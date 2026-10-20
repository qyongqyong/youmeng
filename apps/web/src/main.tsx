import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import './styles.css';

type Post = {
  id: string; title: string; content: string; author: string; avatar: string;
  mood: string; palette: string; likes: number; comments: number; createdAt: string; generated: boolean;
};

type PostsState = { items: Post[]; loading: boolean; error: string | null };
const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], loading: true, error: null } as PostsState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => { state.items = action.payload; state.loading = false; },
    addPost: (state, action: PayloadAction<Post>) => { state.items.unshift(action.payload); },
    incrementLike: (state, action: PayloadAction<{ id: string; likes: number }>) => {
      const item = state.items.find((post) => post.id === action.payload.id);
      if (item) item.likes = action.payload.likes;
    }
  }
});
const store = configureStore({ reducer: { posts: postsSlice.reducer } });
type RootState = ReturnType<typeof store.getState>;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!response.ok) throw new Error((await response.json()).message ?? '请求失败');
  return response.json();
};

function Visual({ palette }: { palette: string }) {
  return <div className={`visual visual-${palette}`}><span className="visual-orb" /><span className="visual-star">✦</span><span className="visual-caption">DREAM IN PROGRESS</span></div>;
}

function App() {
  const posts = (store.getState() as RootState).posts.items;
  const [items, setItems] = React.useState<Post[]>(posts);
  const [active, setActive] = React.useState('推荐');
  const [showComposer, setShowComposer] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', content: '', mood: '朦胧' });
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    api<{ posts: Post[] }>('/api/posts').then(({ posts }) => { store.dispatch(postsSlice.actions.setPosts(posts)); setItems(posts); }).catch(() => setNotice('API 暂不可用，当前显示演示内容'));
  }, []);

  const like = async (post: Post) => {
    try {
      const result = await api<{ likes: number }>(`/api/posts/${post.id}/like`, { method: 'POST' });
      store.dispatch(postsSlice.actions.incrementLike({ id: post.id, likes: result.likes }));
      setItems((current) => current.map((item) => item.id === post.id ? { ...item, likes: result.likes } : item));
    } catch { setNotice('点赞失败，请稍后再试'); }
  };

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await api<{ post: Post }>('/api/posts', { method: 'POST', body: JSON.stringify(form) });
      store.dispatch(postsSlice.actions.addPost(result.post)); setItems((current) => [result.post, ...current]);
      setForm({ title: '', content: '', mood: '朦胧' }); setShowComposer(false); setNotice('梦境已经进入梦圈');
    } catch (error) { setNotice(error instanceof Error ? error.message : '发布失败'); }
  };

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark">✦</div><div><strong>有梦</strong><span>把梦写下来</span></div></div><nav><button className="nav-active">梦圈</button><button>我的梦</button><button>灵感集</button></nav><div className="profile"><button className="icon-button">⌕</button><button className="avatar">我</button></div></header>
    <main>
      <section className="hero"><div><p className="eyebrow">DREAM CIRCLE · 01</p><h1>每一个梦，<em>都值得被看见。</em></h1><p className="hero-copy">写下昨夜的梦，让它长出画面。梦圈是有梦里的公开梦境社区。</p><button className="primary" onClick={() => setShowComposer(true)}>写下我的梦 <span>↗</span></button></div><div className="hero-art"><div className="moon" /><div className="mountain mountain-a" /><div className="mountain mountain-b" /><span className="hero-star star-a">✦</span><span className="hero-star star-b">✧</span><span className="hero-label">YOUR DREAM<br />IS A PLACE</span></div></section>
      <section className="section-head"><div><p className="eyebrow">THE DREAMS OF TODAY</p><h2>正在发生的梦</h2></div><div className="filters">{['推荐', '最新', '最受欢迎'].map((filter) => <button key={filter} className={active === filter ? 'filter-active' : ''} onClick={() => setActive(filter)}>{filter}</button>)}</div></section>
      {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
      <section className="feed">{items.map((post) => <article className="dream-card" key={post.id}><Visual palette={post.palette} /><div className="card-body"><div className="card-meta"><span className="author-avatar">{post.avatar}</span><span>{post.author}</span><span className="dot">·</span><span>{post.createdAt}</span><span className="mood">{post.mood}</span></div><h3>{post.title}</h3><p>{post.content}</p><div className="card-actions"><button onClick={() => like(post)}>♡ {post.likes}</button><button>◌ {post.comments}</button><button className="share">分享 ↗</button></div></div></article>)}</section>
      <section className="bottom-cta"><div><p className="eyebrow">TURN WORDS INTO WORLDS</p><h2>你的梦，下一帧是什么？</h2><p>输入一段梦境，先从一张图开始。</p></div><button className="primary" onClick={() => setShowComposer(true)}>开始创作 <span>↗</span></button></section>
    </main>
    <footer><span>© 2026 有梦</span><span>梦圈 · 公开梦境社区</span><span>内容由用户创作，AI 仅用于视觉表达</span></footer>
    {showComposer && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowComposer(false)}><form className="composer" onSubmit={publish}><div className="composer-top"><div><p className="eyebrow">NEW DREAM</p><h2>写下你的梦</h2></div><button type="button" className="close" onClick={() => setShowComposer(false)}>×</button></div><label>标题<input required maxLength={80} placeholder="给这个梦一个名字" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>梦境正文<textarea required minLength={8} maxLength={2000} placeholder="你看见了什么？听见了什么？" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label><label>梦的气质<select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}><option>朦胧</option><option>热烈</option><option>自由</option><option>宁静</option><option>奇幻</option></select></label><div className="composer-foot"><span>发布后默认公开在梦圈</span><button className="primary" type="submit">发布梦境 ↗</button></div></form></div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Provider store={store}><App /></Provider></React.StrictMode>);
