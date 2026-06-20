import { useState, useMemo } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useApp, MOCK_EXTENDED_USERS, MOCK_ROLES, MOCK_PLANTS } from '@/store/AppContext';

export default function SampleAccountsPage() {
  const { state, login, addToast } = useApp();
  const navigate = useNavigate();
  const [loggingInUser, setLoggingInUser] = useState<string | null>(null);

  const visibleUsers = useMemo(() => {
    const seen = new Set<string>();
    return MOCK_EXTENDED_USERS.filter((user) => {
      if (seen.has(user.role)) return false;
      seen.add(user.role);
      return true;
    });
  }, []);

  if (state.isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  const handleLoginWithSample = async (sampleUser: typeof MOCK_EXTENDED_USERS[0]) => {
    setLoggingInUser(sampleUser.username);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(sampleUser.username, sampleUser.password);
    if (result.success) {
      addToast('success', `Đăng nhập thành công — ${sampleUser.name}`);
      navigate('/home', { replace: true });
    } else {
      addToast('error', result.error || 'Đăng nhập thất bại');
    }
    setLoggingInUser(null);
  };

  const getRoleName = (roleId: string) => MOCK_ROLES.find((r) => r.id === roleId)?.name || roleId;
  const getPlantName = (plantId: string) => MOCK_PLANTS.find((p) => p.id === plantId)?.name || plantId;

  const roleColors: Record<string, string> = {
    'cong-nhan-san-xuat': 'bg-amber-100 text-amber-700 border-amber-200',
    'thu-kho': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'kcs-qm': 'bg-rose-100 text-rose-700 border-rose-200',
    'ky-thuat': 'bg-slate-100 text-slate-700 border-slate-200',
    'quan-doc': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'ke-toan-kho': 'bg-teal-100 text-teal-700 border-teal-200',
    'admin': 'bg-violet-100 text-violet-700 border-violet-200',
  };

  return (
    <div className="flex justify-center min-h-screen bg-ant-bg">
      <div className="w-full max-w-mobile flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-ant-card border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-arrow-left-line text-lg text-ant-text" />
          </Link>
          <div>
            <p className="text-sm font-bold text-ant-text">Tài khoản mẫu</p>
            <p className="text-xxs text-ant-text-secondary">Chọn tài khoản để đăng nhập</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-ant-text-secondary mb-4 leading-relaxed">
            Các tài khoản mẫu với vai trò và nhà máy khác nhau dùng để kiểm thử các phân hệ. Mỗi tài khoản có vai trò và nhà máy được gán sẵn. Mật khẩu mặc định:{' '}
            <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-ant-text text-xs font-mono">123456</code>
            {' '}(admin: <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-ant-text text-xs font-mono">admin123</code>)
          </p>

          <div className="space-y-2.5">
            {visibleUsers.map((user) => {
              const isLoggingIn = loggingInUser === user.username;
              const roleColor = roleColors[user.role] || 'bg-gray-100 text-gray-700 border-gray-200';

              return (
                <button
                  key={user.username}
                  onClick={() => handleLoginWithSample(user)}
                  disabled={isLoggingIn}
                  className="w-full bg-ant-card rounded-xl border border-gray-100 p-4 flex items-center gap-3.5 hover:border-ant-sx/30 hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-ant-sx flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">
                      {user.name.split(' ').pop()?.charAt(0) || '?'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-ant-text">{user.name}</p>
                      <span className={`text-xxs px-1.5 py-0.5 rounded-full border font-medium whitespace-nowrap ${roleColor}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                    <p className="text-xxs text-ant-text-secondary">
                      {getPlantName(user.plant)} · {user.department} · {user.employeeCode}
                    </p>
                    <p className="text-xxs text-ant-text-secondary/70 mt-0.5 font-mono">
                      {user.username}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isLoggingIn ? (
                      <div className="w-5 h-5 border-2 border-ant-sx/30 border-t-ant-sx rounded-full animate-spin" />
                    ) : (
                      <i className="ri-arrow-right-s-line text-ant-text-secondary text-lg" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-ant-text-secondary hover:text-ant-text transition-colors"
            >
              <i className="ri-arrow-left-line" />
              Quay lại đăng nhập
            </Link>
          </div>
        </main>

        <p className="text-center text-xxs text-ant-text-secondary/50 pb-4">
          ANTESCO Shop Floor &amp; Warehouse v1.0
        </p>
      </div>
    </div>
  );
}