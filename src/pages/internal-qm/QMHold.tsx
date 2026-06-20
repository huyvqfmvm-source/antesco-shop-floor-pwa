import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { OfflineQueueItem } from '@/store/AppContext';

const STEPS = [
  { key: 'scan', label: 'Quét pallet/lô', icon: 'ri-qr-scan-line' },
  { key: 'defect', label: 'Ghi nhận lỗi', icon: 'ri-error-warning-line' },
  { key: 'photo', label: 'Chụp ảnh', icon: 'ri-camera-line' },
  { key: 'lock', label: 'Khóa lô', icon: 'ri-lock-line' },
];

const MOCK_VOICE_RESULT = 'Lô xoài xí ngầu phát sinh lỗi rách màng bao bì tạm tại góc pallet, rò rỉ khí làm kết tinh tuyết.';

export default function QMHoldPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{ type: string; batch: string; product: string; location: string; status: string } | null>(null);
  const [defectText, setDefectText] = useState('');
  const [defectCode, setDefectCode] = useState('DF-005');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [photos, setPhotos] = useState<number[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showRoleBlocked, setShowRoleBlocked] = useState(false);

  // RBAC check
  const canQmHold = hasPermission(state.role?.id, 'QM_HOLD');
  const isOffline = state.networkStatus === 'offline';

  // Dynamically find a scannable batch/HU not already blocked
  const availableTarget = state.batches.find((b) => b.status !== 'Blocked Stock' && b.plant === (state.plant?.code || 'MA')) ||
    state.batches[0];
  const targetBatch = availableTarget?.id || '002216225';
  const targetProduct = availableTarget?.product || 'TP0061 - Xoài đông IQF';

  const handleScan = useCallback(() => {
    if (!canQmHold) {
      setShowRoleBlocked(true);
      return;
    }
    const mockResult = {
      type: 'HU',
      batch: targetBatch,
      product: targetProduct,
      location: 'KL-03-B2-T3',
      status: 'Unrestricted',
    };
    setScannedCode('HU-2026-MA-FG-XN-0005');
    setScanResult(mockResult);
    addToast('success', 'Đã quét Batch: ' + targetBatch);
    setStep(1);
  }, [canQmHold, addToast, targetBatch, targetProduct]);

  const handleVoiceRecord = useCallback(() => {
    setIsRecording(true);
    setVoiceText('');
    setTimeout(() => {
      setIsRecording(false);
      setVoiceText(MOCK_VOICE_RESULT);
      setDefectText(MOCK_VOICE_RESULT);
      addToast('info', 'Voice-to-text: đã nhận diện giọng nói');
    }, 2000);
  }, [addToast]);

  const handleAddPhoto = useCallback(() => {
    if (photos.length >= 4) {
      addToast('warning', 'Đã đủ 4 ảnh bằng chứng');
      return;
    }
    setPhotos((prev) => [...prev, Date.now()]);
    addToast('success', `Đã chụp ảnh thứ ${photos.length + 1}`);
  }, [photos.length, addToast]);

  const handleRemovePhoto = useCallback((idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleContinue = useCallback(() => {
    if (step === 1) {
      if (!defectText.trim()) {
        addToast('warning', 'Vui lòng nhập lý do lỗi hoặc dùng voice-to-text');
        return;
      }
      if (!defectCode) {
        addToast('warning', 'Vui lòng chọn mã lỗi (DF)');
        return;
      }
      addActivityLog(
        state.currentUser,
        state.role?.name || '',
        'Ghi nhận lỗi QM',
        `Batch ${scanResult?.batch} — ${defectCode}: ${defectText.slice(0, 60)}`,
        'Unrestricted',
        'Đang ghi nhận lỗi'
      );
      addToast('success', 'Đã ghi nhận lỗi và mã DF');
      setStep(2);
    } else if (step === 2) {
      if (photos.length < 2) {
        addToast('warning', 'Bắt buộc chụp tối thiểu 2 ảnh bằng chứng');
        return;
      }
      setStep(3);
    }
  }, [step, defectText, defectCode, photos.length, addToast, addActivityLog, state.currentUser, state.role?.name, scanResult]);

  const handleLockBatch = useCallback(() => {
    if (photos.length < 2) {
      addToast('warning', 'Bắt buộc chụp tối thiểu 2 ảnh bằng chứng');
      return;
    }
    setIsLocking(true);

    if (isOffline) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const queueItem: OfflineQueueItem = {
        queueId: `off-qm-${Date.now()}`,
        type: 'QM_HOLD',
        user: state.currentUser,
        role: state.role?.name || '',
        plant: state.plant?.code || 'MA',
        shift: state.shift?.name || '',
        batchId: scanResult?.batch,
        defectCode,
        photos: photos.map((p) => `photo-${p}`),
        reason: defectText,
        createdAt: timestamp,
        status: 'Pending Sync',
        retryCount: 0,
        mockMovement: 'MIGO-344',
        maxHoldHours: 24,
      };

      setTimeout(() => {
        dispatch({ type: 'ADD_OFFLINE_QUEUE', payload: queueItem });
        addActivityLog(
          state.currentUser,
          state.role?.name || '',
          'QM Hold (Offline Queue)',
          `Batch ${scanResult?.batch} — ${defectCode}`,
          'Unrestricted',
          'Đã khóa tạm (Offline)',
          'Lưu vào Offline Queue — MIGO-344'
        );
        addToast('warning', 'Đã khóa tạm trên thiết bị - Chờ đồng bộ');
        setIsLocking(false);
        setLocked(true);
      }, 500);
    } else {
      simulateAction(
        'Khóa lô QC',
        `Batch ${scanResult?.batch} — ${defectCode}: ${defectText.slice(0, 80)}`,
        'Đã khóa lô — Blocked Stock',
        () => {
          dispatch({ type: 'UPDATE_BATCH_STATUS', payload: { id: scanResult!.batch, status: 'Blocked Stock' } });
          // Update all related HUs to Blocked Stock
          const relatedHUs = state.handlingUnits.filter((h) => {
            const batch = state.batches.find((b) => b.id === scanResult!.batch);
            return batch && h.product === (batch.product?.split(' - ')[0] || '');
          });
          relatedHUs.forEach((hu) => {
            dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: hu.id, updates: { status: 'Blocked Stock' } } });
          });
          dispatch({
            type: 'ADD_QUALITY_HOLD',
            payload: {
              id: `QH-2026-${String(Date.now()).slice(-4)}`,
              batch: scanResult!.batch,
              reason: `${defectCode}: ${defectText.slice(0, 80)}`,
              plant: state.plant?.code || 'MA',
              status: 'Đã khóa',
              createdDate: new Date().toISOString().slice(0, 10),
            },
          });
          addActivityLog(
            state.currentUser,
            state.role?.name || '',
            'Khóa lô QC',
            `Batch ${scanResult?.batch} → Blocked Stock — ${defectCode}`,
            'Unrestricted',
            'Blocked Stock'
          );
          setIsLocking(false);
          setLocked(true);
        }
      );
    }
  }, [photos, isOffline, simulateAction, dispatch, scanResult, defectCode, defectText, addToast, state, addActivityLog]);

  // Role blocked screen
  if (showRoleBlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-ant-bg">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-ant-error/10 flex items-center justify-center mb-4">
            <i className="ri-shield-user-line text-3xl text-ant-error" />
          </div>
          <h3 className="text-base font-bold text-ant-text mb-1">Không có quyền</h3>
          <p className="text-sm text-ant-text-secondary text-center mb-2">
            Bạn không có quyền thực hiện QM Hold / Blocked Stock.
          </p>
          <p className="text-xs text-ant-text-secondary text-center mb-4">
            Vai trò: <strong>{state.role?.name}</strong> — Chỉ KCS/QM, Quản đốc, hoặc Admin mới có quyền này.
          </p>
          <button onClick={() => navigate('/internal-qm')} className="px-4 py-2.5 rounded-xl bg-ant-qm text-white text-sm font-medium">
            Quay lại Nội bộ & QM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">QM Hold / Blocked Stock</h2>
          <p className="text-xxs text-ant-text-secondary">
            Khóa lô chất lượng — {isOffline ? 'Offline Mode' : 'Online'}
          </p>
        </div>
        {isOffline && (
          <div className="ml-auto px-2 py-1 rounded-full bg-ant-offline/20 text-ant-offline text-xxs font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-ant-offline" />
            OFFLINE
          </div>
        )}
      </div>

      <PermissionBanner
        module="Nội bộ & QM — QM Hold"
        moduleIcon="ri-shield-check-line"
        moduleColor="qm"
        requiredPermissions={['QM_HOLD', 'QM_VIEW']}
        className="mx-2"
      />

      {/* Process Stepper */}
      <div className="bg-ant-qm rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-shield-check-line text-base" />
          <span className="text-xs font-bold">QUY TRÌNH KHÓA LÔ QM</span>
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
                <span className="text-xxs text-center leading-tight whitespace-nowrap">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-3 h-0.5 rounded-full flex-shrink-0 ${i < step ? 'bg-white/60' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Scan */}
      {step === 0 && (
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-4">
          <h3 className="text-sm font-bold text-ant-text">Bước 1 — Quét pallet hoặc batch cần khóa</h3>
          <p className="text-xs text-ant-text-secondary">Quét mã QR pallet (HU) hoặc mã batch để bắt đầu quy trình QM Hold.</p>

          {!canQmHold && (
            <div className="bg-ant-error/5 rounded-lg p-3 border border-ant-error/20 flex items-start gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ri-shield-user-line text-xs text-ant-error" />
              </div>
              <p className="text-xs text-ant-error">
                Vai trò <strong>{state.role?.name}</strong> không có quyền QM Hold. Chỉ KCS/QM, Quản đốc, hoặc Admin mới được thực hiện.
              </p>
            </div>
          )}

          <button
            onClick={handleScan}
            className="w-full py-4 rounded-xl bg-ant-error text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-qr-scan-line text-lg" />
            </div>
            QUÉT PALLET / BATCH
          </button>
          <div className="p-3 rounded-lg bg-ant-bg border border-gray-100">
            <p className="text-xxs text-ant-text-secondary mb-1">Batch có thể quét (chưa bị khóa):</p>
            <p className="text-xs font-mono text-ant-text">Batch {targetBatch}</p>
            <p className="text-xxs text-ant-text-secondary">{targetProduct} · {availableTarget?.plant || 'MA'}</p>
          </div>

          {isOffline && (
            <div className="rounded-xl p-3 bg-ant-offline/5 border border-ant-offline/20">
              <div className="flex items-center gap-2">
                <i className="ri-cloud-off-line text-ant-offline" />
                <div>
                  <p className="text-xs font-medium text-ant-offline">Chế độ Offline kho lạnh</p>
                  <p className="text-xxs text-ant-text-secondary">QM Hold vẫn hoạt động, dữ liệu lưu vào Offline Queue (MIGO-344)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Defect Recording */}
      {step === 1 && scanResult && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2">Thông tin batch/pallet</h3>
            <div className="space-y-2">
              <InfoRow label="Mã HU" value={scannedCode} mono />
              <InfoRow label="Batch" value={scanResult.batch} mono />
              <InfoRow label="Sản phẩm" value={scanResult.product} />
              <InfoRow label="Vị trí ô kệ" value={scanResult.location} />
              <InfoRow label="Trạng thái hiện tại" value={scanResult.status} success />
            </div>
          </div>

          <div className="bg-ant-card rounded-xl border border-ant-error/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-ant-error/20 flex items-center justify-center">
                <i className="ri-error-warning-line text-ant-error text-xs" />
              </div>
              <h3 className="text-sm font-bold text-ant-text">Bước 2 — Ghi nhận lý do lỗi</h3>
            </div>

            <div className="mb-3">
              <button
                onClick={handleVoiceRecord}
                disabled={isRecording}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  isRecording
                    ? 'bg-ant-error text-white border-ant-error'
                    : 'bg-ant-bg border-gray-200 text-ant-text hover:border-ant-qm'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${isRecording ? 'ri-mic-fill animate-voice-pulse' : 'ri-mic-line'} text-base`} />
                </div>
                {isRecording ? (
                  <span className="flex items-center gap-1">
                    ĐANG GHI ÂM
                    <span className="flex items-end gap-0.5 h-5">
                      <span className="w-0.5 bg-white rounded-full animate-voice-wave" />
                      <span className="w-0.5 bg-white rounded-full animate-voice-wave" />
                      <span className="w-0.5 bg-white rounded-full animate-voice-wave" />
                      <span className="w-0.5 bg-white rounded-full animate-voice-wave" />
                      <span className="w-0.5 bg-white rounded-full animate-voice-wave" />
                    </span>
                  </span>
                ) : (
                  'Voice-to-Text: Ghi âm lý do lỗi'
                )}
              </button>
              {voiceText && (
                <div className="mt-2 p-2.5 rounded-lg bg-ant-qm/5 border border-ant-qm/20">
                  <p className="text-xs text-ant-text-secondary italic">&ldquo;{voiceText}&rdquo;</p>
                </div>
              )}
            </div>

            <textarea
              value={defectText}
              onChange={(e) => setDefectText(e.target.value)}
              placeholder="Nhập lý do lỗi chi tiết..."
              maxLength={500}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-24 focus:outline-none focus:border-ant-error"
            />
            <p className="text-xxs text-ant-text-secondary text-right mt-1">{defectText.length}/500</p>

            <div className="mt-3 bg-ant-error/5 rounded-xl p-3 border border-ant-error/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-ant-error/20 flex items-center justify-center">
                  <i className="ri-robot-line text-xs text-ant-error" />
                </div>
                <p className="text-xs font-bold text-ant-error">AI gợi ý mã lỗi</p>
              </div>
              <div className="bg-ant-card rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono font-bold text-ant-error">{defectCode}</p>
                  <p className="text-xs text-ant-text-secondary">Rách bao bì / Sự cố vật lý</p>
                </div>
                <button
                  onClick={() => setDefectCode(defectCode === 'DF-005' ? 'DF-002' : 'DF-005')}
                  className="text-xs text-ant-qm font-medium px-2 py-1 rounded-lg hover:bg-ant-qm/10"
                >
                  Đổi mã
                </button>
              </div>
              <p className="text-xxs text-ant-text-secondary mt-2">Hướng xử lý đề xuất: <strong className="text-ant-error">Blocked Stock</strong></p>
            </div>
          </div>

          <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-ant-qm text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: CHỤP ẢNH BẰNG CHỨNG
          </button>
        </div>
      )}

      {/* Step 2: Photo Evidence */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-ant-warning/20 flex items-center justify-center">
                <i className="ri-camera-line text-ant-warning text-xs" />
              </div>
              <h3 className="text-sm font-bold text-ant-text">Bước 3 — Chụp ảnh bằng chứng</h3>
            </div>
            <p className="text-xs text-ant-text-secondary mb-3">Bắt buộc tối thiểu 2 ảnh. Chụp rõ vị trí lỗi, bao bì, nhãn batch.</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${
                    photos[idx]
                      ? 'border-ant-sx bg-ant-sx-light'
                      : 'border-gray-200 bg-ant-bg'
                  }`}
                >
                  {photos[idx] ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 flex items-center justify-center mx-auto">
                          <i className="ri-image-line text-2xl text-ant-text-secondary/40" />
                        </div>
                        <p className="text-xxs text-ant-text-secondary mt-1">Ảnh {idx + 1}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ant-error text-white flex items-center justify-center"
                      >
                        <i className="ri-close-line text-xxs" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleAddPhoto} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-camera-line text-lg text-ant-text-secondary/40" />
                      </div>
                      <span className="text-xxs text-ant-text-secondary/60">Chụp ảnh</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-ant-text-secondary">
                Đã chụp: <strong className="text-ant-text">{photos.length}/4</strong> {photos.length < 2 && '(cần ít nhất 2)'}
              </span>
              <button onClick={handleAddPhoto} className="px-3 py-1.5 rounded-lg bg-ant-bg border border-gray-200 text-xs font-medium text-ant-text">
                <i className="ri-camera-line mr-1" />Thêm ảnh
              </button>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
              photos.length >= 2 ? 'bg-ant-qm text-white' : 'bg-gray-200 text-ant-text-secondary cursor-not-allowed'
            }`}
          >
            <i className="ri-arrow-right-line" />
            TIẾP TỤC: KHÓA LÔ
          </button>
        </div>
      )}

      {/* Step 3: Lock Batch */}
      {step === 3 && !locked && (
        <div className="space-y-4">
          <div className="bg-ant-card rounded-xl border border-ant-error/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-ant-error/20 flex items-center justify-center">
                <i className="ri-lock-line text-ant-error text-xs" />
              </div>
              <h3 className="text-sm font-bold text-ant-text">Bước 4 — Xác nhận khóa lô</h3>
            </div>

            <div className="space-y-2 mb-3">
              <InfoRow label="Pallet/Batch" value={scannedCode} mono />
              <InfoRow label="Mã lỗi" value={defectCode} mono error />
              <InfoRow label="Lý do" value={defectText} />
              <InfoRow label="Ảnh bằng chứng" value={`${photos.length} ảnh`} />
              <InfoRow label="Trạng thái sau khóa" value="Blocked Stock" error />
            </div>

            <div className="bg-ant-error/5 rounded-lg p-3 border border-ant-error/20 flex items-start gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ri-alert-line text-ant-error text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-ant-error">Cảnh báo Blocked Stock</p>
                <p className="text-xxs text-ant-text-secondary">Sau khi khóa, batch này sẽ bị chặn xuất kho trong phân hệ Xuất kho. Mọi FEFO picking sẽ bỏ qua batch này.</p>
                {isOffline && (
                  <p className="text-xxs text-ant-offline mt-1">Offline: Sẽ lưu vào Offline Queue, trạng thái &ldquo;Đã khóa tạm trên thiết bị - Chờ đồng bộ&rdquo;</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLockBatch}
            disabled={isLocking}
            className="w-full py-4 rounded-xl bg-ant-error text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isLocking ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ĐANG KHÓA LÔ...
              </>
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-lock-line text-lg" />
                </div>
                KHÓA LÔ CHỜ BIÊN BẢN
              </>
            )}
          </button>

          <Link to="/internal-qm" className="block text-center text-xs text-ant-text-secondary py-2">
            Quay lại Nội bộ & QM
          </Link>
        </div>
      )}

      {/* Completed State */}
      {locked && (
        <div className="space-y-4">
          <div className="bg-ant-sx rounded-xl p-6 text-white text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-line text-3xl text-white" />
            </div>
            <h3 className="text-base font-bold mb-1">
              {isOffline ? 'ĐÃ KHÓA TẠM THIẾT BỊ' : 'ĐÃ KHÓA LÔ THÀNH CÔNG'}
            </h3>
            <p className="text-sm text-white/70">Batch {scanResult?.batch} đã chuyển sang Blocked Stock</p>
            <p className="text-xs text-white/50 mt-1">Mã lỗi: {defectCode} · {photos.length} ảnh bằng chứng</p>
            {isOffline && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-white/10">
                <p className="text-xs text-white/80">
                  <i className="ri-cloud-off-line mr-1" />Đã lưu vào Offline Queue — Chờ đồng bộ (MIGO-344)
                </p>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/internal-qm')}
                className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium"
              >
                Về Nội bộ & QM
              </button>
              <button
                onClick={() => {
                  setStep(0); setScannedCode(''); setScanResult(null); setDefectText('');
                  setDefectCode('DF-005'); setVoiceText(''); setPhotos([]); setLocked(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white text-ant-sx text-sm font-bold"
              >
                Khóa lô mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, success, error }: { label: string; value: string; mono?: boolean; success?: boolean; error?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-xs font-medium ${
        error ? 'text-ant-error' : success ? 'text-ant-sx' : 'text-ant-text'
      } ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
