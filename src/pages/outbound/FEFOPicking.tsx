import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

type PickingStep = 'select' | 'scan_bin' | 'scan_pallet' | 'confirm';

const FEFO_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  recommended: { bg: 'bg-ant-sx/10', text: 'text-ant-sx', border: 'border-ant-sx/30', label: 'Nên lấy' },
  check: { bg: 'bg-ant-warning/10', text: 'text-ant-warning', border: 'border-ant-warning/30', label: 'Cần kiểm tra' },
  blocked: { bg: 'bg-ant-error/10', text: 'text-ant-error', border: 'border-ant-error/30', label: 'Bị khóa chất lượng' },
  unrelated: { bg: 'bg-gray-100', text: 'text-ant-text-secondary', border: 'border-gray-200', label: 'Không thuộc phiếu xuất' },
};

const OVERRIDE_REASONS = [
  'Khách hàng yêu cầu đích danh lô khác',
  'Hàng lỗi bao bì chờ QC',
  'Lô đề xuất không tiếp cận được',
  'Lý do khác',
];

// Scan & camera animation component
function ScanCamera({ label }: { label: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl bg-black overflow-hidden mb-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800" />
      <div className="absolute left-4 right-4 h-0.5 bg-ant-xk animate-scan-line" style={{ top: '50%' }} />
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-ant-xk rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-ant-xk rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-ant-xk rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-ant-xk rounded-br-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/60 text-xs font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function FEFOPickingPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<PickingStep>('select');
  const [scanning, setScanning] = useState(false);
  const [scannedBinOk, setScannedBinOk] = useState(false);
  const [scannedPalletOk, setScannedPalletOk] = useState(false);
  const [pickedPallets, setPickedPallets] = useState<string[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [currentScanResult, setCurrentScanResult] = useState<{ code: string; type: string } | null>(null);
  const [wrongFefoPopup, setWrongFefoPopup] = useState(false);
  const [blockedStockPopup, setBlockedStockPopup] = useState(false);

  const delivery = state.outboundDeliveries.find((od) => od.id === id);

  // FEFO recommended pallet — tries all OD items until finding unblocked one
  const fefoPallet = useMemo(() => {
    if (!delivery) return null;
    // Try each item in order until we find an unblocked pallet
    for (const item of delivery.items) {
      const batch = state.batches.find((b) => b.id === item.batch);
      const hu = state.handlingUnits.find((h) =>
        h.product === item.product && h.location !== '' && h.type === 'FG' &&
        (h.status === 'Đã xếp kệ' || h.status === 'Đã picking')
      );
      if (!hu) continue;
      const bin = state.bins.find((b) => b.id === hu.location);
      if (!batch) continue;
      const isBlocked = state.qualityHolds.some((qh) => qh.batch === batch.id && qh.status === 'Đang giữ')
        || batch.status === 'Blocked Stock';
      // Return the first unblocked pallet found
      if (!isBlocked) {
        return {
          hu: hu.id,
          bin: hu.location,
          batch: batch.id,
          product: item.product,
          qty: item.qty,
          unit: item.unit,
          isBlocked: false,
          fefoStatus: 'recommended' as const,
        };
      }
    }
    // If all are blocked, return the first blocked one (still show as blocked)
    const firstItem = delivery.items[0];
    const firstBatch = state.batches.find((b) => b.id === firstItem.batch);
    const firstHu = state.handlingUnits.find((h) =>
      h.product === firstItem.product && h.location !== '' && h.type === 'FG' &&
      (h.status === 'Đã xếp kệ' || h.status === 'Đã picking')
    );
    if (!firstHu || !firstBatch) return null;
    return {
      hu: firstHu.id,
      bin: firstHu.location,
      batch: firstBatch.id,
      product: firstItem.product,
      qty: firstItem.qty,
      unit: firstItem.unit,
      isBlocked: true,
      fefoStatus: 'blocked' as const,
    };
  }, [delivery, state.batches, state.handlingUnits, state.bins, state.qualityHolds]);

  const allPallets = useMemo(() => {
    if (!delivery) return [];
    return state.handlingUnits
      .filter((h) => delivery.items.some((item) => item.product === h.product) && h.type === 'FG' && h.location !== '')
      .map((h) => {
        const item = delivery.items.find((i) => i.product === h.product);
        const batch = state.batches.find((b) => b.id === (item?.batch || ''));
        const isRecommended = fefoPallet?.hu === h.id;
        const isBlocked = state.qualityHolds.some((qh) => qh.batch === (batch?.id || '') && qh.status === 'Đang giữ') || batch?.status === 'Blocked Stock';
        let fefoStatus: 'recommended' | 'check' | 'blocked' | 'unrelated' = 'unrelated';
        if (isRecommended && !isBlocked) fefoStatus = 'recommended';
        else if (isBlocked) fefoStatus = 'blocked';
        else if (item && h.location !== '') fefoStatus = 'check';
        return { ...h, fefoStatus, batchId: item?.batch, batch, isRecommended };
      });
  }, [delivery, state.handlingUnits, state.batches, state.qualityHolds, fefoPallet]);

  const canOverride = state.role?.id === 'quan-doc' || state.role?.id === 'admin';
  const canStartPicking = Boolean(fefoPallet && !fefoPallet.isBlocked);

  const handleStartPicking = () => {
    if (!fefoPallet) {
      addToast('warning', 'Không tìm thấy pallet phù hợp cho phiếu xuất này');
      return;
    }
    if (fefoPallet.isBlocked) {
      setBlockedStockPopup(true);
      addToast('error', 'Lô đề xuất đang bị QM Hold / Blocked Stock, không thể picking');
      return;
    }
    setStep('scan_bin');
  };

  const startScanBin = () => {
    if (!canStartPicking) {
      setBlockedStockPopup(true);
      addToast('error', 'Không thể quét ô kệ cho lô đang bị khóa chất lượng');
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const targetBin = fefoPallet?.bin || 'KL-03-B2-T3';
      setCurrentScanResult({ code: targetBin, type: 'bin' });

      if (fefoPallet?.bin === targetBin) {
        setScannedBinOk(true);
        addToast('success', `Đã quét đúng ô kệ: ${targetBin}`);
        setStep('scan_pallet');
      } else {
        addToast('error', `Ô kệ không khớp! Đề xuất: ${fefoPallet?.bin}`);
      }
    }, 600 + Math.random() * 400);
  };

  const startScanPallet = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const resultHu = fefoPallet?.hu || 'HU-2026-MA-FG-XN-0005';
      setCurrentScanResult({ code: resultHu, type: 'pallet' });

      if (resultHu === fefoPallet?.hu) {
        if (fefoPallet?.fefoStatus === 'blocked') {
          setBlockedStockPopup(true);
          addToast('error', 'Batch này đang bị Blocked Stock / QM Hold!');
          return;
        }
        setScannedPalletOk(true);
        addToast('success', `Đã quét đúng pallet FEFO: ${resultHu}`);
      } else {
        // Check if scanned pallet is a different batch (wrong FEFO)
        const scannedPallet = allPallets.find((p) => p.id === resultHu);
        if (scannedPallet && scannedPallet.fefoStatus === 'blocked') {
          setBlockedStockPopup(true);
          addToast('error', 'Batch này đang bị Blocked Stock! Không thể lấy.');
          return;
        }
        setWrongFefoPopup(true);
      }
    }, 600 + Math.random() * 400);
  };

  const handleOverrideFEFO = () => {
    if (!overrideReason) {
      addToast('warning', 'Vui lòng chọn lý do override FEFO');
      return;
    }
    setShowOverrideModal(false);
    setWrongFefoPopup(false);
    setScannedPalletOk(true);
    const palletId = currentScanResult?.code || '';
    addActivityLog(state.currentUser, state.role?.name || '', 'Override FEFO', `Lấy pallet ${palletId} thay vì ${fefoPallet?.hu} — Lý do: ${overrideReason}`);
    addToast('warning', `Đã override FEFO. Lý do: ${overrideReason}`);
  };

  const handleConfirmPicking = () => {
    const palletId = currentScanResult?.code || fefoPallet?.hu;
    setPickedPallets((prev) => [...prev, palletId]);

    // Update HU status
    dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: palletId, updates: { status: 'Đã picking', location: '' } } });
    dispatch({ type: 'UPDATE_BIN_STATUS', payload: { id: fefoPallet?.bin || 'KL-03-B2-T3', status: 'Trống' } });

    if (delivery) {
      dispatch({ type: 'UPDATE_OUTBOUND_DELIVERY', payload: { id: delivery.id, updates: { status: 'Đang picking' } } });
    }

    simulateAction(
      'FEFO Picking',
      `Đã lấy pallet ${palletId} từ ${fefoPallet?.bin} — OD ${delivery?.id}`,
      `Đã xác nhận picking pallet ${palletId}!`,
      () => {
        setStep('select');
        setScannedBinOk(false);
        setScannedPalletOk(false);
        setCurrentScanResult(null);
      }
    );
  };

  if (!delivery) {
    return (
      <div className="p-6 text-center">
        <i className="ri-error-warning-line text-3xl text-ant-text-secondary" />
        <p className="mt-2 text-sm text-ant-text-secondary">Không tìm thấy phiếu xuất</p>
        <button onClick={() => navigate('/outbound')} className="mt-3 text-sm text-ant-xk font-medium">Quay lại</button>
      </div>
    );
  }

  const steps: { key: PickingStep; label: string }[] = [
    { key: 'select', label: 'Chọn OD' },
    { key: 'scan_bin', label: 'Quét ô kệ' },
    { key: 'scan_pallet', label: 'Quét pallet' },
    { key: 'confirm', label: 'Xác nhận' },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <div className="bg-ant-xk p-5 text-white">
        <button onClick={() => navigate('/outbound')} className="mb-2 flex items-center gap-1 text-xs text-white/70 hover:text-white">
          <i className="ri-arrow-left-line" />Quay lại
        </button>
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-arrow-up-down-line text-lg" />
          <span className="text-xs font-medium opacity-80">SMART FEFO PICKING</span>
        </div>
        <h2 className="text-lg font-bold">{delivery.id}</h2>
        <p className="text-xs text-white/70">{delivery.customer} · {delivery.items.map((i) => `${i.qty} ${i.unit} ${i.product}`).join(', ')}</p>
      </div>

      {/* Stepper */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between bg-ant-card rounded-xl border border-gray-100 px-3 py-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold transition-all ${
                i < currentStepIdx ? 'bg-ant-xk text-white' :
                i === currentStepIdx ? 'bg-ant-xk text-white ring-2 ring-ant-xk/30' :
                'bg-gray-100 text-ant-text-secondary'
              }`}>
                {i < currentStepIdx ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              <span className={`text-xxs font-medium hidden sm:block ${i <= currentStepIdx ? 'text-ant-text' : 'text-ant-text-secondary'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-6 h-px ${i < currentStepIdx ? 'bg-ant-xk' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <PermissionBanner
        module="Xuất kho — FEFO Picking"
        moduleIcon="ri-arrow-up-down-line"
        moduleColor="xk"
        requiredPermissions={['OUTBOUND_FEFO_PICKING', 'OUTBOUND_FEFO_OVERRIDE', 'OUTBOUND_VIEW']}
        className="mx-4 mb-3"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Step: Select OD - Show OD info */}
        {(step === 'select') && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Thông tin phiếu xuất</h3>
              <div className="space-y-2">
                <InfoRow label="Số OD" value={delivery.id} mono />
                <InfoRow label="Khách hàng" value={delivery.customer} />
                <InfoRow label="Ngày xuất" value={delivery.shipDate} />
                <InfoRow label="Nhà máy" value={delivery.plant} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-ant-text-secondary mb-2">Sản phẩm cần xuất</p>
                {delivery.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-ant-text">{item.product}</span>
                    <span className="text-sm font-bold text-ant-xk">{item.qty} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FEFO Recommendation */}
            {fefoPallet ? (
              <div className={`rounded-xl border p-4 ${FEFO_COLORS[fefoPallet.fefoStatus].bg} ${FEFO_COLORS[fefoPallet.fefoStatus].border}`}>
                <h3 className="text-sm font-bold text-ant-text mb-3">
                  <i className="ri-lightbulb-flash-line mr-1" />Đề xuất FEFO
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Lô đề xuất" value={fefoPallet.batch} mono />
                  <InfoRow label="Pallet" value={fefoPallet.hu} mono />
                  <InfoRow label="Ô kệ" value={fefoPallet.bin} mono />
                  <InfoRow label="Số lượng" value={`${fefoPallet.qty} ${fefoPallet.unit}`} />
                </div>
                <div className={`mt-3 px-3 py-2 rounded-lg ${FEFO_COLORS[fefoPallet.fefoStatus].bg}`}>
                  <span className={`text-xs font-bold ${FEFO_COLORS[fefoPallet.fefoStatus].text}`}>
                    {FEFO_COLORS[fefoPallet.fefoStatus].label}
                  </span>
                  {fefoPallet.fefoStatus === 'blocked' && (
                    <p className="text-xxs text-ant-error mt-1">Batch bị QM Hold hoặc Blocked Stock — không thể lấy</p>
                  )}
                  {fefoPallet.fefoStatus === 'recommended' && (
                    <p className="text-xxs text-ant-sx mt-1">Lô có ngày sản xuất sớm nhất, ưu tiên xuất trước</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-ant-warning/30 bg-ant-warning/5 p-4">
                <h3 className="text-sm font-bold text-ant-text mb-2">
                  <i className="ri-lightbulb-flash-line mr-1" />Đề xuất FEFO
                </h3>
                <p className="text-xs text-ant-warning font-medium">
                  Không tìm thấy pallet khả dụng cho sản phẩm trong phiếu xuất này.
                </p>
                <p className="text-xxs text-ant-text-secondary mt-1">
                  Cần putaway pallet vào ô kệ trước khi picking. Vào Nhập kho → Putaway.
                </p>
              </div>
            )}

            {/* All available pallets for this OD */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Pallet khả dụng</h3>
              <div className="space-y-2">
                {allPallets.map((p) => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${FEFO_COLORS[p.fefoStatus].border} ${FEFO_COLORS[p.fefoStatus].bg}`}>
                    <div>
                      <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                      <p className="text-xxs text-ant-text-secondary">{p.location || 'Chưa xếp kệ'} · {p.qty} {p.unit}</p>
                      {p.batchId && <p className="text-xxs text-ant-text-secondary">Batch: {p.batchId}</p>}
                    </div>
                    <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${FEFO_COLORS[p.fefoStatus].text} ${FEFO_COLORS[p.fefoStatus].bg}`}>
                      {FEFO_COLORS[p.fefoStatus].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartPicking}
              disabled={!canStartPicking}
              className={`w-full h-14 rounded-xl text-base font-bold transition-all active:scale-[0.98] whitespace-nowrap ${
                canStartPicking
                  ? 'bg-ant-xk text-white hover:bg-ant-xk-dark cursor-pointer'
                  : 'bg-ant-error/10 text-ant-error border border-ant-error/20 cursor-not-allowed'
              }`}
            >
              <i className={`${canStartPicking ? 'ri-qr-scan-line' : 'ri-lock-line'} mr-2`} />
              {canStartPicking ? 'Bắt đầu Picking' : 'Đang khóa chất lượng'}
            </button>
          </>
        )}

        {/* Step: Scan Bin */}
        {step === 'scan_bin' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">Quét ô kệ</h3>
              <p className="text-xs text-ant-text-secondary mb-3">Ô kệ đề xuất: <span className="font-mono font-bold text-ant-xk">{fefoPallet?.bin || 'KL-03-B2-T3'}</span></p>

              {scanning ? (
                <>
                  <ScanCamera label="Đang quét ô kệ..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét mã QR ô kệ...</p>
                  </div>
                </>
              ) : scannedBinOk ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                    <i className="ri-check-line text-2xl text-ant-sx" />
                  </div>
                  <p className="text-sm font-bold text-ant-sx">Đã quét đúng ô kệ!</p>
                  <p className="text-xs text-ant-text-secondary mt-1 font-mono">{currentScanResult?.code}</p>
                </div>
              ) : (
                <button
                  onClick={startScanBin}
                  className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <i className="ri-qr-scan-line mr-2" />Quét QR ô kệ
                </button>
              )}
            </div>

            {scannedBinOk && (
              <button
                onClick={() => setStep('scan_pallet')}
                className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Quét Pallet
              </button>
            )}
          </>
        )}

        {/* Step: Scan Pallet */}
        {step === 'scan_pallet' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">Quét Pallet</h3>
              <p className="text-xs text-ant-text-secondary mb-3">Pallet đề xuất: <span className="font-mono font-bold text-ant-xk">{fefoPallet?.hu || 'HU-2026-MA-FG-XN-0005'}</span></p>

              {scanning ? (
                <>
                  <ScanCamera label="Đang quét pallet..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét mã QR pallet...</p>
                  </div>
                </>
              ) : scannedPalletOk ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                    <i className="ri-check-line text-2xl text-ant-sx" />
                  </div>
                  <p className="text-sm font-bold text-ant-sx">Đã quét đúng pallet!</p>
                  <p className="text-xs text-ant-text-secondary mt-1 font-mono">{currentScanResult?.code}</p>
                </div>
              ) : (
                <button
                  onClick={startScanPallet}
                  className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <i className="ri-qr-scan-line mr-2" />Quét QR Pallet
                </button>
              )}
            </div>

            {scannedPalletOk && (
              <button
                onClick={() => setStep('confirm')}
                className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Xác nhận
              </button>
            )}
          </>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="bg-ant-sx-light rounded-xl border border-ant-sx/20 p-4">
              <h3 className="text-sm font-bold text-ant-sx mb-3">
                <i className="ri-check-double-line mr-1" />Xác nhận lấy hàng
              </h3>
              <div className="space-y-2">
                <InfoRow label="Phiếu xuất" value={delivery.id} mono />
                <InfoRow label="Ô kệ" value={fefoPallet?.bin || 'KL-03-B2-T3'} mono />
                <InfoRow label="Pallet" value={currentScanResult?.code || fefoPallet?.hu || ''} mono />
                <InfoRow label="Lô" value={fefoPallet?.batch || ''} mono />
                <InfoRow label="Số lượng" value={`${fefoPallet?.qty || 0} ${fefoPallet?.unit || 'KG'}`} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('scan_bin'); setScannedBinOk(false); setScannedPalletOk(false); }}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-1" />Làm lại
              </button>
              <button
                onClick={handleConfirmPicking}
                className="flex-1 h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-check-line mr-1.5" />Xác nhận lấy hàng
              </button>
            </div>
          </>
        )}

        {/* Picked pallets summary */}
        {pickedPallets.length > 0 && (
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-2">Đã picking ({pickedPallets.length})</h3>
            {pickedPallets.map((p) => (
              <div key={p} className="flex items-center gap-2 py-1">
                <i className="ri-checkbox-circle-fill text-ant-sx text-sm" />
                <span className="text-xs font-mono text-ant-text">{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wrong FEFO Popup */}
      {wrongFefoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-6 w-full max-w-mobile animate-slide-up">
            <div className="w-12 h-12 mx-auto rounded-full bg-ant-error/10 flex items-center justify-center mb-3">
              <i className="ri-error-warning-line text-2xl text-ant-error" />
            </div>
            <h3 className="text-base font-bold text-ant-error text-center">Sai lô FEFO!</h3>
            <p className="text-sm text-ant-text-secondary text-center mt-2">Pallet bạn quét không thuộc lô được ưu tiên xuất theo FEFO.</p>
            <p className="text-xs text-ant-text-secondary text-center mt-1">
              Lô đề xuất: <span className="font-mono font-bold text-ant-xk">{fefoPallet?.batch}</span>
            </p>

            {canOverride ? (
              <>
                {!showOverrideModal ? (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setWrongFefoPopup(false); setCurrentScanResult(null); }}
                      className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary whitespace-nowrap"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={() => setShowOverrideModal(true)}
                      className="flex-1 h-10 rounded-xl bg-ant-warning text-white text-sm font-bold hover:bg-amber-600 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-shield-user-line mr-1" />Override
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-ant-text mb-2">Lý do override FEFO:</p>
                    <div className="space-y-1.5 mb-3">
                      {OVERRIDE_REASONS.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => setOverrideReason(reason)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                            overrideReason === reason ? 'bg-ant-warning/20 text-ant-warning font-bold border border-ant-warning/30' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                      {overrideReason === 'Lý do khác' && (
                        <input
                          type="text"
                          placeholder="Nhập lý do override..."
                          className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-ant-text bg-ant-bg mt-1 focus:outline-none focus:border-ant-warning"
                          onChange={(e) => setOverrideReason(e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowOverrideModal(false)}
                        className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-medium text-ant-text-secondary whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleOverrideFEFO}
                        disabled={!overrideReason}
                        className="flex-1 h-10 rounded-xl bg-ant-warning text-white text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        Xác nhận Override
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-ant-error text-center bg-ant-error/5 rounded-lg p-2">
                  Bạn không có quyền override FEFO. Vui lòng liên hệ Quản đốc/Tổ trưởng.
                </p>
                <button
                  onClick={() => { setWrongFefoPopup(false); setCurrentScanResult(null); }}
                  className="w-full h-10 mt-3 rounded-xl bg-gray-100 text-sm font-medium text-ant-text-secondary whitespace-nowrap"
                >
                  Đã hiểu, quay lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blocked Stock Popup */}
      {blockedStockPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-6 w-full max-w-mobile animate-shake">
            <div className="w-12 h-12 mx-auto rounded-full bg-ant-error/10 flex items-center justify-center mb-3">
              <i className="ri-forbid-line text-2xl text-ant-error" />
            </div>
            <h3 className="text-base font-bold text-ant-error text-center">Batch bị khóa!</h3>
            <p className="text-sm text-ant-text-secondary text-center mt-2">
              Batch này đang ở trạng thái <strong>Blocked Stock</strong> hoặc <strong>QM Hold</strong>. Không thể xuất kho.
            </p>
            <p className="text-xs text-ant-text-secondary text-center mt-1">
              Vui lòng liên hệ KCS/QM để kiểm tra và mở khóa batch trước khi xuất.
            </p>
            <button
              onClick={() => { setBlockedStockPopup(false); setCurrentScanResult(null); }}
              className="w-full h-10 mt-4 rounded-xl bg-ant-error text-white text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm font-medium text-ant-text ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}
