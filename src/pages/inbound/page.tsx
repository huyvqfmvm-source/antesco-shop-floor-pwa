import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';
import ModuleCard from '@/components/feature/ModuleCard';
import ProcessStepper from '@/components/base/ProcessStepper';

export default function InboundPage() {
  const { state } = useApp();

  const plantCode = state.plant?.code || 'MA';
  const plantHUs = state.handlingUnits.filter((hu) => hu.plant === plantCode);
  const pendingReceiving = plantHUs.filter((hu) => hu.status === 'Chờ nhập kho' || hu.status === 'Chờ nhập kho TP');
  const pendingPutaway = plantHUs.filter((hu) => hu.status === 'Chờ putaway');
  const completedHUs = plantHUs.filter((hu) => hu.status === 'Đã xếp kệ');
  const plantRMs = state.rawMaterialReceipts.filter((r) => r.plant === plantCode);

  const statusBadgeVariant = (status: string): 'nk' | 'warning' | 'success' | 'offline' | 'qm' => {
    switch (status) {
      case 'Chờ nhập kho': case 'Chờ nhập kho TP': return 'nk';
      case 'Chờ putaway': return 'warning';
      case 'Đã xếp kệ': return 'success';
      case 'Chờ đồng bộ putaway': return 'offline';
      case 'Chờ đồng bộ': return 'offline';
      default: return 'qm';
    }
  };

  return (
    <div className="p-4 space-y-4 min-h-screen bg-ant-bg">
      {/* Banner */}
      <div className="bg-ant-nk rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i className="ri-archive-drawer-line text-sm" />
          </div>
          <span className="text-xs font-bold opacity-80 uppercase tracking-wider">NHẬP KHO</span>
        </div>
        <h2 className="text-xl font-bold">Quy trình nhập kho</h2>
        <p className="text-xs text-white/60 mt-1.5">{state.plant?.name} · {plantHUs.length} pallet</p>
      </div>

      {/* Process Stepper */}
      <ProcessStepper
        steps={[
          { label: 'Tiếp nhận NL', done: true, color: 'nk' },
          { label: 'Nhập kho TP', active: true, color: 'nk' },
          { label: 'Putaway', color: 'nk' },
          { label: 'Hoàn tất', color: 'nk' },
        ]}
      />

      {/* Nav Cards */}
      <div>
        <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2.5">Nghiệp vụ nhập kho</h3>
        <div className="space-y-2">
          <ModuleCard
            to="/inbound/receive-rm" icon="ri-leaf-line" label="Tiếp nhận nguyên liệu tươi"
            sub="Quét PO · OCR xe & phiếu cân · Nhập QC"
            badge={plantRMs.length > 0 ? `${plantRMs.length} phiếu` : 'Mới'} color="sx"
          />
          <ModuleCard
            to="/inbound/fg-receiving" icon="ri-archive-drawer-line" label="Nhập kho thành phẩm & Đồng kiểm"
            sub="Quét pallet · OCR bảng kê · Đồng kiểm · Ký bàn giao"
            badge={pendingReceiving.length > 0 ? `${pendingReceiving.length} chờ` : 'Sẵn sàng'} color="nk"
          />
          <ModuleCard
            to="/inbound/putaway" icon="ri-layout-grid-line" label="Hướng dẫn Putaway"
            sub="Quét pallet · Quét ô kệ · Xác nhận xếp hàng"
            badge={pendingPutaway.length > 0 ? `${pendingPutaway.length} chờ` : 'Sẵn sàng'} color="warning"
          />
          <ModuleCard
            to="/inbound/pending" icon="ri-file-list-3-line" label="Danh sách pallet chờ xử lý"
            sub="Lọc theo kho · trạng thái · nhà máy"
            badge={`${pendingReceiving.length + pendingPutaway.length} pallet`} color="qm"
          />
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Tổng quan pallet — {state.plant?.name || ''}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <MiniStat icon="ri-archive-drawer-line" color="ant-nk" label="Chờ nhập kho" value={pendingReceiving.length} />
          <MiniStat icon="ri-layout-grid-line" color="ant-warning" label="Chờ putaway" value={pendingPutaway.length} />
          <MiniStat icon="ri-check-line" color="ant-sx" label="Đã xếp kệ" value={completedHUs.length} />
          <MiniStat icon="ri-cloud-line" color="ant-offline" label="Lỗi đồng bộ" value={plantHUs.filter((hu) => hu.status === 'Chờ đồng bộ' || hu.status === 'Chờ đồng bộ putaway').length} />
        </div>
      </div>

      {/* Recent HUs */}
      <div className="bg-ant-card rounded-2xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Pallet gần đây — {plantCode}</h3>
        <div className="space-y-1.5">
          {plantHUs.slice(0, 5).map((hu) => (
            <div key={hu.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-bold text-ant-text truncate">{hu.id}</p>
                <p className="text-xxs text-ant-text-secondary">{hu.product} · {hu.qty.toLocaleString()} {hu.unit}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {hu.location && (
                  <span className="text-xxs text-ant-text-secondary bg-gray-50 px-2 py-0.5 rounded-full font-mono">{hu.location}</span>
                )}
                <StatusBadge variant={statusBadgeVariant(hu.status)} label={hu.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function MiniStat({ icon, color, label, value }: { icon: string; color: string; label: string; value: number }) {
  return (
    <div className={`bg-${color}/5 rounded-xl p-3 border border-${color}/10`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-6 h-6 rounded-lg bg-${color}/20 flex items-center justify-center`}>
          <i className={`${icon} text-xs text-${color}`} />
        </div>
        <span className="text-xxs text-ant-text-secondary font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold text-${color}`}>{value}</p>
    </div>
  );
}
