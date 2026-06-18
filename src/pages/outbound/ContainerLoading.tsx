import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

type LoadingStep = 'scan_od' | 'scan_pallets' | 'ocr_container' | 'checklist' | 'confirm';

const CHECKLIST_ITEMS = [
  { key: 'temp', label: 'Nhiệt độ thùng xe đạt -18°C', icon: 'ri-temp-cold-line' },
  { key: 'clean', label: 'Thùng xe sạch sẽ', icon: 'ri-brush-line' },
  { key: 'smell', label: 'Không có mùi lạ', icon: 'ri-windy-line' },
  { key: 'seal_photo', label: 'Seal đã chụp ảnh', icon: 'ri-camera-line' },
  { key: 'container_photo', label: 'Container đã chụp ảnh', icon: 'ri-image-line' },
];

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

export default function ContainerLoadingPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<LoadingStep>('scan_od');
  const [scanning, setScanning] = useState(false);
  const [scannedOD, setScannedOD] = useState(false);
  const [scannedPallets, setScannedPallets] = useState<string[]>([]);
  const [ocrContainer, setOcrContainer] = useState('');
  const [ocrSeal, setOcrSeal] = useState('');
  const [ocrDone, setOcrDone] = useState(false);
  const [temperature, setTemperature] = useState('-18');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [tempWarning, setTempWarning] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);

  const delivery = state.outboundDeliveries.find((od) => od.id === id);
  const relatedPallets = state.handlingUnits.filter((h) =>
    delivery?.items.some((item) => item.product === h.product) && h.type === 'FG' &&
    (h.status === 'Đã picking' || h.status === 'Đã loading' || h.status === 'Đã xếp kệ')
  );

  // Auto-sync temp checklist with temperature validation
  useEffect(() => {
    const numVal = parseInt(temperature, 10);
    const isValid = !isNaN(numVal) && numVal <= -18;
    setChecklist((prev) => ({ ...prev, temp: isValid }));
  }, [temperature]);

  const stepsMeta = [
    { key: 'scan_od' as LoadingStep, label: 'Quét OD' },
    { key: 'scan_pallets' as LoadingStep, label: 'Quét Pallet' },
    { key: 'ocr_container' as LoadingStep, label: 'OCR Container' },
    { key: 'checklist' as LoadingStep, label: 'Checklist' },
    { key: 'confirm' as LoadingStep, label: 'Xuất bến' },
  ];
  const currentStepIdx = stepsMeta.findIndex((s) => s.key === step);

  const toggleChecklist = (key: string) => {
    if (key === 'temp') return; // temp handled by temperature input
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecklistDone = CHECKLIST_ITEMS.every((item) => checklist[item.key]);
  const allPalletsScanned = relatedPallets.length > 0 && relatedPallets.every((p) => scannedPallets.includes(p.id));
  const canConfirm = allPalletsScanned && allChecklistDone && ocrContainer && ocrSeal && !tempWarning;

  const missingItems: string[] = [];
  if (!allPalletsScanned) missingItems.push('Chưa quét đủ tất cả pallet');
  if (!ocrContainer) missingItems.push('Chưa OCR container');
  if (!ocrSeal) missingItems.push('Chưa OCR seal');
  if (tempWarning) missingItems.push('Nhiệt độ không đạt -18°C');
  CHECKLIST_ITEMS.forEach((item) => {
    if (!checklist[item.key]) missingItems.push(`Thiếu: ${item.label}`);
  });

  const handleScanOD = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedOD(true);
      addToast('success', `Đã quét OD: ${delivery?.id || 'OD-2026-0098'}`);
    }, 500 + Math.random() * 400);
  };

  const handleScanPallet = (palletId: string) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedPallets((prev) => [...prev, palletId]);
      addToast('success', `Đã quét pallet: ${palletId}`);
    }, 400 + Math.random() * 300);
  };

  const handleOCRContainer = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setOcrContainer('TGBU1234567');
      setOcrSeal('SEAL-889912');
      setOcrDone(true);
      addToast('success', 'OCR Container: TGBU1234567 · Seal: SEAL-889912');
    }, 700 + Math.random() * 500);
  };

  const handleTempChange = (val: string) => {
    setTemperature(val);
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal > -18) {
      setTempWarning(true);
      addToast('error', `Nhiệt độ ${val}°C cao hơn ngưỡng -18°C! Vui lòng kiểm tra lại.`);
    } else if (!isNaN(numVal) && numVal <= -18) {
      setTempWarning(false);
    }
  };

  const handleConfirmExport = () => {
    if (!canConfirm) return;

    simulateAction(
      'Xuất bến',
      `OD ${delivery?.id} · Container ${ocrContainer} · Seal ${ocrSeal} · ${relatedPallets.length} pallet`,
      `Đã xuất bến thành công! OD ${delivery?.id} đã rời kho.`,
      () => {
        if (delivery) {
          dispatch({ type: 'UPDATE_OUTBOUND_DELIVERY', payload: { id: delivery.id, updates: { status: 'Đã xuất bến', container: ocrContainer, seal: ocrSeal } } });
        }
        scannedPallets.forEach((pId) => {
          dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: pId, updates: { status: 'Đã xuất bến' } } });
        });
        addActivityLog(state.currentUser, state.role?.name || '', 'Xuất bến', `OD ${delivery?.id} · Container ${ocrContainer} · Seal ${ocrSeal}`);
        setShowExportPopup(true);
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

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <div className="bg-ant-xk p-5 text-white">
        <button onClick={() => navigate('/outbound')} className="mb-2 flex items-center gap-1 text-xs text-white/70 hover:text-white">
          <i className="ri-arrow-left-line" />Quay lại
        </button>
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-ship-line text-lg" />
          <span className="text-xs font-medium opacity-80">ĐÓNG CONTAINER & XUẤT BẾN</span>
        </div>
        <h2 className="text-lg font-bold">{delivery.id}</h2>
      </div>

      {/* Stepper */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between bg-ant-card rounded-xl border border-gray-100 px-3 py-3 overflow-x-auto">
          {stepsMeta.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
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
              {i < stepsMeta.length - 1 && <div className={`w-4 h-px ${i < currentStepIdx ? 'bg-ant-xk' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <PermissionBanner
        module="Xuất kho — Đóng Container"
        moduleIcon="ri-ship-line"
        moduleColor="xk"
        requiredPermissions={['OUTBOUND_CONTAINER_LOADING', 'OUTBOUND_VIEW']}
        className="mx-4 mb-3"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Step 1: Scan OD */}
        {step === 'scan_od' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Quét Phiếu Xuất</h3>
              <div className="space-y-2 mb-3">
                <InfoRow label="Số OD" value={delivery.id} mono />
                <InfoRow label="Khách hàng" value={delivery.customer} />
                <InfoRow label="Ngày xuất" value={delivery.shipDate} />
                <InfoRow label="Sản phẩm" value={delivery.items.map((i) => `${i.product} (${i.qty} ${i.unit})`).join(', ')} />
              </div>

              {scanning ? (
                <>
                  <ScanCamera label="Đang quét OD..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét...</p>
                  </div>
                </>
              ) : scannedOD ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                    <i className="ri-check-line text-2xl text-ant-sx" />
                  </div>
                  <p className="text-sm font-bold text-ant-sx">Đã quét OD!</p>
                  <p className="text-xs text-ant-text-secondary mt-1 font-mono">{delivery.id}</p>
                </div>
              ) : (
                <button
                  onClick={handleScanOD}
                  className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <i className="ri-qr-scan-line mr-2" />Quét QR Outbound Delivery
                </button>
              )}
            </div>

            {scannedOD && (
              <button
                onClick={() => setStep('scan_pallets')}
                className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Quét Pallet Loading
              </button>
            )}
          </>
        )}

        {/* Step 2: Scan Pallets */}
        {step === 'scan_pallets' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">
                Danh sách Pallet Loading ({scannedPallets.length}/{relatedPallets.length})
              </h3>
              {relatedPallets.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-ant-text-secondary">Chưa có pallet nào để loading. Cần picking trước.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedPallets.map((p) => {
                    const isScanned = scannedPallets.includes(p.id);
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                        isScanned ? 'border-ant-sx/30 bg-ant-sx-light' : 'border-gray-100 bg-gray-50'
                      }`}>
                        <div>
                          <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                          <p className="text-xxs text-ant-text-secondary">{p.product} · {p.qty} {p.unit} · {p.location || 'Chưa xếp kệ'}</p>
                        </div>
                        {isScanned ? (
                          <div className="w-7 h-7 rounded-full bg-ant-sx flex items-center justify-center">
                            <i className="ri-check-line text-white text-xs" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleScanPallet(p.id)}
                            disabled={scanning}
                            className="w-7 h-7 rounded-full bg-ant-xk flex items-center justify-center hover:bg-ant-xk-dark transition-colors disabled:opacity-60"
                          >
                            <i className="ri-qr-scan-line text-white text-xs" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {scanning && (
                <div className="mt-3">
                  <ScanCamera label="Đang quét pallet loading..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét...</p>
                  </div>
                </div>
              )}
            </div>

            {!allPalletsScanned && relatedPallets.length > 0 && (
              <div className="bg-ant-error/5 rounded-xl border border-ant-error/20 p-3">
                <p className="text-xs text-ant-error">
                  <i className="ri-error-warning-line mr-1" />
                  Còn {relatedPallets.length - scannedPallets.length} pallet chưa scan. Cần scan đủ tất cả pallet trước khi xuất bến.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep('ocr_container')}
              disabled={!allPalletsScanned}
              className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap"
            >
              <i className="ri-arrow-right-line mr-2" />Tiếp tục — OCR Container/Seal
            </button>
          </>
        )}

        {/* Step 3: OCR Container/Seal */}
        {step === 'ocr_container' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">OCR Container & Seal</h3>

              {!ocrDone ? (
                <>
                  {scanning ? (
                    <>
                      <ScanCamera label="Đang OCR Container/Seal..." />
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-ant-text-secondary">Đang nhận diện...</p>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleOCRContainer}
                      className="w-full h-12 rounded-xl bg-ant-nk text-white text-sm font-bold hover:bg-ant-nk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                    >
                      <i className="ri-scan-2-line mr-2" />Quét OCR Container/Seal
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                      <i className="ri-check-line text-2xl text-ant-sx" />
                    </div>
                    <p className="text-sm font-bold text-ant-sx">OCR thành công!</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-ant-text-secondary">Container</span>
                      <span className="text-sm font-mono font-bold text-ant-text">{ocrContainer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-ant-text-secondary">Seal</span>
                      <span className="text-sm font-mono font-bold text-ant-text">{ocrSeal}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {ocrDone && (
              <button
                onClick={() => setStep('checklist')}
                className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Checklist
              </button>
            )}
          </>
        )}

        {/* Step 4: Checklist */}
        {step === 'checklist' && (
          <>
            {/* Temperature */}
            <div className={`bg-ant-card rounded-xl border p-4 ${tempWarning ? 'border-ant-error/30' : 'border-gray-100'}`}>
              <h3 className="text-sm font-bold text-ant-text mb-3">
                <i className="ri-temp-cold-line mr-1" />Nhiệt độ thùng xe
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={temperature}
                  onChange={(e) => handleTempChange(e.target.value)}
                  className={`w-24 h-12 rounded-xl border-2 text-center text-lg font-bold font-mono focus:outline-none ${
                    tempWarning ? 'border-ant-error text-ant-error bg-ant-error/5' : !checklist['temp'] ? 'border-gray-200 text-ant-text' : 'border-ant-sx text-ant-sx bg-ant-sx/5'
                  }`}
                />
                <span className="text-sm font-medium text-ant-text-secondary">°C</span>
                {tempWarning ? (
                  <span className="text-xs font-bold text-ant-error bg-ant-error/5 px-2 py-1 rounded-full">
                    <i className="ri-error-warning-line mr-1" />Cao hơn ngưỡng!
                  </span>
                ) : checklist['temp'] ? (
                  <span className="text-xs text-ant-sx bg-ant-sx-light px-2 py-1 rounded-full">
                    <i className="ri-check-line mr-1" />Đạt -18°C
                  </span>
                ) : (
                  <span className="text-xs text-ant-text-secondary bg-gray-100 px-2 py-1 rounded-full">
                    Nhập nhiệt độ
                  </span>
                )}
              </div>
              <p className="text-xxs text-ant-text-secondary mt-2">Ngưỡng yêu cầu: ≤ -18°C</p>
            </div>

            {/* Checklist items (exclude temp, handled above) */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Checklist Xuất Bến</h3>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.filter((item) => item.key !== 'temp').map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      checklist[item.key]
                        ? 'border-ant-sx/30 bg-ant-sx-light'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      checklist[item.key] ? 'bg-ant-sx' : 'bg-gray-100'
                    }`}>
                      <i className={`${item.icon} ${checklist[item.key] ? 'text-white' : 'text-ant-text-secondary'} text-sm`} />
                    </div>
                    <span className={`text-sm flex-1 text-left ${checklist[item.key] ? 'font-bold text-ant-sx' : 'text-ant-text'}`}>
                      {item.label}
                    </span>
                    {checklist[item.key] && <i className="ri-checkbox-circle-fill text-ant-sx text-lg" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Missing items summary */}
            {!canConfirm && missingItems.length > 0 && (
              <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/20 p-3">
                <p className="text-xs font-bold text-ant-warning mb-1.5">
                  <i className="ri-error-warning-line mr-1" />Các mục còn thiếu trước khi xuất bến:
                </p>
                <ul className="space-y-0.5">
                  {missingItems.map((item, i) => (
                    <li key={i} className="text-xs text-ant-text-secondary flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-ant-warning shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setStep('confirm')}
              disabled={!canConfirm}
              className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap"
            >
              <i className="ri-arrow-right-line mr-2" />Tiếp tục — Xác nhận Xuất Bến
            </button>
          </>
        )}

        {/* Step 5: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="bg-ant-xk-light rounded-xl border border-ant-xk/20 p-4">
              <h3 className="text-sm font-bold text-ant-xk mb-3">
                <i className="ri-check-double-line mr-1" />Xác nhận Xuất Bến
              </h3>
              <div className="space-y-2">
                <InfoRow label="Phiếu xuất" value={delivery.id} mono />
                <InfoRow label="Khách hàng" value={delivery.customer} />
                <InfoRow label="Container" value={ocrContainer} mono />
                <InfoRow label="Seal" value={ocrSeal} mono />
                <InfoRow label="Nhiệt độ" value={`${temperature}°C`} />
                <InfoRow label="Pallet" value={`${scannedPallets.length}/${relatedPallets.length} đã quét`} />
                <InfoRow label="Checklist" value={`${CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length}/${CHECKLIST_ITEMS.length} đạt`} success />
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">Pallet đã loading</h3>
              {scannedPallets.map((pId) => {
                const p = relatedPallets.find((rp) => rp.id === pId);
                return (
                  <div key={pId} className="flex items-center gap-2 py-1">
                    <i className="ri-checkbox-circle-fill text-ant-sx text-sm" />
                    <span className="text-xs font-mono text-ant-text">{pId}</span>
                    {p && <span className="text-xxs text-ant-text-secondary">{p.qty} {p.unit}</span>}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('checklist')}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-1" />Kiểm tra lại
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex-1 h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-ship-line mr-1.5" />Xác nhận Xuất Bến
              </button>
            </div>
          </>
        )}
      </div>

      {/* Success popup */}
      {showExportPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-6 w-full max-w-mobile animate-slide-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
              <i className="ri-ship-line text-3xl text-ant-sx" />
            </div>
            <h3 className="text-base font-bold text-ant-text text-center">Đã Xuất Bến!</h3>
            <p className="text-sm text-ant-text-secondary text-center mt-2">
              OD {delivery.id} đã rời kho thành công.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mt-3 space-y-1">
              <p className="text-xs text-ant-text-secondary">Container: <span className="font-mono font-bold text-ant-text">{ocrContainer}</span></p>
              <p className="text-xs text-ant-text-secondary">Seal: <span className="font-mono font-bold text-ant-text">{ocrSeal}</span></p>
              <p className="text-xs text-ant-text-secondary">Trạng thái: <span className="font-bold text-ant-xk">Đã xuất kho vật lý</span></p>
              <p className="text-xs text-ant-text-secondary">Kế toán: <span className="font-bold text-ant-nk">Sẵn sàng xuất hóa đơn mock</span></p>
            </div>
            <button
              onClick={() => navigate('/outbound')}
              className="w-full h-10 mt-4 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-colors whitespace-nowrap"
            >
              Về danh sách phiếu xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, success }: { label: string; value: string; mono?: boolean; success?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm font-medium ${success ? 'text-ant-sx font-bold' : 'text-ant-text'} ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}