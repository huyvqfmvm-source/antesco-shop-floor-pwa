import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';

type BtpStep = 'select' | 'scan_pallet' | 'scan_bin' | 'confirm';

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

export default function BTPIssuePage() {
  const { state, simulateAction, addToast, addActivityLog, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<BtpStep>('select');
  const [scanning, setScanning] = useState(false);
  const [scannedPalletOk, setScannedPalletOk] = useState(false);
  const [scannedBinOk, setScannedBinOk] = useState(false);
  const [selectedLine, setSelectedLine] = useState('');

  const canIssueBtp = hasPermission(state.role?.id, 'OUTBOUND_BTP_ISSUE');

  const btpPallet = state.handlingUnits.find((h) => h.type === 'BTP' && h.plant === (state.plant?.code || 'MA') && h.status === 'Chờ chế biến');
  const btpBin = btpPallet?.location || 'KM-01-A2';
  const relatedPO = btpPallet
    ? state.productionOrders.find((po) => po.huBtp === btpPallet.id)
    : state.productionOrders.find((po) => po.plant === (state.plant?.code || 'MA'));
  const currentBtpStock = btpPallet?.qty || 3200;
  const issueQty = Math.min(1600, currentBtpStock);

  const productionLines = [
    { id: 'line-cut', name: 'Chuyền cắt xí ngầu 1.5cm', product: 'TP0061', po: '10000456' },
    { id: 'line-slice', name: 'Chuyền cắt lát 2cm', product: 'TP0042', po: '10000457' },
    { id: 'line-whole', name: 'Chuyền nguyên múi', product: 'TP0078', po: '10000458' },
  ];

  const relatedLine = 'line-cut';

  const startScanPallet = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedPalletOk(true);
      addToast('success', `Đã quét pallet BTP: ${btpPallet?.id || ''}`);
    }, 500 + Math.random() * 400);
  };

  const startScanBin = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedBinOk(true);
      addToast('success', `Đã quét ô kệ: ${btpBin}`);
    }, 500 + Math.random() * 400);
  };

  const handleConfirmIssue = () => {
    if (!canIssueBtp) {
      addToast('error', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    const line = productionLines.find((l) => l.id === (selectedLine || relatedLine));
    const remaining = currentBtpStock - issueQty;

    simulateAction(
      'Xuất BTP cho chuyền',
      `Pallet ${btpPallet?.id || ''} → ${line?.name || 'Chuyền cắt xí ngầu'} · ${issueQty.toLocaleString()} KG`,
      `Đã xuất BTP cho chuyền — Tồn BTP còn ${remaining.toLocaleString()} KG`,
      () => {
        dispatch({
          type: 'UPDATE_HANDLING_UNIT',
          payload: {
            id: btpPallet?.id || 'HU-2026-MA-BTP-XOAI-0001',
            updates: { qty: remaining, status: remaining <= 0 ? 'Đã xuất hết' : 'Chờ chế biến' },
          },
        });
        if (relatedPO) {
          const newWip = (relatedPO.wipQty || 0) + issueQty;
          dispatch({
            type: 'UPDATE_PRODUCTION_ORDER',
            payload: {
              id: relatedPO.id,
              updates: {
                wipQty: newWip,
                currentOperation: relatedPO.currentOperation || '0020',
                status: relatedPO.status === 'REL' ? 'STRT' : relatedPO.status,
              },
            },
          });
        }
        addActivityLog(
          state.currentUser, state.role?.name || '', 'Xuất BTP',
          `Xuất BTP ${btpPallet?.id || ''} → Chuyền cắt xí ngầu · ${issueQty.toLocaleString()} KG. Tồn BTP còn ${remaining.toLocaleString()} KG · WIP PO ${relatedPO?.id || ''} +${issueQty.toLocaleString()} KG`
        );
        navigate('/outbound');
      }
    );
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <div className="bg-ant-xk p-5 text-white">
        <button onClick={() => navigate('/outbound')} className="mb-2 flex items-center gap-1 text-xs text-white/70 hover:text-white">
          <i className="ri-arrow-left-line" />Quay lại
        </button>
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-stack-line text-lg" />
          <span className="text-xs font-medium opacity-80">XUẤT BTP CHO CHUYỀN</span>
        </div>
        <h2 className="text-lg font-bold">Cấp phát BTP sản xuất</h2>
      </div>

      {/* Stepper */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between bg-ant-card rounded-xl border border-gray-100 px-3 py-3">
          {[
            { key: 'select' as BtpStep, label: 'Chọn chuyền' },
            { key: 'scan_pallet' as BtpStep, label: 'Quét pallet' },
            { key: 'scan_bin' as BtpStep, label: 'Quét ô kệ' },
            { key: 'confirm' as BtpStep, label: 'Xác nhận' },
          ].map((s, i) => {
            const idx = ['select','scan_pallet','scan_bin','confirm'].indexOf(step);
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold transition-all ${
                  i < idx ? 'bg-ant-xk text-white' :
                  i === idx ? 'bg-ant-xk text-white ring-2 ring-ant-xk/30' :
                  'bg-gray-100 text-ant-text-secondary'
                }`}>
                  {i < idx ? <i className="ri-check-line text-xs" /> : i + 1}
                </div>
                <span className={`text-xxs font-medium hidden sm:block ${i <= idx ? 'text-ant-text' : 'text-ant-text-secondary'}`}>
                  {s.label}
                </span>
                {i < 3 && <div className={`w-5 h-px ${i < idx ? 'bg-ant-xk' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <PermissionBanner
        module="Xuất kho — Xuất BTP"
        moduleIcon="ri-stack-line"
        moduleColor="xk"
        requiredPermissions={['OUTBOUND_BTP_ISSUE', 'OUTBOUND_VIEW']}
        className="mx-4 mb-3"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Step: Select Line */}
        {step === 'select' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Thông tin Pallet BTP</h3>
              <div className="space-y-2">
                <InfoRow label="Pallet nguồn" value={btpPallet?.id || 'HU-2026-MA-BTP-XOAI-0001'} mono />
                <InfoRow label="Loại BTP" value="BTP-XOAI-MA — Xoài má tươi sau lạng" />
                <InfoRow label="Kho hiện tại" value={btpBin} />
                <InfoRow label="Lệnh SX liên quan" value={relatedPO?.id || '10000456'} mono />
                <InfoRow label="Số lượng tồn BTP" value={`${currentBtpStock.toLocaleString()} KG`} bold />
                <InfoRow label="Số lượng xuất" value={`${issueQty.toLocaleString()} KG`} bold />
                <InfoRow label="Còn lại sau xuất" value={`${(currentBtpStock - issueQty).toLocaleString()} KG`} />
              </div>

              {currentBtpStock < issueQty && (
                <div className="mt-3 p-3 rounded-lg bg-ant-error/5 border border-ant-error/20 flex items-start gap-2">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="ri-error-warning-line text-ant-error text-sm" />
                  </div>
                  <p className="text-xs text-ant-error font-medium">
                    Tồn BTP không đủ! Cần {issueQty.toLocaleString()} KG, hiện có {currentBtpStock.toLocaleString()} KG.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Chọn chuyền nhận BTP</h3>
              <div className="space-y-2">
                {productionLines.map((line) => (
                  <button
                    key={line.id}
                    onClick={() => setSelectedLine(line.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      (selectedLine || relatedLine) === line.id
                        ? 'border-ant-xk/30 bg-ant-xk-light'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-ant-text">{line.name}</p>
                        <p className="text-xxs text-ant-text-secondary">
                          SP: {line.product} · PO: {line.po} · WIP sẽ +{issueQty.toLocaleString()} KG
                        </p>
                      </div>
                      {(selectedLine || relatedLine) === line.id && (
                        <i className="ri-checkbox-circle-fill text-ant-xk text-lg" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {canIssueBtp ? (
              <button
                onClick={() => setStep('scan_pallet')}
                disabled={currentBtpStock < issueQty}
                className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Quét Pallet BTP
              </button>
            ) : (
              <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
                <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('OUTBOUND_BTP_ISSUE')}</p>
              </div>
            )}
          </>
        )}

        {/* Step: Scan Pallet */}
        {step === 'scan_pallet' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">Quét Pallet BTP</h3>
              <p className="text-xs text-ant-text-secondary mb-3">Pallet cần quét: <span className="font-mono font-bold text-ant-xk">{btpPallet?.id || 'HU-2026-MA-BTP-XOAI-0001'}</span></p>

              {scanning ? (
                <>
                  <ScanCamera label="Đang quét pallet BTP..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét...</p>
                  </div>
                </>
              ) : scannedPalletOk ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                    <i className="ri-check-line text-2xl text-ant-sx" />
                  </div>
                  <p className="text-sm font-bold text-ant-sx">Đã quét đúng pallet BTP!</p>
                  <p className="text-xs text-ant-text-secondary mt-1 font-mono">{btpPallet?.id || 'HU-2026-MA-BTP-XOAI-0001'}</p>
                  <p className="text-xs text-ant-text-secondary">{currentBtpStock.toLocaleString()} KG · {btpBin}</p>
                </div>
              ) : (
                <button
                  onClick={startScanPallet}
                  className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <i className="ri-qr-scan-line mr-2" />Quét QR Pallet BTP
                </button>
              )}
            </div>

            {scannedPalletOk && (
              <button
                onClick={() => setStep('scan_bin')}
                className="w-full h-12 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Quét Ô Kệ
              </button>
            )}
          </>
        )}

        {/* Step: Scan Bin */}
        {step === 'scan_bin' && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-2">Quét Ô Kệ</h3>
              <p className="text-xs text-ant-text-secondary mb-3">Ô kệ hiện tại: <span className="font-mono font-bold text-ant-xk">{btpBin}</span></p>

              {scanning ? (
                <>
                  <ScanCamera label="Đang quét ô kệ..." />
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-ant-xk border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-ant-text-secondary">Đang quét...</p>
                  </div>
                </>
              ) : scannedBinOk ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx-light flex items-center justify-center mb-3">
                    <i className="ri-check-line text-2xl text-ant-sx" />
                  </div>
                  <p className="text-sm font-bold text-ant-sx">Đã quét đúng ô kệ!</p>
                  <p className="text-xs text-ant-text-secondary mt-1 font-mono">{btpBin}</p>
                </div>
              ) : (
                <button
                  onClick={startScanBin}
                  className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <i className="ri-qr-scan-line mr-2" />Quét QR Ô Kệ
                </button>
              )}
            </div>

            {scannedBinOk && (
              <button
                onClick={() => setStep('confirm')}
                className="w-full h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-arrow-right-line mr-2" />Tiếp tục — Xác nhận Xuất
              </button>
            )}
          </>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="bg-ant-xk-light rounded-xl border border-ant-xk/20 p-4">
              <h3 className="text-sm font-bold text-ant-xk mb-3">
                <i className="ri-check-double-line mr-1" />Xác nhận xuất BTP
              </h3>
              <div className="space-y-2 mb-3">
                <InfoRow label="Pallet BTP" value={btpPallet?.id || 'HU-2026-MA-BTP-XOAI-0001'} mono />
                <InfoRow label="Loại BTP" value="BTP-XOAI-MA — Xoài má tươi sau lạng" />
                <InfoRow label="Chuyền nhận" value={productionLines.find((l) => l.id === (selectedLine || relatedLine))?.name || ''} />
                <InfoRow label="Lệnh SX nhận" value={relatedPO?.id || '10000456'} mono />
                <InfoRow label="Số lượng xuất" value={`${issueQty.toLocaleString()} KG`} bold />
                <InfoRow label="Tồn BTP sau xuất" value={`${(currentBtpStock - issueQty).toLocaleString()} KG`} />
                <InfoRow label="Kho nguồn" value={btpBin} mono />
              </div>

              <div className="bg-ant-bg rounded-lg p-3 mb-3">
                <p className="text-xs text-ant-text-secondary">Sau khi xác nhận:</p>
                <ul className="text-xxs text-ant-text-secondary space-y-0.5 mt-1">
                  <li>• Tồn BTP giảm {issueQty.toLocaleString()} KG</li>
                  <li>• WIP chuyền cắt xí ngầu tăng {issueQty.toLocaleString()} KG</li>
                  <li>• PO {relatedPO?.id || '10000456'} chuyển STRT nếu đang REL</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('select'); setScannedPalletOk(false); setScannedBinOk(false); }}
                className="flex-1 h-14 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-1" />Làm lại
              </button>
              <button
                onClick={handleConfirmIssue}
                className="flex-1 h-14 rounded-xl bg-ant-xk text-white text-sm font-bold hover:bg-ant-xk-dark transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-check-line mr-1.5" />Xác nhận Xuất BTP
              </button>
            </div>

            <p className="text-xxs text-ant-text-secondary text-center mt-2">
              Tồn BTP: {currentBtpStock.toLocaleString()} → {(currentBtpStock - issueQty).toLocaleString()} KG · WIP PO {relatedPO?.id || '10000456'}: {(relatedPO?.wipQty || 0).toLocaleString()} → {((relatedPO?.wipQty || 0) + issueQty).toLocaleString()} KG
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm text-ant-text ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}