import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission, RBAC_PERMISSIONS, TAB_PERMISSIONS, MOCK_ROLES, MOCK_PLANTS, type PermissionAction } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';
import ConfirmModal from '@/components/base/ConfirmModal';
import type { NetworkStatus } from '@/store/AppContext';

const NETWORK_OPTIONS: { status: NetworkStatus; label: string; desc: string; icon: string; variant: 'success' | 'offline' | 'sync' | 'error' }[] = [
  { status: 'online', label: 'Online', desc: 'Kết nối SAP bình thường', icon: 'ri-wifi-line', variant: 'success' },
  { status: 'offline', label: 'Offline kho lạnh', desc: 'Không sóng — Putaway & QM Hold vẫn dùng được', icon: 'ri-wifi-off-line', variant: 'offline' },
  { status: 'syncing', label: 'SAP mock thành công', desc: 'Mô phỏng đồng bộ SAP OK', icon: 'ri-cloud-line', variant: 'sync' },
  { status: 'error', label: 'SAP mock lỗi', desc: 'Mô phỏng lỗi kết nối SAP', icon: 'ri-cloud-off-line', variant: 'error' },
];

const PERMISSION_GROUPS: { label: string; icon: string; actions: PermissionAction[] }[] = [
  { label: 'Sản xuất', icon: 'ri-tools-line', actions: ['PRODUCTION_CREATE_ORDER', 'PRODUCTION_WIP', 'PRODUCTION_PALLET', 'PRODUCTION_CONFIRM_FG', 'PRODUCTION_UTILITY', 'PRODUCTION_SIGN', 'PRODUCTION_MATERIAL', 'PRODUCTION_VIEW'] },
  { label: 'Nhập kho', icon: 'ri-archive-drawer-line', actions: ['INBOUND_RECEIVE_RM', 'INBOUND_FG_RECEIVING', 'INBOUND_PUTAWAY', 'INBOUND_SIGN_WH', 'INBOUND_PENDING_VIEW', 'INBOUND_VIEW'] },
  { label: 'Xuất kho', icon: 'ri-truck-line', actions: ['OUTBOUND_FEFO_PICKING', 'OUTBOUND_FEFO_OVERRIDE', 'OUTBOUND_CONTAINER_LOADING', 'OUTBOUND_CONTAINER_CHECK', 'OUTBOUND_BTP_ISSUE', 'OUTBOUND_VIEW'] },
  { label: 'Nội bộ & QM', icon: 'ri-shield-check-line', actions: ['QM_HOLD', 'QM_CYCLE_COUNT', 'QM_CONTAINER_CHECK', 'QM_DEFECT_CODES', 'QM_VIEW'] },
  { label: 'Điều chuyển', icon: 'ri-arrow-left-right-line', actions: ['TRANSFER_ORDER', 'RECEIVE_TRANSFER'] },
  { label: 'Error Queue', icon: 'ri-error-warning-line', actions: ['ERROR_QUEUE_RESOLVE'] },
  { label: 'Chứng từ kế toán', icon: 'ri-file-chart-line', actions: ['VIEW_DOCUMENTS', 'VIEW_INVOICE_STATUS'] },
  { label: 'Admin', icon: 'ri-admin-line', actions: ['ADMIN_RBAC_MATRIX'] },
];

const PERMISSION_LABELS: Record<string, string> = {
  'PRODUCTION_CREATE_ORDER': 'Phát lệnh SX',
  'PRODUCTION_WIP': 'Ghi WIP',
  'PRODUCTION_PALLET': 'Tạo pallet BTP',
  'PRODUCTION_CONFIRM_FG': 'Xác nhận TP',
  'PRODUCTION_UTILITY': 'Ghi tiện ích',
  'PRODUCTION_SIGN': 'Ký bàn giao SX',
  'PRODUCTION_MATERIAL': 'Cấp vật tư BOM',
  'PRODUCTION_VIEW': 'Xem Sản xuất',
  'INBOUND_RECEIVE_RM': 'Nhập nguyên liệu',
  'INBOUND_FG_RECEIVING': 'Nhập kho TP',
  'INBOUND_PUTAWAY': 'Putaway',
  'INBOUND_SIGN_WH': 'Ký thủ kho',
  'INBOUND_PENDING_VIEW': 'Xem danh sách chờ',
  'INBOUND_VIEW': 'Xem Nhập kho',
  'OUTBOUND_FEFO_PICKING': 'FEFO Picking',
  'OUTBOUND_FEFO_OVERRIDE': 'Override FEFO',
  'OUTBOUND_CONTAINER_LOADING': 'Đóng container',
  'OUTBOUND_CONTAINER_CHECK': 'Kiểm container',
  'OUTBOUND_BTP_ISSUE': 'Xuất BTP',
  'OUTBOUND_VIEW': 'Xem Xuất kho',
  'QM_HOLD': 'QM Hold / Khóa lô',
  'QM_CYCLE_COUNT': 'Cycle Counting',
  'QM_CONTAINER_CHECK': 'Kiểm container QM',
  'QM_DEFECT_CODES': 'Xem mã lỗi DF',
  'QM_VIEW': 'Xem Nội bộ & QM',
  'TRANSFER_ORDER': 'Điều chuyển NM',
  'RECEIVE_TRANSFER': 'Nhận điều chuyển',
  'ERROR_QUEUE_RESOLVE': 'Xử lý Error Queue',
  'VIEW_DOCUMENTS': 'Xem chứng từ kho',
  'VIEW_INVOICE_STATUS': 'Xem trạng thái hóa đơn',
  'ADMIN_RBAC_MATRIX': 'Ma trận phân quyền',
};

