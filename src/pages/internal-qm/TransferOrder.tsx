import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

const STEPS = [
  { key: 'scan', label: 'Quét phiếu ĐC', icon: 'ri-file-list-3-line' },
  { key: 'pallets', label: 'Quét pallet', icon: 'ri-stack-line' },
  { key: 'vehicle', label: 'OCR xe', icon: 'ri-car-line' },
  { key: 'sign', label: 'Ký bàn giao', icon: 'ri-pen-nib-line' },
  { key: 'confirm', label: 'Chốt chuyển', icon: 'ri-check-double-line' },
];

const MOCK_PALLETS = [
  { id: 'HU-IQF-XN-01', qty: 500, unit: 'KG', product: 'TP0061', status: 'Unrestricted' },
  { id: 'HU-IQF-XN-02', qty: 500, unit: 'KG', product: 'TP0061', status: 'Unrestricted' },
  { id: 'HU-IQF-XN-03', qty: 500, unit: 'KG', product: 'TP0061', status: 'Blocked Stock' },
  { id: 'HU-IQF-XN-04', qty: 500, unit: 'KG', product: 'TP0061', status: 'Unrestricted' },
  { id: 'HU-IQF-XN-05', qty: 500, unit: 'KG', product: 'TP0061', status: 'Unrestricted' },
];

