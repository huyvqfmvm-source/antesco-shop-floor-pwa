import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  CRTD: { label: 'Đã tạo', color: 'text-ant-qm', bg: 'bg-ant-qm/10', step: 0 },
  REL: { label: 'Đã phát hành', color: 'text-ant-nk', bg: 'bg-ant-nk/10', step: 1 },
  STRT: { label: 'Đang sản xuất', color: 'text-ant-sync', bg: 'bg-ant-sync/10', step: 2 },
  CNF: { label: 'Đã xác nhận', color: 'text-ant-warning', bg: 'bg-ant-warning/10', step: 3 },
  TECO: { label: 'Hoàn tất', color: 'text-ant-success', bg: 'bg-ant-success/10', step: 4 },
};

const PROCESS_STEPS = [
  { label: 'Đã tạo', icon: 'ri-file-add-line' },
  { label: 'Phát lệnh', icon: 'ri-send-plane-line' },
  { label: 'Cấp vật tư', icon: 'ri-archive-line' },
  { label: 'Ghi WIP', icon: 'ri-tools-line' },
  { label: 'Nhập kho TP', icon: 'ri-archive-drawer-line' },
  { label: 'Hoàn tất', icon: 'ri-check-double-line' },
];

export default function ProductionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addToast, addActivityLog } = useApp();
  const [confirming, setConfirming] = useState(false);

  const order = state.productionOrders.find((po) => po.id === id);
  const roleId = state.role?.id;

  if (!order) {
    return (
      <div className="p-4">
        <div className="bg-ant-card rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-error-warning-line text-xl text-ant-text-secondary" />
          </div>
          <p className="text-sm font-medium text-ant-text-secondary">Không tìm thấy lệnh sản xuất</p>
          <button onClick={() => navigate('/production')} className="mt-4 px-4 py-2.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-95 transition-all whitespace-nowrap">Quay lại danh sách</button>
        </div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.CRTD;
  const currentStep = sc.step;

  const canRelease = order.status === 'CRTD' && hasPermission(roleId, 'PRODUCTION_CREATE_ORDER');
  const canWip = hasPermission(roleId, 'PRODUCTION_WIP');
  const canPallet = hasPermission(roleId, 'PRODUCTION_PALLET');
  const canMaterial = hasPermission(roleId, 'PRODUCTION_MATERIAL') || hasPermission(roleId, 'PRODUCTION_CREATE_ORDER');
  const canConfirmFg = hasPermission(roleId, 'PRODUCTION_CONFIRM_FG') || hasPermission(roleId, 'PRODUCTION_CREATE_ORDER');

  const handleRelease = () => {
    if (!canRelease) {
      addToast('error', 'Bạn không có quyền phát lệnh sản xuất. Vui lòng liên hệ Quản đốc/Tổ trưởng.');
      return;
    }
    setConfirming(true);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_PRODUCTION_ORDER_STATUS', payload: { id: order.id, status: 'REL' } });
      addActivityLog(state.currentUser, state.role?.name || '', 'Phát lệnh SX', `PO ${order.id} — ${order.productName} · CRTD → REL`);
      addToast('success', `Đã phát hành lệnh sản xuất ${order.id}`);
      setConfirming(false);
    }, 600);
  };

  const navItems = [
    { to: `/production/material/${order.id}`, label: 'Cấp phát vật tư', icon: 'ri-archive-line', enabled: (order.status === 'REL' || order.status === 'STRT' || order.status === 'CNF' || order.status === 'TECO') && canMaterial, desc: 'Quét BOM & xác nhận vật tư', noPerm: !canMaterial, permKey: 'PRODUCTION_MATERIAL' as const },
    { to: `/production/wip/${order.id}`, label: 'Ghi nhận WIP', icon: 'ri-tools-line', enabled: (order.status === 'STRT' || order.status === 'CNF' || order.status === 'TECO') && canWip, desc: 'Nhập công đoạn & sản lượng', noPerm: !canWip, permKey: 'PRODUCTION_WIP' as const },
    { to: `/production/pallet/${order.id}`, label: 'Tạo pallet BTP', icon: 'ri-stack-line', enabled: (order.status === 'STRT' || order.status === 'CNF' || order.status === 'TECO') && canPallet, desc: 'Tạo HU & in tem QR', noPerm: !canPallet, permKey: 'PRODUCTION_PALLET' as const },
    { to: `/production/confirm/${order.id}`, label: 'Xác nhận thành phẩm', icon: 'ri-checkbox-circle-line', enabled: (order.status === 'STRT' || order.status === 'CNF' || order.status === 'TECO') && canConfirmFg, desc: 'Nhập SL đạt/phế & đóng lô', noPerm: !canConfirmFg, permKey: 'PRODUCTION_CONFIRM_FG' as const },
  ];

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => navigate('/production')} className="flex items-center gap-1.5 text-sm text-ant-text-secondary hover:text-ant-text transition-colors">
        <i className="ri-arrow-left-line" />Danh sách lệnh
      </button>

      <PermissionBanner
        module="Sản xuất"
        moduleIcon="ri-tools-line"
        moduleColor="sx"
        requiredPermissions={['PRODUCTION_CREATE_ORDER', 'PRODUCTION_WIP', 'PRODUCTION_PALLET', 'PRODUCTION_CONFIRM_FG', 'PRODUCTION_MATERIAL', 'PRODUCTION_VIEW']}
      />

      <div className="bg-ant-sx rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium opacity-70">CHI TIẾT LỆNH SX</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color} bg-white/20`}>{sc.label}</span>
        </div>
        <h2 className="text-lg font-bold">{order.id}</h2>
        <p className="text-sm text-white/80 mt-0.5">{order.productName}</p>
      </div>

      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Thông tin lệnh</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoRow label="Mã SP" value={order.productCode} />
          <InfoRow label="Kế hoạch" value={`${order.plannedQty.toLocaleString()} ${order.unit}`} highlight />
          <InfoRow label="Nhà máy" value={order.plant} />
          <InfoRow label="Bắt đầu" value={order.startDate} />
          <InfoRow label="Hoàn thành" value={order.dueDate} />
          {order.wipQty ? <InfoRow label="WIP hiện tại" value={`${order.wipQty.toLocaleString()} KG`} /> : null}
          {order.fgQty ? <InfoRow label="Thành phẩm đạt" value={`${order.fgQty.toLocaleString()} KG`} highlight /> : null}
        </div>
      </div>

      {/* Process Stepper */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-4">Tiến độ</h3>
        <div className="flex items-start">
          {PROCESS_STEPS.map((step, i) => {
            const isDone = i <= currentStep;
            const isCurrent = i === currentStep + 1 && currentStep < PROCESS_STEPS.length - 1;
            return (
              <div key={step.label} className="flex-1 flex flex-col items-center relative">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="absolute top-4 left-[calc(50%+12px)] w-[calc(100%-24px)] h-0.5 -translate-y-1/2">
                    <div className={`h-full ${i < currentStep ? 'bg-ant-sx' : 'bg-gray-200'}`} />
                  </div>
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-ant-sx text-white' : isCurrent ? 'bg-ant-sx/20 text-ant-sx border-2 border-ant-sx' : 'bg-gray-100 text-ant-text-secondary'}`}>
                  {isDone ? <i className="ri-check-line text-sm" /> : i + 1}
                </div>
                <span className={`text-xxs mt-1.5 text-center leading-tight max-w-[60px] ${isDone ? 'text-ant-sx font-medium' : isCurrent ? 'text-ant-sx font-medium' : 'text-ant-text-secondary'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phát lệnh button */}
      {order.status === 'CRTD' && (
        <>
          {canRelease ? (
            <button onClick={handleRelease} disabled={confirming} className={`w-full px-4 py-4 rounded-xl bg-ant-sx text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] whitespace-nowrap ${confirming ? 'opacity-70' : ''}`}>
              {confirming ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang phát lệnh...</> : <><div className="w-6 h-6 flex items-center justify-center"><i className="ri-send-plane-line text-lg" /></div>PHÁT LỆNH SẢN XUẤT</>}
            </button>
          ) : (
            <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center"><i className="ri-information-line text-ant-warning text-sm" /></div>
                <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('PRODUCTION_CREATE_ORDER')}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sub-module navigation */}
      <div>
        <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2">Thao tác</h3>
        <div className="space-y-2">
          {navItems.map((item) => (
            <button key={item.to} onClick={() => item.enabled && navigate(item.to)} disabled={!item.enabled}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${item.enabled ? 'bg-ant-card border-gray-100 hover:border-ant-sx/30 active:scale-[0.98]' : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.enabled ? 'bg-ant-sx/10' : 'bg-gray-100'}`}>
                <i className={`${item.icon} text-sm ${item.enabled ? 'text-ant-sx' : 'text-ant-text-secondary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.enabled ? 'text-ant-text' : 'text-ant-text-secondary'}`}>{item.label}</p>
                <p className={`text-xxs ${item.noPerm ? 'text-ant-error' : 'text-ant-text-secondary'}`}>
                  {item.noPerm ? getPermissionExplanation(item.permKey!) : item.desc}
                </p>
              </div>
              {item.enabled ? <div className="w-6 h-6 flex items-center justify-center"><i className="ri-arrow-right-s-line text-ant-sx text-lg" /></div> : <span className="text-xxs text-ant-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">Bị chặn</span>}
            </button>
          ))}
        </div>
      </div>

      {order.status !== 'CRTD' && (
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3">Mã tham chiếu</h3>
          <div className="space-y-2">
            <InfoRow label="Batch FG" value={order.batchFg} mono />
            <InfoRow label="HU FG" value={order.huFg} mono />
            <InfoRow label="HU BTP" value={order.huBtp} mono />
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function InfoRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-xxs text-ant-text-secondary">{label}</p>
      <p className={`text-sm mt-0.5 ${mono ? 'font-mono' : 'font-medium'} ${highlight ? 'text-ant-sx font-bold' : 'text-ant-text'}`}>{value}</p>
    </div>
  );
}