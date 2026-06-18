import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_BOM_PO_10000456 } from '@/mocks/data';
import type { BomItem } from '@/store/AppContext';

type ScanStatus = 'pending' | 'scanned' | 'shortage' | 'wrong_lot' | 'qc_hold';

interface BomLineState {
  item: BomItem;
  status: ScanStatus;
  actualLot: string;
}

const SCAN_STATUS_CONFIG: Record<ScanStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Chưa quét', color: 'text-ant-text-secondary', bg: 'bg-gray-100', icon: 'ri-checkbox-blank-circle-line' },
  scanned: { label: 'Đã quét đủ', color: 'text-ant-success', bg: 'bg-ant-success/10', icon: 'ri-checkbox-circle-line' },
  shortage: { label: 'Thiếu số lượng', color: 'text-ant-warning', bg: 'bg-ant-warning/10', icon: 'ri-alert-line' },
  wrong_lot: { label: 'Sai lô FEFO', color: 'text-ant-error', bg: 'bg-ant-error/10', icon: 'ri-close-circle-line' },
  qc_hold: { label: 'Lô bị khóa QC', color: 'text-ant-error', bg: 'bg-ant-error/10', icon: 'ri-error-warning-line' },
};

const CATEGORY_LABELS: Record<string, string> = { raw: 'Nguyên liệu', chemical: 'Hóa chất', packaging: 'Bao bì' };

export default function ProductionMaterialPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();

  const [lines, setLines] = useState<BomLineState[]>(
    MOCK_BOM_PO_10000456.map((item) => ({ item, status: 'pending' as ScanStatus, actualLot: '' }))
  );
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleScanLine = useCallback((index: number) => {
    setScanningIndex(index);
    const line = lines[index];

    setTimeout(() => {
      const newLines = [...lines];
      // Simulate different results
      const rand = Math.random();
      if (rand < 0.7) {
        // Success
        newLines[index] = { ...line, status: 'scanned', actualLot: line.item.requiredLot };
      } else if (rand < 0.85) {
        // Wrong lot - FEFO warning
        newLines[index] = { ...line, status: 'wrong_lot', actualLot: '002210025' };
      } else if (rand < 0.95) {
        // QC hold
        newLines[index] = { ...line, status: 'qc_hold', actualLot: line.item.requiredLot };
      } else {
        // Shortage
        newLines[index] = { ...line, status: 'shortage', actualLot: line.item.requiredLot };
      }
      setLines(newLines);
      setScanningIndex(null);
    }, 600 + Math.random() * 500);
  }, [lines]);

  const handleConfirm = () => {
    const hasErrors = lines.some((l) => l.status === 'wrong_lot' || l.status === 'qc_hold');
    if (hasErrors) {
      addToast('error', 'Có dòng vật tư bị sai lô hoặc khóa QC. Vui lòng kiểm tra lại trước khi xác nhận.');
      return;
    }
    setConfirming(true);
    simulateAction(
      'Cấp phát vật tư',
      `PO ${id} — ${lines.filter((l) => l.status === 'scanned').length}/${lines.length} dòng đã quét`,
      `Đã xác nhận cấp vật tư cho lệnh ${id}`,
      () => {
        if (id) {
          dispatch({ type: 'UPDATE_PRODUCTION_ORDER_STATUS', payload: { id, status: 'STRT' } });
        }
        setConfirming(false);
        setTimeout(() => navigate(`/production/detail/${id}`), 500);
      }
    );
  };

  const scannedCount = lines.filter((l) => l.status === 'scanned').length;
  const errorCount = lines.filter((l) => l.status === 'wrong_lot' || l.status === 'qc_hold').length;

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
          <i className="ri-archive-line text-sm" />
          <span className="text-xs font-medium opacity-80">CẤP PHÁT VẬT TƯ</span>
        </div>
        <h2 className="text-lg font-bold">PO {id}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {scannedCount}/{lines.length} dòng OK
          </span>
          {errorCount > 0 && (
            <span className="text-xs bg-ant-error/40 px-2 py-1 rounded-full">
              {errorCount} lỗi
            </span>
          )}
        </div>
      </div>

      {/* BOM List */}
      <div>
        <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-3">
          Định mức vật tư (BOM)
        </h3>
        <div className="space-y-2">
          {lines.map((line, index) => {
            const st = SCAN_STATUS_CONFIG[line.status];
            return (
              <div
                key={line.item.materialCode}
                className={`bg-ant-card rounded-xl border p-3 transition-all ${
                  line.status === 'wrong_lot' ? 'border-ant-error/30 bg-ant-error/5' :
                  line.status === 'qc_hold' ? 'border-ant-error/20 bg-ant-error/5' :
                  line.status === 'scanned' ? 'border-ant-success/20 bg-ant-success/5' :
                  'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xxs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-ant-text-secondary">
                        {CATEGORY_LABELS[line.item.category]}
                      </span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ant-text mt-1.5">{line.item.materialName}</p>
                    <p className="text-xs text-ant-text-secondary mt-0.5">
                      Mã: <span className="font-mono">{line.item.materialCode}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-ant-text-secondary mb-3">
                  <span>Lô yêu cầu: <strong className="text-ant-text font-mono">{line.item.requiredLot}</strong></span>
                  <span>SL: <strong className="text-ant-text">{line.item.requiredQty.toLocaleString()} {line.item.unit}</strong></span>
                </div>
                {line.status === 'scanned' && (
                  <div className="flex items-center gap-2 text-xs text-ant-success bg-ant-success/5 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-check-line text-base" />
                    </div>
                    Đã quét lô {line.actualLot} — Tít!
                  </div>
                )}
                {line.status === 'wrong_lot' && (
                  <div className="flex items-center gap-2 text-xs text-ant-error bg-ant-error/5 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-error-warning-line text-base" />
                    </div>
                    Quét sai lô FEFO! Yêu cầu {line.item.requiredLot}, đã quét {line.actualLot}
                  </div>
                )}
                {line.status === 'qc_hold' && (
                  <div className="flex items-center gap-2 text-xs text-ant-error bg-ant-error/5 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-error-warning-line text-base" />
                    </div>
                    Lô {line.actualLot} đang bị khóa QC — không thể cấp phát!
                  </div>
                )}
                {/* Scan button if not scanned */}
                {line.status === 'pending' && (
                  <button
                    onClick={() => handleScanLine(index)}
                    disabled={scanningIndex !== null}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-ant-sx/30 text-ant-sx text-xs font-bold hover:bg-ant-sx/5 transition-all active:scale-[0.98]"
                  >
                    {scanningIndex === index ? (
                      <>
                        <div className="w-4 h-4 border-2 border-ant-sx border-t-transparent rounded-full animate-spin" />
                        Đang quét QR...
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-qr-scan-line text-sm" />
                        </div>
                        Quét QR/Barcode
                      </>
                    )}
                  </button>
                )}
                {(line.status === 'wrong_lot' || line.status === 'qc_hold' || line.status === 'shortage') && (
                  <button
                    onClick={() => {
                      const newLines = [...lines];
                      newLines[index] = { ...line, status: 'pending', actualLot: '' };
                      setLines(newLines);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 text-ant-text-secondary text-xs font-medium hover:bg-gray-100 transition-all"
                  >
                    <i className="ri-refresh-line text-sm" />
                    Quét lại
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={confirming || scannedCount === 0}
        className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
          confirming || scannedCount === 0
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
            Xác nhận cấp vật tư
          </>
        )}
      </button>

      <div className="h-4" />
    </div>
  );
}