export default function TransferOrderPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scannedST, setScannedST] = useState(false);
  const [scannedPallets, setScannedPallets] = useState<string[]>([]);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [tempC, setTempC] = useState('-18');
  const [signSX, setSignSX] = useState(false);
  const [signTK, setSignTK] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [blockedError, setBlockedError] = useState('');

  const handleScanST = useCallback(() => {
    setScannedST(true);
    addToast('success', 'Đã quét ST-2026-0089 — Điều chuyển MA → BK');
    setStep(1);
  }, [addToast]);

  const handleScanPallet = useCallback((huId: string) => {
    setDuplicateError('');
    setBlockedError('');

    if (scannedPallets.includes(huId)) {
      setDuplicateError(`Pallet ${huId} đã được quét.`);
      addToast('warning', 'Pallet đã được quét — không thể quét trùng');
      return;
    }

    const pallet = MOCK_PALLETS.find((p) => p.id === huId);
    if (pallet?.status === 'Blocked Stock') {
      setBlockedError(`Pallet ${huId} đang Blocked Stock — không được đưa lên xe!`);
      addToast('error', 'Blocked Stock — không được phép điều chuyển');
      return;
    }

    setScannedPallets((prev) => [...prev, huId]);
    addToast('success', `Đã quét ${huId}`);
  }, [scannedPallets, addToast]);

  const handleOCRVehicle = useCallback(() => {
    setVehiclePlate('67C-123.45');
    addToast('success', 'OCR: Biển số 67C-123.45');
    setStep(3);
  }, [addToast]);

  const handleContinue = useCallback(() => {
    if (step === 1) {
      if (scannedPallets.length === 0) {
        addToast('warning', 'Vui lòng quét ít nhất 1 pallet');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!vehiclePlate) {
        addToast('warning', 'Vui lòng OCR biển số xe');
        return;
      }
      if (!tempC) {
        addToast('warning', 'Vui lòng nhập nhiệt độ xe');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!signSX || !signTK) {
        addToast('warning', 'Cần đầy đủ chữ ký: Đại diện SX + Thủ kho');
        return;
      }
      setStep(4);
    }
  }, [step, scannedPallets.length, vehiclePlate, tempC, signSX, signTK, addToast]);

  const handleConfirm = useCallback(() => {
    if (!signSX || !signTK) {
      addToast('warning', 'Cần đầy đủ chữ ký bàn giao');
      return;
    }
    setIsConfirming(true);
    simulateAction(
      'Điều chuyển NM',
      `ST-2026-0089 — ${scannedPallets.length} pallet MA → BK, xe 67C-123.45, ${tempC}°C`,
      'Đã chốt điều chuyển — Stock in Transit',
      () => {
        dispatch({ type: 'UPDATE_TRANSFER_ORDER', payload: { id: 'ST-2026-0089', updates: { status: 'Stock in Transit - Đang đi đường' } } });
        scannedPallets.forEach((hu) => {
          dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: hu, updates: { plant: 'BK', location: '', status: 'Đang vận chuyển' } } });
        });
        setIsConfirming(false);
        setConfirmed(true);
      }
    );
  }, [signSX, signTK, addToast, simulateAction, dispatch, scannedPallets, tempC]);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">Điều chuyển liên nhà máy</h2>
          <p className="text-xxs text-ant-text-secondary">ST-2026-0089: Mỹ An → Bình Khánh</p>
        </div>
      </div>

      {/* Process Stepper */}
      <div className="bg-ant-qm rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-arrow-left-right-line text-base" />
          <span className="text-xs font-bold">ĐIỀU CHUYỂN NỘI BỘ</span>
        </div>
        <div className="flex items-center gap-1">
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

      {/* Step 0: Scan ST */}
      {step === 0 && (
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-4">
          <h3 className="text-sm font-bold text-ant-text">Bước 1 — Quét phiếu điều chuyển</h3>
          <div className="p-3 rounded-lg bg-ant-bg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-ant-text">ST-2026-0089</span>
              <span className="text-xxs px-1.5 py-0.5 rounded-full bg-ant-qm/10 text-ant-qm font-medium">Chờ chuyển</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ant-text-secondary mb-2">
              <span className="font-bold text-ant-sx">MA · KL-03</span>
              <i className="ri-arrow-right-line" />
              <span className="font-bold text-ant-nk">BK · KL-05</span>
            </div>
            <p className="text-xxs text-ant-text-secondary">5 pallet · 2,500 KG · TP0061</p>
          </div>
          <button onClick={handleScanST} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-qr-scan-line" />
            </div>
            QUÉT PHIẾU ST-2026-0089
          </button>
        </div>
      )}

      {/* Step 1: Multi-scan pallets */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 2 — Quét pallet lên xe ({scannedPallets.length}/{MOCK_PALLETS.length})</h3>

            {duplicateError && (
              <div className="mb-3 p-2.5 rounded-lg bg-ant-warning/10 border border-ant-warning/30 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-alert-line text-ant-warning text-sm" />
                </div>
                <p className="text-xs font-medium text-ant-warning">{duplicateError}</p>
              </div>
            )}

            {blockedError && (
              <div className="mb-3 p-2.5 rounded-lg bg-ant-error/10 border border-ant-error/30 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-close-circle-line text-ant-error text-sm" />
                </div>
                <p className="text-xs font-medium text-ant-error">{blockedError}</p>
              </div>
            )}

            <div className="space-y-2">
              {MOCK_PALLETS.map((p) => {
                const isScanned = scannedPallets.includes(p.id);
                const isBlocked = p.status === 'Blocked Stock';
                return (
                  <button
                    key={p.id}
                    onClick={() => handleScanPallet(p.id)}
                    disabled={isScanned}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isScanned
                        ? 'bg-ant-sx-light border-ant-sx/20'
                        : isBlocked
                        ? 'bg-ant-error/5 border-ant-error/20'
                        : 'bg-ant-bg border-gray-100 hover:border-ant-qm/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isScanned ? 'bg-ant-sx/10' : isBlocked ? 'bg-ant-error/10' : 'bg-gray-100'
                      }`}>
                        <i className={`${
                          isScanned ? 'ri-check-line text-ant-sx' : isBlocked ? 'ri-lock-line text-ant-error' : 'ri-stack-line text-ant-text-secondary'
                        } text-sm`} />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                        <p className="text-xxs text-ant-text-secondary">{p.qty} {p.unit} · {p.product}</p>
                      </div>
                    </div>
                    {isBlocked && (
                      <span className="text-xxs px-1.5 py-0.5 rounded-full bg-ant-error/10 text-ant-error font-bold">BLOCKED</span>
                    )}
                    {isScanned && (
                      <span className="text-xxs px-1.5 py-0.5 rounded-full bg-ant-sx/10 text-ant-sx font-medium">Đã quét</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: OCR XE VẬN CHUYỂN
          </button>
        </div>
      )}

      {/* Step 2: Vehicle OCR */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 3 — OCR biển số & nhiệt độ xe</h3>

            {!vehiclePlate ? (
              <button onClick={handleOCRVehicle} className="w-full py-4 rounded-xl border-2 border-dashed border-ant-qm/30 bg-ant-bg flex items-center justify-center gap-2 mb-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-car-line text-ant-qm text-lg" />
                </div>
                <span className="text-sm font-medium text-ant-qm">OCR BIỂN SỐ XE</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-ant-sx-light border border-ant-sx/20 mb-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ant-sx/10 flex items-center justify-center">
                  <i className="ri-car-line text-ant-sx" />
                </div>
                <div>
                  <p className="text-sm font-mono font-bold text-ant-sx">{vehiclePlate}</p>
                  <p className="text-xxs text-ant-text-secondary">Xe tải lạnh — Đã xác nhận</p>
                </div>
              </div>
            )}

            <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">Nhiệt độ thùng xe</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempC}
                onChange={(e) => setTempC(e.target.value)}
                className="w-24 p-2.5 rounded-xl border border-gray-200 text-sm text-ant-text text-center bg-ant-bg focus:outline-none focus:border-ant-qm"
              />
              <span className="text-sm text-ant-text-secondary">°C</span>
              {Number(tempC) > -16 && (
                <span className="text-xxs text-ant-warning font-medium ml-2">Nhiệt độ cao hơn -16°C</span>
              )}
            </div>
          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: KÝ BÀN GIAO
          </button>
        </div>
      )}

      {/* Step 3: Sign */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 4 — Ký bàn giao</h3>
            <p className="text-xs text-ant-text-secondary mb-4">Yêu cầu chữ ký của cả Đại diện sản xuất và Thủ kho.</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setSignSX(true); addToast('success', 'Đại diện SX đã ký'); }}
                disabled={signSX}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  signSX ? 'bg-ant-sx/5 border-ant-sx/30' : 'bg-ant-bg border-dashed border-gray-200 hover:border-ant-sx/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${signSX ? 'bg-ant-sx/10' : 'bg-gray-100'}`}>
                  <i className={`${signSX ? 'ri-pen-nib-fill text-ant-sx' : 'ri-pen-nib-line text-ant-text-secondary'} text-base`} />
                </div>
                <p className="text-sm font-bold text-ant-text">Đại diện SX</p>
                {signSX && <p className="text-xxs text-ant-sx font-medium mt-1">Đã ký</p>}
                {!signSX && <p className="text-xxs text-ant-text-secondary mt-1">Chạm để ký</p>}
              </button>

              <button
                onClick={() => { setSignTK(true); addToast('success', 'Thủ kho đã ký'); }}
                disabled={signTK}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  signTK ? 'bg-ant-nk/5 border-ant-nk/30' : 'bg-ant-bg border-dashed border-gray-200 hover:border-ant-nk/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${signTK ? 'bg-ant-nk/10' : 'bg-gray-100'}`}>
                  <i className={`${signTK ? 'ri-pen-nib-fill text-ant-nk' : 'ri-pen-nib-line text-ant-text-secondary'} text-base`} />
                </div>
                <p className="text-sm font-bold text-ant-text">Thủ kho</p>
                {signTK && <p className="text-xxs text-ant-nk font-medium mt-1">Đã ký</p>}
                {!signTK && <p className="text-xxs text-ant-text-secondary mt-1">Chạm để ký</p>}
              </button>
            </div>
          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: CHỐT ĐIỀU CHUYỂN
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && !confirmed && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3">Bước 5 — Chốt điều chuyển</h3>

            <div className="space-y-2 mb-3">
              <InfoRow label="Phiếu" value="ST-2026-0089" mono />
              <InfoRow label="NM nguồn" value="Mỹ An · KL-03" />
              <InfoRow label="NM đích" value="Bình Khánh · KL-05" />
              <InfoRow label="Số pallet" value={`${scannedPallets.length} / ${MOCK_PALLETS.length}`} />
              <InfoRow label="Biển số xe" value={vehiclePlate} mono />
              <InfoRow label="Nhiệt độ" value={`${tempC}°C`} />
              <InfoRow label="Chữ ký SX" value={signSX ? 'Đã ký' : 'Chưa ký'} />
              <InfoRow label="Chữ ký TK" value={signTK ? 'Đã ký' : 'Chưa ký'} />
            </div>

            <div className="bg-ant-qm/5 rounded-lg p-3 border border-ant-qm/20">
              <p className="text-xs text-ant-text-secondary">
                Sau khi chốt, hàng sẽ chuyển trạng thái <strong className="text-ant-qm">&ldquo;Stock in Transit - Đang đi đường&rdquo;</strong>.
                Nhà máy Bình Khánh sẽ xác nhận nhận hàng sau.
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full py-4 rounded-xl bg-ant-sx text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ĐANG CHỐT...
              </>
            ) : (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-check-double-line text-lg" />
                </div>
                CHỐT ĐIỀU CHUYỂN — STOCK IN TRANSIT
              </>
            )}
          </button>
        </div>
      )}

      {/* Completed */}
      {confirmed && (
        <div className="bg-ant-sx rounded-xl p-6 text-white text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <i className="ri-check-line text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold">ĐÃ CHỐT ĐIỀU CHUYỂN</h3>
            <p className="text-sm text-white/70 mt-1">ST-2026-0089: {scannedPallets.length} pallet — Stock in Transit</p>
            <p className="text-xs text-white/50">Mỹ An → Bình Khánh · Xe 67C-123.45 · {tempC}°C</p>
          </div>
          <div className="flex gap-3">
            <Link to="/internal-qm" className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium text-center">
              Về Nội bộ & QM
            </Link>
            <Link to="/internal-qm/receive-transfer" className="flex-1 py-2.5 rounded-xl bg-white text-ant-sx text-sm font-bold text-center">
              Nhận tại BK
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-xs font-medium text-ant-text ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}