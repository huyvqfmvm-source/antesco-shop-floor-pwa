import { Outlet, Navigate } from 'react-router-dom';
import { useApp, hasPermission, type PermissionAction } from '@/store/AppContext';
import BottomNav from './BottomNav';
import FloatingScanButton from './FloatingScanButton';
import ToastContainer from './ToastContainer';
import SyncQueueModal from './SyncQueueModal';
import ConfirmModal from '@/components/base/ConfirmModal';
import PermissionDenied from '@/components/base/PermissionDenied';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';

// Map routes to required permissions for route guard
const ROUTE_PERMISSION_MAP: Record<string, PermissionAction> = {
  '/production': 'PRODUCTION_VIEW',
  '/inbound': 'INBOUND_VIEW',
  '/outbound': 'OUTBOUND_VIEW',
  '/internal-qm': 'QM_VIEW',
  '/reports': 'PRODUCTION_VIEW',
  '/accounting': 'VIEW_DOCUMENTS',
  '/settings': 'PRODUCTION_VIEW',
  '/account': 'PRODUCTION_VIEW',
  '/admin': 'ADMIN_ALL',
};

export default function MobileLayout() {
  const { state, dispatch, logout } = useApp();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    if (state.isLoggedIn && state.networkStatus === 'online' && state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_SHOW_SYNC_MODAL', payload: true });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.networkStatus, state.offlineQueue, state.isLoggedIn, dispatch]);

  // Route-level permission check (must be before early return)
  const routePermission = useMemo(() => {
    for (const [route, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
      if (location.pathname.startsWith(route)) {
        return { route, permission };
      }
    }
    return null;
  }, [location.pathname]);

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isHomeRoute = location.pathname === '/home' || location.pathname === '/';
  const isStandalonePage = location.pathname === '/login' || location.pathname === '/register';
  const isUtilityRoute = ['/account', '/settings', '/reports', '/accounting'].some((route) => location.pathname.startsWith(route));
  const isModuleRoute = ['/production', '/inbound', '/outbound', '/internal-qm'].some((route) => location.pathname.startsWith(route));
  const showBottomNav = !isHomeRoute && !isStandalonePage && !isUtilityRoute && isModuleRoute;

  const canAccessRoute = !routePermission || hasPermission(state.role?.id, routePermission.permission);

  const pendingQueueCount = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length;
  const errorQueueCount = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;
  const notificationCount = Math.min(99, state.activityLogs.length + pendingQueueCount + errorQueueCount);

  const getNetVariant = () => {
    switch (state.networkStatus) {
      case 'online': return { variant: 'success' as const, label: 'Online' };
      case 'offline': return { variant: 'offline' as const, label: 'Offline kho lạnh' };
      case 'syncing': return { variant: 'sync' as const, label: 'Đang sync' };
      case 'error': return { variant: 'error' as const, label: 'Lỗi kết nối' };
    }
  };
  const netStatus = getNetVariant();

  // Build active display mode classes
  const modeClasses = [
    state.darkMode ? 'dark-mode' : '',
    state.highContrast ? 'high-contrast-mode' : '',
    state.coldStorageUI ? 'cold-storage-mode' : '',
  ].filter(Boolean).join(' ');

  // Determine active display mode labels for badge
  const activeModeLabel = (() => {
    if (state.coldStorageUI) return { icon: 'ri-snowflake-line', label: 'KHO LẠNH', color: 'bg-sky-500' };
    if (state.highContrast) return { icon: 'ri-sun-line', label: 'HIGH CONTRAST', color: 'bg-amber-500' };
    if (state.darkMode) return { icon: 'ri-moon-line', label: 'DARK', color: 'bg-gray-700' };
    return null;
  })();

  const getInitChar = (name: string) => name.split(' ').pop()?.charAt(0) || '?';

  const handleLogout = () => {
    setShowAvatarMenu(false);
    if (pendingQueueCount > 0) {
      dispatch({ type: 'SET_SHOW_LOGOUT_CONFIRM', payload: true });
    } else {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-ant-bg md:bg-gray-100 md:flex md:justify-center md:items-start md:p-4">
      {/* Full-screen app on mobile, framed preview on desktop */}
      <div className={`w-full relative min-h-screen bg-ant-bg overflow-hidden flex flex-col md:max-w-[430px] md:min-h-[calc(100vh-32px)] md:rounded-[2rem] md:shadow-2xl md:shadow-black/10 md:ring-1 md:ring-black/5 ${modeClasses}`}>
        {/* Desktop preview notch */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 z-50 w-32 h-7 bg-black rounded-b-2xl items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-700" />
        </div>

        {/* Status bar spacer */}
        <div className="shrink-0 bg-ant-card md:hidden" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <div className="hidden md:block h-10 shrink-0 bg-ant-card" />

        {/* Header */}
        <header className="app-header sticky top-0 z-40 bg-ant-card/90 backdrop-blur-2xl border-b border-gray-100/60 px-4 h-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-ant-sx flex items-center justify-center shrink-0">
              <i className="ri-building-2-line text-white text-xs" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ant-text leading-tight truncate">{state.currentUser}</p>
              <p className="text-[10px] text-ant-text-secondary leading-tight truncate">
                {state.role?.name || ''} · {state.plant?.name || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {activeModeLabel && (
              <span className={`hidden min-[380px]:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold ${activeModeLabel.color}`}>
                <i className={`${activeModeLabel.icon} text-[10px]`} />
                {activeModeLabel.label}
              </span>
            )}
            <button
              onClick={() => { setShowNotifications((v) => !v); setShowAvatarMenu(false); }}
              className="header-action-btn relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Thông báo"
            >
              <i className="ri-notification-3-line text-lg text-ant-text-secondary" />
              {notificationCount > 0 && (
                <span className="header-badge absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-ant-error text-white text-[9px] flex items-center justify-center font-bold animate-badge-pop">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setShowAvatarMenu((v) => !v); setShowNotifications(false); }}
              className="header-action-btn w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Menu tài khoản"
            >
              <div className="header-avatar-inner w-6 h-6 rounded-full bg-ant-sx/20 flex items-center justify-center">
                <span className="text-[11px] font-bold text-ant-sx">{getInitChar(state.currentUser)}</span>
              </div>
            </button>
          </div>
        </header>

        {showNotifications && (
          <div className="absolute top-[calc(env(safe-area-inset-top,0px)+56px)] right-3 left-3 z-[70] rounded-2xl bg-ant-card border border-gray-100 shadow-2xl shadow-black/15 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ant-text">Thông báo</p>
                <p className="text-xxs text-ant-text-secondary">Hoạt động, lỗi và hàng chờ đồng bộ</p>
              </div>
              <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100">
                <i className="ri-close-line text-ant-text-secondary" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2">
              {errorQueueCount > 0 && (
                <Link to="/internal-qm/error-queue" onClick={() => setShowNotifications(false)} className="flex items-center gap-3 rounded-xl bg-ant-error/5 border border-ant-error/10 p-3 mb-2">
                  <i className="ri-error-warning-line text-ant-error" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ant-error">{errorQueueCount} lỗi cần xử lý</p>
                    <p className="text-xxs text-ant-text-secondary">Mở Error Queue</p>
                  </div>
                </Link>
              )}
              {pendingQueueCount > 0 && (
                <Link to="/settings" onClick={() => setShowNotifications(false)} className="flex items-center gap-3 rounded-xl bg-ant-offline/5 border border-ant-offline/10 p-3 mb-2">
                  <i className="ri-cloud-line text-ant-offline" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ant-offline">{pendingQueueCount} giao dịch chờ sync</p>
                    <p className="text-xxs text-ant-text-secondary">Kiểm tra Offline Queue</p>
                  </div>
                </Link>
              )}
              {state.activityLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex gap-3 rounded-xl p-3 hover:bg-ant-bg">
                  <div className="w-8 h-8 rounded-xl bg-ant-nk/10 text-ant-nk flex items-center justify-center shrink-0">
                    <i className="ri-information-line text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ant-text truncate">{log.user} · {log.action}</p>
                    <p className="text-xxs text-ant-text-secondary line-clamp-2">{log.detail}</p>
                    <p className="text-[10px] text-ant-text-secondary/70">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAvatarMenu && (
          <div className="absolute top-[calc(env(safe-area-inset-top,0px)+56px)] right-3 z-[70] w-[min(360px,calc(100%-24px))] rounded-2xl bg-ant-card border border-gray-100 shadow-2xl shadow-black/15 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-ant-sx text-white flex items-center justify-center font-bold">{getInitChar(state.currentUser)}</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ant-text truncate">{state.currentUser}</p>
                  <p className="text-xs text-ant-text-secondary truncate">{state.role?.name} · {state.plant?.name} · {state.shift?.name}</p>
                  <p className="text-xxs text-ant-text-secondary">Mạng: {state.networkStatus}</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Link to="/account" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ant-bg text-sm font-semibold text-ant-text">
                <i className="ri-user-line text-ant-text-secondary" />Tài khoản
              </Link>
              <Link to="/settings" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ant-bg text-sm font-semibold text-ant-text">
                <i className="ri-settings-3-line text-ant-text-secondary" />Cài đặt & phân quyền
              </Link>
              <div className="my-2 border-t border-gray-100" />
              <MiniToggle label="Chế độ tối" icon="ri-moon-line" active={state.darkMode} onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} />
              <MiniToggle label="Tương phản cao" icon="ri-sun-line" active={state.highContrast} onClick={() => dispatch({ type: 'TOGGLE_HIGH_CONTRAST' })} />
              <MiniToggle label="Kho lạnh" icon="ri-snowflake-line" active={state.coldStorageUI} onClick={() => dispatch({ type: 'TOGGLE_COLD_STORAGE_UI' })} />
              <div className="my-2 border-t border-gray-100" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ant-error/5 text-sm font-bold text-ant-error">
                <i className="ri-logout-box-r-line" />Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {canAccessRoute ? (
            <Outlet />
          ) : (
            <PermissionDenied
              currentRole={state.role?.name}
              moduleName={routePermission?.route}
              requiredPermission={routePermission?.permission}
            />
          )}
        </main>

        {/* Bottom Nav spacer — prevents content from being hidden */}
        {showBottomNav && <div className="h-20 shrink-0" />}

        {/* Bottom Nav */}
        {showBottomNav && <BottomNav />}

        {/* Floating Scan Button */}
        <FloatingScanButton />

        {/* Toast Container */}
        <ToastContainer />

        {/* Sync Queue Modal */}
        <SyncQueueModal />

        {/* Logout Confirm Modal */}
        {state.showLogoutConfirm && <LogoutConfirmModal />}
      </div>
    </div>
  );
}

function MiniToggle({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-ant-bg">
      <span className="flex items-center gap-3 text-sm font-semibold text-ant-text">
        <i className={`${icon} text-ant-text-secondary`} />
        {label}
      </span>
      <span className={`mini-toggle-track relative w-9 h-5 rounded-full transition-colors ${active ? 'bg-ant-sx' : 'bg-gray-300'}`}>
        <span className={`mini-toggle-thumb absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${active ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function LogoutConfirmModal() {
  const { state, dispatch, logout } = useApp();
  const pendingCount = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length;

  return (
    <ConfirmModal
      isOpen={state.showLogoutConfirm}
      title="Còn giao dịch chưa đồng bộ"
      message={`Thiết bị còn ${pendingCount} giao dịch chưa đồng bộ. Nếu thoát, dữ liệu vẫn được lưu trên máy và sẽ gửi lại khi đăng nhập/kết nối mạng. Bạn có chắc muốn thoát không?`}
      icon="ri-cloud-off-line"
      iconColor="bg-ant-warning/10 text-ant-warning"
      confirmLabel="Vẫn thoát"
      cancelLabel="Ở lại kiểm tra"
      confirmColor="bg-ant-error"
      onConfirm={() => {
        dispatch({ type: 'SET_SHOW_LOGOUT_CONFIRM', payload: false });
        logout();
      }}
      onCancel={() => dispatch({ type: 'SET_SHOW_LOGOUT_CONFIRM', payload: false })}
    />
  );
}
