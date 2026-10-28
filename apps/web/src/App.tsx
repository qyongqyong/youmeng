import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import FeedPage from './features/dreams/FeedPage';
import DreamDetailPage from './features/dreams/DreamDetailPage';
import ComposePage from './features/dreams/ComposePage';
import ProfilePage from './features/profile/ProfilePage';
import LoginPage from './features/auth/LoginPage';
import InsightsPage from './features/insights/InsightsPage';

function NotFound() {
  return (
    <div className="gate">
      <div className="gate-icon">🌙</div>
      <h2>页面不存在</h2>
      <p>你要找的梦境可能已经飘走了。</p>
      <Link to="/" className="btn primary">
        回到梦圈
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<FeedPage />} />
          <Route path="dream/:id" element={<DreamDetailPage />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="me" element={<ProfilePage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
