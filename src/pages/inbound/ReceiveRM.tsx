import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import PermissionBanner from '@/components/base/PermissionBanner';
import { useScanFeedback } from '@/hooks/useScanFeedback';

export default function ReceiveRMPage() {
  const { state, dispatch, addToast, addActivityLog, simulateAction } = useApp();
  const { scanSuccess } = useScanFeedback();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [poNumber, setPoNumber] = useState('PO-2026-00089');
  const [supplier, setSupplier] = useState('Đại lý Nguyễn Văn Tài');
  const [licensePlate, setLicensePlate] = useState('');
  const [grossWeight, setGrossWeight] = useState<number | ''>('');
  const [tareWeight, setTareWeight] = useState<number | ''>('');
  const [gradeI, setGradeI] = useState<number | ''>('');
  const [gradeII, setGradeII] = useState<number | ''>('');
  const [reject, setReject] = useState<number | ''>('');
  const [qcStatus, setQcStatus] = useState('Đạt');
  const [scanning, setScanning] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [cameraImage, setCameraImage] = useState('');
  const [weighImage, setWeighImage] = useState('');
  const netWeight = grossWeight && tareWeight ? grossWeight - tareWeight : 0;
  const totalGrade = (gradeI || 0) + (gradeII || 0) + (reject || 0);

  const steps = ['Quét PO', 'OCR xe & phiếu cân', 'Nhập thông số QC', 'Xác nhận nhập'];

  const handleScanPO = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      scanSuccess();
      addToast('success', 'Đã quét PO-2026-00089 — Xoài cát tươi');
      setStep(1);
    }, 800);
  }, [addToast, scanSuccess]);

  const handleOCR = useCallback(() => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      scanSuccess();
      setLicensePlate('67C-123.45');
      setGrossWeight(8500);
      setCameraImage('mock-camera');
      setWeighImage('mock-weigh');
      addToast('success', 'OCR thành công: Biển số 67C-123.45 · GW 8,500 KG');
    }, 1000);
  }, [addToast, scanSuccess]);

  const handleConfirmReceipt = useCallback(() => {
    if (totalGrade !== 100) {
      addToast('error', 'Tổng tỷ lệ QC phải bằng 100%. Hiện tại: ' + totalGrade + '%');
      return;
    }
    const batchRm = 'RM-2026-MA-XOAI-162-001';

    simulateAction(
      'Nhập nguyên liệu',
      `${poNumber} — ${supplier} — Net ${netWeight.toLocaleString()} KG — Batch ${batchRm}`,
      qcStatus === 'Đạt'
        ? `Đã nhập nguyên liệu ${netWeight.toLocaleString()} KG vào QI Stock`
        : `Đã nhập nguyên liệu vào Rejected/Hold — chờ xử lý QC`,
      () => {
        dispatch({
          type: 'ADD_RAW_MATERIAL_RECEIPT',
          payload: {
            id: `RM-RCPT-${Date.now()}`,
            poNumber,
            supplier,
            licensePlate,
            grossWeight: Number(grossWeight),
            tareWeight: Number(tareWeight),
            netWeight,
            gradeI: Number(gradeI),
            gradeII: Number(gradeII),
            reject: Number(reject),
            batchRm,
            qcStatus,
            plant: state.plant?.code || 'MA',
            status: 'Đã nhập',
            createdDate: new Date().toISOString().split('T')[0],
          },
        });
        addActivityLog(state.currentUser, state.role?.name || '', 'Nhập nguyên liệu', `${poNumber} — Batch ${batchRm} — Net ${netWeight.toLocaleString()} KG`);
        addToast('success', 'Nhập nguyên liệu thành công!');
        setTimeout(() => navigate('/inbound'), 500);
      }
    );
  }, [poNumber, supplier, licensePlate, grossWeight, tareWeight, netWeight, gradeI, gradeII, reject, qcStatus, totalGrade, state.currentUser, state.role?.name, state.plant?.code, simulateAction, addToast, dispatch, addActivityLog, navigate]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/inbound" className="no-cs-mega w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
          <i className="ri-arrow-left-line text-lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Tiếp nhận nguyên liệu tươi</h1>
          <p className="text-xs text-white/70 truncate">{state.plant?.name}</p>
        </div>
      </header>

      {/* Process Stepper */}
      <div className="bg-ant-card border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${
                i < step ? 'bg-ant-sx text-white' :
                i === step ? 'bg-ant-sx text-white ring-2 ring-ant-sx/30' :
                'bg-gray-100 text-ant-text-secondary'
              }`}>{i < step ? <i className="ri-check-line text-xs" /> : i + 1}</div>
              {i < 3 && <div className={`w-5 h-px ${i < step ? 'bg-ant-sx' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs font-medium text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <PermissionBanner
        module="Nhập kho — Tiếp nhận nguyên liệu"
        moduleIcon="ri-archive-line"
        moduleColor="nk"
        requiredPermissions={['INBOUND_RECEIVE_RM', 'INBOUND_VIEW']}
        className="mx-4 mt-3"
      />

      <main className="flex-1 overflow-y-auto p-4">
        {/* Step 0: Quét PO */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Số PO</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm font-mono font-bold text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
                  placeholder="Nhập hoặc quét PO..."
                />
                <button
                  onClick={handleScanPO}
                  disabled={scanning}
                  className={`h-12 w-12 rounded-xl bg-ant-sx text-white flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                    scanning ? 'opacity-70' : ''
                  }`}
                >
                  {scanning ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <i className="ri-qr-scan-line text-lg" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/20 p-4">
              <p className="text-xs text-ant-sx font-bold mb-1">PO mẫu gợi ý</p>
              <button
                onClick={() => { setPoNumber('PO-2026-00089'); setSupplier('Đại lý Nguyễn Văn Tài'); }}
                className="w-full text-left bg-ant-card rounded-lg p-3 border border-ant-sx/10 active:scale-[0.98] transition-all"
              >
                <p className="text-sm font-bold text-ant-text">PO-2026-00089</p>
                <p className="text-xs text-ant-text-secondary">Đại lý Nguyễn Văn Tài · Xoài cát tươi · Tiền Giang</p>
              </button>
            </div>

            <button
              onClick={handleScanPO}
              disabled={scanning || !poNumber}
              className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              {scanning ? 'Đang quét PO...' : 'Quét PO & Tiếp tục'}
            </button>
          </div>
        )}

        {/* Step 1: OCR xe & phiếu cân */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Biển số xe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm font-mono font-bold text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
                    placeholder="VD: 67C-123.45"
                  />
                  <button
                    onClick={handleOCR}
                    disabled={ocrScanning}
                    className="h-12 w-12 rounded-xl bg-ant-nk text-white flex items-center justify-center shrink-0 transition-all active:scale-90"
                  >
                    {ocrScanning ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="ri-scan-line text-lg" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Tổng trọng lượng (KG)</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm font-mono font-bold text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
                    placeholder="GW"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Trừ bì / tạp chất (KG)</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm font-mono font-bold text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
                    placeholder="Tare"
                  />
                </div>
              </div>

              <div className="bg-ant-sx/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ant-text-secondary">Net Weight tự tính</span>
                  <span className="text-lg font-bold text-ant-sx">{netWeight.toLocaleString()} KG</span>
                </div>
              </div>
            </div>

            {/* Camera & Weigh slip mock images */}
            {licensePlate && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-ant-sx/30">
                  <div className="text-center">
                    <i className="ri-car-line text-3xl text-white/50" />
                    <p className="text-xxs text-white/40 mt-1">Ảnh xe</p>
                  </div>
                </div>
                <div className="bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-ant-nk/30">
                  <div className="text-center">
                    <i className="ri-scales-3-line text-3xl text-white/50" />
                    <p className="text-xxs text-white/40 mt-1">Phiếu cân</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!licensePlate || !grossWeight}
                className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Tiếp tục <i className="ri-arrow-right-line ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Nhập QC */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Tỷ lệ Loại I (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gradeI}
                    onChange={(e) => setGradeI(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm font-bold text-ant-sx bg-ant-sx/5 focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
                    min={0} max={100}
                  />
                  <span className="text-sm font-bold text-ant-text-secondary w-8 text-right">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Tỷ lệ Loại II (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gradeII}
                    onChange={(e) => setGradeII(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm font-bold text-ant-warning bg-ant-warning/5 focus:outline-none focus:ring-2 focus:ring-ant-warning/20 focus:border-ant-warning"
                    min={0} max={100}
                  />
                  <span className="text-sm font-bold text-ant-text-secondary w-8 text-right">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Tỷ lệ Không mua (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={reject}
                    onChange={(e) => setReject(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm font-bold text-ant-error bg-ant-error/5 focus:outline-none focus:ring-2 focus:ring-ant-error/20 focus:border-ant-error"
                    min={0} max={100}
                  />
                  <span className="text-sm font-bold text-ant-text-secondary w-8 text-right">%</span>
                </div>
              </div>

              {/* Total check */}
              <div className={`rounded-xl p-3 flex items-center justify-between ${
                totalGrade === 100 ? 'bg-ant-sx/5 border border-ant-sx/20' :
                totalGrade > 100 ? 'bg-ant-error/5 border border-ant-error/20' :
                'bg-ant-warning/5 border border-ant-warning/20'
              }`}>
                <span className="text-xs font-medium text-ant-text-secondary">Tổng tỷ lệ</span>
                <span className={`text-sm font-bold ${
                  totalGrade === 100 ? 'text-ant-sx' :
                  totalGrade > 100 ? 'text-ant-error' : 'text-ant-warning'
                }`}>
                  {totalGrade}%
                  {totalGrade !== 100 && totalGrade > 0 && ' (phải = 100%)'}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider block mb-2">Trạng thái QC</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQcStatus('Đạt')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                      qcStatus === 'Đạt'
                        ? 'bg-ant-sx border-ant-sx text-white'
                        : 'bg-gray-50 border-gray-200 text-ant-text-secondary'
                    }`}
                  >
                    <i className={`${qcStatus === 'Đạt' ? 'ri-check-line' : 'ri-check-line'} mr-1`} />
                    Đạt — QI Stock
                  </button>
                  <button
                    onClick={() => setQcStatus('Không đạt')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                      qcStatus === 'Không đạt'
                        ? 'bg-ant-error border-ant-error text-white'
                        : 'bg-gray-50 border-gray-200 text-ant-text-secondary'
                    }`}
                  >
                    <i className="ri-close-line mr-1" />
                    Không đạt — Hold
                  </button>
                </div>
                {qcStatus === 'Không đạt' && (
                  <p className="text-xxs text-ant-error mt-2">Hàng sẽ được đưa vào Rejected/Hold. Vui lòng ghi rõ lý do QC không đạt.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-1" /> Quay lại
              </button>
              <button
                onClick={handleConfirmReceipt}
                disabled={totalGrade !== 100}
                className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <i className="ri-check-line mr-1" /> Xác nhận nhập
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 rounded-full bg-ant-sx/10 flex items-center justify-center mb-4">
              <i className="ri-check-line text-3xl text-ant-sx" />
            </div>
            <h3 className="text-lg font-bold text-ant-text mb-2">Nhập nguyên liệu thành công!</h3>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 w-full space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-ant-text-secondary">PO</span>
                <span className="font-bold text-ant-text">{poNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ant-text-secondary">Net Weight</span>
                <span className="font-bold text-ant-sx">{netWeight.toLocaleString()} KG</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ant-text-secondary">Batch RM</span>
                <span className="font-mono font-bold text-ant-text">RM-2026-MA-XOAI-162-001</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ant-text-secondary">QC</span>
                <span className={`font-bold ${qcStatus === 'Đạt' ? 'text-ant-sx' : 'text-ant-error'}`}>{qcStatus}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/inbound')}
              className="w-full py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Về Nhập kho
            </button>
          </div>
        )}

        {/* Step 2 confirmation is handled by handleConfirmReceipt which auto-navigates */}
      </main>
    </div>
  );
}