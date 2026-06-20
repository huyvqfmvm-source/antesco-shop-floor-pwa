import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';

export default function AdminDashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('today');

  // System stats
  const totalPOs = state.productionOrders.length;
  const activePOs = state.productionOrders.filter((p) => p.status === 'STRT').length;
  const totalHUs = state.handlingUnits.length;
  const totalBatches = state.batches.length;
  const totalUsers = state.registeredUsers.length;
  const blockedBatches = state.batches.filter((b) => b.status === 'Blocked Stock').length;
  const qhActive = state.qualityHolds.filter((q) => q.status === 'Đang giữ' || q.status === 'Đã khóa').length;
  const errorPending = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;
  const offlinePending = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved' || q.status === 'Pending User Confirm' || q.status === 'Ready To Sync').length;
  const completedODs = state.outboundDeliveries.filter((od) => od.status === 'Đã xuất bến').length;
  const totalRMs = state.rawMaterialReceipts.length;

  // PO by status
  const poByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    state.productionOrders.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return map;
  }, [state.productionOrders]);

  // Plant stats
  const plantStats = useMemo(() => {
    const plants = ['MA', 'BK'];
    return plants.map((plant) => {
      const pos = state.productionOrders.filter((p) => p.plant === plant);
      const hus = state.handlingUnits.filter((h) => h.plant === plant);
      const oqs = state.offlineQueue.filter((q) => q.plant === plant);
      return {
        plant,
        name: plant === 'MA' ? 'Mỹ An' : 'Bình Khánh',
        poCount: pos.length,
        huCount: hus.length,
        activePOs: pos.filter((p) => p.status === 'STRT').length,
        offlineQueue: oqs.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length,
      };
    });
  }, [state.productionOrders, state.handlingUnits, state.offlineQueue]);

  // Recent activities
  const recentActivities = state.activityLogs.slice(0, 8);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    state.registeredUsers.forEach((u) => { map[u.role] = (map[u.role] || 0) + 1; });
    return map;
  }, [state.registeredUsers]);

  const statusLabel: Record<string, string> = {
    'cong-nhan-san-xuat': 'CN SX', 'thu-kho': 'Thủ kho', 'kcs-qm': 'KCS/QM',
    'ky-thuat': 'Kỹ thuật', 'quan-doc': 'Quản đốc', 'ke-toan-kho': 'Kế toán', 'admin': 'Admin',
  };

  const statusColor: Record<string, string> = {
    'cong-nhan-san-xuat': 'bg-ant-sx', 'thu-kho': 'bg-ant-nk', 'kcs-qm': 'bg-ant-qm',
    'ky-thuat': 'bg-ant-offline', 'quan-doc': 'bg-ant-xk', 'ke-toan-kho': 'bg-ant-warning', 'admin': 'bg-ant-error',
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Dashboard Admin</h1>
          <p className="text-xxs text-ant-text-secondary truncate">Tổng quan toàn hệ thống ANTECO</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTimeRange('today')}
            className={`h-8 px-2.5 rounded-lg text-xxs font-bold transition-all ${timeRange === 'today' ? 'bg-ant-sx text-white' : 'bg-gray-100 text-ant-text-secondary'}`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`h-8 px-2.5 rounded-lg text-xxs font-bold transition-all ${timeRange === 'week' ? 'bg-ant-sx text-white' : 'bg-gray-100 text-ant-text-secondary'}`}
          >
            Tuần
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* KPI Top Row */}
        <div className="grid grid-cols-4 gap-2">
          <KpiCard label="Lệnh SX" value={totalPOs} sub={`${activePOs} đang chạy`} icon="ri-file-list-3-line" color="sx" />
          <KpiCard label="Pallet" value={totalHUs} sub={`${totalBatches} batch`} icon="ri-stack-line" color="nk" />
          <KpiCard label="Người dùng" value={totalUsers} sub="7 roles" icon="ri-team-line" color="qm" />
          <KpiCard label="Phiếu xuất" value={completedODs} sub="đã xuất bến" icon="ri-truck-line" color="xk" />
        </div>

        {/* Alerts Row */}
        {(errorPending > 0 || offlinePending > 0 || blockedBatches > 0 || qhActive > 0) && (
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {errorPending > 0 && (
              <Link to="/internal-qm/error-queue" className="h-10 px-3 rounded-xl bg-ant-error/10 text-ant-error text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all">
                <div className="w-2 h-2 rounded-full bg-ant-error animate-pulse" />
                Error Queue: {errorPending}
                <i className="ri-arrow-right-s-line" />
              </Link>
            )}
            {offlinePending > 0 && (
              <div className="h-10 px-3 rounded-xl bg-ant-offline/10 text-ant-offline text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <i className="ri-cloud-off-line text-sm" />
                Offline Queue: {offlinePending}
              </div>
            )}
            {blockedBatches > 0 && (
              <Link to="/internal-qm/qm-hold" className="h-10 px-3 rounded-xl bg-ant-error/10 text-ant-error text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all">
                <i className="ri-lock-line text-sm" />
                Blocked Stock: {blockedBatches}
                <i className="ri-arrow-right-s-line" />
              </Link>
            )}
            {qhActive > 0 && (
              <Link to="/internal-qm/qm-hold" className="h-10 px-3 rounded-xl bg-ant-warning/10 text-ant-warning text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all">
                <i className="ri-shield-flash-line text-sm" />
                QM Hold: {qhActive}
                <i className="ri-arrow-right-s-line" />
              </Link>
            )}
          </div>
        )}

        {/* Plant comparison */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-building-line text-ant-sx text-sm" />
            Tổng quan theo nhà máy
          </h3>
          <div className="space-y-3">
            {plantStats.map((ps) => (
              <div key={ps.plant} className="bg-ant-bg rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-ant-text">{ps.name}</span>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${ps.plant === 'MA' ? 'bg-ant-sx/10 text-ant-sx' : 'bg-ant-nk/10 text-ant-nk'}`}>
                    {ps.plant}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-ant-text">{ps.poCount}</p>
                    <p className="text-xxs text-ant-text-secondary">PO</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-ant-text">{ps.huCount}</p>
                    <p className="text-xxs text-ant-text-secondary">Pallet</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-ant-sx">{ps.activePOs}</p>
                    <p className="text-xxs text-ant-text-secondary">Đang SX</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${ps.offlineQueue > 0 ? 'text-ant-offline' : 'text-ant-text-secondary'}`}>{ps.offlineQueue}</p>
                    <p className="text-xxs text-ant-text-secondary">Offline Q</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PO Status Distribution */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3">Phân bố lệnh SX</h3>
          <div className="space-y-2">
            {[
              { key: 'CRTD', label: 'Đã tạo', color: 'bg-gray-400' },
              { key: 'REL', label: 'Đã phát hành', color: 'bg-ant-nk' },
              { key: 'STRT', label: 'Đang SX', color: 'bg-ant-sx' },
              { key: 'CNF', label: 'Đã xác nhận', color: 'bg-ant-warning' },
              { key: 'TECO', label: 'Hoàn tất', color: 'bg-ant-success' },
            ].map((item) => {
              const count = poByStatus[item.key] || 0;
              const pct = totalPOs > 0 ? Math.round((count / totalPOs) * 100) : 0;
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="text-xs text-ant-text-secondary w-28">{item.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-ant-text w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-shield-keyhole-line text-ant-qm text-sm" />
            Phân bố người dùng ({totalUsers})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <Link
                key={role}
                to="/settings#rbac-matrix"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-ant-bg border border-gray-100 hover:border-gray-200 active:scale-95 transition-all"
              >
                <div className={`w-6 h-6 rounded-md ${statusColor[role] || 'bg-gray-400'} flex items-center justify-center`}>
                  <span className="text-white text-xxs font-bold">{count}</span>
                </div>
                <span className="text-xs font-medium text-ant-text">{statusLabel[role] || role}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-archive-line text-ant-nk text-sm" />
            Tổng quan kho
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-ant-bg rounded-xl p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-ant-nk/20 flex items-center justify-center mb-1.5">
                <i className="ri-file-list-3-line text-ant-nk text-sm" />
              </div>
              <p className="text-lg font-bold text-ant-nk">{totalRMs}</p>
              <p className="text-xxs text-ant-text-secondary">Phiếu nhập NL</p>
            </div>
            <div className="bg-ant-bg rounded-xl p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-ant-xk/20 flex items-center justify-center mb-1.5">
                <i className="ri-truck-line text-ant-xk text-sm" />
              </div>
              <p className="text-lg font-bold text-ant-xk">{completedODs}</p>
              <p className="text-xxs text-ant-text-secondary">Đã xuất bến</p>
            </div>
            <div className="bg-ant-bg rounded-xl p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-ant-sx/20 flex items-center justify-center mb-1.5">
                <i className="ri-stack-line text-ant-sx text-sm" />
              </div>
              <p className="text-lg font-bold text-ant-sx">{totalHUs}</p>
              <p className="text-xxs text-ant-text-secondary">Tổng pallet</p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-heart-pulse-line text-ant-xk text-sm" />
            Sức khỏe hệ thống
          </h3>
          <div className="space-y-2">
            <SystemHealthRow label="Error Queue" value={errorPending} max={10} icon="ri-error-warning-line" color="error" link="/internal-qm/error-queue" />
            <SystemHealthRow label="Offline Queue" value={offlinePending} max={10} icon="ri-cloud-off-line" color="offline" />
            <SystemHealthRow label="Blocked Stock" value={blockedBatches} max={10} icon="ri-lock-line" color="error" link="/internal-qm/qm-hold" />
            <SystemHealthRow label="QM Hold đang mở" value={qhActive} max={10} icon="ri-shield-flash-line" color="warning" link="/internal-qm/qm-hold" />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-history-line text-ant-qm text-sm" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-1.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-ant-bg">
                <div className="w-7 h-7 rounded-full bg-ant-sx/10 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-record-circle-line text-ant-sx text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ant-text">{act.user}</span>
                    <span className="text-xxs text-ant-text-secondary bg-gray-100 px-1.5 py-0.5 rounded-full">{act.role}</span>
                  </div>
                  <p className="text-xs text-ant-text-secondary mt-0.5">{act.action}: {act.detail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xxs text-ant-text-secondary">{act.timestamp}</span>
                    <span className="text-xxs font-mono text-ant-text-secondary">{act.plant}</span>
                    {act.beforeStatus && act.afterStatus && (
                      <span className="text-xxs text-ant-text-secondary">
                        {act.beforeStatus} → <span className="font-medium text-ant-sx">{act.afterStatus}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3">Quick Admin Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink to="/settings#rbac-matrix" icon="ri-shield-keyhole-line" color="qm" label="Ma trận RBAC" />
            <QuickLink to="/settings" icon="ri-settings-3-line" color="offline" label="Cài đặt hệ thống" />
            <QuickLink to="/reports" icon="ri-bar-chart-line" color="sx" label="Báo cáo" />
            <QuickLink to="/internal-qm/error-queue" icon="ri-error-warning-line" color="error" label={errorPending > 0 ? `Error Queue (${errorPending})` : 'Error Queue'} />
            <QuickLink to="/accounting" icon="ri-bill-line" color="nk" label="Kế toán kho" />
            <QuickLink to="/production/device-check" icon="ri-tools-line" color="xk" label="Kiểm tra thiết bị" />
            <QuickLink to="/production/temperature-alerts" icon="ri-temp-cold-line" color="warning" label="Cảnh báo nhiệt độ" />
            <QuickLink to="/production/utility" icon="ri-plug-line" color="offline" label="Utility Log" />
          </div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, color }: { label: string; value: number; sub: string; icon: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sx: { bg: 'bg-ant-sx/10', text: 'text-ant-sx', border: 'border-ant-sx/10' },
    nk: { bg: 'bg-ant-nk/10', text: 'text-ant-nk', border: 'border-ant-nk/10' },
    qm: { bg: 'bg-ant-qm/10', text: 'text-ant-qm', border: 'border-ant-qm/10' },
    xk: { bg: 'bg-ant-xk/10', text: 'text-ant-xk', border: 'border-ant-xk/10' },
  };
  const c = colorMap[color] || colorMap.sx;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-3 text-center`}>
      <div className="w-6 h-6 mx-auto rounded-md bg-white flex items-center justify-center mb-1.5">
        <i className={`${icon} ${c.text} text-xs`} />
      </div>
      <p className={`text-xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xxs text-ant-text-secondary">{sub}</p>
    </div>
  );
}

function SystemHealthRow({ label, value, max, icon, color, link }: { label: string; value: number; max: number; icon: string; color: string; link?: string }) {
  const colorMap: Record<string, { bar: string; bg: string; text: string }> = {
    error: { bar: 'bg-ant-error', bg: 'bg-ant-error/10', text: 'text-ant-error' },
    offline: { bar: 'bg-ant-offline', bg: 'bg-ant-offline/10', text: 'text-ant-offline' },
    warning: { bar: 'bg-ant-warning', bg: 'bg-ant-warning/10', text: 'text-ant-warning' },
    sx: { bar: 'bg-ant-sx', bg: 'bg-ant-sx/10', text: 'text-ant-sx' },
  };
  const c = colorMap[color] || colorMap.sx;
  const pct = Math.min(100, Math.round((value / max) * 100));
  const content = (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
        <i className={`${icon} ${c.text} text-xs`} />
      </div>
      <span className="text-xs text-ant-text-secondary flex-1">{label}</span>
      <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold ${value > 0 ? c.text : 'text-ant-text-secondary'} w-6 text-right`}>{value}</span>
    </div>
  );
  if (link && value > 0) return <Link to={link} className="no-cs-mega block bg-ant-bg rounded-xl p-2.5 active:scale-[0.98] transition-all">{content}</Link>;
  return <div className="bg-ant-bg rounded-xl p-2.5">{content}</div>;
}

function QuickLink({ to, icon, color, label }: { to: string; icon: string; color: string; label: string }) {
  const colorMap: Record<string, string> = {
    qm: 'bg-ant-qm/10 text-ant-qm', sx: 'bg-ant-sx/10 text-ant-sx', nk: 'bg-ant-nk/10 text-ant-nk',
    xk: 'bg-ant-xk/10 text-ant-xk', error: 'bg-ant-error/10 text-ant-error', warning: 'bg-ant-warning/10 text-ant-warning',
    offline: 'bg-ant-offline/10 text-ant-offline',
  };
  const c = colorMap[color] || colorMap.sx;
  return (
    <Link to={to} className="no-cs-mega flex items-center gap-2.5 px-3 py-3 rounded-xl bg-ant-bg border border-gray-100 hover:border-gray-200 active:scale-95 transition-all">
      <div className={`w-8 h-8 rounded-lg ${c} flex items-center justify-center`}>
        <i className={`${icon} text-sm`} />
      </div>
      <span className="text-xs font-medium text-ant-text">{label}</span>
      <i className="ri-arrow-right-s-line text-ant-text-secondary ml-auto" />
    </Link>
  );
}