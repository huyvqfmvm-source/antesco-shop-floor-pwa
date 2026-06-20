import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import { MOCK_RM_RECEIPTS } from '@/mocks/extended';
import { MOCK_LOSS_REASONS } from '@/mocks/loss-reasons';
import { MOCK_DEFECT_CODES } from '@/mocks/data';
import PermissionBanner from '@/components/base/PermissionBanner';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';

export default function QCInspectionPage() {
  const { state, addToast, addActivityLog } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [receiptId, setReceiptId] = useState('RM-RCPT-001');
  const [gradeIPct, setGradeIPct] = useState<number | ''>(85);
  const [gradeIIPct, setGradeIIPct] = useState<number | ''>(10);
  const [rejectPct, setRejectPct] = useState<number | ''>(5);
  const [qcResult, setQcResult] = useState<'Đạt' | 'Cần kiểm tra' | 'Không đạt' | 'QM Hold'>('Đạt');
  const [selectedDefect, setSelectedDefect] = useState('');
  const [note, setNote] = useState('');
  const [qcSignInfo, setQcSignInfo] = useState<SignedInfo | null>(null);
  const [whSignInfo, setWhSignInfo] = useState<SignedInfo | null>(null);

  const receipt = MOCK_RM_RECEIPTS.find((r) => r.id === receiptId);
  const totalPct = (gradeIPct || 0) + (gradeIIPct || 0) + (rejectPct || 0);
  const hasDefects = qcResult === 'Không đạt' || qcResult === 'QM Hold';
  const canConfirm = qcSignInfo !== null && whSignInfo !== null && (!hasDefects || (hasDefects && selectedDefect && note.length > 0));

  const steps = ['Chọn phiếu nhập', 'Ghi nhận QC', 'Phân loại lỗi', 'Ký xác nhận'];

  const handleSignQc = useCallback((info: SignedInfo) => {
    setQcSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký QC đầu vào', `${info.signerName} · ${receiptId}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptId]);

  const handleSignWh = useCallback((info: SignedInfo) => {
    setWhSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký TK (QC đầu vào)', `${info.signerName} · ${receiptId}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptId]);

  const handleSubmit = () => {
    if (!canConfirm) return;
    addActivityLog(state.currentUser, state.role?.name || '', 'QC đầu vào', `${receiptId} · ${qcResult} · Loại I: ${gradeIPct}% Loại II: ${gradeIIPct}% Loại bỏ: ${rejectPct}%`);
    addToast('success', `Đã hoàn tất QC đầu vào. Kết quả: ${qcResult}`);
    navigate('/inbound');
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-qm text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/inbound')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">QC đầu vào — Kiểm thu nguyên liệu</h1>
          <p className="text-xs text-white/70">BM-KTNL-01 · {state.plant?.name}</p>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-gray-100 bg-ant-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${i < step ? 'bg-ant-qm text-white' : i === step ? 'bg-ant-qm text-white ring-2 ring-ant-qm/30' : 'bg-gray-100 text-ant-text-secondary'}`}>
                {i < step ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              {i < 3 && <div className={`w-5 h-px ${i < step ? 'bg-ant-qm' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <PermissionBanner module="QC đầu vào" moduleIcon="ri-microscope-line" moduleColor="qm" requiredPermissions={['QM_VIEW', 'QM_HOLD']} className="mx-4 mt-3" />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Select receipt */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Chọn phiếu nhập cần kiểm QC</p>
              <div className="space-y-2">
                {MOCK_RM_RECEIPTS.map((r) => (
                  <button key={r.id} onClick={() => { setReceiptId(r.id); setStep(1); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${receiptId === r.id ? 'border-ant-qm/30 bg-ant-qm/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-ant-text">{r.poNumber}</p>
                        <p className="text-xs text-ant-text-secondary">{r.supplier} · Net {r.netWeight.toLocaleString()} KG</p>
                      </div>
                      <span className="text-xxs px-2 py-0.5 rounded-full bg-ant-qm/10 text-ant-qm font-bold">{r.id}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-ant-text-secondary">
                      <span><i className="ri-truck-line mr-0.5" />{r.licensePlate}</span>
                      <span>QC: <span className={`font-bold ${r.qcStatus === 'Đạt' ? 'text-ant-sx' : 'text-ant-warning'}`}>{r.qcStatus}</span></span>
                      <span>Batch: <span className="font-mono text-ant-text">{r.batchRm}</span></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => receiptId && setStep(1)} className="w-full py-3.5 rounded-xl bg-ant-qm text-white text-sm font-bold active:scale-[0.98] transition-all whitespace-nowrap">
              Tiếp tục — Ghi nhận QC
            </button>
          </>
        )}

        {/* Step 1: QC input */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-ant-text">Kết quả kiểm — {receiptId}</p>
                <span className="text-xxs bg-ant-qm/10 text-ant-qm px-2 py-0.5 rounded-full font-bold">BM-KTNL-01</span>
              </div>
              {receipt && (
                <div className="bg-ant-bg rounded-lg p-3 mb-3 space-y-1">
                  <InfoRow label="PO" value={receipt.poNumber} />
                  <InfoRow label="NCC" value={receipt.supplier} />
                  <InfoRow label="Net Weight" value={`${receipt.netWeight.toLocaleString()} KG`} bold />
                  <InfoRow label="Batch RM" value={receipt.batchRm} mono />
                </div>
              )}

              {/* Grade inputs */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-ant-sx mb-1.5 block">Loại I (%)</label>
                  <input type="number" value={gradeIPct} onChange={(e) => setGradeIPct(e.target.value ? Number(e.target.value) : '')} min={0} max={100}
                    className="w-full h-12 rounded-xl border border-ant-sx/20 bg-ant-sx/5 px-4 text-sm font-bold text-ant-sx focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ant-warning mb-1.5 block">Loại II (%)</label>
                  <input type="number" value={gradeIIPct} onChange={(e) => setGradeIIPct(e.target.value ? Number(e.target.value) : '')} min={0} max={100}
                    className="w-full h-12 rounded-xl border border-ant-warning/20 bg-ant-warning/5 px-4 text-sm font-bold text-ant-warning focus:outline-none focus:ring-2 focus:ring-ant-warning/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ant-error mb-1.5 block">Loại bỏ (%)</label>
                  <input type="number" value={rejectPct} onChange={(e) => setRejectPct(e.target.value ? Number(e.target.value) : '')} min={0} max={100}
                    className="w-full h-12 rounded-xl border border-ant-error/20 bg-ant-error/5 px-4 text-sm font-bold text-ant-error focus:outline-none focus:ring-2 focus:ring-ant-error/20" />
                </div>
              </div>

              <div className={`rounded-xl p-3 mb-4 ${totalPct > 0 ? 'bg-ant-bg' : 'bg-gray-50'}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-ant-text-secondary">Tổng</span>
                  <span className="font-bold text-ant-text">{totalPct}%</span>
                </div>
                <p className="text-xxs text-ant-text-secondary mt-1">QC ghi nhận theo thực tế. Không bắt buộc tổng = 100%.</p>
              </div>

              {/* QC Result */}
              <label className="text-xs font-bold text-ant-text-secondary mb-2 block">Đánh giá tổng quát</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['Đạt', 'Cần kiểm tra', 'Không đạt', 'QM Hold'] as const).map((r) => (
                  <button key={r} onClick={() => setQcResult(r)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${qcResult === r
                      ? r === 'Đạt' ? 'bg-ant-sx border-ant-sx text-white' : r === 'Cần kiểm tra' ? 'bg-ant-warning border-ant-warning text-white' : 'bg-ant-error border-ant-error text-white'
                      : 'bg-gray-50 border-gray-200 text-ant-text-secondary'}`}>{r}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => { if (hasDefects) setStep(2); else setStep(3); }} disabled={!gradeIPct && !gradeIIPct && !rejectPct}
                className="flex-1 py-3.5 rounded-xl bg-ant-qm text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">Tiếp tục</button>
            </div>
          </>
        )}

        {/* Step 2: Defect details */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Phân loại lỗi — {qcResult}</p>

              <label className="text-xs font-bold text-ant-text-secondary mb-2 block">Mã lỗi DF</label>
              <select value={selectedDefect} onChange={(e) => setSelectedDefect(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-ant-qm/20">
                <option value="">Chọn mã lỗi...</option>
                {MOCK_DEFECT_CODES.map((dc) => <option key={dc.code} value={dc.code}>{dc.code} — {dc.name} ({dc.category})</option>)}
                <option value="KHAC">Khác</option>
              </select>

              <label className="text-xs font-bold text-ant-text-secondary mb-1.5 block">Ghi chú (bắt buộc)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả chi tiết lỗi..." maxLength={500}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-ant-text bg-ant-bg resize-none h-24 focus:outline-none focus:border-ant-qm/50 mb-1" />
              <p className="text-xxs text-ant-text-secondary text-right">{note.length}/500</p>

              <div className="mt-3 p-3 rounded-lg bg-ant-error/5 border border-ant-error/20">
                <p className="text-xs font-bold text-ant-error mb-1"><i className="ri-camera-line mr-1" />Yêu cầu ảnh bằng chứng</p>
                <button className="w-full py-2.5 rounded-lg border-2 border-dashed border-ant-error/30 text-xs text-ant-error font-medium hover:bg-ant-error/5 transition-all">
                  <i className="ri-add-line mr-1" />Thêm ảnh bằng chứng
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => setStep(3)} disabled={!selectedDefect || !note}
                className="flex-1 py-3.5 rounded-xl bg-ant-qm text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký xác nhận</button>
            </div>
          </>
        )}

        {/* Step 3: Sign */}
        {step === 3 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký xác nhận QC đầu vào</p>
              <div className="bg-ant-bg rounded-lg p-3 mb-4 space-y-1">
                <InfoRow label="Kết quả" value={qcResult} />
                <InfoRow label="Loại I" value={`${gradeIPct || 0}%`} />
                <InfoRow label="Loại II" value={`${gradeIIPct || 0}%`} />
                <InfoRow label="Loại bỏ" value={`${rejectPct || 0}%`} />
                {selectedDefect && <InfoRow label="Mã lỗi" value={selectedDefect} />}
              </div>

              <MultiRoleSignature label="KCS/QM kiểm tra" roleLabel="Lê Văn Cường · KCS/QM MA" requiredPermission="QM_HOLD" signedInfo={qcSignInfo} onSign={handleSignQc} className="mb-3" otherSignerUsername={whSignInfo?.signerUsername} />
              <MultiRoleSignature label="Thủ kho xác nhận" roleLabel="Trần Thị Bình · Thủ kho MA" requiredPermission="INBOUND_SIGN_WH" signedInfo={whSignInfo} onSign={handleSignWh} otherSignerUsername={qcSignInfo?.signerUsername} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(hasDefects ? 2 : 1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={handleSubmit} disabled={!canConfirm}
                className="flex-1 py-3.5 rounded-xl bg-ant-qm text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">Xác nhận QC</button>
            </div>
          </>
        )}
      </main>
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