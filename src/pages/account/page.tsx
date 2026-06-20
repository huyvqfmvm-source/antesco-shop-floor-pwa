import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useApp, MOCK_ROLES, MOCK_PLANTS } from '@/store/AppContext';

export default function AccountPage() {
  const { state, dispatch, changePassword, addToast, logout } = useApp();
  const navigate = useNavigate();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!state.isLoggedIn || !state.currentUserData) {
    return <Navigate to="/login" replace />;
  }

  const user = state.currentUserData;
  const roleName = MOCK_ROLES.find((r) => r.id === user.role)?.name || user.role;
  const plantName = MOCK_PLANTS.find((p) => p.id === user.plant)?.name || user.plant;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.pop()?.charAt(0)?.toUpperCase() || '?';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPwd) { setPwdError('Vui lòng nhập mật khẩu cũ.'); return; }
    if (!newPwd) { setPwdError('Vui lòng nhập mật khẩu mới.'); return; }
    if (newPwd.length < 4) { setPwdError('Mật khẩu mới phải có ít nhất 4 ký tự.'); return; }
    if (newPwd !== confirmNewPwd) { setPwdError('Mật khẩu mới nhập lại không khớp.'); return; }

    const result = changePassword(user.username, oldPwd, newPwd);

    if (!result.success) {
      setPwdError(result.error || 'Đổi mật khẩu thất bại.');
      return;
    }

    setPwdSuccess('Đổi mật khẩu thành công!');
    setOldPwd('');
    setNewPwd('');
    setConfirmNewPwd('');
    setShowChangePwd(false);
    addToast('success', 'Đổi mật khẩu thành công!');
  };

  const handleLogout = () => {
    const pendingQueueCount = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length;
    if (pendingQueueCount > 0) {
      dispatch({ type: 'SET_SHOW_LOGOUT_CONFIRM', payload: true });
    } else {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const getPermissionSummary = (roleId: string): string[] => {
    const summaries: Record<string, string[]> = {
      'cong-nhan-san-xuat': ['Sản xuất: WIP, tạo pallet BTP, ký bàn giao sản xuất'],
      'thu-kho': ['Kho: Nhập kho, Putaway, Picking, Xuất BTP, Đóng container, Điều chuyển'],
      'kcs-qm': ['QM: QM Hold, kiểm kê, kiểm tra chất lượng, xem defect catalog'],
      'ky-thuat': ['Kỹ thuật: Utility Logging'],
      'quan-doc': ['Toàn bộ: Phát lệnh SX, override FEFO, xử lý Error Queue, xem tất cả'],
      'ke-toan-kho': ['Kế toán: Xem chứng từ kho, xem xuất bến (không thao tác kho vật lý)'],
      'admin': ['Quản trị: Toàn quyền hệ thống'],
    };
    return summaries[roleId] || ['Chưa phân quyền'];
  };

  const permissions = getPermissionSummary(user.role);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div>
          <p className="text-sm font-bold text-ant-text">Tài khoản</p>
          <p className="text-xxs text-ant-text-secondary">Thông tin cá nhân</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar & Name Card */}
        <div className="bg-ant-card rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-ant-sx flex items-center justify-center shrink-0 shadow-sm shadow-ant-sx/20">
              <span className="text-white text-2xl font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-ant-text">{user.name}</h2>
              <p className="text-sm text-ant-text-secondary">{roleName}</p>
              <p className="text-xs text-ant-text-secondary mt-0.5">{plantName} · {user.department}</p>
            </div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="bg-ant-card rounded-xl border border-gray-100 divide-y divide-gray-100">
          <InfoRow label="Họ và tên" value={user.name} />
          <InfoRow label="Mã nhân viên" value={user.employeeCode} />
          <InfoRow label="Tên đăng nhập" value={user.username} mono />
          <InfoRow label="Số điện thoại" value={user.phone} />
          <InfoRow label="Vai trò" value={roleName} />
          <InfoRow label="Nhà máy" value={`${plantName} (${user.plant})`} />
          <InfoRow label="Bộ phận" value={user.department} />
        </div>

        {/* Permission Summary */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-3">Phân quyền</h3>
          <div className="space-y-2">
            {permissions.map((perm, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-ant-sx-light flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-check-line text-ant-sx text-xs" />
                </div>
                <p className="text-sm text-ant-text">{perm}</p>
              </div>
            ))}
          </div>
          {user.role === 'admin' && (
            <div className="mt-3 p-3 rounded-lg bg-ant-sx-light border border-ant-sx/30">
              <p className="text-xs text-ant-sx-dark">
                <i className="ri-shield-user-line mr-1" />
                Admin có toàn quyền quản trị mô phỏng, bao gồm đổi role/nhà máy của tài khoản trong Settings.
              </p>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          {!showChangePwd ? (
            <button
              onClick={() => { setShowChangePwd(true); setPwdError(''); setPwdSuccess(''); }}
              className="w-full flex items-center justify-between py-1 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i className="ri-lock-line text-ant-text-secondary text-sm" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-ant-text">Đổi mật khẩu</p>
                  <p className="text-xxs text-ant-text-secondary">Cập nhật mật khẩu đăng nhập</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-ant-text-secondary text-lg" />
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <h3 className="text-sm font-bold text-ant-text mb-1">Đổi mật khẩu</h3>
              
              <div>
                <label className="block text-xs font-semibold text-ant-text mb-1">Mật khẩu cũ</label>
                <input
                  type="password"
                  value={oldPwd}
                  onChange={(e) => { setOldPwd(e.target.value); setPwdError(''); }}
                  placeholder="Nhập mật khẩu cũ"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ant-text mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError(''); }}
                  placeholder="Tối thiểu 4 ký tự"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ant-text mb-1">Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmNewPwd}
                  onChange={(e) => { setConfirmNewPwd(e.target.value); setPwdError(''); }}
                  placeholder="Nhập lại mật khẩu mới"
                  className="input-field"
                />
              </div>

              {pwdError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <i className="ri-error-warning-line text-ant-error text-sm mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{pwdError}</p>
                </div>
              )}
              {pwdSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                  <i className="ri-check-line text-ant-success text-sm mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-700">{pwdSuccess}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowChangePwd(false); setPwdError(''); }}
                  className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary hover:bg-ant-bg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xác nhận đổi
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-ant-error/30 bg-ant-card text-ant-error text-sm font-bold hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-logout-box-r-line text-base" />
          Đăng xuất
        </button>

        <div className="h-4" />
        <p className="text-center text-xxs text-ant-text-secondary/50 pb-4">
          ANTESCO Shop Floor &amp; Warehouse v1.0
        </p>
      </main>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm font-medium text-ant-text text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}