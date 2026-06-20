import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { OfflineQueueItem } from '@/store/AppContext';

const STEPS = [
  { key: 'scan', label: 'Quét ô kệ', icon: 'ri-layout-grid-line' },
  { key: 'pallets', label: 'Quét pallet', icon: 'ri-stack-line' },
  { key: 'count', label: 'Nhập số lượng', icon: 'ri-numbers-line' },
  { key: 'confirm', label: 'Xác nhận', icon: 'ri-check-double-line' },
];

const MOCK_BIN_DATA = {
  bin: 'KL-03-B2-T3',
  warehouse: 'Kho lạnh 03',
  plant: 'Mỹ An',
  expectedPallets: 5,
};

const MOCK_EXPECTED_PALLETS = [
  { id: 'HU-2026-MA-FG-XN-0005', qty: 500, unit: 'KG', product: 'TP0061' },
  { id: 'HU-2026-MA-FG-XN-0006', qty: 500, unit: 'KG', product: 'TP0061' },
  { id: 'HU-2026-MA-FG-XN-0008', qty: 500, unit: 'KG', product: 'TP0061' },
  { id: 'HU-IQF-XN-01', qty: 500, unit: 'KG', product: 'TP0061' },
  { id: 'HU-IQF-XN-03', qty: 500, unit: 'KG', product: 'TP0061' },
];

