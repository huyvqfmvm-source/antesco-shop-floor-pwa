import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useApp, type PermissionAction } from '@/store/AppContext';

export type ScanType = 'production_order' | 'pallet_hu' | 'batch' | 'bin' | 'outbound_delivery' | 'container_seal' | 'ocr_plate' | 'ocr_weigh' | 'ocr_production' | 'ocr_container' | 'ocr_seal' | 'voice_to_text';

interface ScanResult {
  code: string;
  label: string;
  extra?: string;
}

const SCAN_OPTIONS: { type: ScanType; label: string; icon: string; color: string }[] = [
  { type: 'production_order', label: 'Lệnh sản xuất', icon: 'ri-file-list-3-line', color: 'ant-sx' },
  { type: 'pallet_hu', label: 'Pallet / HU', icon: 'ri-stack-line', color: 'ant-nk' },
  { type: 'batch', label: 'Batch', icon: 'ri-flask-line', color: 'ant-xk' },
  { type: 'bin', label: 'Bin / Ô kệ', icon: 'ri-layout-grid-line', color: 'ant-qm' },
  { type: 'outbound_delivery', label: 'Outbound Delivery', icon: 'ri-truck-line', color: 'ant-xk' },
  { type: 'container_seal', label: 'Container / Seal', icon: 'ri-ship-line', color: 'ant-nk' },
  { type: 'ocr_plate', label: 'OCR biển số xe', icon: 'ri-car-line', color: 'ant-qm' },
  { type: 'ocr_weigh', label: 'OCR phiếu cân', icon: 'ri-scales-3-line', color: 'ant-sx' },
  { type: 'ocr_production', label: 'OCR bảng kê SL', icon: 'ri-file-chart-line', color: 'ant-xk' },
  { type: 'voice_to_text', label: 'Voice-to-Text', icon: 'ri-mic-line', color: 'ant-offline' },
];

const SCAN_PERMISSION_MAP: Record<ScanType, PermissionAction[]> = {
  production_order: ['PRODUCTION_VIEW'],
  pallet_hu: ['INBOUND_VIEW', 'OUTBOUND_VIEW', 'PRODUCTION_PALLET'],
  batch: ['PRODUCTION_VIEW', 'QM_VIEW'],
  bin: ['INBOUND_PUTAWAY', 'QM_CYCLE_COUNT'],
  outbound_delivery: ['OUTBOUND_VIEW'],
  container_seal: ['OUTBOUND_CONTAINER_LOADING', 'OUTBOUND_CONTAINER_CHECK', 'QM_CONTAINER_CHECK'],
  ocr_plate: ['TRANSFER_ORDER', 'OUTBOUND_CONTAINER_LOADING'],
  ocr_weigh: ['INBOUND_RECEIVE_RM', 'VIEW_DOCUMENTS'],
  ocr_production: ['INBOUND_FG_RECEIVING', 'PRODUCTION_CONFIRM_FG'],
  ocr_container: ['OUTBOUND_CONTAINER_CHECK', 'QM_CONTAINER_CHECK'],
  ocr_seal: ['OUTBOUND_CONTAINER_CHECK', 'QM_CONTAINER_CHECK'],
  voice_to_text: ['QM_HOLD', 'ERROR_QUEUE_RESOLVE'],
};

