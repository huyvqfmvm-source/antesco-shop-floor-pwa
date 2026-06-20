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

const FORM_SOURCE_MAP: Record<string, { code: string; name: string }> = {
  PUTAWAY: { code: 'SAP-MIGO-311', name: 'Goods Receipt Putaway' },
  QM_HOLD: { code: 'SAP-MIGO-344', name: 'Quality Inspection Hold' },
  FG_RECEIVING: { code: 'SAP-MIGO-101', name: 'Goods Receipt FG' },
  FEFO_PICKING: { code: 'SAP-MIGO-201', name: 'Goods Issue FEFO' },
  CYCLE_COUNT: { code: 'SAP-LI11N', name: 'Cycle Count Entry' },
  TRANSFER_ORDER: { code: 'SAP-MIGO-311', name: 'Transfer Order' },
  RECEIVE_TRANSFER: { code: 'SAP-MIGO-311', name: 'Receive Transfer' },
  BTP_REPORT: { code: 'BC-BTP-01', name: 'Báo cáo BTP' },
  FG_CARTON_REPORT: { code: 'BC-DTTP-01', name: 'Báo cáo đóng thùng TP' },
  CONTAINER_LOADING: { code: 'SAP-VL10', name: 'Container Loading & Dispatch' },
};

export default function SyncConfirmationPage() {
  const { state, dispatch, addToast, addActivityLog, syncOfflineQueue } = useApp();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmingItem, setConfirmingItem] = useState<OfflineQueueItem | null>(null);
  const [confirmNote, setConfirmNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingItem, setRejectingItem] = useState<OfflineQueueItem | null>(null);

  const canConfirm = hasPermission(state.role?.id, 'INBOUND_PUTAWAY') || state.role?.id === 'quan-doc' || state.role?.id === 'admin';

  const pendingConfirmation = state.offlineQueue.filter(
    (q) => q.status === 'Local Saved' || q.status === 'Pending Sync'
  );

  const readyToSync = state.offlineQueue.filter((q) => q.status === 'Ready To Sync');

  const toggleSelect = (queueId: string) => {
    const next = new Set(selectedItems);
    if (next.has(queueId)) next.delete(queueId);
    else next.add(queueId);
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === pendingConfirmation.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pendingConfirmation.map((q) => q.queueId)));
    }
  };

  const handleConfirmItem = (item: OfflineQueueItem) => {
    setConfirmingItem(item);
    setConfirmNote('');
  };

  const handleDoConfirm = () => {
    if (!confirmingItem) return;
    dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: confirmingItem.queueId, status: 'Ready To Sync' } });
    addActivityLog(
      state.currentUser, state.role?.name || '',
      'Xác nhận đồng bộ SAP',
      `${confirmingItem.queueId} — ${confirmingItem.type} — Sẵn sàng gửi SAP`,
      'Pending Sync', 'Ready To Sync',
      confirmNote || 'User xác nhận gửi lên SAP'
    );
    addToast('success', `Đã xác nhận giao dịch ${confirmingItem.queueId}. Sẵn sàng gửi SAP.`);
    setConfirmingItem(null);
    setConfirmNote('');
  };

  const handleRejectItem = (item: OfflineQueueItem) => {
    setRejectingItem(item);
    setRejectReason('');
  };

  const handleDoReject = () => {
    if (!rejectingItem) return;
    dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: rejectingItem.queueId, status: 'Cancelled' } });
    addActivityLog(
      state.currentUser, state.role?.name || '',
      'Từ chối đồng bộ SAP',
      `${rejectingItem.queueId} — ${rejectingItem.type} — Đã hủy`,
      'Pending Sync', 'Cancelled',
      rejectReason || 'User từ chối gửi lên SAP'
    );
    addToast('warning', `Đã hủy giao dịch ${rejectingItem.queueId}`);
    setRejectingItem(null);
    setRejectReason('');
  };

  const handleBulkConfirm = () => {
    if (selectedItems.size === 0) return;
    selectedItems.forEach((queueId) => {
      dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId, status: 'Ready To Sync' } });
    });
    addActivityLog(
      state.currentUser, state.role?.name || '',
      'Xác nhận hàng loạt SAP',
      `${selectedItems.size} giao dịch sẵn sàng gửi SAP`,
      'Pending Sync', 'Ready To Sync',
      'Bulk confirm'
    );
    addToast('success', `Đã xác nhận ${selectedItems.size} giao dịch. Sẵn sàng gửi SAP.`);
    setSelectedItems(new Set());
  };

  const handleBulkReject = () => {
    if (selectedItems.size === 0) return;
    selectedItems.forEach((queueId) => {
      dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId, status: 'Cancelled' } });
    });
    addActivityLog(
      state.currentUser, state.role?.name || '',
      'Từ chối hàng loạt SAP',
      `${selectedItems.size} giao dịch đã hủy`,
      'Pending Sync', 'Cancelled',
      'Bulk reject'
    );
    addToast('warning', `Đã hủy ${selectedItems.size} giao dịch`);
    setSelectedItems(new Set());
  };

  const handleSyncNow = () => {
    if (readyToSync.length === 0 && pendingConfirmation.length === 0) {
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
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Xác nhận đồng bộ SAP</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{pendingConfirmation.length} giao dịch cần xác nhận · {readyToSync.length} sẵn sàng</p>
        </div>
        {!canConfirm && (
          <span className="text-xxs text-ant-error bg-ant-error/5 px-2 py-1 rounded-full font-bold">Chỉ xem</span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Warning Banner */}
        <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-ant-warning/10 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-alert-line text-ant-warning text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-ant-warning">QUAN TRỌNG: Xác nhận trước khi gửi SAP</p>
              <p className="text-xs text-ant-text-secondary mt-1">
                Các giao dịch bên dưới được tạo khi offline và CHƯA được gửi lên SAP/mock SAP.
                Vui lòng kiểm tra kỹ từng giao dịch trước khi xác nhận.
                Sau khi xác nhận, giao dịch sẽ chuyển sang trạng thái "Sẵn sàng đồng bộ" và sẽ được gửi lên SAP ở bước tiếp theo.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-warning">{pendingConfirmation.length}</p>
            <p className="text-xxs text-ant-text-secondary">Cần xác nhận</p>
          </div>
          <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-sx">{readyToSync.length}</p>
            <p className="text-xxs text-ant-text-secondary">Sẵn sàng sync</p>
          </div>
          <div className="bg-ant-nk/5 rounded-xl border border-ant-nk/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-nk">{state.offlineQueue.length}</p>
            <p className="text-xxs text-ant-text-secondary">Tổng</p>
          </div>
        </div>

        {/* Bulk Actions */}
        {pendingConfirmation.length > 0 && canConfirm && (
          <div className="flex items-center gap-2">
            <button onClick={toggleSelectAll} className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-medium text-ant-text-secondary hover:bg-gray-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
              {selectedItems.size === pendingConfirmation.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            {selectedItems.size > 0 && (
              <>
                <button onClick={handleBulkConfirm} className="h-9 px-3 rounded-xl bg-ant-sx text-white text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-check-double-line mr-1" />Xác nhận {selectedItems.size}
                </button>
                <button onClick={handleBulkReject} className="h-9 px-3 rounded-xl bg-ant-error/10 text-ant-error text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-close-circle-line mr-1" />Hủy {selectedItems.size}
                </button>
              </>
            )}
          </div>
        )}

        {/* Pending Confirmation List */}
        {pendingConfirmation.length === 0 && readyToSync.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-ant-sx/10 flex items-center justify-center mb-4">
              <i className="ri-check-double-line text-2xl text-ant-sx" />
            </div>
            <p className="text-sm font-bold text-ant-text">Không có giao dịch cần xác nhận</p>
            <p className="text-xs text-ant-text-secondary mt-1">Tất cả giao dịch đã được xác nhận hoặc đồng bộ</p>
          </div>
        ) : (
          <>
            {/* Pending Confirmation */}
            {pendingConfirmation.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ant-warning" />
                  Cần xác nhận ({pendingConfirmation.length})
                </h3>
                <div className="space-y-2">
                  {pendingConfirmation.map((item) => {
                    const typeInfo = TYPE_LABELS[item.type] || { label: item.type, icon: 'ri-file-line', color: 'ant-qm' };
                    const form = FORM_SOURCE_MAP[item.type] || { code: 'SAP-UNKNOWN', name: 'Unknown' };
                    const isSelected = selectedItems.has(item.queueId);
                    return (
                      <div key={item.queueId} className={`bg-ant-card rounded-xl border p-4 ${isSelected ? 'border-ant-sx/30 bg-ant-sx/5 ring-1 ring-ant-sx/20' : 'border-ant-warning/20'}`}>
                        <div className="flex items-start gap-3">
                          {canConfirm && (
                            <button onClick={() => toggleSelect(item.queueId)} className="w-5 h-5 rounded border-2 shrink-0 mt-1 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                              style={{ borderColor: isSelected ? 'var(--ant-sx)' : '#d1d5db', backgroundColor: isSelected ? 'var(--ant-sx)' : 'transparent' }}>
                              {isSelected && <i className="ri-check-line text-white text-[10px]" />}
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-7 h-7 rounded-lg bg-${typeInfo.color}/10 flex items-center justify-center shrink-0`}>
                                <i className={`${typeInfo.icon} text-${typeInfo.color} text-xs`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-ant-text truncate">{typeInfo.label}</p>
                                <p className="text-xxs text-ant-text-secondary font-mono truncate">{item.queueId}</p>
                              </div>
                            </div>

                            <div className="text-xs text-ant-text-secondary mb-2 space-y-0.5">
                              <p>{getItemSummary(item)}</p>
                              <p className="text-xxs">
                                <span className="font-medium">Biểu mẫu nguồn:</span> {form.code} — {form.name}
                              </p>
                              <p className="text-xxs">
                                <span className="font-medium">Tạo bởi:</span> {item.user} ({item.role}) · {item.createdAt}
                              </p>
                              {item.reason && (
                                <p className="text-xxs text-ant-warning">
                                  <span className="font-medium">Ghi chú:</span> {item.reason}
                                </p>
                              )}
                            </div>

                            {canConfirm && (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleConfirmItem(item)} className="flex-1 h-8 rounded-lg bg-ant-sx text-white text-xxs font-bold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1">
                                  <i className="ri-check-line text-xs" />Xác nhận gửi SAP
                                </button>
                                <button onClick={() => handleRejectItem(item)} className="flex-1 h-8 rounded-lg bg-ant-error/10 text-ant-error text-xxs font-bold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1">
                                  <i className="ri-close-line text-xs" />Hủy
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ready To Sync */}
            {readyToSync.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ant-sx" />
                  Sẵn sàng đồng bộ ({readyToSync.length})
                </h3>
                <div className="space-y-1.5">
                  {readyToSync.map((item) => {
                    const typeInfo = TYPE_LABELS[item.type] || { label: item.type, icon: 'ri-file-line', color: 'ant-qm' };
                    return (
                      <div key={item.queueId} className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg bg-${typeInfo.color}/10 flex items-center justify-center shrink-0`}>
                            <i className={`${typeInfo.icon} text-${typeInfo.color} text-xs`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-ant-text truncate">{typeInfo.label}</p>
                            <p className="text-xxs text-ant-text-secondary truncate">{getItemSummary(item)}</p>
                          </div>
                        </div>
                        <span className="text-xxs font-bold text-ant-sx bg-ant-sx/10 px-2 py-0.5 rounded-full shrink-0">Sẵn sàng</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sync All Button */}
            {readyToSync.length > 0 && (
              <button onClick={handleSyncNow} className="w-full h-12 rounded-xl bg-ant-offline text-white text-sm font-bold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-cloud-line text-lg" />
                Đồng bộ {readyToSync.length} giao dịch lên SAP
              </button>
            )}
          </>
        )}

        <div className="h-4" />
      </main>

      {/* Confirm Modal */}
      {confirmingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <div className="w-10 h-10 mx-auto rounded-full bg-ant-sx/10 flex items-center justify-center mb-3">
              <i className="ri-check-double-line text-xl text-ant-sx" />
            </div>
            <h3 className="text-sm font-bold text-ant-text text-center mb-1">Xác nhận gửi SAP</h3>
            <p className="text-xs text-ant-text-secondary text-center mb-3">
              Bạn đang xác nhận giao dịch <span className="font-mono font-bold">{confirmingItem.queueId}</span> để gửi lên SAP.
              Sau khi xác nhận, giao dịch sẽ ở trạng thái "Sẵn sàng đồng bộ".
            </p>
            <textarea
              value={confirmNote}
              onChange={(e) => setConfirmNote(e.target.value)}
              placeholder="Ghi chú xác nhận (tùy chọn)..."
              maxLength={200}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-sx mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setConfirmingItem(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary cursor-pointer">
                Đóng
              </button>
              <button onClick={handleDoConfirm} className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold cursor-pointer">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <div className="w-10 h-10 mx-auto rounded-full bg-ant-error/10 flex items-center justify-center mb-3">
              <i className="ri-close-circle-line text-xl text-ant-error" />
            </div>
            <h3 className="text-sm font-bold text-ant-text text-center mb-1">Hủy giao dịch?</h3>
            <p className="text-xs text-ant-text-secondary text-center mb-3">
              Giao dịch <span className="font-mono font-bold">{rejectingItem.queueId}</span> sẽ bị hủy và không được gửi lên SAP.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do hủy (bắt buộc)..."
              maxLength={200}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-error mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectingItem(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary cursor-pointer">
                Đóng
              </button>
              <button onClick={handleDoReject} className="flex-1 h-10 rounded-xl bg-ant-error text-white text-sm font-bold cursor-pointer">
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}