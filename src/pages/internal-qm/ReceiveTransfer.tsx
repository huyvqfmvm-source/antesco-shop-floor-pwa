import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

const MOCK_PALLETS = [
  { id: 'HU-IQF-XN-01', qty: 500, unit: 'KG', product: 'TP0061', scanned: false },
  { id: 'HU-IQF-XN-02', qty: 500, unit: 'KG', product: 'TP0061', scanned: false },
  { id: 'HU-IQF-XN-03', qty: 500, unit: 'KG', product: 'TP0061', scanned: false },
  { id: 'HU-IQF-XN-04', qty: 500, unit: 'KG', product: 'TP0061', scanned: false },
  { id: 'HU-IQF-XN-05', qty: 500, unit: 'KG', product: 'TP0061', scanned: false },
];

export default function ReceiveTransferPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();
  const [scannedPallets, setScannedPallets] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleScanPallet = useCallback((huId: string) => {
    if (scannedPallets.includes(huId)) {
      addToast('warning', 'Pallet đã được quét');
      return;
    }
    setScannedPallets((prev) => [...prev, huId]);
    addToast('success', `Đã quét ${huId}`);
  }, [scannedPallets, addToast]);

  const handleScanAll = useCallback(() => {
    const all = MOCK_PALLETS.map((p) => p.id);
    setScannedPallets(all);
    addToast('success', 'Đã quét tất cả 5 pallet');
  }, [addToast]);

  const handleConfirm = useCallback(() => {
    const missing = MOCK_PALLETS.length - scannedPallets.length;
    if (missing > 0 && !note.trim()) {
      addToast('warning', `Thiếu ${missing} pallet — vui lòng nhập ghi chú lý do`);
      return;
    }

    setIsConfirming(true);
    simulateAction(
      'Nhận hàng ĐC',
      `ST-2026-0089 — ${scannedPallets.length}/${MOCK_PALLETS.length} pallet nhận tại BK${missing > 0 ? `, thiếu ${missing} pallet` : ''}`,
      missing > 0 ? 'Đã nhận — Có chênh lệch, đã ghi chú' : 'Đã nhận đủ — Hoàn tất điều chuyển',
      () => {
        dispatch({ type: 'UPDATE_TRANSFER_ORDER', payload: { id: 'ST-2026-0089', updates: { status: 'Đã nhận tại Bình Khánh' } } });
        scannedPallets.forEach((hu) => {
          dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: hu, updates: { plant: 'BK', location: 'KL-05', status: 'Chờ putaway' } } });
        });
        setIsConfirming(false);
        setConfirmed(true);
      }
    );
  }, [scannedPallets, note, addToast, simulateAction, dispatch]);

  const missing = MOCK_PALLETS.length - scannedPallets.length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">Xác nhận nhận hàng</h2>
          <p className="text-xxs text-ant-text-secondary">ST-2026-0089 — NM Bình Khánh · KL-05</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-ant-nk rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-archive-drawer-line text-base" />
          <span className="text-xs font-bold">NHẬN HÀNG TẠI BÌNH KHÁNH</span>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <span className="text-xs">Từ: Mỹ An · KL-03</span>
          <i className="ri-arrow-right-line text-xs" />
          <span className="text-xs">Đến: Bình Khánh · KL-05</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
          <span>Xe: 67C-123.45</span>
          <span>-18°C</span>
          <span>5 pallet · 2,500 KG</span>
        </div>
      </div>

      {/* Pallet scanning */}
      <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ant-text">Quét pallet nhận ({scannedPallets.length}/{MOCK_PALLETS.length})</h3>
          <button onClick={handleScanAll} className="text-xs text-ant-nk font-medium">
            Quét tất cả
          </button>
        </div>

        {missing > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-ant-warning/10 border border-ant-warning/30 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-alert-line text-ant-warning text-sm" />
            </div>
            <p className="text-xs font-medium text-ant-warning">Thiếu {missing} pallet — cần ghi chú lý do</p>
          </div>
        )}

        <div className="space-y-2">
          {MOCK_PALLETS.map((p) => {
            const isScanned = scannedPallets.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleScanPallet(p.id)}
                disabled={isScanned}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isScanned ? 'bg-ant-sx-light border-ant-sx/20' : 'bg-ant-bg border-gray-100 hover:border-ant-nk/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isScanned ? 'bg-ant-sx/10' : 'bg-gray-100'
                  }`}>
                    <i className={`${isScanned ? 'ri-check-line text-ant-sx' : 'ri-stack-line text-ant-text-secondary'} text-sm`} />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                    <p className="text-xxs text-ant-text-secondary">{p.qty} {p.unit} · {p.product}</p>
                  </div>
                </div>
                {isScanned && <span className="text-xxs text-ant-sx font-medium">Đã quét</span>}
                {!isScanned && <span className="text-xxs text-ant-text-secondary/40">Chưa quét</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      {missing > 0 && (
        <div className="bg-ant-card rounded-xl border border-yellow-200 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-2">Ghi chú chênh lệch</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Nhập lý do thiếu ${missing} pallet...`}
            maxLength={500}
            className="w-full p-3 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-20 focus:outline-none focus:border-ant-warning"
          />
          <p className="text-xxs text-ant-text-secondary text-right mt-1">{note.length}/500</p>
        </div>
      )}

      {/* Confirm */}
      {!confirmed && (
        <button
          onClick={handleConfirm}
          disabled={isConfirming || scannedPallets.length === 0}
          className="w-full py-4 rounded-xl bg-ant-nk text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isConfirming ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ĐANG XÁC NHẬN...
            </>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-check-double-line text-lg" />
              </div>
              {missing > 0 ? 'XÁC NHẬN NHẬN HÀNG (CÓ CHÊNH LỆCH)' : 'XÁC NHẬN NHẬN ĐỦ HÀNG'}
            </>
          )}
        </button>
      )}

      {confirmed && (
        <div className="bg-ant-sx rounded-xl p-6 text-white text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <i className="ri-check-line text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold">ĐÃ NHẬN HÀNG TẠI BÌNH KHÁNH</h3>
            <p className="text-sm text-white/70 mt-1">
              {missing > 0
                ? `Đã nhận ${scannedPallets.length}/${MOCK_PALLETS.length} pallet — Có chênh lệch`
                : 'Đã nhận đủ 5 pallet'}
            </p>
          </div>
          <Link to="/internal-qm" className="block py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium text-center">
            Về Nội bộ & QM
          </Link>
        </div>
      )}
    </div>
  );
}
