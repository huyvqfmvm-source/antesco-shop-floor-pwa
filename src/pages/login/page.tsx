import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

export default function LoginPage() {
  const { state, login, addToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('antesco_remembered_user');
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === '1') {
      addToast('success', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
    }
  }, [searchParams, addToast]);

  if (state.isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = login(username.trim(), password);

    if (!result.success) {
      setError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('antesco_remembered_user', username.trim());
    } else {
      localStorage.removeItem('antesco_remembered_user');
    }

    setIsLoading(false);
    addToast('success', 'Đăng nhập thành công!');
    navigate('/home', { replace: true });
  };

  return (
    <div className="flex justify-center min-h-screen bg-ant-bg">
      <div className="w-full max-w-mobile flex flex-col min-h-screen">
        <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-ant-sx/5 via-ant-sx/[0.02] to-transparent pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
          {/* Logo & Brand */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto bg-ant-sx rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-ant-sx/20">
              <i className="ri-building-2-line text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-ant-text tracking-tight">ANTESCO</h1>
            <p className="text-sm text-ant-text-secondary mt-1 font-medium">Shop Floor &amp; Warehouse</p>
            <p className="text-xs text-ant-text-secondary/70 mt-0.5">Hệ thống vận hành sản xuất &amp; kho</p>
          </div>

          {/* Login Card */}
          <div className="bg-ant-card rounded-2xl p-6 shadow-sm border border-gray-100">
            <form onSubmit={handleLogin}>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ant-text mb-1.5">
                  Tài khoản
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="ri-user-line text-ant-text-secondary text-lg" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-ant-bg text-ant-text text-sm placeholder:text-ant-text-secondary focus:outline-none focus:border-ant-sx focus:ring-2 focus:ring-ant-sx/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block text-sm font-semibold text-ant-text mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-ant-text-secondary text-lg" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="w-full h-12 pl-10 pr-12 rounded-xl border border-gray-200 bg-ant-bg text-ant-text text-sm placeholder:text-ant-text-secondary focus:outline-none focus:border-ant-sx focus:ring-2 focus:ring-ant-sx/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  >
                    <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-ant-text-secondary text-lg hover:text-ant-text transition-colors`} />
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-gray-300 text-ant-sx focus:ring-ant-sx cursor-pointer"
                  />
                  <span className="text-xs text-ant-text-secondary">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => addToast('info', 'Tính năng quên mật khẩu sẽ có trong bản sau. Vui lòng dùng tài khoản mẫu.')}
                  className="text-xs text-ant-sx font-medium hover:text-ant-sx-dark transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                  <i className="ri-error-warning-line text-ant-error text-base mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-ant-text-secondary font-medium">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Alternative login options */}
            <div className="space-y-2.5">
              <Link
                to="/login/sample-accounts"
                className="w-full h-11 rounded-xl border border-gray-200 bg-ant-bg text-ant-text-secondary text-sm font-medium hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-user-star-line text-base" />
                Dùng tài khoản mẫu
              </Link>
              <Link
                to="/register"
                className="w-full h-11 rounded-xl border border-ant-sx/30 bg-ant-sx-light text-ant-sx-dark text-sm font-semibold hover:bg-ant-sx-light/70 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-user-add-line text-base" />
                Đăng ký tài khoản mới
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xxs text-ant-text-secondary/50 mt-6">
            ANTESCO Shop Floor &amp; Warehouse v1.0 · Mô phỏng
          </p>
        </div>
      </div>
    </div>
  );
}