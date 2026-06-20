import { useState } from 'react';
import { type ScanCodeType, type ScanEvent } from '@/hooks/useMockScan';
import { MOCK_SCAN_SAMPLE_CODES } from '@/mocks/scan-logs';

interface MockScannerProps {
  allowedTypes: ScanCodeType[];
  scannedCodes: string[];
  lastScan: ScanEvent | null;
  onMockScan: (codeValue?: string) => ScanEvent | null;
  onManualSubmit: () => void;
  onResetScan: () => void;
  manualCode: string;
  showManualInput: boolean;
  onManualCodeChange: (code: string) => void;
  onToggleManualInput: () => void;
  compact?: boolean;
}

export default function MockScanner({
  allowedTypes,
  scannedCodes,
  lastScan,
  onMockScan,
  onManualSubmit,
  onResetScan,
  manualCode,
  showManualInput,
  onManualCodeChange,
  onToggleManualInput,
  compact = false,
}: MockScannerProps) {
  const [showSampleCodes, setShowSampleCodes] = useState(false);

  const sampleCodes = allowedTypes.flatMap((type) =>
    (MOCK_SCAN_SAMPLE_CODES[type] || []).map((code) => ({ type, code }))
  );

  return (
    <div className={`bg-ant-card rounded-2xl border border-gray-100 ${compact ? 'p-3' : 'p-4'} space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ant-sx/10 flex items-center justify-center">
            <i className="ri-qr-scan-line text-ant-sx text-sm" />
          </div>
          <div>
            <p className="text-xs font-bold text-ant-text">Quét mã</p>
            <p className="text-xxs text-ant-text-secondary">
              {scannedCodes.length > 0 ? `${scannedCodes.length} mã đã quét` : allowedTypes.join(', ')}
            </p>
          </div>
        </div>
        {scannedCodes.length > 0 && (
          <button
            onClick={() => { onResetScan(); }}
            className="h-8 px-2.5 rounded-lg text-xxs font-medium text-ant-text-secondary hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <i className="ri-refresh-line mr-1" />Làm mới
          </button>
        )}
      </div>

      {/* Scan result */}
      {lastScan && (
        <div
          className={`rounded-xl p-3 flex items-center gap-3 animate-scale-in ${
            lastScan.result === 'success'
              ? 'bg-ant-sx/5 border border-ant-sx/20'
              : lastScan.result === 'duplicate'
              ? 'bg-ant-warning/5 border border-ant-warning/20'
              : 'bg-ant-error/5 border border-ant-error/20'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              lastScan.result === 'success'
                ? 'bg-ant-sx/10 text-ant-sx'
                : lastScan.result === 'duplicate'
                ? 'bg-ant-warning/10 text-ant-warning'
                : 'bg-ant-error/10 text-ant-error'
            }`}
          >
            <i
              className={`${
                lastScan.result === 'success'
                  ? 'ri-check-line'
                  : lastScan.result === 'duplicate'
                  ? 'ri-repeat-line'
                  : 'ri-close-line'
              } text-sm`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-bold ${
                lastScan.result === 'success'
                  ? 'text-ant-sx'
                  : lastScan.result === 'duplicate'
                  ? 'text-ant-warning'
                  : 'text-ant-error'
              }`}
            >
              {lastScan.result === 'success' ? 'Quét thành công' : lastScan.result === 'duplicate' ? 'Trùng mã' : 'Lỗi quét'}
            </p>
            <p className="text-xxs text-ant-text-secondary truncate">{lastScan.codeValue}</p>
            <p className="text-xxs text-ant-text-secondary mt-0.5 line-clamp-2">{lastScan.message}</p>
          </div>
        </div>
      )}

      {/* Scanned codes list */}
      {scannedCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scannedCodes.map((code, idx) => (
            <span
              key={`${code}-${idx}`}
              className="h-7 px-2.5 rounded-full bg-ant-sx/10 text-ant-sx text-xxs font-mono font-bold inline-flex items-center gap-1"
            >
              <i className="ri-check-line text-xs" />
              {code}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2`}>
        <button
          onClick={() => onMockScan()}
          className="flex-1 h-12 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-qr-scan-line text-base" />
          Quét mô phỏng
        </button>
        <button
          onClick={onToggleManualInput}
          className={`flex-1 h-12 rounded-xl border text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
            showManualInput
              ? 'border-ant-sx bg-ant-sx/5 text-ant-sx'
              : 'border-gray-200 bg-white text-ant-text-secondary hover:bg-gray-50'
          }`}
        >
          <i className="ri-keyboard-line text-base" />
          Nhập tay
        </button>
        <button
          onClick={() => setShowSampleCodes(!showSampleCodes)}
          className="h-12 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-ant-text-secondary hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          <i className="ri-file-list-3-line text-sm" />
          Mã mẫu
        </button>
      </div>

      {/* Sample codes */}
      {showSampleCodes && sampleCodes.length > 0 && (
        <div className="rounded-xl bg-ant-bg border border-gray-100 p-3 animate-slide-down">
          <p className="text-xxs font-bold text-ant-text-secondary mb-2">Mã mẫu có sẵn</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleCodes.map((item) => (
              <button
                key={`${item.type}-${item.code}`}
                onClick={() => onMockScan(item.code)}
                className="h-8 px-2.5 rounded-full bg-white border border-gray-200 text-xxs font-mono font-bold text-ant-text hover:bg-ant-sx/5 hover:border-ant-sx/30 hover:text-ant-sx active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="text-ant-text-secondary text-[9px] mr-1">{item.type}:</span>
                {item.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual input */}
      {showManualInput && (
        <div className="flex gap-2 animate-slide-down">
          <div className="relative flex-1">
            <i className="ri-barcode-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ant-text-secondary" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => onManualCodeChange(e.target.value)}
              placeholder={`Nhập mã ${allowedTypes.join('/')}...`}
              onKeyDown={(e) => { if (e.key === 'Enter') onManualSubmit(); }}
              className="w-full h-12 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm text-ant-text placeholder:text-ant-text-secondary focus:outline-none focus:border-ant-sx focus:ring-2 focus:ring-ant-sx/20 transition-all"
              autoFocus
            />
          </div>
          <button
            onClick={onManualSubmit}
            disabled={!manualCode.trim()}
            className="h-12 px-4 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
          >
            <i className="ri-arrow-right-line" />
          </button>
        </div>
      )}
    </div>
  );
}