import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from './authSlice';
import { pushToast } from '../ui/uiSlice';
import Icon from '../../components/Icon';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  if (user) {
    return <Navigate to={redirect} replace />;
  }

  const validPhone = /^1\d{10}$/.test(phone);

  const sendCode = () => {
    if (!validPhone) {
      dispatch(pushToast({ text: '请输入正确的 11 位手机号', type: 'error' }));
      return;
    }
    setSent(true);
    dispatch(
      pushToast({ text: '验证码已发送（演示：任意 4-6 位）', type: 'success' }),
    );
  };

  const submit = () => {
    if (!validPhone) {
      dispatch(pushToast({ text: '请输入正确的手机号', type: 'error' }));
      return;
    }
    if (code.trim().length < 4) {
      dispatch(
        pushToast({ text: '请输入验证码（演示：任意 4-6 位）', type: 'error' }),
      );
      return;
    }
    dispatch(login({ phone }));
    dispatch(pushToast({ text: '登录成功，欢迎来到有梦', type: 'success' }));
    navigate(redirect);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Icon name="moon" size={26} />
          <span>有梦</span>
        </div>
        <h1>登录有梦</h1>
        <p className="login-sub">
          仅支持手机号验证码登录（演示模式，验证码不真实发送）
        </p>

        <label className="field">
          <span>手机号</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入 11 位手机号"
            maxLength={11}
          />
        </label>

        <label className="field">
          <span>验证码</span>
          <div className="code-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="验证码"
              maxLength={6}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={sendCode}
              disabled={sent}
            >
              {sent ? '已发送' : '获取验证码'}
            </button>
          </div>
        </label>

        <button type="button" className="btn primary block" onClick={submit}>
          登录
        </button>

        <p className="login-foot">
          登录即表示同意《用户协议》与《隐私政策》（演示）
        </p>

        <Link to="/" className="login-back">
          <Icon name="arrow-left" size={15} /> 先随便逛逛
        </Link>
      </div>
    </div>
  );
}
