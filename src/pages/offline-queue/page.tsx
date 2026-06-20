import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import type { OfflineQueueItem } from '@/store/AppContext';

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  PUTAWAY: { label: 'Putaway', icon: 'ri-layout-grid-line', color: 'ant-nk' },
  QM_HOLD: { label: 'QM Hold', icon: 'ri-shield-check-line', color: 'ant-error' },
  FG_RECEIVING: { label: 'Nhập kho TP', icon: 'ri-archive-drawer-line', color: 'ant-nk' },
  FEFO_PICKING: { label: 'FEFO Picking', icon: 'ri-arrow-up-down-line', color: 'ant-xk' },
  CYCLE_COUNT: { label: 'Kiểm kê', icon: 'ri-clipboard-line', color: 'ant-qm' },
  TRANSFER_ORDER: { label: 'Điều chuyển', icon: 'ri-arrow-left-right-line', color: 'ant-qm' },
  RECEIVE_TRANSFER: { label: 'Nhận ĐC', icon: 'ri-arrow-go-back-line', color: 'ant-qm' },
  BTP_REPORT: { label: 'Báo cáo BTP', icon: 'ri-file-chart-line', color: 'ant-sx' },
  FG_CARTON_REPORT: { label: 'Đóng thùng TP', icon: 'ri-inbox-line', color: 'ant-sx' },
  CONTAINER_LOADING: { label: 'Đóng container', icon: 'ri-ship-line', color: 'ant-xk' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  'Local Saved': { label: 'Lưu tạm', variant: 'neutral' },
  'Pending User Confirm': { label: 'Chờ xác nhận', variant: 'warning' },
  'Ready To Sync': { label: 'Sẵn sàng sync', variant: 'sync' },
  'Pending Sync': { label: 'Chờ đồng bộ', variant: 'warning' },
  'Syncing': { label: 'Đang đồng bộ', variant: 'sync' },
  'Synced': { label: 'Đã đồng bộ', variant: 'success' },
  'Sync Failed': { label: 'Lỗi đồng bộ', variant: 'error' },
  'Conflict': { label: 'Xung đột', variant: 'error' },
  'Cancelled': { label: 'Đã hủy', variant: 'neutral' },
};

const FILTER_TYPES = [
  { value: '', label: 'Tất cả loại', icon: 'ri-filter-line' },
  { value: 'PUTAWAY', label: 'Putaway', icon: 'ri-layout-grid-line' },
  { value: 'QM_HOLD', label: 'QM Hold', icon: 'ri-shield-check-line' },
  { value: 'FG_RECEIVING', label: 'Nhập kho TP', icon: 'ri-archive-drawer-line' },
  { value: 'FEFO_PICKING', label: 'FEFO Picking', icon: 'ri-arrow-up-down-line' },
  { value: 'CYCLE_COUNT', label: 'Kiểm kê', icon: 'ri-clipboard-line' },
  { value: 'TRANSFER_ORDER', label: 'Điều chuyển', icon: 'ri-arrow-left-right-line' },
  { value: 'RECEIVE_TRANSFER', label: 'Nhận ĐC', icon: 'ri-arrow-go-back-line' },
  { value: 'BTP_REPORT', label: 'Báo cáo BTP', icon: 'ri-file-chart-line' },
  { value: 'FG_CARTON_REPORT', label: 'Đóng thùng TP', icon: 'ri-inbox-line' },
  { value: 'CONTAINER_LOADING', label: 'Đóng container', icon: 'ri-ship-line' },
];

