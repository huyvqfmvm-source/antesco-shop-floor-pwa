import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

export default function ProductionPalletPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();

  const order = state.productionOrders.find((po) => po.id === id);
  const [palletKg, setPalletKg] = useState(1600);
  const [cartonCount, setCartonCount] = useState(80);
  const [creating, setCreating] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [generatedHu, setGeneratedHu] = useState('');

  const canPallet = hasPermission(state.role?.id, 'PRODUCTION_PALLET');

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

  const wipQty = order.wipQty || 0;
  const cartonWeight = 20;

  const updateKg = (kg: number) => {
    setPalletKg(Math.max(0, kg));
    setCartonCount(Math.round(kg / cartonWeight));
  };
  const updateCartons = (ctns: number) => {
    setCartonCount(Math.max(0, ctns));
    setPalletKg(ctns * cartonWeight);
  };

  const handleCreatePallet = () => {
    if (!canPallet) {
      addToast('error', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    if (palletKg <= 0) {
      addToast('error', 'Vui lòng nhập số lượng pallet hợp lệ');
      return;
    }
    if (palletKg > wipQty) {
      addToast('error', `Số lượng pallet vượt quá WIP hiện có (${wipQty.toLocaleString()} KG)`);
      return;
    }

    setCreating(true);
    const seq = String(state.handlingUnits.filter((h) => h.type === 'BTP' && h.plant === order.plant).length + 1).padStart(4, '0');
    const huId = `HU-2026-${order.plant}-BTP-XOAI-${seq}`;

    simulateAction(
      'Tạo pallet BTP',
      `PO ${order.id} — ${huId} · ${cartonCount} thùng · ${palletKg.toLocaleString()} KG`,
      `Đã tạo pallet BTP: ${huId} — ${cartonCount} thùng tạm`,
      () => {
        setGeneratedHu(huId);
        dispatch({
          type: 'ADD_HANDLING_UNIT',
          payload: {
            id: huId,
            type: 'BTP',
            product: `${order.productCode}-BTP`,
            qty: palletKg,
            unit: 'KG',
            location: 'KM-01-A2',
            plant: order.plant,
            status: 'Chờ chế biến',
          },
        });
        dispatch({
          type: 'UPDATE_PRODUCTION_ORDER',
          payload: { id: order.id, updates: { huBtp: huId } },
        });
        addActivityLog(
          state.currentUser, state.role?.name || '',
          'Tạo pallet BTP',
          `PO ${order.id} — ${huId} · ${cartonCount} thùng · ${palletKg.toLocaleString()} KG`,
          'WIP', 'Chờ chế biến',
          `Tồn WIP còn ${(wipQty - palletKg).toLocaleString()} KG`
        );
        setShowQrModal(true);
        setCreating(false);
      }
    );
  };

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
          <i className="ri-stack-line text-sm" />
          <span className="text-xs font-medium opacity-80">TẠO PALLET BTP</span>
        </div>
        <h2 className="text-lg font-bold">PO {id}</h2>
        <p className="text-xs text-white/70 mt-1">
          WIP hiện có: {wipQty.toLocaleString()} KG · {order.currentOperation || 'Chưa có WIP'}
        </p>
      </div>

      <PermissionBanner
        module="Sản xuất — Tạo Pallet BTP"
        moduleIcon="ri-stack-line"
        moduleColor="sx"
        requiredPermissions={['PRODUCTION_PALLET', 'PRODUCTION_VIEW']}
      />

      {/* Pallet Info Card */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Thông tin pallet BTP</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-xs text-ant-text-secondary">Sản phẩm gốc</span>
            <span className="text-sm font-medium text-ant-text truncate max-w-[200px]">{order.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-ant-text-secondary">Loại BTP</span>
            <span className="text-sm font-medium text-ant-text">Xoài má tươi sau lạng — BTP-XOAI-{order.plant}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-ant-text-secondary">Nhà máy</span>
            <span className="text-sm font-medium text-ant-text">{order.plant === 'MA' ? 'Mỹ An' : 'Bình Khánh'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-ant-text-secondary">Đóng gói tạm</span>
            <span className="text-sm font-medium text-ant-text">Thùng nhựa 20KG/thùng</span>
          </div>
        </div>

        {/* KG selector */}
        <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">Khối lượng pallet (KG)</label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => updateKg(palletKg - 200)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >−</button>
          <div className="flex-1 bg-ant-bg rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-ant-sx">{palletKg.toLocaleString()}</p>
            <p className="text-xs text-ant-text-secondary">KG</p>
          </div>
          <button
            onClick={() => updateKg(palletKg + 200)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >+</button>
        </div>

        {/* Carton selector */}
        <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">Số thùng tạm (20 KG/thùng)</label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => updateCartons(cartonCount - 10)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >−</button>
          <div className="flex-1 bg-ant-bg rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-ant-nk">{cartonCount}</p>
            <p className="text-xs text-ant-text-secondary">Thùng tạm</p>
          </div>
          <button
            onClick={() => updateCartons(cartonCount + 10)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-ant-text hover:bg-gray-200 transition-colors active:scale-90"
          >+</button>
        </div>

        <div className="flex gap-2">
          {[
            { kg: 800, ctns: 40, label: '40 thùng' },
            { kg: 1600, ctns: 80, label: '80 thùng' },
            { kg: 3200, ctns: 160, label: '160 thùng' },
          ].map((q) => (
            <button
              key={q.kg}
              onClick={() => { setPalletKg(q.kg); setCartonCount(q.ctns); }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                palletKg === q.kg ? 'bg-ant-sx text-white' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'
              }`}
            >{q.label}</button>
          ))}
        </div>

        {palletKg > wipQty && (
          <div className="mt-3 p-3 rounded-lg bg-ant-error/5 border border-ant-error/20 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <i className="ri-error-warning-line text-ant-error text-sm" />
            </div>
            <p className="text-xs text-ant-error font-medium">
              Số lượng pallet ({palletKg.toLocaleString()} KG) vượt WIP hiện có ({wipQty.toLocaleString()} KG)
            </p>
          </div>
        )}
      </div>

      {/* Create Button */}
      {canPallet ? (
        <button
          onClick={handleCreatePallet}
          disabled={creating || palletKg <= 0 || palletKg > wipQty}
          className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            creating || palletKg <= 0 || palletKg > wipQty
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-ant-sx hover:bg-ant-sx-dark'
          }`}
        >
          {creating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang tạo pallet...
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-stack-line text-lg" />
              </div>
              Tạo pallet BTP — {cartonCount} thùng · {palletKg.toLocaleString()} KG
            </>
          )}
        </button>
      ) : (
        <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
          <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('PRODUCTION_PALLET')}</p>
        </div>
      )}

      {/* QR Label Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQrModal(false)} />
          <div className="relative w-full max-w-mobile bg-ant-card rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-ant-text">Tem QR Pallet BTP</h3>
              <button onClick={() => setShowQrModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <i className="ri-close-line text-lg text-ant-text-secondary" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-ant-bg rounded-xl p-4 space-y-3">
                <div className="bg-white rounded-xl border-2 border-dashed border-ant-sx/30 p-4 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-3">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${Math.random() > 0.45 ? 'bg-white' : 'bg-transparent'}`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-mono font-bold text-ant-text">{generatedHu}</p>
                  <p className="text-xs text-ant-sx font-medium">BTP-XOAI-{order.plant} — Pallet BTP xoài IQF</p>
                  <div className="border-t border-gray-200" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Sản phẩm gốc</p>
                      <p className="text-xs font-medium text-ant-text">{order.productCode} — {order.productName}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Nhà máy</p>
                      <p className="text-xs font-medium text-ant-text">{order.plant === 'MA' ? 'Mỹ An' : 'Bình Khánh'}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Số thùng tạm</p>
                      <p className="text-xs font-bold text-ant-nk">{cartonCount} thùng</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Khối lượng</p>
                      <p className="text-xs font-bold text-ant-sx">{palletKg.toLocaleString()} KG</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Ngày SX</p>
                      <p className="text-xs font-medium text-ant-text">17/06/2026</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">PO gốc</p>
                      <p className="text-xs font-mono font-medium text-ant-text">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">WIP gốc</p>
                      <p className="text-xs font-medium text-ant-text">{wipQty.toLocaleString()} KG</p>
                    </div>
                    <div>
                      <p className="text-xxs text-ant-text-secondary">Còn lại sau tạo</p>
                      <p className="text-xs font-medium text-ant-text">{(wipQty - palletKg).toLocaleString()} KG</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  addToast('success', 'Đã gửi lệnh in tem QR — máy in ZT410');
                  setShowQrModal(false);
                }}
                className="w-full mt-4 px-4 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-ant-sx-dark transition-all active:scale-[0.98]"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-printer-line text-base" />
                </div>
                In tem QR mock (ZT410)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing BTP Pallets */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Pallet BTP hiện có ({state.handlingUnits.filter((h) => h.type === 'BTP').length})</h3>
        {state.handlingUnits.filter((h) => h.type === 'BTP').length === 0 ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <i className="ri-stack-line text-lg text-ant-text-secondary/40" />
            </div>
            <p className="text-xs text-ant-text-secondary">Chưa có pallet BTP nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.handlingUnits.filter((h) => h.type === 'BTP').map((hu) => (
              <div key={hu.id} className="flex items-center justify-between bg-ant-bg rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-xs font-mono font-medium text-ant-text">{hu.id}</p>
                  <p className="text-xxs text-ant-text-secondary">{hu.qty.toLocaleString()} KG · {hu.status}</p>
                </div>
                <span className="text-xxs px-2 py-0.5 rounded-full bg-ant-sx/10 text-ant-sx font-medium">BTP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}