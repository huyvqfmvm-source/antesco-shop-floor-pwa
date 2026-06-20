import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';
import { useScanFeedback } from '@/hooks/useScanFeedback';
import type { OfflineQueueItem } from '@/store/AppContext';

export default function PutawayPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const { scanSuccess, scanError } = useScanFeedback();
  const navigate = useNavigate();
  const coldUI = state.coldStorageUI;

  const [step, setStep] = useState(0);
  const [palletScanning, setPalletScanning] = useState(false);
  const [binScanning, setBinScanning] = useState(false);
  const [scannedPallet, setScannedPallet] = useState('');
  const [scannedBin, setScannedBin] = useState('');
  const [wrongBin, setWrongBin] = useState(false);
  const [vibrating, setVibrating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const steps = ['Quét pallet', 'Quét ô kệ', 'Xác nhận'];

  // Dynamically find pallets waiting for putaway from the store
  const pendingPutawayHUs = state.handlingUnits.filter(
    (h) => h.status === 'Chờ putaway' && h.plant === (state.plant?.code || 'MA')
  );
  const availablePallet = pendingPutawayHUs.length > 0 ? pendingPutawayHUs[0] : null;
  const mockPallet = availablePallet?.id || '';
  const suggestedBin = availablePallet
    ? (state.bins.find((b) => b.plant === (state.plant?.code || 'MA') && b.status === 'Trống')?.id || 'KL-03-A1-T1')
    : 'KL-03-B2-T3';
  const isOffline = state.networkStatus === 'offline';

  // RBAC check
  const canPutaway = hasPermission(state.role?.id, 'INBOUND_PUTAWAY');

  const palletData = state.handlingUnits.find((hu) => hu.id === scannedPallet);

  const handleScanPallet = useCallback(() => {
    setPalletScanning(true);
    setTimeout(() => {
      setScannedPallet(mockPallet);
      setPalletScanning(false);
      scanSuccess();
      addToast('success', 'Đã quét pallet: ' + mockPallet);
      setStep(1);
    }, 700);
  }, [addToast, mockPallet, scanSuccess]);

  const handleScanBin = useCallback((manualBin?: string) => {
    setBinScanning(true);
    setTimeout(() => {
      const scanned = manualBin || (Math.random() > 0.3 ? suggestedBin : 'KL-01-A1-T1');
      setScannedBin(scanned);
      setBinScanning(false);

      if (scanned === suggestedBin) {
        scanSuccess();
        addToast('success', 'Ô kệ đúng: ' + scanned);
        setWrongBin(false);
        setStep(2);
      } else {
        scanError();
        setWrongBin(true);
        setVibrating(true);
        addToast('error', 'Ô kệ không đúng! Vui lòng kiểm tra lại.');
        setTimeout(() => setVibrating(false), 1200);
      }
    }, 600);
  }, [suggestedBin, addToast, scanSuccess, scanError]);

  const handleConfirmPutaway = useCallback(() => {
    setConfirming(true);

    if (isOffline) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const queueItem: OfflineQueueItem = {
        queueId: `off-${Date.now()}`,
        type: 'PUTAWAY',
        user: state.currentUser,
        role: state.role?.name || '',
        plant: state.plant?.code || 'MA',
        huId: scannedPallet,
        binId: scannedBin,
        createdAt: timestamp,
        status: 'Pending',
        retryCount: 0,
        mockMovement: 'MIGO-311',
        maxHoldHours: 24,
      };

      setTimeout(() => {
        dispatch({ type: 'ADD_OFFLINE_QUEUE', payload: queueItem });
        dispatch({
          type: 'UPDATE_HANDLING_UNIT',
          payload: { id: scannedPallet, updates: { status: 'Chờ đồng bộ putaway', location: scannedBin } },
        });
        dispatch({
          type: 'UPDATE_BIN_STATUS',
          payload: { id: scannedBin, status: 'Có hàng' },
        });
        addActivityLog(
          state.currentUser,
          state.role?.name || '',
          'Putaway (Offline Queue)',
          `${scannedPallet} → ${scannedBin}`,
          'Chờ putaway',
          'Chờ đồng bộ putaway',
          'Lưu vào Offline Queue — MIGO-311'
        );
        addToast('warning', 'Đã lưu vào Offline Queue. Sẽ đồng bộ khi có mạng.');
        setConfirming(false);
        navigate('/inbound');
      }, 500);
    } else {
      simulateAction(
        'Putaway',
        `${scannedPallet} → ${scannedBin}`,
        `Đã xếp pallet vào ${scannedBin}`,
        () => {
          dispatch({
            type: 'UPDATE_HANDLING_UNIT',
            payload: { id: scannedPallet, updates: { status: 'Đã xếp kệ', location: scannedBin } },
          });
          dispatch({
            type: 'UPDATE_BIN_STATUS',
            payload: { id: scannedBin, status: 'Có hàng' },
          });
          addActivityLog(
            state.currentUser,
            state.role?.name || '',
            'Putaway',
            `${scannedPallet} → ${scannedBin}`,
            'Chờ putaway',
            'Đã xếp kệ'
          );
          setConfirming(false);
          navigate('/inbound');
        }
      );
    }
  }, [isOffline, scannedPallet, scannedBin, state, simulateAction, dispatch, addActivityLog, addToast, navigate]);

  const btnSize = coldUI ? 'h-16 text-base' : 'h-14 text-sm';
  const iconSize = coldUI ? 'text-2xl' : 'text-lg';

  // No permission screen
  if (!canPutaway) {
    return (
      <div className={`min-h-screen flex flex-col ${coldUI ? 'bg-black text-white' : 'bg-ant-bg'}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-ant-error/10 flex items-center justify-center mb-4">
            <i className="ri-shield-user-line text-3xl text-ant-error" />
          </div>
          <h3 className="text-base font-bold text-ant-text mb-1">Không có quyền</h3>
          <p className="text-sm text-ant-text-secondary text-center mb-2">
            Bạn không có quyền thực hiện nghiệp vụ Putaway.
          </p>
          <p className="text-xs text-ant-text-secondary text-center mb-4">
            Vai trò: <strong>{state.role?.name}</strong> — Chỉ Thủ kho, Quản đốc, hoặc Admin mới có quyền này.
          </p>
          <Link to="/inbound" className="px-4 py-2.5 rounded-xl bg-ant-qm text-white text-sm font-medium">
            Quay lại Nhập kho
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${coldUI ? 'bg-black text-white' : 'bg-ant-bg'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shrink-0 ${coldUI ? 'bg-gray-900' : 'bg-ant-warning text-white'}`}>
        <Link to="/inbound" className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${coldUI ? 'hover:bg-white/10' : 'hover:bg-white/10'}`}>
          <i className={`ri-arrow-left-line ${coldUI ? 'text-white text-xl' : 'text-lg'}`} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className={`font-bold truncate ${coldUI ? 'text-lg' : 'text-sm'}`}>Hướng dẫn Putaway</h1>
          <p className={`truncate ${coldUI ? 'text-xs text-gray-300' : 'text-xs text-white/70'}`}>
            {state.plant?.name} · {isOffline ? 'Offline mode' : 'Online'}
          </p>
        </div>
        {isOffline && (
          <div className="px-2 py-1 rounded-full bg-ant-offline/30 text-ant-offline text-xxs font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-ant-offline" />
            OFFLINE
          </div>
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
                i < step ? (coldUI ? 'bg-ant-warning text-black' : 'bg-ant-warning text-white') :
                i === step ? (coldUI ? 'bg-ant-warning text-black ring-2 ring-ant-warning/30' : 'bg-ant-warning text-white ring-2 ring-ant-warning/30') :
                coldUI ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-ant-text-secondary'
              }`}>{i < step ? <i className="ri-check-line text-xs" /> : i + 1}</div>
              {i < 2 && <div className={`${coldUI ? 'w-8 h-px' : 'w-10 h-px'} ${i < step ? (coldUI ? 'bg-ant-warning' : 'bg-ant-warning') : coldUI ? 'bg-gray-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className={`text-center mt-2 font-medium ${coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}`}>{steps[step]}</p>
      </div>

      <PermissionBanner
        module="Nhập kho — Putaway"
        moduleIcon="ri-layout-grid-line"
        moduleColor="nk"
        requiredPermissions={['INBOUND_PUTAWAY', 'INBOUND_VIEW']}
        className="mx-4 mt-3"
      />

      {/* Wrong bin popup */}
      {wrongBin && (
        <div className={`${vibrating ? 'animate-shake' : ''} mx-4 mt-4 rounded-xl p-4 ${coldUI ? 'bg-red-500/20 border-2 border-red-500' : 'bg-ant-error/5 border-2 border-ant-error/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-full flex items-center justify-center shrink-0 ${coldUI ? 'w-12 h-12 bg-red-500/30' : 'w-10 h-10 bg-ant-error/20'}`}>
              <i className={`ri-error-warning-line ${coldUI ? 'text-2xl text-red-400' : 'text-xl text-ant-error'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold ${coldUI ? 'text-sm text-red-400' : 'text-xs text-ant-error'}`}>Ô kệ không đúng!</p>
              <p className={coldUI ? 'text-xs text-gray-300' : 'text-xxs text-ant-text-secondary'}>
                Pallet này được chỉ định vào <strong>{suggestedBin}</strong>. Vui lòng kiểm tra lại vị trí.
              </p>
            </div>
            <button
              onClick={() => setWrongBin(false)}
              className={`${coldUI ? 'w-8 h-8' : 'w-7 h-7'} rounded-full flex items-center justify-center ${coldUI ? 'bg-red-500/30 text-red-400' : 'bg-ant-error/10 text-ant-error'}`}
            >
              <i className="ri-close-line" />
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 overflow-y-auto p-4`}>
        {/* Step 0: Scan Pallet */}
        {step === 0 && (
          <div className="space-y-4">
            {!availablePallet ? (
              <div className={`rounded-xl border p-6 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
                <div className="flex flex-col items-center py-6 gap-4">
                  <div className={`rounded-full flex items-center justify-center ${coldUI ? 'w-20 h-20 bg-gray-800' : 'w-16 h-16 bg-ant-warning/10'}`}>
                    <i className={`ri-stack-line ${coldUI ? 'text-3xl text-ant-warning' : 'text-2xl text-ant-warning'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>Không có pallet chờ putaway</p>
                    <p className={coldUI ? 'text-sm text-gray-400 mt-1' : 'text-xs text-ant-text-secondary mt-1'}>
                      Cần nhập kho thành phẩm trước: Nhập kho → Nhập kho TP
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={`rounded-xl border p-4 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
                  <p className={`font-bold mb-1 ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>Quét mã Pallet cần xếp</p>
                  <p className={coldUI ? 'text-sm text-gray-400 mb-4' : 'text-xs text-ant-text-secondary mb-4'}>{pendingPutawayHUs.length} pallet chờ putaway — đưa mã QR vào vùng quét</p>

                  <div className="flex flex-col items-center py-6 gap-4">
                    <div className={`rounded-full flex items-center justify-center ${coldUI ? 'w-20 h-20 bg-gray-800' : 'w-16 h-16 bg-ant-warning/10'}`}>
                      <i className={`ri-stack-line ${coldUI ? 'text-3xl text-ant-warning' : 'text-2xl text-ant-warning'}`} />
                    </div>
                    <button
                      onClick={handleScanPallet}
                      disabled={palletScanning}
                      className={`${btnSize} w-full max-w-xs rounded-xl bg-ant-warning text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.95] ${palletScanning ? 'opacity-70' : ''} whitespace-nowrap`}
                    >
                      {palletScanning ? (
                        <>
                          <div className={`${coldUI ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                          Đang quét...
                        </>
                      ) : (
                        <>
                          <i className={`ri-qr-scan-line ${iconSize}`} />
                          Quét pallet ({availablePallet.id})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dùng mã mẫu */}
                <div className={`rounded-xl border p-3 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-nk/5 border-ant-nk/20'}`}>
                  <p className={`text-xs font-bold mb-2 ${coldUI ? 'text-gray-400' : 'text-ant-nk'}`}>
                    <i className="ri-lightbulb-line mr-1" />Dùng mã mẫu:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pendingPutawayHUs.slice(0, 4).map((hu) => (
                      <button
                        key={hu.id}
                        onClick={() => {
                          setScannedPallet(hu.id);
                          scanSuccess();
                          addToast('success', 'Đã chọn pallet: ' + hu.id);
                          setStep(1);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 whitespace-nowrap ${coldUI ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white border border-ant-nk/20 text-ant-nk hover:bg-ant-nk/5'}`}
                      >
                        {hu.id}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {isOffline && (
              <div className={`rounded-xl p-4 ${coldUI ? 'bg-ant-offline/20 border border-ant-offline/30' : 'bg-ant-offline/5 border border-ant-offline/20'}`}>
                <div className="flex items-center gap-2">
                  <i className={`ri-cloud-off-line ${coldUI ? 'text-ant-offline text-lg' : 'text-ant-offline'}`} />
                  <div>
                    <p className={`font-medium ${coldUI ? 'text-sm text-ant-offline' : 'text-xs text-ant-offline'}`}>
                      Chế độ Offline kho lạnh
                    </p>
                    <p className={coldUI ? 'text-xs text-gray-400' : 'text-xxs text-ant-text-secondary'}>
                      Putaway vẫn hoạt động, dữ liệu lưu vào Offline Queue (MIGO-311)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Scan Bin */}
        {step === 1 && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`font-mono font-bold ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>{scannedPallet}</p>
                  {palletData && (
                    <p className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>
                      {palletData.product} · {palletData.qty.toLocaleString()} {palletData.unit}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xxs font-bold ${coldUI ? 'bg-ant-warning/30 text-ant-warning' : 'bg-ant-warning/10 text-ant-warning'}`}>Đã quét</span>
              </div>

              <div className={`rounded-xl p-4 mb-4 ${coldUI ? 'bg-ant-warning/20 border border-ant-warning/30' : 'bg-ant-warning/5 border border-ant-warning/20'}`}>
                <p className={coldUI ? 'text-xs text-gray-400 mb-1' : 'text-xxs text-ant-text-secondary mb-1'}>Ô kệ đề xuất</p>
                <p className={`font-mono font-bold ${coldUI ? 'text-xl text-ant-warning' : 'text-lg text-ant-warning'}`}>{suggestedBin}</p>
                <p className={coldUI ? 'text-xs text-gray-400' : 'text-xxs text-ant-text-secondary'}>KL-03 · Hàng B, Tầng 2, Vị trí 3</p>
              </div>

              <button
                onClick={() => handleScanBin()}
                disabled={binScanning}
                className={`${btnSize} w-full rounded-xl bg-ant-warning text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.95] ${binScanning ? 'opacity-70' : ''} whitespace-nowrap`}
              >
                {binScanning ? (
                  <>
                    <div className={`${coldUI ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                    Đang quét ô kệ...
                  </>
                ) : (
                  <>
                    <i className={`ri-layout-grid-line ${iconSize}`} />
                    Quét QR ô kệ
                  </>
                )}
              </button>

              <p className={`text-center mt-2 ${coldUI ? 'text-xs text-gray-500' : 'text-xxs text-ant-text-secondary'}`}>
                ~70% khớp ô kệ đề xuất · ~30% sai ô kệ (mô phỏng)
              </p>
            </div>

            <button
              onClick={() => setStep(0)}
              className={`w-full ${btnSize} rounded-xl border font-medium transition-all active:scale-[0.98] whitespace-nowrap ${coldUI ? 'border-gray-700 text-gray-300 bg-gray-900' : 'border-gray-200 text-ant-text-secondary bg-white'}`}
            >
              <i className="ri-arrow-left-line mr-1" /> Quay lại
            </button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${coldUI ? 'bg-gray-900 border-gray-800' : 'bg-ant-card border-gray-100'}`}>
              <p className={`font-bold mb-4 ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>Xác nhận xếp hàng</p>

              <div className="space-y-3">
                <div className={`rounded-xl p-4 ${coldUI ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={coldUI ? 'text-xs text-gray-400' : 'text-xxs text-ant-text-secondary'}>Pallet</p>
                  <p className={`font-mono font-bold ${coldUI ? 'text-base text-white' : 'text-sm text-ant-text'}`}>{scannedPallet}</p>
                  {palletData && (
                    <p className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>
                      {palletData.product} · {palletData.qty.toLocaleString()} {palletData.unit}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <i className={`ri-arrow-down-line ${coldUI ? 'text-2xl text-ant-warning' : 'text-xl text-ant-warning'}`} />
                </div>

                <div className={`rounded-xl p-4 border-2 ${coldUI ? 'bg-ant-warning/10 border-ant-warning/30' : 'bg-ant-warning/5 border-ant-warning/20'}`}>
                  <p className={coldUI ? 'text-xs text-gray-400' : 'text-xxs text-ant-text-secondary'}>Ô kệ đích</p>
                  <p className={`font-mono font-bold ${coldUI ? 'text-xl text-ant-warning' : 'text-lg text-ant-warning'}`}>{scannedBin}</p>
                  <p className={coldUI ? 'text-sm text-gray-400' : 'text-xs text-ant-text-secondary'}>
                    {scannedBin === suggestedBin ? 'Đúng ô kệ đề xuất' : 'Ô kệ thay thế'}
                  </p>
                </div>
              </div>

              {isOffline && (
                <div className={`mt-4 rounded-xl p-3 ${coldUI ? 'bg-ant-offline/20 border border-ant-offline/30' : 'bg-ant-offline/5 border border-ant-offline/20'}`}>
                  <p className={`font-medium ${coldUI ? 'text-sm text-ant-offline' : 'text-xs text-ant-offline'}`}>
                    <i className="ri-cloud-off-line mr-1" />
                    Lưu vào Offline Queue (MIGO-311) — tự động đồng bộ khi Online
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setScannedBin(''); }}
                className={`flex-1 ${btnSize} rounded-xl border font-medium transition-all active:scale-[0.98] whitespace-nowrap ${coldUI ? 'border-gray-700 text-gray-300 bg-gray-900' : 'border-gray-200 text-ant-text-secondary bg-white'}`}
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={handleConfirmPutaway}
                disabled={confirming}
                className={`flex-1 ${btnSize} rounded-xl font-bold text-white transition-all active:scale-[0.95] whitespace-nowrap ${
                  isOffline ? 'bg-ant-offline hover:bg-ant-offline/80' : 'bg-ant-warning hover:bg-amber-600'
                } ${confirming ? 'opacity-70' : ''}`}
              >
                {confirming ? (
                  <>
                    <div className={`${coldUI ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin mr-2`} />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-1" />
                    {isOffline ? 'Xác nhận (Offline)' : 'Xác nhận xếp hàng'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
