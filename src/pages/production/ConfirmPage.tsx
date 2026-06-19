import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

export default function ProductionConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();

  const order = state.productionOrders.find((po) => po.id === id);
  const [fgQty, setFgQty] = useState(4500);
  const [scrapQty, setScrapQty] = useState(500);
  const [scrapReason, setScrapReason] = useState('');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ code: string; desc: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const cartonWeight = 10;
  const fgCartons = Math.round(fgQty / cartonWeight);

  const canConfirmFg = hasPermission(state.role?.id, 'PRODUCTION_CONFIRM_FG') || hasPermission(state.role?.id, 'PRODUCTION_CREATE_ORDER');

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
  const plannedQty = order.plannedQty;
  const hasScrapRequirement = scrapQty > 0 && scrapReason.trim().length === 0;
  const totalInput = fgQty + scrapQty;

  const handleVoiceToText = () => {
    setVoiceRecording(true);
    setTimeout(() => {
      setVoiceRecording(false);
      setScrapReason('Lô xoài xí ngầu phát sinh lỗi rách màng bao bì tạm tại góc pallet, rò rỉ khí làm kết tinh tuyết');
      addToast('info', 'Voice-to-text: Đã nhận diện giọng nói');
    }, 1200);
  };

  const handleAiSuggest = () => {
    setAiSuggestion({ code: 'DF-002', desc: 'Xoài dập úng / Xì gôm — Hư hỏng cơ học trong quá trình xử lý' });
    addToast('info', 'AI đã gợi ý mã lỗi dựa trên mô tả');
  };

  const handleConfirm = () => {
    if (!canConfirmFg) {
      addToast('error', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    if (fgQty <= 0) {
      addToast('error', 'Vui lòng nhập số lượng thành phẩm đạt (> 0 KG)');
      return;
    }
    setConfirming(true);

    const now = new Date();
    const year = now.getFullYear();
    const dayOfYear = String(Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / 86400000)).padStart(3, '0');
    const seq = String(state.batches.filter((b) => b.plant === order.plant).length + 1).padStart(3, '0');
    const productShort = order.productCode.replace('TP', '');
    const batchFg = `FG-${year}-${order.plant}-${productShort}-${dayOfYear}-${seq}`;
    const existingFgCount = state.handlingUnits.filter((h) => h.type === 'FG' && h.plant === order.plant && h.id.startsWith('HU-')).length + 1;
    const huSeq = String(existingFgCount).padStart(4, '0');
    const huFg = `HU-${year}-${order.plant}-FG-${productShort}-${huSeq}`;

    simulateAction(
      'Xác nhận thành phẩm',
      `PO ${order.id} — Đạt ${fgQty.toLocaleString()} KG · Phế ${scrapQty.toLocaleString()} KG · ${aiSuggestion?.code || ''}`,
      `Đã xác nhận thành phẩm: ${fgQty.toLocaleString()} KG · Batch ${batchFg}`,
      () => {
        if (id) {
          dispatch({ type: 'UPDATE_PRODUCTION_ORDER', payload: { id, updates: { fgQty, scrapQty, scrapReason, status: 'CNF', batchFg, huFg } } });
          dispatch({
            type: 'ADD_BATCH',
            payload: {
              id: batchFg,
              product: `${order.productCode} - ${order.productName}`,
              qty: fgQty,
              unit: 'KG',
              plant: order.plant,
              status: 'Chờ nhập kho TP',
              productionOrder: order.id,
            },
          });
          dispatch({
            type: 'ADD_HANDLING_UNIT',
            payload: {
              id: huFg,
              type: 'FG',
              product: order.productCode,
              qty: fgQty,
              unit: 'KG',
              location: '',
              plant: order.plant,
              status: 'Chờ nhập kho TP',
            },
          });
          addActivityLog(
            state.currentUser, state.role?.name || '',
            'Xác nhận thành phẩm',
            `PO ${order.id} — Đạt ${fgQty.toLocaleString()} KG · Phế ${scrapQty.toLocaleString()} KG · Batch ${batchFg}`,
            order.status, 'CNF',
            scrapQty > 0 ? `Phế phẩm: ${scrapReason || 'Không có lý do'}` : undefined
          );
        }
        setConfirming(false);
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
          <i className="ri-checkbox-circle-line text-sm" />
          <span className="text-xs font-medium opacity-80">XÁC NHẬN THÀNH PHẨM</span>
        </div>
        <h2 className="text-lg font-bold">PO {id}</h2>
        <p className="text-xs text-white/70 mt-1">
          Kế hoạch: {plannedQty.toLocaleString()} KG · WIP: {wipQty.toLocaleString()} KG
        </p>
      </div>

      <PermissionBanner
        module="Sản xuất — Xác nhận TP"
        moduleIcon="ri-checkbox-circle-line"
        moduleColor="sx"
        requiredPermissions={['PRODUCTION_CONFIRM_FG', 'PRODUCTION_VIEW']}
      />

      {/* Quantity Inputs */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-4">Sản lượng</h3>

        {/* FG Qty */}
        <div className="mb-4">
          <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">
            Thành phẩm đạt (KG)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFgQty(Math.max(0, fgQty - 100))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-ant-text hover:bg-gray-200 active:scale-90"
            >−</button>
            <div className="flex-1 bg-ant-bg rounded-xl px-4 py-2.5 text-center">
              <p className="text-xl font-bold text-ant-sx">{fgQty.toLocaleString()}</p>
              <p className="text-xxs text-ant-text-secondary">~{Math.round(fgQty / 10)} thùng 10KG</p>
            </div>
            <button
              onClick={() => setFgQty(fgQty + 100)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-ant-text hover:bg-gray-200 active:scale-90"
            >+</button>
          </div>
          <div className="flex gap-2 mt-2">
            {[3200, 4000, 4500, 5000].map((q) => (
              <button
                key={q}
                onClick={() => setFgQty(q)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                  fgQty === q ? 'bg-ant-sx text-white' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'
                }`}
              >{q.toLocaleString()}</button>
            ))}
          </div>
        </div>

        {/* Scrap Qty */}
        <div>
          <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">
            Phế phẩm (KG)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScrapQty(Math.max(0, scrapQty - 50))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-ant-text hover:bg-gray-200 active:scale-90"
            >−</button>
            <div className="flex-1 bg-ant-bg rounded-xl px-4 py-2.5 text-center">
              <p className="text-xl font-bold text-ant-error">{scrapQty.toLocaleString()}</p>
              <p className="text-xxs text-ant-text-secondary">Phế phẩm</p>
            </div>
            <button
              onClick={() => setScrapQty(scrapQty + 50)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-ant-text hover:bg-gray-200 active:scale-90"
            >+</button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 p-3 bg-ant-bg rounded-xl flex items-center justify-between">
          <span className="text-xs text-ant-text-secondary">Tổng (Đạt + Phế)</span>
          <span className={`text-sm font-bold ${totalInput > wipQty ? 'text-ant-error' : 'text-ant-text'}`}>
            {totalInput.toLocaleString()} KG
            {totalInput > wipQty && (
              <span className="text-xs font-normal ml-1">(Vượt WIP {wipQty.toLocaleString()}!)</span>
            )}
          </span>
        </div>
      </div>

      {/* Scrap Reason */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-ant-text mb-3">Lý do phế phẩm</h3>

        {/* Voice-to-text */}
        <button
          onClick={handleVoiceToText}
          disabled={voiceRecording}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed mb-3 transition-all active:scale-[0.98] ${
            voiceRecording
              ? 'border-ant-error/50 bg-ant-error/5 text-ant-error'
              : 'border-ant-sx/20 text-ant-sx hover:bg-ant-sx/5'
          }`}
        >
          {voiceRecording ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-ant-error animate-voice-pulse flex items-center justify-center">
                <i className="ri-mic-fill text-white text-xs" />
              </div>
              Đang ghi âm
              <span className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 bg-ant-error rounded-full animate-voice-wave" />
                <span className="w-0.5 bg-ant-error rounded-full animate-voice-wave" />
                <span className="w-0.5 bg-ant-error rounded-full animate-voice-wave" />
                <span className="w-0.5 bg-ant-error rounded-full animate-voice-wave" />
                <span className="w-0.5 bg-ant-error rounded-full animate-voice-wave" />
              </span>
            </span>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-mic-line text-base" />
              </div>
              Voice-to-text mô tả lỗi
            </>
          )}
        </button>

        {/* Text area */}
        <textarea
          value={scrapReason}
          onChange={(e) => setScrapReason(e.target.value)}
          placeholder="Mô tả lý do phế phẩm hoặc dùng voice-to-text..."
          maxLength={500}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-20 focus:outline-none focus:border-ant-sx/50 mb-3"
        />
        <p className="text-xxs text-ant-text-secondary text-right -mt-2 mb-3">{scrapReason.length}/500</p>

        {/* AI suggestion */}
        {scrapReason && !aiSuggestion && (
          <button
            onClick={handleAiSuggest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ant-offline/10 text-ant-offline text-sm font-medium hover:bg-ant-offline/20 transition-all active:scale-[0.98]"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-robot-line text-base" />
            </div>
            AI gợi ý mã lỗi
          </button>
        )}

        {/* AI Result */}
        {aiSuggestion && (
          <div className="bg-ant-error/5 rounded-xl p-3 border border-ant-error/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-ant-error/20 flex items-center justify-center">
                <i className="ri-robot-line text-xs text-ant-error" />
              </div>
              <p className="text-xs font-bold text-ant-error">AI gợi ý mã lỗi</p>
            </div>
            <div className="bg-ant-card rounded-lg p-2.5">
              <p className="text-sm font-mono font-bold text-ant-error">{aiSuggestion.code}</p>
              <p className="text-xs text-ant-text-secondary">{aiSuggestion.desc}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setAiSuggestion(null)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ant-text-secondary bg-gray-50 hover:bg-gray-100"
              >
                Bỏ qua
              </button>
              <button
                onClick={() => addToast('success', `Đã xác nhận mã lỗi ${aiSuggestion.code}`)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-ant-error hover:bg-red-700"
              >
                Xác nhận mã lỗi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {canConfirmFg ? (
        <button
          onClick={handleConfirm}
          disabled={confirming || fgQty <= 0 || totalInput > wipQty || hasScrapRequirement}
          className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            confirming || fgQty <= 0 || totalInput > wipQty
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-ant-sx hover:bg-ant-sx-dark'
          }`}
        >
          {confirming ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xác nhận...
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-check-double-line text-lg" />
              </div>
              Xác nhận & Sinh batch thành phẩm
            </>
          )}
        </button>
      ) : (
        <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
          <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('PRODUCTION_CONFIRM_FG')}</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}