export default function CycleCountPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();
  const canCycleCount = hasPermission(state.role?.id, 'QM_CYCLE_COUNT');
  const [step, setStep] = useState(0);
  const [scannedBin, setScannedBin] = useState(false);
  const [scannedPallets, setScannedPallets] = useState<string[]>([]);
  const [actualQty, setActualQty] = useState('');
  const [photos, setPhotos] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{ match: boolean; expected: number; actual: number } | null>(null);

  const expectedTotal = MOCK_EXPECTED_PALLETS.reduce((acc, p) => acc + p.qty, 0);

  const handleScanBin = useCallback(() => {
    setScannedBin(true);
    addToast('success', `Đã quét ô kệ ${MOCK_BIN_DATA.bin}`);
    setStep(1);
  }, [addToast]);

  const handleScanPallet = useCallback((huId: string) => {
    if (scannedPallets.includes(huId)) {
      addToast('warning', 'Pallet đã được quét');
      return;
    }
    setScannedPallets((prev) => [...prev, huId]);
    addToast('success', `Đã quét ${huId}`);
  }, [scannedPallets, addToast]);

  const handleContinue = useCallback(() => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const qty = Number(actualQty);
      if (!actualQty || qty <= 0) {
        addToast('warning', 'Vui lòng nhập số lượng thực tế');
        return;
      }
      setStep(3);
    }
  }, [step, actualQty, addToast]);

  const handleAddPhoto = useCallback(() => {
    setPhotos((prev) => [...prev, Date.now()]);
    addToast('success', `Đã chụp ảnh thứ ${photos.length + 1}`);
  }, [photos.length, addToast]);

  const handleConfirm = useCallback(() => {
    if (!canCycleCount) {
      addToast('error', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    const actual = Number(actualQty) || (scannedPallets.length * 500);
    const isMatch = scannedPallets.length === MOCK_BIN_DATA.expectedPallets && actual === expectedTotal;

    if (!isMatch && photos.length === 0) {
      addToast('warning', 'Kết quả lệch — bắt buộc chụp ảnh hiện trạng');
      return;
    }
    if (!isMatch && !note.trim()) {
      addToast('warning', 'Kết quả lệch — bắt buộc nhập ghi chú');
      return;
    }

    const isOffline = state.networkStatus === 'offline';

    if (isOffline) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const queueItem: OfflineQueueItem = {
        queueId: `off-cc-${Date.now()}`,
        type: 'CYCLE_COUNT',
        user: state.currentUser,
        role: state.role?.name || '',
        plant: state.plant?.code || 'MA',
        shift: state.shift?.name || '',
        binId: MOCK_BIN_DATA.bin,
        quantity: actual,
        unit: 'KG',
        reason: note,
        photos: photos.map((p) => `photo-${p}`),
        additionalData: { expectedPallets: MOCK_BIN_DATA.expectedPallets, actualPallets: scannedPallets.length, expectedQty: expectedTotal },
        createdAt: timestamp,
        status: 'Pending Sync',
        retryCount: 0,
        mockMovement: 'LI11N',
        maxHoldHours: 24,
      };

      dispatch({ type: 'ADD_OFFLINE_QUEUE', payload: queueItem });
      addActivityLog(state.currentUser, state.role?.name || '', 'Kiểm kê (Offline)', `${MOCK_BIN_DATA.bin} — ${scannedPallets.length}/${MOCK_BIN_DATA.expectedPallets} pallet — ${actual} KG`, isMatch ? 'Khớp' : 'Lệch', 'Chờ đồng bộ', 'Lưu vào Offline Queue — LI11N');
      addToast('warning', 'Đã lưu vào Offline Queue. Sẽ đồng bộ khi có mạng.');
      setResult({ match: isMatch, expected: expectedTotal, actual });
      return;
    }

    setIsConfirming(true);
    simulateAction(
      'Kiểm kê ô kệ',
      `${MOCK_BIN_DATA.bin} — ${scannedPallets.length}/${MOCK_BIN_DATA.expectedPallets} pallet, ${actual}/${expectedTotal} KG${!isMatch ? ' LỆCH' : ''}`,
      isMatch ? 'Đã kiểm kê — Khớp sổ sách' : 'Đã lưu kiểm kê — Có chênh lệch',
      () => {
        const countId = `CC-2026-${String(Date.now()).slice(-4)}`;
        dispatch({
          type: 'ADD_CYCLE_COUNT',
          payload: {
            id: countId,
            bin: MOCK_BIN_DATA.bin,
            plant: state.plant?.code || 'MA',
            expectedPallets: MOCK_BIN_DATA.expectedPallets,
            actualPallets: scannedPallets.length,
            expectedQty: expectedTotal,
            actualQty: actual,
            unit: 'KG',
            status: isMatch ? 'Đã kiểm kê khớp' : 'Lệch số lượng',
            countedBy: state.currentUser,
            note: note,
            imageCount: photos.length,
            createdDate: new Date().toISOString().slice(0, 10),
          },
        });
        setIsConfirming(false);
        setResult({ match: isMatch, expected: expectedTotal, actual });
      }
    );
  }, [actualQty, scannedPallets.length, expectedTotal, photos.length, note, addToast, simulateAction, dispatch, state, canCycleCount]);

  const selectedPalletQty = scannedPallets.length * 500;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">Cycle Counting</h2>
          <p className="text-xxs text-ant-text-secondary">Kiểm kê chu kỳ ô kệ</p>
        </div>
      </div>

      {/* Process Stepper */}
      <div className="bg-ant-qm rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-clipboard-line text-base" />
          <span className="text-xs font-bold">KIỂM KÊ CHU KỲ</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto stepper-scroll">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 flex-1 last:flex-none">
              <button
                disabled={i > step + 1}
                onClick={() => { if (i <= step) setStep(i); }}
                className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                  i === step ? 'bg-white/20' : i < step ? 'opacity-60' : 'opacity-40'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${s.icon} ${i <= step ? 'text-white' : 'text-white/40'} text-sm`} />
                </div>
                <span className="text-xxs text-center leading-tight">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-3 h-0.5 rounded-full flex-shrink-0 ${i < step ? 'bg-white/60' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Scan Bin */}
      {step === 0 && (
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-4">
          <h3 className="text-sm font-bold text-ant-text">Bước 1 — Quét ô kệ cần kiểm kê</h3>
          <div className="p-3 rounded-lg bg-ant-bg border border-gray-100">
            <p className="text-xs text-ant-text-secondary">Ô kệ mẫu:</p>
            <p className="text-sm font-mono font-bold text-ant-text">{MOCK_BIN_DATA.bin}</p>
            <p className="text-xxs text-ant-text-secondary">{MOCK_BIN_DATA.warehouse} · {MOCK_BIN_DATA.plant}</p>
          </div>
          <button onClick={handleScanBin} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-qr-scan-line" />
            </div>
            QUÉT Ô KỆ KL-03-B2-T3
          </button>
        </div>
      )}

      {/* Step 1: Scan Pallets */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ant-text">Bước 2 — Quét pallet thực tế ({scannedPallets.length}/{MOCK_BIN_DATA.expectedPallets})</h3>
            </div>
            <p className="text-xs text-ant-text-secondary mb-3">Theo sổ sách: {MOCK_BIN_DATA.expectedPallets} pallet tại {MOCK_BIN_DATA.bin}</p>

            <div className="space-y-2">
              {MOCK_EXPECTED_PALLETS.map((p) => {
                const isScanned = scannedPallets.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleScanPallet(p.id)}
                    disabled={isScanned}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isScanned ? 'bg-ant-sx-light border-ant-sx/20' : 'bg-ant-bg border-gray-100 hover:border-ant-qm/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isScanned ? 'bg-ant-sx/10' : 'bg-gray-100'}`}>
                        <i className={`${isScanned ? 'ri-check-line text-ant-sx' : 'ri-stack-line text-ant-text-secondary'} text-sm`} />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                        <p className="text-xxs text-ant-text-secondary">{p.qty} {p.unit} · {p.product}</p>
                      </div>
                    </div>
                    {isScanned && <span className="text-xxs text-ant-sx font-medium">Đã quét</span>}
                  </button>
                );
              })}
            </div>

          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            {scannedPallets.length === MOCK_BIN_DATA.expectedPallets ? 'KHỚP — TIẾP TỤC' : 'LỆCH — TIẾP TỤC NHẬP SỐ LƯỢNG'}
          </button>
        </div>
      )}

      {/* Step 2: Enter Quantity */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 3 — Nhập số lượng thực tế</h3>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-ant-bg">
                <p className="text-xxs text-ant-text-secondary">Theo sổ</p>
                <p className="text-lg font-bold text-ant-text">{expectedTotal.toLocaleString()} KG</p>
                <p className="text-xxs text-ant-text-secondary">{MOCK_BIN_DATA.expectedPallets} pallet</p>
              </div>
              <div className={`p-3 rounded-xl ${
                scannedPallets.length === MOCK_BIN_DATA.expectedPallets ? 'bg-ant-sx-light' : 'bg-ant-warning/10'
              }`}>
                <p className="text-xxs text-ant-text-secondary">Thực tế quét</p>
                <p className={`text-lg font-bold ${scannedPallets.length === MOCK_BIN_DATA.expectedPallets ? 'text-ant-sx' : 'text-ant-warning'}`}>
                  {selectedPalletQty.toLocaleString()} KG
                </p>
                <p className="text-xxs text-ant-text-secondary">{scannedPallets.length} pallet</p>
              </div>
            </div>

            <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">Số lượng thực tế (KG)</label>
            <input
              type="number"
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value)}
              placeholder={String(selectedPalletQty)}
              className="w-full p-3 rounded-xl border border-gray-200 text-lg text-ant-text text-center bg-ant-bg focus:outline-none focus:border-ant-qm"
            />

            {scannedPallets.length !== MOCK_BIN_DATA.expectedPallets && (
              <div className="mt-3 p-2.5 rounded-lg bg-ant-warning/10 border border-ant-warning/20 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-alert-line text-ant-warning text-sm" />
                </div>
                <p className="text-xs text-ant-warning font-medium">
                  Lệch {Math.abs(scannedPallets.length - MOCK_BIN_DATA.expectedPallets)} pallet so với sổ sách!
                </p>
              </div>
            )}
          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: XÁC NHẬN KIỂM KÊ
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && !result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 4 — Xác nhận kiểm kê</h3>

            <div className="space-y-2 mb-3">
              <InfoRow label="Ô kệ" value={MOCK_BIN_DATA.bin} mono />
              <InfoRow label="Pallet theo sổ" value={`${MOCK_BIN_DATA.expectedPallets}`} />
              <InfoRow label="Pallet thực tế" value={`${scannedPallets.length}`} highlight={scannedPallets.length !== MOCK_BIN_DATA.expectedPallets} />
              <InfoRow label="KL theo sổ" value={`${expectedTotal.toLocaleString()} KG`} />
              <InfoRow label="KL thực tế" value={`${(Number(actualQty) || selectedPalletQty).toLocaleString()} KG`} highlight={Number(actualQty) !== expectedTotal} />
              <InfoRow label="Trạng thái" value={scannedPallets.length === MOCK_BIN_DATA.expectedPallets && Number(actualQty || selectedPalletQty) === expectedTotal ? 'Khớp sổ sách' : 'Lệch'} error={scannedPallets.length !== MOCK_BIN_DATA.expectedPallets} />
            </div>

            {(scannedPallets.length !== MOCK_BIN_DATA.expectedPallets || Number(actualQty) !== expectedTotal) && (
              <div className="space-y-3">
                <div className="bg-ant-warning/10 rounded-lg p-3 border border-ant-warning/20">
                  <p className="text-xs font-bold text-ant-warning mb-2">Yêu cầu bổ sung do kết quả lệch:</p>
                  <div className="space-y-2">
                    <button onClick={handleAddPhoto} className="w-full py-2 rounded-lg bg-ant-card border border-gray-200 text-xs text-ant-text flex items-center justify-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-camera-line text-sm" />
                      </div>
                      Chụp ảnh hiện trạng {photos.length > 0 && `(${photos.length})`}
                    </button>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Nhập ghi chú lý do chênh lệch..."
                      maxLength={500}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-warning"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!canCycleCount ? (
            <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
              <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('QM_CYCLE_COUNT')}</p>
            </div>
          ) : (
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full py-4 rounded-xl bg-ant-sx text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ĐANG LƯU KIỂM KÊ...
              </>
            ) : (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-check-double-line text-lg" />
                </div>
                XÁC NHẬN KIỂM KÊ
              </>
            )}
          </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-6 text-white text-center space-y-4 ${result.match ? 'bg-ant-sx' : 'bg-ant-warning'}`}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <i className={`${result.match ? 'ri-check-line' : 'ri-alert-line'} text-3xl text-white`} />
          </div>
          <div>
            <h3 className="text-base font-bold">
              {result.match ? 'ĐÃ KIỂM KÊ — KHỚP SỔ SÁCH' : 'ĐÃ LƯU KIỂM KÊ — CÓ CHÊNH LỆCH'}
            </h3>
            <p className="text-sm text-white/70 mt-1">
              {MOCK_BIN_DATA.bin}: {scannedPallets.length}/{MOCK_BIN_DATA.expectedPallets} pallet · {result.actual.toLocaleString()}/{result.expected.toLocaleString()} KG
            </p>
            {!result.match && <p className="text-xs text-white/50 mt-1">Đã lưu bản ghi kiểm kê, không tự tạo adjustment</p>}
          </div>
          <button onClick={() => navigate('/internal-qm')} className="block w-full py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium text-center">
            Về Nội bộ & QM
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, highlight, error }: { label: string; value: string; mono?: boolean; highlight?: boolean; error?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-xs font-medium ${
        error ? 'text-ant-error' : highlight ? 'text-ant-warning' : 'text-ant-text'
      } ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}