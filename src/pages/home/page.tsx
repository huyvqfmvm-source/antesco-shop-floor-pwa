import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useApp, hasPermission, canAccessTab, getRoleHomeHint } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';

export default function HomePage() {
  const { state, addToast, syncOfflineQueue, dispatch, addActivityLog } = useApp();
  const navigate = useNavigate();

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const roleId = state.role?.id || '';
  const plantCode = state.plant?.code || 'MA';
  const roleHint = getRoleHomeHint(roleId);

  // Network status display
  const getNetworkDisplay = () => {
    switch (state.networkStatus) {
      case 'online': return { icon: 'ri-wifi-line', label: 'Online', color: 'text-ant-sx', bg: 'bg-ant-sx/10' };
      case 'offline': return { icon: 'ri-wifi-off-line', label: 'Offline', color: 'text-ant-offline', bg: 'bg-ant-offline/10' };
      case 'syncing': return { icon: 'ri-refresh-line', label: 'Đang đồng bộ', color: 'text-ant-sync', bg: 'bg-ant-sync/10' };
      case 'error': return { icon: 'ri-cloud-off-line', label: 'Lỗi kết nối', color: 'text-ant-error', bg: 'bg-ant-error/10' };
    }
  };
  const netDisplay = getNetworkDisplay();

  const getModeIndicator = () => {
    if (state.coldStorageUI) return { icon: 'ri-snowflake-line', label: 'KHO LẠNH', color: 'bg-sky-500' };
    if (state.highContrast) return { icon: 'ri-sun-line', label: 'HIGH CONTRAST', color: 'bg-amber-500' };
    if (state.darkMode) return { icon: 'ri-moon-line', label: 'DARK MODE', color: 'bg-gray-700' };
    return null;
  };
  const modeIndicator = getModeIndicator();

  const poToday = state.productionOrders.filter((p) => p.plant === plantCode);
  const palletChoNhapKho = state.handlingUnits.filter((h) => h.plant === plantCode && h.status === 'Chờ nhập kho TP');
  const palletChoPutaway = state.handlingUnits.filter((h) => h.plant === plantCode && h.status === 'Chờ putaway');
  const odChoXuat = state.outboundDeliveries.filter((o) => o.plant === plantCode && (o.status === 'Chờ picking' || o.status === 'Đang picking'));
  const loBiKhoaQC = state.batches.filter((b) => b.plant === plantCode && b.status === 'Blocked Stock');
  const queuePending = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved' || q.status === 'Pending User Confirm' || q.status === 'Ready To Sync').length;
  const errorQueueCount = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;

  const handleSyncQueue = () => {
    if (queuePending === 0) { addToast('info', 'Không có giao dịch nào cần đồng bộ'); return; }
    syncOfflineQueue();
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {/* ========== NETWORK STATUS + MODE INDICATOR ========== */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${netDisplay.bg}`}>
              <i className={`${netDisplay.icon} ${netDisplay.color} text-xs`} />
              <span className={`text-xxs font-bold ${netDisplay.color}`}>{netDisplay.label}</span>
            </div>
            {modeIndicator && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-xxs font-bold ${modeIndicator.color}`}>
                <i className={`${modeIndicator.icon} text-[10px]`} />
                {modeIndicator.label}
              </span>
            )}
            <div className="flex-1" />
            <span className="text-xxs text-ant-text-secondary">{state.shift?.name || ''}</span>
          </div>

          {/* ========== SYNC QUEUE ALERT (all roles) ========== */}
          {queuePending > 0 && (
            <div className="rounded-2xl p-4 border bg-ant-offline/5 border-ant-offline/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ant-offline/10 flex items-center justify-center">
                    <i className="ri-cloud-line text-ant-offline text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ant-offline">Offline Queue: {queuePending} gói tin</p>
                    <p className="text-xs text-ant-text-secondary">{queuePending} gói tin đang đợi đồng bộ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/sync-confirm" className="px-3 py-2 rounded-xl bg-ant-offline/10 text-ant-offline text-xs font-bold hover:bg-ant-offline/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer">
                    Xác nhận
                  </Link>
                  {state.networkStatus === 'online' && (
                    <button onClick={handleSyncQueue} className="px-4 py-2.5 rounded-xl bg-ant-offline text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all whitespace-nowrap cursor-pointer">
                      <i className="ri-refresh-line mr-1" />Đồng bộ ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== ROLE-BASED HOME ========== */}

          {/* --- CÔNG NHÂN SẢN XUẤT --- */}
          {roleId === 'cong-nhan-san-xuat' && (
            <>
              <div className="bg-ant-sx rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-tools-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh hôm nay</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-tools-line" color="sx" label="Ghi WIP" onClick={() => navigate('/production/wip/10000456')} />
                  <QuickBtn icon="ri-stack-line" color="sx" label="Tạo pallet BTP" onClick={() => navigate('/production/pallet/10000456')} />
                  <QuickBtn icon="ri-qr-scan-line" color="sx" label="Quét lệnh SX" onClick={() => navigate('/production')} />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Việc của Công nhân SX</h3>
                <div className="space-y-1.5">
                  <TaskRow icon="ri-tools-line" color="ant-sx" label="WIP đang chạy" count={1} />
                  <TaskRow icon="ri-stack-line" color="ant-nk" label="Pallet BTP cần tạo" count={3} />
                  <TaskRow icon="ri-file-chart-line" color="ant-xk" label="Báo cáo sản lượng" count={1} />
                </div>
              </div>
            </>
          )}

          {/* --- THỦ KHO --- */}
          {roleId === 'thu-kho' && (
            <>
              <div className="bg-ant-nk rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-archive-drawer-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Tổng quan hôm nay</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon="ri-archive-drawer-line" color="nk" label="Pallet chờ NK" value={palletChoNhapKho.length} sub="Cần nhập kho" />
                  <SummaryCard icon="ri-layout-grid-line" color="warning" label="Chờ putaway" value={palletChoPutaway.length} sub="Cần xếp ô kệ" highlight />
                  <SummaryCard icon="ri-truck-line" color="xk" label="OD chờ picking" value={odChoXuat.length} sub="Picking pending" />
                  <SummaryCard icon="ri-cloud-line" color="offline" label="Queue chờ" value={queuePending} sub="Gói tin pending" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-archive-drawer-line" color="nk" label="Nhập kho TP" onClick={() => navigate('/inbound/fg-receiving')} />
                  <QuickBtn icon="ri-layout-grid-line" color="nk" label="Putaway" onClick={() => navigate('/inbound/putaway')} />
                  <QuickBtn icon="ri-arrow-up-down-line" color="xk" label="FEFO Picking" onClick={() => navigate('/outbound/fefo-picking/OD-2026-0098')} />
                  <QuickBtn icon="ri-truck-line" color="xk" label="Xuất BTP" onClick={() => navigate('/outbound/btp-issue')} />
                  <QuickBtn icon="ri-ship-line" color="xk" label="Đóng container" onClick={() => navigate('/outbound/container-loading/OD-2026-0102')} />
                  <QuickBtn icon="ri-arrow-left-right-line" color="qm" label="Điều chuyển" onClick={() => navigate('/internal-qm/transfer-order')} />
                  <QuickBtn icon="ri-archive-line" color="nk" label="Nhập NL" onClick={() => navigate('/inbound/receive-rm')} />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Việc của Thủ kho</h3>
                <div className="space-y-1.5">
                  <TaskRow icon="ri-archive-drawer-line" color="ant-nk" label="Pallet chờ nhập kho" count={palletChoNhapKho.length} link="/inbound/fg-receiving" />
                  <TaskRow icon="ri-layout-grid-line" color="ant-warning" label="Pallet chờ putaway" count={palletChoPutaway.length} link="/inbound/putaway" />
                  <TaskRow icon="ri-truck-line" color="ant-xk" label="OD chờ picking" count={odChoXuat.length} link="/outbound" />
                  <TaskRow icon="ri-cloud-line" color="ant-offline" label="Queue chờ đồng bộ" count={queuePending} />
                </div>
              </div>
            </>
          )}

          {/* --- KCS/QM --- */}
          {roleId === 'kcs-qm' && (
            <>
              <div className="bg-ant-qm rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-shield-check-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Tổng quan chất lượng</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon="ri-flask-line" color="warning" label="Lô cần kiểm tra" value={loBiKhoaQC.length} sub="QC pending" />
                  <SummaryCard icon="ri-error-warning-line" color="error" label="QM Hold mở" value={state.qualityHolds.filter((q) => q.status === 'Đang giữ').length} sub="Đang giữ chất lượng" />
                  <SummaryCard icon="ri-camera-line" color="qm" label="Ảnh thiếu" value={2} sub="Bằng chứng" />
                  <SummaryCard icon="ri-file-chart-line" color="nk" label="Báo cáo QC" value={1} sub="Cuối ca" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-error-warning-line" color="error" label="QM Hold" onClick={() => navigate('/internal-qm/qm-hold')} />
                  <QuickBtn icon="ri-clipboard-line" color="qm" label="Kiểm kê" onClick={() => navigate('/internal-qm/cycle-count')} />
                  <QuickBtn icon="ri-ship-line" color="qm" label="Kiểm container" onClick={() => navigate('/outbound/container-loading/OD-2026-0102')} />
                  <QuickBtn icon="ri-bug-line" color="qm" label="Mã lỗi DF" onClick={() => navigate('/internal-qm/defect-codes')} />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Việc của KCS/QM</h3>
                <div className="space-y-1.5">
                  <TaskRow icon="ri-flask-line" color="ant-warning" label="Lô cần kiểm tra" count={loBiKhoaQC.length} />
                  <TaskRow icon="ri-error-warning-line" color="ant-error" label="QM Hold đang mở" count={state.qualityHolds.filter((q) => q.status === 'Đang giữ').length} />
                  <TaskRow icon="ri-camera-line" color="ant-qm" label="Ảnh bằng chứng thiếu" count={2} />
                  <TaskRow icon="ri-file-chart-line" color="ant-nk" label="Báo cáo QC cuối ca" count={1} />
                </div>
              </div>

              {/* Operational Warnings */}
              {loBiKhoaQC.length > 0 && (
                <div className="bg-ant-card rounded-2xl border border-gray-100 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider">Cảnh báo vận hành</h3>
                  {loBiKhoaQC.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-ant-error/5 border border-ant-error/10">
                      <div className="w-8 h-8 rounded-lg bg-ant-error/10 flex items-center justify-center shrink-0">
                        <i className="ri-lock-line text-ant-error text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ant-error">Batch {b.id} — Blocked Stock</p>
                        <p className="text-xxs text-ant-text-secondary">Không thể xuất kho</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* --- KỸ THUẬT --- */}
          {roleId === 'ky-thuat' && (
            <>
              <div className="bg-ant-sx rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-plug-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-plug-line" color="offline" label="Điện" onClick={() => navigate('/production/utility')} />
                  <QuickBtn icon="ri-drop-line" color="nk" label="Nước" onClick={() => navigate('/production/utility')} />
                  <QuickBtn icon="ri-fire-line" color="error" label="Hơi" onClick={() => navigate('/production/utility')} />
                  <QuickBtn icon="ri-tools-line" color="xk" label="Kiểm tra TB" onClick={() => navigate('/production/device-check')} />
                  <QuickBtn icon="ri-temp-cold-line" color="warning" label="Nhiệt độ kho" onClick={() => navigate('/production/temperature-alerts')} />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Việc của Kỹ thuật</h3>
                <div className="space-y-1.5">
                  <TaskRow icon="ri-plug-line" color="ant-offline" label="Utility Logging cuối ca" count={3} link="/production/utility" />
                  <TaskRow icon="ri-tools-line" color="ant-xk" label="Kiểm tra thiết bị" count={12} link="/production/device-check" />
                  <TaskRow icon="ri-temp-cold-line" color="ant-warning" label="Cảnh báo nhiệt độ kho" count={3} link="/production/temperature-alerts" />
                </div>
              </div>
            </>
          )}

          {/* --- QUẢN ĐỐC/TỔ TRƯỞNG --- */}
          {roleId === 'quan-doc' && (
            <>
              <div className="bg-ant-xk rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-vip-crown-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Tổng quan toàn nhà máy</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon="ri-file-list-3-line" color="sx" label="PO đang SX" value={poToday.filter((p) => p.status !== 'CRTD' && p.status !== 'TECO').length} sub="Đang hoạt động" />
                  <SummaryCard icon="ri-check-double-line" color="sx" label="Chờ phát lệnh" value={poToday.filter((p) => p.status === 'CRTD').length} sub="Cần duyệt" highlight />
                  <SummaryCard icon="ri-error-warning-line" color="error" label="Error Queue" value={errorQueueCount} sub="Cần xử lý" />
                  <SummaryCard icon="ri-truck-line" color="xk" label="OD pending" value={odChoXuat.length} sub="Chờ xuất" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-send-plane-line" color="sx" label="Phát lệnh SX" onClick={() => navigate('/production')} />
                  <QuickBtn icon="ri-error-warning-line" color="error" label="Error Queue" onClick={() => navigate('/internal-qm/error-queue')} />
                  <QuickBtn icon="ri-arrow-up-down-line" color="xk" label="Override FEFO" onClick={() => navigate('/outbound/fefo-picking/OD-2026-0098')} />
                  <QuickBtn icon="ri-shield-check-line" color="qm" label="QM Hold" onClick={() => navigate('/internal-qm/qm-hold')} />
                  <QuickBtn icon="ri-file-chart-line" color="nk" label="Báo cáo ca" onClick={() => navigate('/reports')} />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Việc của Quản đốc</h3>
                <div className="space-y-1.5">
                  <TaskRow icon="ri-check-double-line" color="ant-sx" label="Lệnh SX chờ phát hành" count={poToday.filter((p) => p.status === 'CRTD').length} link="/production" />
                  <TaskRow icon="ri-error-warning-line" color="ant-error" label="Error queue cần xử lý" count={errorQueueCount} link="/internal-qm/error-queue" />
                  <TaskRow icon="ri-shield-user-line" color="ant-xk" label="Override FEFO pending" count={0} />
                  <TaskRow icon="ri-file-chart-line" color="ant-qm" label="Báo cáo ca" count={1} />
                </div>
              </div>

              {/* Operational Warnings */}
              {(loBiKhoaQC.length > 0 || errorQueueCount > 0) && (
                <div className="bg-ant-card rounded-2xl border border-gray-100 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider">Cảnh báo vận hành</h3>
                  {loBiKhoaQC.length > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-ant-error/5 border border-ant-error/10">
                      <div className="w-8 h-8 rounded-lg bg-ant-error/10 flex items-center justify-center shrink-0">
                        <i className="ri-lock-line text-ant-error text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ant-error">{loBiKhoaQC.length} lô Blocked Stock</p>
                        <p className="text-xxs text-ant-text-secondary">Không thể xuất kho — cần xử lý QM</p>
                      </div>
                    </div>
                  )}
                  {errorQueueCount > 0 && (
                    <Link to="/internal-qm/error-queue" className="no-cs-mega flex items-center gap-3 p-3 rounded-xl bg-ant-warning/5 border border-ant-warning/10 active:scale-[0.98] transition-all">
                      <div className="w-8 h-8 rounded-lg bg-ant-warning/10 flex items-center justify-center shrink-0">
                        <i className="ri-close-circle-line text-ant-warning text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-ant-warning">{errorQueueCount} lỗi trong Error Queue</p>
                        <p className="text-xxs text-ant-text-secondary">Cần xử lý ngay</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-ant-text-secondary" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* --- KẾ TOÁN KHO --- */}
          {roleId === 'ke-toan-kho' && (
            <>
              <div className="bg-ant-nk rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-file-chart-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Chứng từ hôm nay</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon="ri-file-list-3-line" color="nk" label="Phiếu nhập kho" value={state.rawMaterialReceipts.length} sub="Nguyên liệu & TP" />
                  <SummaryCard icon="ri-truck-line" color="xk" label="Đã xuất bến" value={state.outboundDeliveries.filter((o) => o.status === 'Đã xuất bến').length} sub="Chờ hóa đơn" highlight />
                  <SummaryCard icon="ri-ship-line" color="qm" label="Đang loading" value={state.outboundDeliveries.filter((o) => o.status === 'Đang loading').length} sub="Container" />
                  <SummaryCard icon="ri-arrow-left-right-line" color="offline" label="Điều chuyển" value={state.transferOrders.length} sub="Nội bộ" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Tra cứu nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-bill-line" color="nk" label="Nhập kho" onClick={() => navigate('/inbound')} />
                  <QuickBtn icon="ri-receipt-line" color="xk" label="Xuất kho" onClick={() => navigate('/outbound')} />
                  <QuickBtn icon="ri-ship-line" color="xk" label="Xuất bến" onClick={() => navigate('/outbound')} />
                  <QuickBtn icon="ri-file-chart-line" color="qm" label="Chứng từ" onClick={() => navigate('/accounting')} />
                </div>
              </div>

              {/* OD đã xuất bến + sẵn sàng xuất hóa đơn */}
              {state.outboundDeliveries.filter((o) => o.status === 'Đã xuất bến').length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Sẵn sàng xuất hóa đơn mock</h3>
                  <div className="space-y-1.5">
                    {state.outboundDeliveries.filter((o) => o.status === 'Đã xuất bến').map((od) => (
                      <Link key={od.id} to={`/outbound/container-loading/${od.id}`} className="no-cs-mega flex items-center gap-3 bg-ant-card rounded-2xl border border-ant-sx/20 px-4 py-3 active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-ant-sx/10 flex items-center justify-center shrink-0">
                            <i className="ri-bill-line text-ant-sx text-sm" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ant-text">{od.id}</p>
                            <p className="text-xs text-ant-text-secondary truncate">{od.customer} · Container {od.container} · Seal {od.seal}</p>
                          </div>
                        </div>
                        <span className="h-9 px-3 rounded-xl bg-ant-sx/10 text-ant-sx text-xxs font-bold inline-flex items-center justify-center whitespace-nowrap shrink-0">Xuất hóa đơn</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* --- ADMIN --- */}
          {roleId === 'admin' && (
            <>
              <div className="bg-ant-qm rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <i className="ri-admin-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Xin chào, {state.currentUser}</p>
                    <p className="text-xs text-white/70">{roleHint.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Tổng quan hệ thống</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon="ri-file-list-3-line" color="sx" label="Lệnh SX" value={poToday.length} sub="PO đang hoạt động" />
                  <SummaryCard icon="ri-layout-grid-line" color="nk" label="Pallet" value={state.handlingUnits.length} sub="HU trong hệ thống" />
                  <SummaryCard icon="ri-error-warning-line" color="error" label="Error Queue" value={errorQueueCount} sub="Cần xử lý" />
                  <SummaryCard icon="ri-cloud-line" color="offline" label="Offline Queue" value={queuePending} sub="Chờ đồng bộ" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Thao tác nhanh</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <QuickBtn icon="ri-shield-keyhole-line" color="qm" label="Ma trận RBAC" onClick={() => navigate('/settings#rbac-matrix')} />
                  <QuickBtn icon="ri-send-plane-line" color="sx" label="Phát lệnh SX" onClick={() => navigate('/production')} />
                  <QuickBtn icon="ri-error-warning-line" color="error" label="Error Queue" onClick={() => navigate('/internal-qm/error-queue')} />
                  <QuickBtn icon="ri-arrow-up-down-line" color="xk" label="FEFO" onClick={() => navigate('/outbound/fefo-picking/OD-2026-0098')} />
                  <QuickBtn icon="ri-shield-check-line" color="qm" label="QM Hold" onClick={() => navigate('/internal-qm/qm-hold')} />
                  <QuickBtn icon="ri-bar-chart-line" color="sx" label="Báo cáo" onClick={() => navigate('/reports')} />
                  <QuickBtn icon="ri-dashboard-line" color="nk" label="Dashboard" onClick={() => navigate('/admin')} />
                </div>
              </div>

              {/* Operational Warnings */}
              {(loBiKhoaQC.length > 0 || errorQueueCount > 0) && (
                <div className="bg-ant-card rounded-2xl border border-gray-100 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider">Cảnh báo vận hành</h3>
                  {loBiKhoaQC.length > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-ant-error/5 border border-ant-error/10">
                      <div className="w-8 h-8 rounded-lg bg-ant-error/10 flex items-center justify-center shrink-0">
                        <i className="ri-lock-line text-ant-error text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ant-error">{loBiKhoaQC.length} lô Blocked Stock</p>
                        <p className="text-xxs text-ant-text-secondary">Không thể xuất kho</p>
                      </div>
                    </div>
                  )}
                  {errorQueueCount > 0 && (
                    <Link to="/internal-qm/error-queue" className="no-cs-mega flex items-center gap-3 p-3 rounded-xl bg-ant-warning/5 border border-ant-warning/10 active:scale-[0.98] transition-all">
                      <div className="w-8 h-8 rounded-lg bg-ant-warning/10 flex items-center justify-center shrink-0">
                        <i className="ri-close-circle-line text-ant-warning text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-ant-warning">{errorQueueCount} lỗi trong Error Queue</p>
                        <p className="text-xxs text-ant-text-secondary">Cần Quản đốc hoặc Admin xử lý</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-ant-text-secondary" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========== PHÂN HỆ (tabs available for role) ========== */}
          <div>
            <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Phân hệ</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/production', tab: 'production', icon: 'ri-tools-line', label: 'Sản xuất', colorBg: 'bg-ant-sx' },
                { to: '/inbound', tab: 'inbound', icon: 'ri-archive-drawer-line', label: 'Nhập kho', colorBg: 'bg-ant-nk' },
                { to: '/outbound', tab: 'outbound', icon: 'ri-truck-line', label: 'Xuất kho', colorBg: 'bg-ant-xk' },
                { to: '/internal-qm', tab: 'internal-qm', icon: 'ri-shield-check-line', label: 'Nội bộ & QM', colorBg: 'bg-ant-qm' },
              ].filter((item) => canAccessTab(roleId, item.tab)).map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className="no-cs-mega flex flex-col items-center gap-2 py-3.5 rounded-xl bg-ant-card border border-gray-100 active:scale-95 transition-all hover:border-gray-200"
                >
                  <div className={`w-9 h-9 rounded-xl ${tab.colorBg} flex items-center justify-center`}>
                    <i className={`${tab.icon} text-white text-sm`} />
                  </div>
                  <span className="text-xxs font-semibold text-ant-text">{tab.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({ icon, color, label, value, sub, highlight }: { icon: string; color: string; label: string; value: number; sub: string; highlight?: boolean }) {
  return (
    <div className={`summary-card bg-ant-card rounded-2xl border min-h-[104px] cursor-default flex flex-col justify-between p-3 ${highlight ? 'border-ant-warning/30 bg-ant-warning/5' : 'border-gray-100'}`}>
      <div className="flex items-start gap-2">
        <div className={`w-7 h-7 rounded-lg bg-${color === 'warning' ? 'ant-warning' : color === 'error' ? 'ant-error' : color === 'offline' ? 'ant-offline' : color === 'sync' ? 'ant-sync' : color === 'qm' ? 'ant-qm' : `ant-${color}`}/10 flex items-center justify-center shrink-0`}>
          <i className={`${icon} text-${color === 'warning' ? 'ant-warning' : color === 'error' ? 'ant-error' : color === 'offline' ? 'ant-offline' : color === 'sync' ? 'ant-sync' : color === 'qm' ? 'ant-qm' : `ant-${color}`} text-xs`} />
        </div>
        <span className="text-xs text-ant-text-secondary font-semibold leading-snug line-clamp-2 min-h-[28px]">{label}</span>
      </div>
      <div>
        <p className={`summary-value text-xl font-bold leading-none ${highlight ? 'text-ant-warning' : 'text-ant-text'}`}>{value}</p>
        <p className="text-xxs text-ant-text-secondary mt-1.5 leading-snug line-clamp-2">{sub}</p>
      </div>
    </div>
  );
}

function QuickBtn({ icon, color, label, onClick }: { icon: string; color: string; label: string; onClick: () => void }) {
  const colorMap: Record<string, string> = { sx: 'ant-sx', nk: 'ant-nk', xk: 'ant-xk', qm: 'ant-qm', error: 'ant-error', offline: 'ant-offline', warning: 'ant-warning' };
  const c = colorMap[color] || 'ant-sx';
  return (
    <button onClick={onClick} className="quick-btn flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-ant-card border border-gray-100 min-w-[80px] h-[84px] active:scale-95 transition-all hover:border-gray-200 cursor-pointer shrink-0">
      <div className={`w-9 h-9 rounded-xl bg-${c}/10 flex items-center justify-center`}>
        <i className={`${icon} text-${c} text-base`} />
      </div>
      <span className="text-xxs font-semibold text-ant-text text-center leading-tight line-clamp-2">{label}</span>
    </button>
  );
}

function TaskRow({ icon, color, label, count, link }: { icon: string; color: string; label: string; count: number; link?: string }) {
  const content = (
    <div className="flex items-center justify-between bg-ant-card rounded-xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-lg bg-${color}/10 flex items-center justify-center shrink-0`}>
          <i className={`${icon} text-${color} text-sm`} />
        </div>
        <span className="text-sm font-medium text-ant-text truncate">{label}</span>
      </div>
      <span className={`ml-2 min-w-[28px] h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${count > 0 ? `bg-${color}/10 text-${color}` : 'bg-gray-100 text-ant-text-secondary'}`}>
        {count}
      </span>
    </div>
  );
  if (link && count > 0) return <Link to={link} className="block">{content}</Link>;
  return content;
}