const ALL_PERMISSION_ACTIONS = Array.from(new Set(PERMISSION_GROUPS.flatMap((group) => group.actions)));

export default function SettingsPage() {
  const { state, dispatch, logout, addToast, addActivityLog, syncOfflineQueue } = useApp();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rbacRole, setRbacRole] = useState(state.role?.id || 'thu-kho');
  const [selectedUser, setSelectedUser] = useState(state.currentUserData?.username || 'admin');
  const [adminRoleDraft, setAdminRoleDraft] = useState(state.currentUserData?.role || 'admin');
  const [adminPlantDraft, setAdminPlantDraft] = useState(state.currentUserData?.plant || 'MA');
  const [adminDepartmentDraft, setAdminDepartmentDraft] = useState(state.currentUserData?.department || '');

  const pendingQueueCount = state.offlineQueue.filter((q) => q.status === 'Pending').length;

  const handleNetworkChange = (status: NetworkStatus) => {
    dispatch({ type: 'SET_NETWORK', payload: status });
    const msg = status === 'online' ? 'Đã kết nối Online' : status === 'offline' ? 'Đã chuyển sang chế độ Offline' : status === 'syncing' ? 'Đang mô phỏng đồng bộ SAP' : 'Đang mô phỏng lỗi SAP';
    addToast(status === 'error' ? 'error' : status === 'offline' ? 'warning' : 'success', msg);
  };

  const handleLogout = () => {
    if (pendingQueueCount > 0) {
      dispatch({ type: 'SET_SHOW_LOGOUT_CONFIRM', payload: true });
    } else {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const getInitChar = (name: string) => name.split(' ').pop()?.charAt(0) || '?';
  const selectedRole = MOCK_ROLES.find((r) => r.id === rbacRole);
  const adminSelectedUser = state.registeredUsers.find((u) => u.username === selectedUser) || state.registeredUsers[0];
  const effectiveAdminActions = adminRoleDraft === 'admin' ? ALL_PERMISSION_ACTIONS : (RBAC_PERMISSIONS[adminRoleDraft] || []);

  const handleSelectAdminUser = (username: string) => {
    const user = state.registeredUsers.find((u) => u.username === username);
    if (!user) return;
    setSelectedUser(username);
    setAdminRoleDraft(user.role);
    setAdminPlantDraft(user.plant);
    setAdminDepartmentDraft(user.department);
  };

  const handleSaveUserAccess = () => {
    if (!adminSelectedUser) return;
    dispatch({
      type: 'UPDATE_USER_ACCESS',
      payload: {
        username: adminSelectedUser.username,
        role: adminRoleDraft,
        plant: adminPlantDraft,
        department: adminDepartmentDraft.trim() || adminSelectedUser.department,
      },
    });
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      'Cập nhật phân quyền',
      `${adminSelectedUser.name} → ${adminRoleDraft} · ${adminPlantDraft}`
    );
    addToast('success', `Đã cập nhật quyền cho ${adminSelectedUser.name}`);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div>
          <p className="text-sm font-bold text-ant-text">Cài đặt</p>
          <p className="text-xxs text-ant-text-secondary">{state.currentUser} · {state.role?.name}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* User Card */}
        <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-ant-sx flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-bold">{getInitChar(state.currentUser)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ant-text">{state.currentUser}</p>
              <p className="text-xs text-ant-text-secondary">{state.role?.name} · {state.plant?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-ant-bg rounded-lg p-2.5">
              <p className="text-xxs text-ant-text-secondary">Nhà máy</p>
              <p className="text-xs font-bold text-ant-text">{state.plant?.code}</p>
            </div>
            <div className="bg-ant-bg rounded-lg p-2.5">
              <p className="text-xxs text-ant-text-secondary">Bộ phận</p>
              <p className="text-xs font-bold text-ant-text">{state.currentUserData?.department || '--'}</p>
            </div>
            <div className="bg-ant-bg rounded-lg p-2.5">
              <p className="text-xxs text-ant-text-secondary">Queue</p>
              <p className={`text-xs font-bold ${pendingQueueCount > 0 ? 'text-ant-offline' : 'text-ant-text'}`}>{pendingQueueCount} gói</p>
            </div>
          </div>
          <Link to="/account" className="mt-3 w-full h-10 rounded-xl border border-ant-sx/20 bg-ant-sx/5 text-ant-sx text-xs font-bold hover:bg-ant-sx/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
            <i className="ri-user-line" />Xem thông tin tài khoản
          </Link>
        </div>

        {state.role?.id === 'admin' && adminSelectedUser && (
          <div className="bg-ant-card rounded-2xl border border-ant-nk/20 overflow-hidden">
            <div className="bg-ant-nk px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Admin Role Control</p>
                  <p className="text-xs text-white/70">Quản lý user, role, plant và phạm vi thao tác</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-white/15 text-xxs font-bold">
                  {state.registeredUsers.length} users
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <label className="block">
                  <span className="text-xxs font-bold text-ant-text-secondary uppercase">Chọn nhân sự</span>
                  <select
                    value={selectedUser}
                    onChange={(e) => handleSelectAdminUser(e.target.value)}
                    className="mt-1 w-full h-12 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-bold text-ant-text outline-none focus:border-ant-nk focus:ring-2 focus:ring-ant-nk/15"
                  >
                    {state.registeredUsers.map((user) => {
                      const role = MOCK_ROLES.find((r) => r.id === user.role);
                      return <option key={user.username} value={user.username}>{user.name} · {user.employeeCode} · {role?.name || user.role}</option>;
                    })}
                  </select>
                </label>

                <div className="rounded-2xl border border-ant-nk/15 bg-ant-nk/5 p-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-ant-nk text-white flex items-center justify-center shrink-0">
                    <span className="text-base font-bold">{getInitChar(adminSelectedUser.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ant-text truncate">{adminSelectedUser.name}</p>
                    <p className="text-xs text-ant-text-secondary truncate">{adminSelectedUser.employeeCode} · {adminSelectedUser.username}</p>
                  </div>
                  <span className="h-8 px-3 rounded-xl bg-white text-ant-nk text-xxs font-bold inline-flex items-center whitespace-nowrap">
                    {MOCK_ROLES.find((r) => r.id === adminSelectedUser.role)?.name || adminSelectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-ant-bg rounded-xl p-3">
                  <p className="text-xs font-bold text-ant-text mb-2">Thông tin nhân sự</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <InfoCell label="Tên" value={adminSelectedUser.name} />
                    <InfoCell label="Mã NV" value={adminSelectedUser.employeeCode} />
                    <InfoCell label="Username" value={adminSelectedUser.username} />
                    <InfoCell label="SĐT" value={adminSelectedUser.phone} />
                  </div>
                </div>

                <div className="bg-ant-bg rounded-xl p-3 space-y-3">
                  <p className="text-xs font-bold text-ant-text">Phạm vi truy cập</p>
                  <label className="block">
                    <span className="text-xxs font-bold text-ant-text-secondary uppercase">Role</span>
                    <select value={adminRoleDraft} onChange={(e) => setAdminRoleDraft(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-ant-text outline-none focus:border-ant-nk">
                      {MOCK_ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xxs font-bold text-ant-text-secondary uppercase">Nhà máy</span>
                    <select value={adminPlantDraft} onChange={(e) => setAdminPlantDraft(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-ant-text outline-none focus:border-ant-nk">
                      {MOCK_PLANTS.map((plant) => <option key={plant.id} value={plant.id}>{plant.name} · {plant.code}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xxs font-bold text-ant-text-secondary uppercase">Bộ phận</span>
                    <input value={adminDepartmentDraft} onChange={(e) => setAdminDepartmentDraft(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-ant-text outline-none focus:border-ant-nk" placeholder="Kho, Sản xuất, QM/KCS..." />
                  </label>
                  <button onClick={handleSaveUserAccess} className="w-full h-12 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] transition-all">
                    <i className="ri-save-line mr-2" />Lưu phân quyền user
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <MetricCell label="Tabs" value={(TAB_PERMISSIONS[adminRoleDraft] || []).length} icon="ri-layout-grid-line" />
                  <MetricCell label="Actions" value={effectiveAdminActions.length} icon="ri-key-2-line" />
                  <MetricCell label="Offline" value={effectiveAdminActions.filter((a) => a === 'INBOUND_PUTAWAY' || a === 'QM_HOLD').length} icon="ri-wifi-off-line" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MA TRẬN PHÂN QUYỀN (RBAC MATRIX) ===== */}
        <div id="rbac-matrix" className="bg-ant-card rounded-2xl border border-ant-qm/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-ant-qm/20 flex items-center justify-center">
              <i className="ri-shield-keyhole-line text-ant-qm text-xs" />
            </div>
            <h3 className="text-sm font-bold text-ant-text">Ma trận phân quyền</h3>
          </div>
          <p className="text-xs text-ant-text-secondary mb-4">Chọn vai trò để xem phạm vi màn hình & quyền thao tác</p>

          {/* Role selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
            {MOCK_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setRbacRole(role.id)}
                className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center transition-all ${
                  rbacRole === role.id
                    ? 'bg-ant-qm text-white shadow-sm shadow-ant-qm/20'
                    : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>

          {selectedRole && (
            <div className="space-y-3">
              {/* Role summary */}
              <div className="bg-ant-qm/5 rounded-xl p-3 border border-ant-qm/10">
                <p className="text-sm font-bold text-ant-text">{selectedRole.name}</p>
                <p className="text-xs text-ant-text-secondary mt-0.5">
                  Tab: {(TAB_PERMISSIONS[selectedRole.id] || []).map((t) => {
                    const map: Record<string, string> = { production: 'Sản xuất', inbound: 'Nhập kho', outbound: 'Xuất kho', 'internal-qm': 'Nội bộ & QM' };
                    return map[t] || t;
                  }).join(', ') || 'Không có tab nào'}
                </p>
              </div>

              {/* Permission matrix by group */}
              {PERMISSION_GROUPS.map((group) => {
                const allowed = group.actions.filter((a) => hasPermission(selectedRole.id, a));
                const viewOnly = group.actions.filter((a) => a.endsWith('_VIEW') && hasPermission(selectedRole.id, a));
                const canOperate = allowed.filter((a) => !a.endsWith('_VIEW'));
                const blocked = group.actions.filter((a) => !hasPermission(selectedRole.id, a) && !a.endsWith('_VIEW'));

                if (allowed.length === 0 && blocked.length === 0) return null;

                return (
                  <div key={group.label} className="bg-ant-bg rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`${group.icon} text-ant-qm text-sm`} />
                      <span className="text-xs font-bold text-ant-text">{group.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {canOperate.map((a) => (
                        <span key={a} className="min-h-8 px-2.5 py-1 rounded-xl bg-ant-sx/10 text-ant-sx text-xxs font-bold border border-ant-sx/20 inline-flex items-center whitespace-nowrap">
                          {PERMISSION_LABELS[a] || a}
                        </span>
                      ))}
                      {viewOnly.map((a) => (
                        <span key={a} className="min-h-8 px-2.5 py-1 rounded-xl bg-ant-nk/10 text-ant-nk text-xxs font-bold border border-ant-nk/20 inline-flex items-center whitespace-nowrap">
                          {PERMISSION_LABELS[a] || a}
                        </span>
                      ))}
                      {blocked.map((a) => (
                        <span key={a} className="min-h-8 px-2.5 py-1 rounded-xl bg-gray-100 text-ant-text-secondary/50 text-xxs font-bold line-through inline-flex items-center whitespace-nowrap">
                          {PERMISSION_LABELS[a] || a}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Chú thích */}
              <div className="flex flex-wrap gap-3 text-xxs text-ant-text-secondary">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-ant-sx/20 border border-ant-sx/20" />Được thao tác</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-ant-nk/20 border border-ant-nk/20" />Chỉ xem</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-100" />Bị chặn</span>
              </div>
            </div>
          )}
        </div>

        {/* Network */}
        <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-global-line text-ant-text-secondary text-sm" />Trạng thái mạng (Mock SAP)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {NETWORK_OPTIONS.map((opt) => (
              <button key={opt.status} onClick={() => handleNetworkChange(opt.status)} className={`px-3 py-3.5 rounded-xl text-left transition-all active:scale-[0.97] cursor-pointer ${
                state.networkStatus === opt.status ? `bg-ant-${opt.variant}/10 border border-ant-${opt.variant}/30` : 'bg-gray-50 border border-transparent hover:bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge variant={opt.variant} label="" size="sm" />
                  <span className={`text-xs font-bold ${state.networkStatus === opt.status ? `text-ant-${opt.variant}` : 'text-ant-text-secondary'}`}>{opt.label}</span>
                </div>
                <p className="text-xxs text-ant-text-secondary leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* UI Toggles */}
        <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2"><i className="ri-palette-line text-ant-text-secondary text-sm" />Giao diện</h3>
          <ToggleRow label="High Contrast" desc="Tăng độ tương phản cho màn hình ngoài trời" active={state.highContrast} activeColor="bg-ant-sx" onToggle={() => dispatch({ type: 'TOGGLE_HIGH_CONTRAST' })} />
          <ToggleRow label="Cold Storage UI" desc="Giao diện tối ưu khi đeo găng tay trong kho lạnh" active={state.coldStorageUI} activeColor="bg-ant-nk" onToggle={() => dispatch({ type: 'TOGGLE_COLD_STORAGE_UI' })} />
        </div>

        {/* Queue Info */}
        {pendingQueueCount > 0 && (
          <div className="bg-ant-card rounded-2xl border border-ant-offline/20 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Offline Queue</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-ant-offline/10 flex items-center justify-center"><i className="ri-cloud-line text-lg text-ant-offline" /></div>
              <div><p className="text-sm font-bold text-ant-offline">{pendingQueueCount} gói tin đang đợi</p><p className="text-xxs text-ant-text-secondary">Đồng bộ tự động khi có mạng</p></div>
            </div>
            <button onClick={() => syncOfflineQueue()} disabled={state.networkStatus === 'offline'} className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${state.networkStatus === 'offline' ? 'bg-gray-200 text-ant-text-secondary cursor-not-allowed' : 'bg-ant-offline text-white hover:opacity-90'}`}>
              <i className="ri-refresh-line mr-1" />{state.networkStatus === 'offline' ? 'Cần Online để đồng bộ' : 'Đồng bộ ngay'}
            </button>
          </div>
        )}

        {/* Reset — Admin only */}
        {state.role?.id === 'admin' && (
          <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Dữ liệu</h3>
            <button onClick={() => setShowResetConfirm(true)} className="w-full px-4 py-3 rounded-xl bg-ant-error/10 text-ant-error text-sm font-bold hover:bg-ant-error/20 active:scale-[0.98] transition-all cursor-pointer">
              <i className="ri-refresh-line mr-2" />Reset Mock Data
            </button>
          </div>
        )}

        <ConfirmModal isOpen={showResetConfirm} title="Reset dữ liệu mock?" message="Toàn bộ dữ liệu sẽ được đưa về trạng thái ban đầu." confirmLabel="Xác nhận Reset" confirmColor="bg-ant-error" icon="ri-refresh-line" iconColor="bg-ant-error/10 text-ant-error" onConfirm={() => { dispatch({ type: 'RESET_MOCK_DATA' }); setShowResetConfirm(false); addToast('success', 'Đã reset toàn bộ dữ liệu mock'); }} onCancel={() => setShowResetConfirm(false)} />

        {/* Logout */}
        <button onClick={handleLogout} className="w-full py-3.5 rounded-2xl bg-ant-card border border-ant-error/30 text-ant-error text-sm font-bold hover:bg-ant-error/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
          <i className="ri-logout-box-r-line text-base" />Đăng xuất
        </button>

        <div className="h-4" />
        <p className="text-center text-xxs text-ant-text-secondary/40 pb-6">ANTESCO Shop Floor & Warehouse v1.0 · Mock · {state.plant?.code || '--'}</p>
      </main>
    </div>
  );
}

function ToggleRow({ label, desc, active, activeColor, onToggle }: { label: string; desc: string; active: boolean; activeColor: string; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="min-w-0 mr-3"><p className="text-sm font-medium text-ant-text">{label}</p><p className="text-xxs text-ant-text-secondary">{desc}</p></div>
      <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${active ? activeColor : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-2 border border-gray-100 min-w-0">
      <p className="text-[10px] text-ant-text-secondary">{label}</p>
      <p className="text-xs font-bold text-ant-text truncate">{value}</p>
    </div>
  );
}

function MetricCell({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl bg-ant-nk/5 border border-ant-nk/10 p-3 text-center">
      <i className={`${icon} text-ant-nk text-base`} />
      <p className="text-lg font-bold text-ant-text leading-tight mt-1">{value}</p>
      <p className="text-[10px] text-ant-text-secondary">{label}</p>
    </div>
  );
}