const FILTER_STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Local Saved', label: 'Lưu tạm' },
  { value: 'Pending Sync', label: 'Chờ đồng bộ' },
  { value: 'Syncing', label: 'Đang đồng bộ' },
  { value: 'Synced', label: 'Đã đồng bộ' },
  { value: 'Sync Failed', label: 'Lỗi đồng bộ' },
  { value: 'Conflict', label: 'Xung đột' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

function StatusTag({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, variant: 'neutral' };
  const colorMap: Record<string, string> = {
    success: 'bg-ant-sx/10 text-ant-sx',
    warning: 'bg-ant-warning/10 text-ant-warning',
    error: 'bg-ant-error/10 text-ant-error',
    sync: 'bg-ant-sync/10 text-ant-sync',
    neutral: 'bg-gray-100 text-ant-text-secondary',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold ${colorMap[cfg.variant] || colorMap.neutral}`}>
      {cfg.label}
    </span>
  );
}

export default function OfflineQueuePage() {
  const { state, dispatch, addToast, addActivityLog, syncOfflineQueue } = useApp();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');

  const canEdit = hasPermission(state.role?.id, 'INBOUND_PUTAWAY') || state.role?.id === 'quan-doc' || state.role?.id === 'admin';

  const filtered = state.offlineQueue.filter((q) => {
    if (filterType && q.type !== filterType) return false;
    if (filterStatus && q.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved' || q.status === 'Pending User Confirm' || q.status === 'Ready To Sync').length;
  const conflictCount = state.offlineQueue.filter((q) => q.status === 'Conflict').length;
  const failedCount = state.offlineQueue.filter((q) => q.status === 'Sync Failed').length;

  const handleCancel = (queueId: string) => {
    dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId, status: 'Cancelled' } });
    const item = state.offlineQueue.find((q) => q.queueId === queueId);
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      'Hủy giao dịch Offline',
      `${queueId} — ${item?.type || ''} — ${item?.huId || item?.batchId || ''}`,
      item?.status,
      'Cancelled'
    );
    addToast('warning', 'Đã hủy giao dịch');
  };

  const handleSaveEdit = (queueId: string) => {
    const item = state.offlineQueue.find((q) => q.queueId === queueId);
    if (!item) return;
    dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId, status: 'Pending Sync' } });
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      'Sửa Offline Queue',
      `${queueId} — Lý do: ${editReason}`,
      item.status,
      'Pending Sync',
      editReason
    );
    addToast('success', 'Đã cập nhật giao dịch');
    setEditingId(null);
    setEditReason('');
  };

  const handleSyncAll = () => {
    if (pendingCount === 0) {
      addToast('info', 'Không có giao dịch nào cần đồng bộ');
      return;
    }
    syncOfflineQueue();
  };

  const getItemSummary = (item: OfflineQueueItem) => {
    switch (item.type) {
      case 'PUTAWAY': return `Pallet ${item.huId || '?'} → Ô kệ ${item.binId || '?'}`;
      case 'QM_HOLD': return `Batch ${item.batchId || '?'} — ${item.defectCode || 'DF-?'}`;
      case 'FG_RECEIVING': return `Pallet ${item.huId || '?'} — ${(item.quantity || 0).toLocaleString()} ${item.unit || 'KG'}`;
      case 'FEFO_PICKING': return `OD ${item.odId || '?'} — Pallet ${item.huId || '?'}`;
      case 'CYCLE_COUNT': return `Ô kệ ${item.binId || '?'} — ${(item.quantity || 0).toLocaleString()} ${item.unit || 'KG'}`;
      case 'TRANSFER_ORDER': return `ĐC ${item.transferId || '?'} — HU ${item.huId || '?'}`;
      case 'RECEIVE_TRANSFER': return `Nhận ĐC ${item.transferId || '?'} — HU ${item.huId || '?'}`;
      case 'BTP_REPORT': return `BTP ${item.batchId || '?'} — ${(item.quantity || 0).toLocaleString()} ${item.unit || 'KG'}`;
      case 'FG_CARTON_REPORT': return `Đóng thùng ${item.batchId || '?'} — ${(item.additionalData?.cartonQty as number) || 0} thùng`;
      case 'CONTAINER_LOADING': return `OD ${item.odId || '?'} — Container ${(item.additionalData?.container as string) || '?'}`;
      default: return item.mockMovement;
    }
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/settings')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Offline Queue</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{state.offlineQueue.length} giao dịch · {pendingCount} chờ đồng bộ</p>
        </div>
        {pendingCount > 0 && (
          <Link to="/sync-confirm" className="h-9 px-3.5 rounded-xl bg-ant-warning text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap mr-2">
            <i className="ri-check-double-line text-sm" />
            Xác nhận {pendingCount}
          </Link>
        )}
        {pendingCount > 0 && (
          <button onClick={handleSyncAll} className="h-9 px-3.5 rounded-xl bg-ant-offline text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line text-sm" />
            Đồng bộ {pendingCount}
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-warning">{pendingCount}</p>
            <p className="text-xxs text-ant-text-secondary">Chờ đồng bộ</p>
          </div>
          <div className="bg-ant-error/5 rounded-xl border border-ant-error/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-error">{failedCount + conflictCount}</p>
            <p className="text-xxs text-ant-text-secondary">Lỗi / Xung đột</p>
          </div>
          <div className="bg-ant-offline/5 rounded-xl border border-ant-offline/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-offline">{state.offlineQueue.length}</p>
            <p className="text-xxs text-ant-text-secondary">Tổng</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-ant-text outline-none focus:border-ant-offline"
          >
            {FILTER_TYPES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-ant-text outline-none focus:border-ant-offline"
          >
            {FILTER_STATUSES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Queue items */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <i className="ri-cloud-line text-2xl text-ant-text-secondary/40" />
            </div>
            <p className="text-sm font-bold text-ant-text">Không có giao dịch offline</p>
            <p className="text-xs text-ant-text-secondary mt-1">
              {filterType || filterStatus ? 'Thử thay đổi bộ lọc' : 'Các giao dịch thực hiện khi offline sẽ xuất hiện ở đây'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const typeInfo = TYPE_LABELS[item.type] || { label: item.type, icon: 'ri-file-line', color: 'ant-qm' };
              const isEditing = editingId === item.queueId;
              const canModify = (item.status === 'Local Saved' || item.status === 'Pending Sync') && canEdit;

              return (
                <div key={item.queueId} className={`bg-ant-card rounded-xl border p-4 ${
                  item.status === 'Conflict' ? 'border-ant-error/30 bg-ant-error/5' :
                  item.status === 'Sync Failed' ? 'border-ant-error/20' :
                  item.status === 'Synced' ? 'border-ant-sx/20 bg-ant-sx/5' :
                  'border-gray-100'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}/10 flex items-center justify-center shrink-0`}>
                        <i className={`${typeInfo.icon} text-${typeInfo.color} text-sm`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ant-text truncate">{typeInfo.label}</p>
                        <p className="text-xxs text-ant-text-secondary font-mono truncate">{item.queueId}</p>
                      </div>
                    </div>
                    <StatusTag status={item.status} />
                  </div>

                  <div className="text-xs text-ant-text-secondary mb-2">
                    <p>{getItemSummary(item)}</p>
                    <p className="text-xxs mt-1">{item.user} · {item.createdAt} · {item.mockMovement}</p>
                  </div>

                  {isEditing && (
                    <div className="mb-3 p-3 rounded-lg bg-ant-warning/5 border border-ant-warning/10">
                      <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Lý do chỉnh sửa / ghi chú</label>
                      <textarea
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Nhập lý do chỉnh sửa..."
                        maxLength={200}
                        className="w-full p-2 rounded-lg border border-gray-200 text-xs text-ant-text bg-white resize-none h-16 focus:outline-none focus:border-ant-warning"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleSaveEdit.bind(null, item.queueId)} className="flex-1 h-8 rounded-lg bg-ant-sx text-white text-xs font-bold active:scale-95 transition-all">
                          Lưu
                        </button>
                        <button onClick={() => { setEditingId(null); setEditReason(''); }} className="flex-1 h-8 rounded-lg bg-gray-100 text-ant-text-secondary text-xs font-medium active:scale-95 transition-all">
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    {canModify && (
                      <>
                        {!isEditing && (
                          <button
                            onClick={() => { setEditingId(item.queueId); setEditReason(item.reason || ''); }}
                            className="flex-1 h-8 rounded-lg bg-ant-nk/10 text-ant-nk text-xxs font-bold active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <i className="ri-edit-line text-xs" />Sửa
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(item.queueId)}
                          className="flex-1 h-8 rounded-lg bg-ant-error/10 text-ant-error text-xxs font-bold active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <i className="ri-close-circle-line text-xs" />Hủy
                        </button>
                      </>
                    )}
                    {item.status === 'Sync Failed' && (
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: item.queueId, status: 'Pending Sync' } })}
                        className="flex-1 h-8 rounded-lg bg-ant-warning/10 text-ant-warning text-xxs font-bold active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <i className="ri-refresh-line text-xs" />Thử lại
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}