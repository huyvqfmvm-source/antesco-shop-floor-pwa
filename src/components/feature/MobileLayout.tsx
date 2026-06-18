import { Outlet, Navigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import BottomNav from './BottomNav';
import FloatingScanButton from './FloatingScanButton';
import ToastContainer from './ToastContainer';
import SyncQueueModal from './SyncQueueModal';
import StatusBadge from '@/components/base/StatusBadge';
import ConfirmModal from '@/components/base/ConfirmModal';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function MobileLayout() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  useEffect(() => {
    if (state.isLoggedIn && state.networkStatus === 'online' && state.offlineQueue.filter((q) => q.status === 'Pending').length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_SHOW_SYNC_MODAL', payload: true });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.networkStatus, state.offlineQueue, state.isLoggedIn, dispatch]);

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isHomeRoute = location.pathname === '/home' || location.pathname === '/';
  const isStandalonePage = location.pathname === '/login' || location.pathname === '/register';
  const showBottomNav = !isHomeRoute && !isStandalonePage;

  const pendingQueueCount = state.offlineQueue.filter((q) => q.status === 'Pending').length;
  const errorQueueCount = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;

  const getNetVariant = () => {
    switch (state.networkStatus) {
      case 'online': return { variant: 'success' as const, label: 'Online' };
      case 'offline': return { variant: 'offline' as const, label: 'Offline kho lạnh' };
      case 'syncing': return { variant: 'sync' as const, label: 'Đang sync' };
      case 'error': return { variant: 'error' as const, label: 'Lỗi kết nối' };
    }
  };
  const netStatus = getNetVariant();
  const getInitChar = (name: string) => name.split(' ').pop()?.charAt(0) || '?';

  return (
    <div className="min-h-screen bg-ant-bg md:bg-gray-100 md:flex md:justify-center md:items-start md:p-4">
      {/* Full-screen app on mobile, framed preview on desktop */}
      <div className="w-full relative min-h-screen bg-ant-bg overflow-hidden flex flex-col md:max-w-[430px] md:min-h-[calc(100vh-32px)] md:rounded-[2rem] md:shadow-2xl md:shadow-black/10 md:ring-1 md:ring-black/5">
        {/* Desktop preview notch */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 z-50 w-32 h-7 bg-black rounded-b-2xl items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-700" />
        </div>

        {/* Status bar spacer */}
        <div className="shrink-0 bg-ant-card md:hidden" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <div className="hidden md:block h-10 shrink-0 bg-ant-card" />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-ant-card/90 backdrop-blur-2xl border-b border-gray-100/60 px-4 h-12 flex items-center justify-between shrink-0">
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
            <StatusBadge variant={netStatus.variant} label={netStatus.label} pulse={state.networkStatus === 'syncing'} />
            {pendingQueueCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-ant-offline/10 text-ant-offline text-[10px] font-bold border border-ant-offline/20">
                <i className="ri-cloud-line text-[10px]" />
                {pendingQueueCount}
              </span>
            )}
            <Link to="/account" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-5 h-5 rounded-full bg-ant-sx/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-ant-sx">{getInitChar(state.currentUser)}</span>
              </div>
            </Link>
            <Link to="/settings" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
              <i className="ri-settings-3-line text-base text-ant-text-secondary" />
              {errorQueueCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-ant-error text-white text-[8px] flex items-center justify-center font-bold animate-badge-pop">
                  {errorQueueCount > 9 ? '!' : errorQueueCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
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

function LogoutConfirmModal() {
  const { state, dispatch, logout } = useApp();
  const pendingCount = state.offlineQueue.filter((q) => q.status === 'Pending').length;

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
