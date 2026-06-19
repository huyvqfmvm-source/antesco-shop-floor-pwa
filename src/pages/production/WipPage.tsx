import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import { MOCK_OPERATIONS } from '@/mocks/data';
import PermissionBanner from '@/components/base/PermissionBanner';

export default function ProductionWipPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();

  const order = state.productionOrders.find((po) => po.id === id);
  const [currentOpIndex, setCurrentOpIndex] = useState(1);
  const [wipQty, setWipQty] = useState(3200);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [weighing, setWeighing] = useState(false);

  const canWip = hasPermission(state.role?.id, 'PRODUCTION_WIP');

  const currentOp = MOCK_OPERATIONS[currentOpIndex];

  const handleScanOp = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addToast('success', `Đã quét công đoạn: ${currentOp.code} — ${currentOp.name}`);
    }, 800);
  };

  const handleWeigh = () => {
    setWeighing(true);
    setTimeout(() => {
      setWipQty(3200);
      setWeighing(false);
      addToast('info', 'Cân mô phỏng: 3,200 KG');
    }, 700);
  };

  const handleSave = () => {
    if (!canWip) {
      addToast('error', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    if (!order || !id) return;
    if (wipQty <= 0) {
      addToast('error', 'Vui lòng nhập số lượng WIP hợp lệ (> 0 KG)');
      return;
    }
    setSaving(true);
    simulateAction(
      'Ghi WIP',
      `PO ${id} — ${currentOp.code} ${currentOp.name} · ${wipQty.toLocaleString()} KG`,
      `Đã ghi nhận WIP: ${currentOp.code} · ${wipQty.toLocaleString()} KG`,
      () => {
        dispatch({
          type: 'UPDATE_PRODUCTION_ORDER',
          payload: { id, updates: { wipQty, currentOperation: currentOp.code, status: order.status === 'REL' ? 'STRT' : order.status } },
        });
        if (order.status === 'REL') {
          addActivityLog(state.currentUser, state.role?.name || '', 'Bắt đầu SX', `PO ${id} — REL → STRT · Bắt đầu từ ${currentOp.code}`, 'REL', 'STRT');
        }
        setSaving(false);
      }
    );
  };

  if (!order) {
    return (
      <div className="p-4">
        <div className="bg-ant-card rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-ant-text-secondary">Không tìm thấy lệnh</p>
          <button onClick={() => navigate('/production')} className="mt-4 px-4 py-2 bg-ant-sx text-white rounded-lg text-sm">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back */}
      <button onClick={() => navigate(`/production/detail/${id}`)} className="flex items-center gap-1.5 text-sm text-ant-text-secondary hover:text-ant-text transition-colors">
        <i className="ri-arrow-left-line" />
        Chi tiết lệnh
      </button>

      {/* Header */}
      <div className="bg-ant-sx rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-tools-line text-sm" />
          <span className="text-xs font-medium opacity-80">GHI NHẬN WIP</span>
        </div>
        <h2 className="text-lg font-bold">PO {id}</h2>
        <p className="text-xs text-white/70 mt-1">WIP hiện tại: {(order.wipQty || 0).toLocaleString()} KG</p>
      </div>

      <PermissionBanner
        module="Sản xuất — Ghi WIP"
        moduleIcon="ri-tools-line"
        moduleColor="sx"
        requiredPermissions={['PRODUCTION_WIP', 'PRODUCTION_VIEW']}
      />

      {/* Operation Stepper */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Công đoạn</h3>
        <div className="space-y-1">
          {MOCK_OPERATIONS.map((op, i) => {
            const isActive = i === currentOpIndex;
            const isDone = i < currentOpIndex;
            return (
              <button
                key={op.code}
                onClick={() => setCurrentOpIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                  isActive ? 'bg-ant-sx/10 border border-ant-sx/30' :
                  isDone ? 'bg-ant-success/5 border border-ant-success/20' :
                  'bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold shrink-0 ${
                  isActive ? 'bg-ant-sx text-white' :
                  isDone ? 'bg-ant-success text-white' :
                  'bg-gray-200 text-ant-text-secondary'
                }`}>
                  {isDone ? <i className="ri-check-line text-xs" /> : op.seq}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${
                    isActive ? 'text-ant-sx' :
                    isDone ? 'text-ant-success' :
                    'text-ant-text-secondary'
                  }`}>
                    {op.code} — {op.name}
                  </p>
                </div>
                {isActive && (
                  <div className="w-3 h-3 rounded-full bg-ant-sx animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Operation Scan */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">
          Đang thao tác: {currentOp.code} — {currentOp.name}
        </h3>
        <button
          onClick={handleScanOp}
          disabled={scanning}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-ant-sx/30 text-ant-sx text-sm font-bold hover:bg-ant-sx/5 transition-all active:scale-[0.98] ${
            scanning ? 'opacity-70' : ''
          }`}
        >
          {scanning ? (
            <>
              <div className="w-5 h-5 border-2 border-ant-sx border-t-transparent rounded-full animate-spin" />
              Đang quét mã công đoạn...
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-qr-scan-line text-base" />
              </div>
              Quét mã công đoạn
            </>
          )}
        </button>
      </div>

      {/* WIP Input */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Nhập sản lượng WIP</h3>

        {/* WIP vượt kế hoạch warning */}
        {wipQty > order.plannedQty && (
          <div className="mb-3 p-3 rounded-lg bg-ant-warning/10 border border-ant-warning/20 flex items-start gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-alert-line text-ant-warning text-sm" />
            </div>
            <div>
              <p className="text-xs font-bold text-ant-warning">Cảnh báo: WIP vượt kế hoạch!</p>
              <p className="text-xxs text-ant-text-secondary">
                WIP hiện tại ({wipQty.toLocaleString()} KG) vượt kế hoạch ({order.plannedQty.toLocaleString()} KG).
                Vui lòng kiểm tra với Quản đốc trước khi tiếp tục.
              </p>
            </div>
          </div>
        )}

        {/* Weigh button */}
        <button
          onClick={handleWeigh}
          disabled={weighing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ant-sx/10 text-ant-sx text-sm font-medium hover:bg-ant-sx/20 transition-all active:scale-[0.98] mb-3"
        >
          {weighing ? (
            <>
              <div className="w-4 h-4 border-2 border-ant-sx border-t-transparent rounded-full animate-spin" />
              Đang đọc cân...
            </>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-scales-3-line text-base" />
              </div>
              Nhận cân mô phỏng
            </>
          )}
        </button>

        {/* Qty input */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setWipQty(Math.max(0, wipQty - 100))}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >
            −
          </button>
          <div className="flex-1 bg-ant-bg rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-ant-sx">{wipQty.toLocaleString()}</p>
            <p className="text-xs text-ant-text-secondary">KG</p>
          </div>
          <button
            onClick={() => setWipQty(wipQty + 100)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >
            +
          </button>
        </div>

        {/* Quick set */}
        <div className="flex gap-2 mb-3">
          {[800, 1600, 3200, 5000].map((q) => (
            <button
              key={q}
              onClick={() => setWipQty(q)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                wipQty === q ? 'bg-ant-sx text-white' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'
              }`}
            >
              {q.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Note */}
        <div>
          <label className="text-xs font-medium text-ant-text-secondary mb-1 block">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú công đoạn..."
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-20 focus:outline-none focus:border-ant-sx/50"
          />
          <p className="text-xxs text-ant-text-secondary text-right mt-1">{note.length}/500</p>
        </div>
      </div>

      {/* Save Button */}
      {canWip ? (
        <button
          onClick={handleSave}
          disabled={saving || wipQty <= 0}
          className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            saving || wipQty <= 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-ant-sx hover:bg-ant-sx-dark'
          }`}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu WIP...
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-save-line text-lg" />
              </div>
              Lưu WIP
            </>
          )}
        </button>
      ) : (
        <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
          <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('PRODUCTION_WIP')}</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}