import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';
import ModuleCard from '@/components/feature/ModuleCard';
import ActivityFeed from '@/components/feature/ActivityFeed';

export default function InternalQMPage() {
  const { state } = useApp();

  const qhActive = state.qualityHolds.filter((q) => q.status === 'Đang giữ' || q.status === 'Đã khóa');
  const blockedBatches = state.batches.filter((b) => b.status === 'Blocked Stock');
  const transfersInTransit = state.transferOrders.filter((t) => t.status.includes('Transit') || t.status === 'Đang vận chuyển');
  const cycleCountsToday = state.cycleCounts.filter((c) => c.createdDate === '2026-06-16');
  const errorQueueCount = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;

  return (
    <div className="p-4 space-y-4 min-h-screen bg-ant-bg">
      {/* Banner */}
      <div className="bg-ant-qm rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i className="ri-shield-check-line text-sm" />
          </div>
          <span className="text-xs font-bold opacity-80 uppercase tracking-wider">NỘI BỘ &amp; QM</span>
        </div>
        <h2 className="text-xl font-bold">Điều chuyển &amp; Quản lý Chất lượng</h2>
        <p className="text-xs text-white/60 mt-1.5">Liên nhà máy · QM Hold · Cycle Counting</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2.5">
        <SummaryBadge icon="ri-error-warning-line" color="error" label="QM Hold đang mở" value={qhActive.length} />
        <SummaryBadge icon="ri-lock-line" color="error" label="Blocked Stock" value={blockedBatches.length} />
        <SummaryBadge icon="ri-arrow-left-right-line" color="qm" label="Đang vận chuyển" value={transfersInTransit.length} />
        <SummaryBadge icon="ri-clipboard-line" color="sx" label="Kiểm kê hôm nay" value={cycleCountsToday.length} />
      </div>

      {/* Nav Cards */}
      <div>
        <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Nghiệp vụ</h3>
        <div className="space-y-2">
          <ModuleCard
            to="/internal-qm/qm-hold" icon="ri-error-warning-line" label="QM Hold / Blocked Stock"
            sub="Khóa lô chất lượng — Khẩn cấp" badge={`${qhActive.length}`} color="error"
          />
          <ModuleCard
            to="/internal-qm/transfer-order" icon="ri-arrow-left-right-line" label="Điều chuyển liên NM"
            sub="Chuyển hàng Mỹ An → Bình Khánh" badge={`${transfersInTransit.length}`} color="qm"
          />
          <ModuleCard
            to="/internal-qm/receive-transfer" icon="ri-archive-drawer-line" label="Xác nhận nhận hàng"
            sub="Nhà máy đích xác nhận" badge={`${transfersInTransit.length}`} color="nk"
          />
          <ModuleCard
            to="/internal-qm/cycle-count" icon="ri-clipboard-line" label="Cycle Counting"
            sub="Kiểm kê chu kỳ ô kệ" badge={`${cycleCountsToday.length}`} color="sx"
          />
          <ModuleCard
            to="/internal-qm/defect-codes" icon="ri-file-list-3-line" label="Danh sách Defect Code"
            sub="10 mã lỗi chuẩn QM" color="offline"
          />
          <ModuleCard
            to="/internal-qm/error-queue" icon="ri-close-circle-line" label="Error Queue Resolver"
            sub="Xử lý lỗi đồng bộ — Quản đốc"
            badge={errorQueueCount > 0 ? `${errorQueueCount}` : ''} color="error"
          />
        </div>
      </div>

      {/* Blocked Stock Warning */}
      {blockedBatches.length > 0 && (
        <div className="bg-ant-error/5 rounded-2xl border border-ant-error/20 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-ant-error/10 flex items-center justify-center">
              <i className="ri-lock-line text-ant-error text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ant-error">Blocked Stock — Liên thông Xuất kho</h3>
              <p className="text-xxs text-ant-text-secondary">Các batch bị khóa sẽ bị chặn trong phân hệ Xuất kho (FEFO Picking)</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {blockedBatches.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-ant-card border border-ant-error/10">
                <span className="text-xs font-mono font-bold text-ant-error">{b.id}</span>
                <span className="text-xxs text-ant-text-secondary truncate mx-2">{b.product}</span>
                <StatusBadge variant="error" label="BLOCKED" size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <ActivityFeed compact maxItems={5} />
      <div className="h-4" />
    </div>
  );
}

function SummaryBadge({ icon, color, label, value }: { icon: string; color: string; label: string; value: number }) {
  return (
    <div className="bg-ant-card rounded-xl border border-gray-100 p-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-ant-${color}/10 flex items-center justify-center shrink-0`}>
        <i className={`${icon} text-ant-${color} text-sm`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ant-text-secondary truncate">{label}</p>
        <p className={`text-xl font-bold ${value > 0 ? `text-ant-${color}` : 'text-ant-text-secondary'}`}>{value}</p>
      </div>
    </div>
  );
}