const MOCK_SCAN_RESULTS: Record<ScanType, ScanResult> = {
  production_order: { code: '10000456', label: 'PO: Xoài đông IQF cắt xí ngầu 1.5cm', extra: '5,000 KG · CRTD' },
  pallet_hu: { code: 'HU-2026-MA-FG-XN-0005', label: 'HU Thành phẩm', extra: 'TP0061 · 4,500 KG · KL-03-B2-T3' },
  batch: { code: '002216225', label: 'Batch thành phẩm', extra: 'TP0061 · Xoài đông IQF · Đang SX' },
  bin: { code: 'KL-03-B2-T3', label: 'Ô kệ kho lạnh 03', extra: 'Hàng B, Tầng 2, Vị trí 3 · Có hàng' },
  outbound_delivery: { code: 'OD-2026-0098', label: 'Outbound Delivery', extra: 'ANTESCO EU GmbH · TGBU1234567' },
  container_seal: { code: 'TGBU1234567', label: 'Container', extra: 'Seal: SEAL-889912 · OD-2026-0098' },
  ocr_plate: { code: '67C-123.45', label: 'Biển số xe', extra: 'Xe tải lạnh · Đã đăng ký' },
  ocr_weigh: { code: 'GW-8500-KG', label: 'Phiếu cân', extra: 'Gross Weight: 8,500 KG · 16/06/2026' },
  ocr_production: { code: 'SL-450-THUNG', label: 'Bảng kê sản lượng', extra: '450 thùng · TP0061' },
  ocr_container: { code: 'TGBU1234567', label: 'Số container', extra: 'Container lạnh · đạt kiểm tra vỏ thùng' },
  ocr_seal: { code: 'SEAL-889912', label: 'Số seal', extra: 'Niêm phong xuất khẩu · OD-2026-0098' },
  voice_to_text: { code: 'VOICE-001', label: 'Voice-to-Text', extra: 'Lô xoài xí ngầu phát sinh lỗi rách màng bao bì tạm tại góc pallet' },
};

