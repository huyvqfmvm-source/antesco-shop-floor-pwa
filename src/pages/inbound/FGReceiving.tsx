import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';
import type { OfflineQueueItem } from '@/store/AppContext';

export default function FGReceivingPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();
  const coldUI = state.coldStorageUI;
  const roleId = state.role?.id;

  const [step, setStep] = useState(0);
  const [scannedHU, setScannedHU] = useState('');
  const [scanning, setScanning] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<number | null>(null);
  const [actualCount, setActualCount] = useState(0);
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [prodSignInfo, setProdSignInfo] = useState<SignedInfo | null>(null);
  const [whSignInfo, setWhSignInfo] = useState<SignedInfo | null>(null);
  const isOffline = state.networkStatus === 'offline';

  const steps = ['Quét pallet', 'OCR bảng kê', 'Đồng kiểm', 'Ký bàn giao', 'Xác nhận'];

  // Dynamically find pallets waiting for inbound from the store
  const pendingHUs = state.handlingUnits.filter(
    (h) => h.status === 'Chờ nhập kho TP' && h.type === 'FG' && h.plant === (state.plant?.code || 'MA')
  );
  const availableHU = pendingHUs.length > 0 ? pendingHUs[0] : null;
  const mockHU = availableHU?.id || '';
  const mockCartons = availableHU ? Math.round(availableHU.qty / 10) : 450;
  const cartonWeight = 10;
  const totalKg = mockCartons * cartonWeight;
  const batch = availableHU ? state.batches.find((b) => b.productionOrder && b.status === 'Chờ nhập kho TP')?.id || '002216225' : '002216225';
  const product = availableHU ? `${availableHU.product} - TP` : 'TP0061 - Xoài đông IQF xí ngầu 1.5cm';

  const hasDiscrepancy = ocrResult !== null && actualCount !== ocrResult && actualCount > 0;
  const canConfirm = prodSignInfo !== null && whSignInfo !== null && actualCount > 0 && (!hasDiscrepancy || (hasDiscrepancy && discrepancyReason.length > 0));

  const canPutaway = hasPermission(state.role?.id, 'INBOUND_PUTAWAY');
  const canSignWh = hasPermission(roleId, 'INBOUND_SIGN_WH');
  const canSignProd = hasPermission(roleId, 'PRODUCTION_SIGN');

  const handleScanHU = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      setScannedHU(mockHU);
      setScanning(false);
      addToast('success', 'Đã quét pallet: ' + mockHU);
      setStep(1);
    }, 700);
  }, [addToast, mockHU]);

  const handleOCR = useCallback(() => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrResult(mockCartons);
      setActualCount(mockCartons);
      setOcrScanning(false);
      addToast('success', `OCR bảng kê: ${mockCartons} thùng · ${totalKg.toLocaleString()} KG`);
      setStep(2);
    }, 900);
  }, [addToast, mockCartons, totalKg]);

  const handleCountUp = useCallback(() => setActualCount((c) => c + 1), []);
  const handleCountDown = useCallback(() => setActualCount((c) => Math.max(0, c - 1)), []);
  const handleCountInc10 = useCallback(() => setActualCount((c) => c + 10), []);

  const handleSignProd = useCallback((info: SignedInfo) => {
    setProdSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký SX (Nhập kho TP)', `${info.signerName} · ${info.signerRole} · ${scannedHU}`);
  }, [addActivityLog, state.currentUser, state.role?.name, scannedHU]);

  const handleSignWh = useCallback((info: SignedInfo) => {
    setWhSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký TK (Nhập kho TP)', `${info.signerName} · ${info.signerRole} · ${scannedHU}`);
  }, [addActivityLog, state.currentUser, state.role?.name, scannedHU]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;

    if (isOffline) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const qty = actualCount * cartonWeight;

      const queueItem: OfflineQueueItem = {
        queueId: `off-fg-${Date.now()}`,
        type: 'FG_RECEIVING',
        user: state.currentUser,
        role: state.role?.name || '',
        plant: state.plant?.code || 'MA',
        shift: state.shift?.name || '',
        huId: scannedHU,
        batchId: batch,
        quantity: qty,
        unit: 'KG',
        reason: hasDiscrepancy ? discrepancyReason : undefined,
        createdAt: timestamp,
        status: 'Pending Sync',
        retryCount: 0,
        mockMovement: 'MIGO-101',
        maxHoldHours: 24,
      };

      dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: scannedHU, updates: { status: 'Chờ đồng bộ nhập kho', qty: qty } } });
      dispatch({ type: 'ADD_OFFLINE_QUEUE', payload: queueItem });
      addActivityLog(state.currentUser, state.role?.name || '', 'Nhập kho TP (Offline)', `${scannedHU} — ${actualCount} thùng — ${qty} KG`, 'Chờ nhập kho TP', 'Chờ đồng bộ nhập kho', 'Lưu vào Offline Queue — MIGO-101');
      addToast('warning', 'Đã lưu vào Offline Queue. Sẽ đồng bộ khi có mạng.');
      navigate('/inbound');
      return;
    }

    simulateAction(
      'Nhập kho thành phẩm',
      `${scannedHU} — ${actualCount} thùng · ${(actualCount * cartonWeight).toLocaleString()} KG — Batch ${batch}`,
      `Đã nhập kho ${actualCount} thùng TP. Pallet → Chờ putaway`,
      () => {
        dispatch({
          type: 'UPDATE_HANDLING_UNIT',
          payload: { id: scannedHU, updates: { status: 'Chờ putaway', qty: actualCount * cartonWeight } },
        });
        addActivityLog(state.currentUser, state.role?.name || '', 'Nhập kho TP & đồng kiểm', `${scannedHU} — ${actualCount}/${mockCartons} thùng — Ký bàn giao OK`);
        navigate('/inbound');
      }
    );
  }, [canConfirm, isOffline, scannedHU, actualCount, batch, hasDiscrepancy, discrepancyReason, cartonWeight, mockCartons, simulateAction, dispatch, addActivityLog, addToast, state, navigate]);

  const btnSize = coldUI ? 'h-16 text-base' : 'h-14 text-sm';
  const iconSize = coldUI ? 'text-2xl' : 'text-lg';
  const cardPad = coldUI ? 'p-6' : 'p-4';
  const textSize = coldUI ? 'text-base' : 'text-sm';
  const labelSize = coldUI ? 'text-sm' : 'text-xs';

  return (
    <div className={`min-h-screen flex flex-col ${coldUI ? 'bg-black text-white' : 'bg-ant-bg'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shrink-0 ${coldUI ? 'bg-gray-900' : 'bg-ant-nk text-white'}`}>
        <Link to="/inbound" className={`no-cs-mega w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${coldUI ? 'hover:bg-white/10' : 'hover:bg-white/10'}`}>
          <i className={`ri-arrow-left-line ${coldUI ? 'text-white text-xl' : 'text-lg'}`} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className={`font-bold truncate ${coldUI ? 'text-lg' : 'text-sm'}`}>Nhập kho TP & Đồng kiểm đếm</h1>
          <p className={`truncate ${coldUI ? 'text-xs text-gray-300' : 'text-xs text-white/70'}`}>
            {state.plant?.name} {coldUI ? '— Cold Storage UI' : ''}
          </p>
        </div>
        {coldUI && (
          <div className="px-2 py-1 rounded-full bg-ant-sx/30 text-ant-sx text-xxs font-bold">COLD</div>
        )}
      </header>

      {/* Process Stepper */}
      <div className={`px-4 py-3 border-b ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`rounded-full flex items-center justify-center text-xxs font-bold ${
                coldUI ? 'w-8 h-8' : 'w-7 h-7'
              } ${
                i < step ? (coldUI ? 'bg-ant-sx text-black' : 'bg-ant-nk text-white') :
                i === step ? (coldUI ? 'bg-ant-sx text-black ring-2 ring-ant-sx/30' : 'bg-ant-nk text-white ring-2 ring-ant-nk/30') :
                coldUI ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-ant-text-secondary'
              }`}>{i < step ? <i className="ri-check-line text-xs" /> : i + 1}</div>
              {i < 4 && <div className={`${coldUI ? 'w-3 h-px' : 'w-5 h-px'} ${i < step ? (coldUI ? 'bg-ant-sx' : 'bg-ant-nk') : coldUI ? 'bg-gray-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className={`text-center mt-2 font-medium ${coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}`}>{steps[step]}</p>
      </div>

      <PermissionBanner
        module="Nhập kho TP & Đồng kiểm"
        moduleIcon="ri-archive-drawer-line"
        moduleColor="nk"
        requiredPermissions={['INBOUND_FG_RECEIVING', 'PRODUCTION_SIGN', 'INBOUND_SIGN_WH', 'INBOUND_VIEW']}
        className="mx-4 mt-3"
      />

      <main className={`flex-1 overflow-y-auto ${cardPad}`}>
        {/* Step 0: Scan Pallet */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center pt-8 space-y-6">
            {!availableHU ? (
              <>
                <div className={`rounded-full flex items-center justify-center ${coldUI ? 'w-20 h-20 bg-gray-800' : 'w-16 h-16 bg-ant-warning/10'}`}>
                  <i className={`ri-stack-line ${coldUI ? 'text-3xl text-ant-warning' : 'text-2xl text-ant-warning'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-bold ${textSize}`}>Không có pallet chờ nhập kho</p>
                  <p className={`mt-1 ${coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}`}>
                    Cần xác nhận thành phẩm từ Sản xuất trước. Vào Sản xuất → Xác nhận TP để tạo pallet.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={`rounded-full flex items-center justify-center ${coldUI ? 'w-20 h-20 bg-gray-800' : 'w-16 h-16 bg-ant-nk/10'}`}>
                  <i className={`ri-stack-line ${coldUI ? 'text-3xl text-ant-nk' : 'text-2xl text-ant-nk'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-bold ${textSize}`}>Quét mã Pallet / HU</p>
                  <p className={`mt-1 ${coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}`}>{pendingHUs.length} pallet chờ nhập kho — đưa mã QR vào vùng quét</p>
                </div>
                <button
                  onClick={handleScanHU}
                  disabled={scanning}
                  className={`${btnSize} w-full max-w-xs rounded-xl bg-ant-nk text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.95] ${scanning ? 'opacity-70' : ''} whitespace-nowrap`}
                >
                  {scanning ? (
                    <>
                      <div className={`${coldUI ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                      Đang quét pallet...
                    </>
                  ) : (
                    <>
                      <i className={`ri-qr-scan-line ${iconSize}`} />
                      Quét pallet ({availableHU.id})
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 1: OCR */}
        {step === 1 && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`font-mono font-bold ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>{scannedHU}</p>
                  <p className={`${coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}`}>{product} · Batch {batch}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xxs font-bold ${coldUI ? 'bg-ant-nk/30 text-ant-nk' : 'bg-ant-nk/10 text-ant-nk'}`}>Đã quét</span>
              </div>

              <button
                onClick={handleOCR}
                disabled={ocrScanning}
                className={`${btnSize} w-full rounded-xl bg-ant-nk text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.95] ${ocrScanning ? 'opacity-70' : ''} whitespace-nowrap`}
              >
                {ocrScanning ? (
                  <>
                    <div className={`${coldUI ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                    Đang OCR bảng kê...
                  </>
                ) : (
                  <>
                    <i className={`ri-file-chart-line ${iconSize}`} />
                    OCR bảng kê sản lượng
                  </>
                )}
              </button>

              {ocrResult !== null && (
                <div className={`mt-4 rounded-xl p-4 ${coldUI ? 'bg-gray-800' : 'bg-ant-sx/5 border border-ant-sx/20'}`}>
                  <p className={coldUI ? 'text-xs text-gray-400' : 'text-xxs text-ant-text-secondary'}>Kết quả OCR</p>
                  <p className={`font-bold ${coldUI ? 'text-xl text-white' : 'text-lg text-ant-sx'}`}>{ocrResult} thùng</p>
                  <p className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>{totalKg.toLocaleString()} KG · {cartonWeight} KG/thùng</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className={`flex-1 ${btnSize} rounded-xl border font-medium transition-all active:scale-[0.98] whitespace-nowrap ${coldUI ? 'border-gray-700 text-gray-300 bg-gray-900' : 'border-gray-200 text-ant-text-secondary bg-white'}`}
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={ocrResult === null}
                className={`flex-1 ${btnSize} rounded-xl bg-ant-nk text-white font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap`}
              >
                Tiếp tục <i className="ri-arrow-right-line ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Joint Count */}
        {step === 2 && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
              <p className={`font-bold mb-1 ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>Số lượng thực đếm</p>
              <p className={coldUI ? 'text-sm text-gray-400 mb-4' : 'text-xs text-ant-text-secondary mb-4'}>Bảng kê OCR: <strong>{ocrResult} thùng</strong> ({totalKg.toLocaleString()} KG)</p>

              {/* Large counter */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={handleCountDown}
                  className={`rounded-full flex items-center justify-center active:scale-90 transition-all ${
                    coldUI ? 'w-14 h-14 bg-red-500/20 text-red-400' : 'w-12 h-12 bg-ant-error/10 text-ant-error'
                  }`}
                >
                  <i className={`${coldUI ? 'ri-subtract-line text-2xl' : 'ri-subtract-line text-xl'}`} />
                </button>
                <div className="text-center min-w-[100px]">
                  <p className={`font-mono font-bold ${coldUI ? 'text-4xl text-white' : 'text-3xl text-ant-text'}`}>{actualCount}</p>
                  <p className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>thùng</p>
                </div>
                <button
                  onClick={handleCountUp}
                  className={`rounded-full flex items-center justify-center active:scale-90 transition-all ${
                    coldUI ? 'w-14 h-14 bg-ant-sx text-black' : 'w-12 h-12 bg-ant-sx text-white'
                  }`}
                >
                  <i className={`${coldUI ? 'ri-add-line text-2xl' : 'ri-add-line text-xl'}`} />
                </button>
              </div>

              <button
                onClick={handleCountInc10}
                className={`w-full ${btnSize} rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap ${
                  coldUI ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-ant-text-secondary'
                }`}
              >
                <i className="ri-skip-forward-line" /> +10 thùng
              </button>

              {/* Discrepancy warning */}
              {hasDiscrepancy && (
                <div className={`mt-4 rounded-xl p-4 ${coldUI ? 'bg-ant-warning/20 border border-ant-warning/30' : 'bg-ant-warning/5 border border-ant-warning/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <i className={`${coldUI ? 'ri-error-warning-line text-xl' : 'ri-error-warning-line'} ${coldUI ? 'text-ant-warning' : 'text-ant-warning'}`} />
                    <p className={`font-bold ${coldUI ? 'text-sm text-ant-warning' : 'text-xs text-ant-warning'}`}>Chênh lệch so với bảng kê!</p>
                  </div>
                  <p className={coldUI ? 'text-sm text-gray-300 mb-2' : 'text-xs text-ant-text-secondary mb-2'}>
                    OCR: {ocrResult} thùng · Thực đếm: {actualCount} thùng · Chênh: {actualCount - ocrResult! > 0 ? '+' : ''}{actualCount - ocrResult!} thùng
                  </p>
                  <textarea
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    placeholder="Nhập lý do chênh lệch (bắt buộc)..."
                    maxLength={500}
                    className={`w-full rounded-xl px-4 py-3 text-sm resize-none ${
                      coldUI ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-ant-text placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-ant-warning/30`}
                    rows={2}
                  />
                  <p className={`text-right mt-1 ${coldUI ? 'text-xs text-gray-500' : 'text-xxs text-ant-text-secondary'}`}>{discrepancyReason.length}/500</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 ${btnSize} rounded-xl border font-medium transition-all active:scale-[0.98] whitespace-nowrap ${coldUI ? 'border-gray-700 text-gray-300 bg-gray-900' : 'border-gray-200 text-ant-text-secondary bg-white'}`}
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={actualCount <= 0 || (hasDiscrepancy && !discrepancyReason)}
                className={`flex-1 ${btnSize} rounded-xl bg-ant-nk text-white font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap`}
              >
                Tiếp tục <i className="ri-arrow-right-line ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: E-Signatures */}
        {step === 3 && (
          <div className="space-y-4">
            <div className={`rounded-xl border ${cardPad} ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
              <p className={`font-bold mb-4 ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>Ký bàn giao điện tử</p>

              <div className={`rounded-xl p-4 mb-3 ${coldUI ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`font-medium ${coldUI ? 'text-sm text-gray-300' : 'text-xs text-ant-text-secondary'}`}>Pallet</p>
                <p className={`font-mono font-bold ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>{scannedHU}</p>
                <div className="flex gap-4 mt-2">
                  <span className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>Batch {batch}</span>
                  <span className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>{actualCount} thùng · {(actualCount * cartonWeight).toLocaleString()} KG</span>
                </div>
              </div>

              {/* Production sign — MultiRole */}
              <MultiRoleSignature
                label="Đại diện sản xuất"
                roleLabel="Nguyễn Văn An · Công nhân SX"
                requiredPermission="PRODUCTION_SIGN"
                signedInfo={prodSignInfo}
                otherSignerUsername={whSignInfo?.signerUsername}
                onSign={handleSignProd}
                className="mb-3"
              />

              {/* WH sign — MultiRole */}
              <MultiRoleSignature
                label="Thủ kho"
                roleLabel="Trần Thị Bình · Thủ kho MA"
                requiredPermission="INBOUND_SIGN_WH"
                signedInfo={whSignInfo}
                otherSignerUsername={prodSignInfo?.signerUsername}
                onSign={handleSignWh}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className={`flex-1 ${btnSize} rounded-xl border font-medium transition-all active:scale-[0.98] whitespace-nowrap ${coldUI ? 'border-gray-700 text-gray-300 bg-gray-900' : 'border-gray-200 text-ant-text-secondary bg-white'}`}
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`flex-1 ${btnSize} rounded-xl bg-ant-nk text-white font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap`}
              >
                <i className="ri-check-line mr-1" /> Xác nhận nhập kho
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center pt-10">
            <div className={`rounded-full flex items-center justify-center mb-4 ${coldUI ? 'w-20 h-20 bg-ant-sx/20' : 'w-16 h-16 bg-ant-sx/10'}`}>
              <i className={`ri-check-line ${coldUI ? 'text-4xl text-ant-sx' : 'text-3xl text-ant-sx'}`} />
            </div>
            <h3 className={`font-bold mb-2 ${coldUI ? 'text-xl text-white' : 'text-lg text-ant-text'}`}>Nhập kho thành công!</h3>
          </div>
        )}
      </main>
    </div>
  );
}
