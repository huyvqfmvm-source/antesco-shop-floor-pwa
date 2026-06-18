import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { ErrorQueueItem } from '@/store/AppContext';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả', icon: 'ri-list-unordered' },
  { key: 'Pending', label: 'Chờ xử lý', icon: 'ri-time-line', color: 'ant-warning' },
  { key: 'Need Review', label: 'Cần xác minh', icon: 'ri-error-warning-line', color: 'ant-error' },
  { key: 'Resolved', label: 'Đã xử lý', icon: 'ri-checkbox-circle-line', color: 'ant-sx' },
  { key: 'Cancelled', label: 'Đã hủy', icon: 'ri-close-circle-line', color: 'ant-text-secondary' },
];

const ERROR_TYPE_LABELS: Record<string, string> = {
  PUTAWAY: 'Putaway',
  QM_HOLD: 'QM Hold',
  FEFO_PICKING: 'FEFO Picking',
  TRANSFER: 'Điều chuyển',
  CONTAINER: 'Đóng container',
};

export default function ErrorQueueResolverPage() {
  const { state, dispatch, addToast, addActivityLog } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedError, setSelectedError] = useState<ErrorQueueItem | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // RBAC check
  const canResolve = hasPermission(state.role?.id, 'ERROR_QUEUE_RESOLVE') || state.role?.id === 'admin';
  const canAccess = canResolve;

  const filteredErrors = useMemo(() => {
    return state.errorQueue.filter((e) => {
      if (filterStatus === 'all') return true;
      return e.status === filterStatus;
    });
  }, [state.errorQueue, filterStatus]);

  const pendingCount = state.errorQueue.filter((e) => e.status === 'Pending').length;
  const needReviewCount = state.errorQueue.filter((e) => e.status === 'Need Review').length;

  if (!canAccess) {
    return (
      <div className="p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-ant-error/10 flex items-center justify-center mb-4">
          <i className="ri-shield-user-line text-2xl text-ant-error" />
        </div>
        <h3 className="text-base font-bold text-ant-text mb-1">Không có quyền truy cập</h3>
        <p className="text-sm text-ant-text-secondary mb-4">
          Chỉ Quản đốc/Tổ trưởng hoặc Admin mới có quyền xử lý Error Queue.
        </p>
        <p className="text-xs text-ant-text-secondary mb-4">
          Vai trò hiện tại: <strong>{state.role?.name || 'Chưa đăng nhập'}</strong>
        </p>
        <button
          onClick={() => navigate('/internal-qm')}
          className="px-4 py-2.5 rounded-xl bg-ant-qm text-white text-sm font-medium"
        >
          Quay lại Nội bộ & QM
        </button>
      </div>
    );
  }

  const handleResolve = (error: ErrorQueueItem) => {
    setSelectedError(error);
    setShowResolveModal(true);
    setResolutionNote('');
  };

  const handleConfirmResolve = () => {
    if (!selectedError) return;
    dispatch({
      type: 'UPDATE_ERROR_STATUS',
      payload: {
        id: selectedError.id,
        status: 'Resolved',
        resolvedBy: state.currentUser,
        resolution: resolutionNote || 'Đã xử lý',
      },
    });
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      'Xử lý Error Queue',
      `Đã resolve lỗi ${selectedError.transactionCode} — ${selectedError.type}`,
    );
    addToast('success', `Đã xử lý lỗi ${selectedError.transactionCode}`);
    setShowResolveModal(false);
    setSelectedError(null);
  };

  const handleCancel = (error: ErrorQueueItem) => {
    setSelectedError(error);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedError) return;
    dispatch({
      type: 'UPDATE_ERROR_STATUS',
      payload: {
        id: selectedError.id,
        status: 'Cancelled',
        resolvedBy: state.currentUser,
        resolution: 'Đã hủy giao dịch',
      },
    });
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      'Hủy Error Queue',
      `Đã hủy lỗi ${selectedError.transactionCode}`,
    );
    addToast('info', `Đã hủy giao dịch ${selectedError.transactionCode}`);
    setShowCancelConfirm(false);
    setSelectedError(null);
  };

  const handleMarkNeedReview = (error: ErrorQueueItem) => {
    dispatch({
      type: 'UPDATE_ERROR_STATUS',
      payload: {
        id: error.id,
        status: 'Need Review',
      },
    });
    addToast('warning', `Đã đánh dấu cần kiểm tra: ${error.transactionCode}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-ant-warning/10 text-ant-warning border-ant-warning/20';
      case 'Need Review': return 'bg-ant-error/10 text-ant-error border-ant-error/20';
      case 'Resolved': return 'bg-ant-sx/10 text-ant-sx border-ant-sx/20';
      case 'Cancelled': return 'bg-gray-100 text-ant-text-secondary border-gray-200';
      default: return 'bg-gray-100 text-ant-text-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Need Review': return 'Cần xác minh';
      case 'Resolved': return 'Đã xử lý';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">Error Queue Resolver</h2>
          <p className="text-xxs text-ant-text-secondary">Xử lý lỗi đồng bộ — Quản đốc/Tổ trưởng</p>
        </div>
      </div>

      <PermissionBanner
        module="Error Queue Resolver"
        moduleIcon="ri-error-warning-line"
        moduleColor="qm"
        requiredPermissions={['ERROR_QUEUE_RESOLVE']}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-ant-card rounded-xl border border-ant-warning/20 p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-ant-warning/20 flex items-center justify-center">
              <i className="ri-time-line text-xs text-ant-warning" />
            </div>
            <div>
              <p className="text-sm font-bold text-ant-warning">{pendingCount}</p>
              <p className="text-xxs text-ant-text-secondary">Chờ xử lý</p>
            </div>
          </div>
        </div>
        <div className="bg-ant-card rounded-xl border border-ant-error/20 p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-ant-error/20 flex items-center justify-center">
              <i className="ri-error-warning-line text-xs text-ant-error" />
            </div>
            <div>
              <p className="text-sm font-bold text-ant-error">{needReviewCount}</p>
              <p className="text-xxs text-ant-text-secondary">Cần xác minh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === f.key
                ? 'bg-ant-qm text-white'
                : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${f.icon} text-xs`} />
            </div>
            {f.label}
          </button>
        ))}
      </div>

      {/* Error Cards */}
      <div className="space-y-3">
        {filteredErrors.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-check-line text-xl text-ant-text-secondary/40" />
            </div>
            <p className="text-sm text-ant-text-secondary">Không có lỗi nào</p>
          </div>
        )}

        {filteredErrors.map((error) => (
          <div key={error.id} className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono font-bold text-ant-text">{error.transactionCode}</p>
                <p className="text-xs text-ant-text-secondary mt-0.5">
                  {ERROR_TYPE_LABELS[error.type] || error.type} · {error.createdAt}
                </p>
              </div>
              <span className={`text-xxs font-bold px-2 py-1 rounded-full border ${getStatusBadge(error.status)}`}>
                {getStatusLabel(error.status)}
              </span>
            </div>

            {/* Error reason */}
            <div className="bg-ant-error/5 rounded-lg p-3 border border-ant-error/10">
              <p className="text-xs font-bold text-ant-error mb-1">
                <i className="ri-error-warning-line mr-1" />Lý do lỗi
              </p>
              <p className="text-xs text-ant-text-secondary">{error.errorReasonVi}</p>
              {error.errorMessage && error.errorMessage !== error.errorReasonVi && (
                <p className="text-xxs text-ant-text-secondary/60 mt-1 font-mono">{error.errorMessage}</p>
              )}
            </div>

            {/* Need Review special message */}
            {error.status === 'Need Review' && error.history.length > 1 && (
              <div className="bg-ant-warning/5 rounded-lg p-3 border border-ant-warning/20">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="ri-alert-line text-xs text-ant-warning" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ant-warning">Dữ liệu cần xác minh</p>
                    <p className="text-xxs text-ant-text-secondary mt-1">
                      Giao dịch khác đã xử lý pallet này trước. Vui lòng kiểm tra lịch sử trước khi gửi lại.
                    </p>
                    {error.history
                      .filter((h) => h.action.includes('trước'))
                      .map((h, i) => (
                        <p key={i} className="text-xxs text-ant-text-secondary mt-1 font-mono">
                          → {h.action} · {h.timestamp} · {h.user}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xxs">
              <div>
                <span className="text-ant-text-secondary">Người tạo: </span>
                <span className="text-ant-text font-medium">{error.user}</span>
              </div>
              <div>
                <span className="text-ant-text-secondary">Vai trò: </span>
                <span className="text-ant-text font-medium">{error.role}</span>
              </div>
              {error.originalData && Object.entries(error.originalData).filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <span className="text-ant-text-secondary">{k}: </span>
                  <span className="text-ant-text font-mono font-medium">{String(v)}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {error.status !== 'Resolved' && error.status !== 'Cancelled' && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleResolve(error)}
                  className="flex-1 min-w-[80px] h-9 rounded-lg bg-ant-sx text-white text-xs font-bold hover:bg-ant-sx-dark transition-colors flex items-center justify-center gap-1"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-check-line text-xs" />
                  </div>
                  Gửi lại
                </button>
                <button
                  onClick={() => handleCancel(error)}
                  className="flex-1 min-w-[80px] h-9 rounded-lg border border-gray-200 text-xs font-medium text-ant-text-secondary hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line text-xs" />
                  </div>
                  Hủy Giao dịch
                </button>
                <button
                  onClick={() => handleMarkNeedReview(error)}
                  className="h-9 px-3 rounded-lg bg-ant-warning/10 text-ant-warning text-xs font-medium hover:bg-ant-warning/20 transition-colors flex items-center gap-1"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-flag-line text-xs" />
                  </div>
                  Cần kiểm tra
                </button>
                <button
                  onClick={() => { setSelectedError(error); setShowHistory(true); }}
                  className="h-9 px-3 rounded-lg bg-gray-100 text-ant-text-secondary text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-history-line text-xs" />
                  </div>
                  Lịch sử
                </button>
              </div>
            )}

            {/* Resolved info */}
            {(error.status === 'Resolved' || error.status === 'Cancelled') && (
              <div className="bg-ant-bg rounded-lg p-2.5">
                <p className="text-xxs text-ant-text-secondary">
                  {error.status === 'Resolved' ? 'Đã xử lý' : 'Đã hủy'} bởi <strong>{error.resolvedBy}</strong>
                  {error.resolution && ` — ${error.resolution}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h3 className="text-sm font-bold text-ant-text mb-2">Xác nhận gửi lại</h3>
            <p className="text-xs text-ant-text-secondary mb-1">
              Gửi lại giao dịch <span className="font-mono font-bold">{selectedError.transactionCode}</span>
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Ghi chú xử lý (tùy chọn)..."
              maxLength={500}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-20 focus:outline-none focus:border-ant-sx mt-3"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmResolve}
                className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold"
              >
                Gửi lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && selectedError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <div className="w-10 h-10 mx-auto rounded-full bg-ant-error/10 flex items-center justify-center mb-3">
              <i className="ri-close-circle-line text-xl text-ant-error" />
            </div>
            <h3 className="text-sm font-bold text-ant-text text-center mb-1">Hủy giao dịch?</h3>
            <p className="text-xs text-ant-text-secondary text-center mb-3">
              Giao dịch <span className="font-mono font-bold">{selectedError.transactionCode}</span> sẽ bị hủy vĩnh viễn.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary"
              >
                Không
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 h-10 rounded-xl bg-ant-error text-white text-sm font-bold"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && selectedError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h3 className="text-sm font-bold text-ant-text mb-3">Lịch sử giao dịch</h3>
            <p className="text-xs font-mono text-ant-text-secondary mb-3">{selectedError.transactionCode}</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedError.history.map((h, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-ant-bg">
                  <div className="w-1.5 h-1.5 rounded-full bg-ant-qm mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-ant-text">{h.action}</p>
                    <p className="text-xxs text-ant-text-secondary">{h.user} · {h.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="w-full h-10 mt-3 rounded-xl bg-gray-100 text-sm font-medium text-ant-text-secondary"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}