export default function ScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, addToast, simulateAction } = useApp();
  const [step, setStep] = useState<'select' | 'scanning' | 'detected' | 'result'>('select');
  const [scanType, setScanType] = useState<ScanType | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [usePressed, setUsePressed] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allowedScanOptions = useMemo(() => {
    const currentRolePermissions = state.rolePermissions[state.role?.id || ''] || [];
    if (state.role?.id === 'admin') return SCAN_OPTIONS;
    return SCAN_OPTIONS.filter((option) => SCAN_PERMISSION_MAP[option.type].some((permission) => currentRolePermissions.includes(permission)));
  }, [state.role?.id, state.rolePermissions]);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setScanType(null);
      setResult(null);
      setManualCode('');
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    };
  }, []);

  const handleSelectType = useCallback((type: ScanType) => {
    setScanType(type);
    setStep('scanning');

    // Phase 1: scanning (0.5-0.8s)
    scanTimerRef.current = setTimeout(() => {
      setStep('detected');

      // Phase 2: detected → result (0.3s)
      detectTimerRef.current = setTimeout(() => {
        setResult(MOCK_SCAN_RESULTS[type]);
        setStep('result');
      }, 350);
    }, 500 + Math.random() * 400);
  }, []);

  const handleUseCode = useCallback(() => {
    if (!result || !scanType) return;
    setUsePressed(true);
    const option = allowedScanOptions.find((o) => o.type === scanType);
    const actionLabel = option?.label || scanType;
    simulateAction(
      `Quét ${actionLabel}`,
      `${result.code} — ${result.label}${result.extra ? ` (${result.extra})` : ''}`,
      `Đã quét thành công: ${result.code}`,
      () => {
        setUsePressed(false);
        onClose();
      }
    );
  }, [allowedScanOptions, result, scanType, simulateAction, onClose]);

  const handleUseManualCode = useCallback(() => {
    const code = manualCode.trim();
    if (!code || !scanType) {
      addToast('warning', 'Vui lòng chọn loại mã và nhập mã cần dùng');
      return;
    }
    const option = allowedScanOptions.find((o) => o.type === scanType);
    setResult({
      code,
      label: option?.label || 'Mã quét thủ công',
      extra: 'Nhập từ máy quét cầm tay / bàn phím',
    });
    setStep('result');
  }, [allowedScanOptions, manualCode, scanType, addToast]);

  const handleRescan = useCallback(() => {
    setStep('select');
    setScanType(null);
    setResult(null);
    setManualCode('');
  }, []);

  if (!isOpen) return null;

  const getColor = () => {
    if (!scanType) return { primary: 'ant-sx', ring: '#16A34A' };
    const opt = allowedScanOptions.find((o) => o.type === scanType);
    if (!opt) return { primary: 'ant-sx', ring: '#16A34A' };
    const map: Record<string, { primary: string; ring: string }> = {
      'ant-sx': { primary: 'ant-sx', ring: '#16A34A' },
      'ant-nk': { primary: 'ant-nk', ring: '#2563EB' },
      'ant-xk': { primary: 'ant-xk', ring: '#F97316' },
      'ant-qm': { primary: 'ant-qm', ring: '#374151' },
      'ant-offline': { primary: 'ant-offline', ring: '#7C3AED' },
    };
    return map[opt.color] || { primary: 'ant-sx', ring: '#16A34A' };
  };
  const scanColors = getColor();

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[430px] bg-ant-card rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Handle bar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <h3 className="text-sm font-bold text-ant-text">
            {step === 'select' && 'Quét mã'}
            {step === 'scanning' && 'Đang quét...'}
            {step === 'detected' && 'Đã nhận diện'}
            {step === 'result' && 'Kết quả quét'}
          </h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-90 transition-all">
            <i className="ri-close-line text-lg text-ant-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {step === 'select' && (
            <div>
              <p className="text-xs text-ant-text-secondary mb-3">Chọn loại mã cần quét</p>
              <div className="grid grid-cols-2 gap-2">
                {allowedScanOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleSelectType(opt.type)}
                    className={`p-3 rounded-xl border border-gray-100 text-left transition-all active:scale-[0.96] hover:border-gray-200 hover:bg-gray-50/50 bg-ant-bg`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-${opt.color}/10 flex items-center justify-center mb-1.5`}>
                      <i className={`${opt.icon} text-${opt.color} text-sm`} />
                    </div>
                    <p className="text-xs font-bold text-ant-text leading-tight">{opt.label}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-ant-nk/15 bg-ant-nk/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-ant-nk/10 flex items-center justify-center">
                    <i className="ri-keyboard-line text-ant-nk text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ant-text">Nhập mã nhanh</p>
                    <p className="text-xxs text-ant-text-secondary">Dùng máy quét barcode dạng bàn phím hoặc nhập tay</p>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={scanType || ''}
                    onChange={(e) => setScanType(e.target.value as ScanType)}
                    className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-ant-text outline-none focus:border-ant-nk"
                  >
                    <option value="">Chọn loại mã</option>
                    {allowedScanOptions.map((opt) => <option key={opt.type} value={opt.type}>{opt.label}</option>)}
                  </select>
                  <button onClick={handleUseManualCode} className="h-11 px-4 rounded-xl bg-ant-nk text-white text-xs font-bold active:scale-[0.97]">
                    Dùng
                  </button>
                </div>
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUseManualCode(); }}
                  className="mt-2 w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-mono text-ant-text outline-none focus:border-ant-nk"
                  placeholder="Ví dụ: HU-2026-MA-FG-XN-0007"
                  autoCapitalize="characters"
                />
              </div>
            </div>
          )}

          {(step === 'scanning' || step === 'detected') && (
            <div className="flex flex-col items-center">
              {/* Camera frame */}
              <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#0a0a0a] overflow-hidden mb-4">
                {/* Dark camera background with subtle texture */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#0d0d0d] to-[#111]" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

                {/* Center focus area */}
                <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] border border-white/10 rounded-lg">
                  {/* Corner markers */}
                  <div className={`absolute -top-[2px] -left-[2px] w-10 h-10 border-t-[3px] border-l-[3px] border-${scanColors.primary} rounded-tl-xl`} />
                  <div className={`absolute -top-[2px] -right-[2px] w-10 h-10 border-t-[3px] border-r-[3px] border-${scanColors.primary} rounded-tr-xl`} />
                  <div className={`absolute -bottom-[2px] -left-[2px] w-10 h-10 border-b-[3px] border-l-[3px] border-${scanColors.primary} rounded-bl-xl`} />
                  <div className={`absolute -bottom-[2px] -right-[2px] w-10 h-10 border-b-[3px] border-r-[3px] border-${scanColors.primary} rounded-br-xl`} />
                </div>

                {/* Scanning line */}
                {step === 'scanning' && (
                  <div className={`absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-${scanColors.primary} to-transparent animate-scan-line shadow-lg shadow-${scanColors.primary}/30`} style={{ top: '15%' }} />
                )}

                {/* Detected overlay */}
                {step === 'detected' && (
                  <div className={`absolute top-[15%] left-[10%] right-[10%] bottom-[15%] bg-${scanColors.primary}/10 border-2 border-${scanColors.primary}/50 rounded-lg transition-all duration-300`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full bg-${scanColors.primary}/20 flex items-center justify-center animate-scale-in`}>
                        <i className={`ri-check-line text-2xl text-white`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status text */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  {step === 'scanning' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 border-2 border-${scanColors.primary}/60 border-t-transparent rounded-full animate-spin`} />
                      <p className="text-white/50 text-xs font-medium">Đang quét mã...</p>
                    </div>
                  ) : (
                    <p className={`text-${scanColors.primary} text-xs font-bold`}>Đã nhận diện</p>
                  )}
                </div>
              </div>

              {step === 'scanning' && (
                <p className="text-xs text-ant-text-secondary text-center">Giữ thiết bị ổn định, đưa mã QR vào khung giữa</p>
              )}
              {step === 'detected' && (
                <p className="text-xs text-ant-sx font-medium text-center flex items-center gap-1.5">
                  <i className="ri-check-line" />
                  Đã nhận diện thành công, đang xử lý...
                </p>
              )}
            </div>
          )}

          {step === 'result' && result && (
            <div>
              {/* Success badge */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-ant-sx/10 flex items-center justify-center">
                  <i className="ri-check-double-line text-2xl text-ant-sx" />
                </div>
                <p className="text-sm font-bold text-ant-sx mt-2">Quét thành công</p>
              </div>

              {/* Result card */}
              <div className="bg-ant-bg rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <p className="text-xxs text-ant-text-secondary/60 uppercase tracking-wider font-bold">Mã quét</p>
                  <p className="text-lg font-mono font-bold text-ant-text mt-0.5">{result.code}</p>
                </div>
                <div className="border-t border-gray-200/60" />
                <div>
                  <p className="text-xxs text-ant-text-secondary/60 uppercase tracking-wider font-bold">Mô tả</p>
                  <p className="text-sm font-medium text-ant-text mt-0.5">{result.label}</p>
                </div>
                {result.extra && (
                  <>
                    <div className="border-t border-gray-200/60" />
                    <div>
                      <p className="text-xxs text-ant-text-secondary/60 uppercase tracking-wider font-bold">Chi tiết</p>
                      <p className="text-xs text-ant-text-secondary mt-0.5">{result.extra}</p>
                    </div>
                  </>
                )}
              </div>

              {/* AI suggestion for voice */}
              {scanType === 'voice_to_text' && (
                <div className="bg-ant-error/5 rounded-xl p-3.5 border border-ant-error/15 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-ant-error/20 flex items-center justify-center">
                      <i className="ri-robot-line text-xs text-ant-error" />
                    </div>
                    <p className="text-xs font-bold text-ant-error">AI gợi ý mã lỗi</p>
                  </div>
                  <div className="bg-ant-card rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-base font-mono font-bold text-ant-error">DF-005</p>
                      <p className="text-xs text-ant-text-secondary mt-0.5">Rách bao bì / Sự cố vật lý</p>
                    </div>
                    <button className="text-xs text-ant-qm font-medium hover:underline">Đổi mã</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRescan}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-sm font-semibold text-ant-text-secondary hover:bg-gray-50 active:scale-[0.97] transition-all whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-refresh-line mr-1.5" />
                  Quét lại
                </button>
                <button
                  onClick={handleUseCode}
                  disabled={usePressed}
                  className={`flex-1 h-12 rounded-xl bg-${scanColors.primary} text-white text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all whitespace-nowrap cursor-pointer disabled:opacity-70`}
                >
                  {usePressed ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : (
                    <>
                      <i className="ri-check-line mr-1.5" />
                      Dùng mã này
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
