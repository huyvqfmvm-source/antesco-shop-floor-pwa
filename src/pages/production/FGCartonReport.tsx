import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_LOSS_REASONS } from '@/mocks/loss-reasons';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';

const PRODUCTS = [
  { code: 'TP0061', name: 'Xoài đông IQF cắt xí ngầu 1.5cm' },
  { code: 'TP0042', name: 'Thanh long đông IQF cắt lát 2cm' },
  { code: 'TP0078', name: 'Mít đông IQF nguyên múi' },
  { code: 'TP0092', name: 'Xoài đông IQF cắt lát 3mm' },
];

const PO_OPTIONS = [
  { id: '10000456', productCode: 'TP0061', batch: 'RM-2026-MA-XOAI-162-001' },
  { id: '10000457', productCode: 'TP0042', batch: 'RM-2026-MA-TL-164-001' },
  { id: '10000460', productCode: 'TP0042', batch: 'FG-2026-BK-0042-167-002' },
];

export default function FGCartonReportPage() {
  const { state, addToast, addActivityLog } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedPO, setSelectedPO] = useState('10000456');
  const [selectedProduct, setSelectedProduct] = useState('TP0061');
  const [materialBatch, setMaterialBatch] = useState('RM-2026-MA-XOAI-162-001');
  const [inputQty, setInputQty] = useState(4500);
  const [cartonQty, setCartonQty] = useState(450);
  const [boxQty, setBoxQty] = useState(4500);
  const [lossQty, setLossQty] = useState(45);
  const [lossReason, setLossReason] = useState('LR-009');
  const [qaConfirm, setQaConfirm] = useState<'OK' | 'Cần kiểm tra'>('OK');
  const [shift, setShift] = useState('Ca 1');
  const [reporter, setReporter] = useState('Nguyễn Văn An');
  const [dept, setDept] = useState('Sản xuất');
  const [prodSign, setProdSign] = useState<SignedInfo | null>(null);
  const [qaSign, setQaSign] = useState<SignedInfo | null>(null);

  const selectedPOData = PO_OPTIONS.find((po) => po.id === selectedPO);
  const cartonWeight = 10;
  const calculatedCartons = Math.round(inputQty / cartonWeight);

  const steps = ['Nhập thông tin', 'Ghi hao hụt', 'Ký xác nhận'];

  const handleSignProd = useCallback((info: SignedInfo) => {
    setProdSign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký SX (đóng thùng TP)', `${info.signerName} · PO ${selectedPO}`);
  }, [addActivityLog, state.currentUser, state.role?.name, selectedPO]);

  const handleSignQa = useCallback((info: SignedInfo) => {
    setQaSign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký QA (đóng thùng TP)', `${info.signerName} · PO ${selectedPO}`);
  }, [addActivityLog, state.currentUser, state.role?.name, selectedPO]);

  const handleComplete = () => {
    addActivityLog(state.currentUser, state.role?.name || '', 'Báo cáo đóng thùng TP', `PO ${selectedPO} · ${cartonQty} thùng · Hao hụt ${lossQty} KG`);
    addToast('success', `Đã hoàn tất báo cáo đóng thùng — ${cartonQty} thùng TP`);
    navigate('/production');
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Báo cáo đóng thùng TP</h1>
          <p className="text-xs text-white/70">BC-DTTP-01 · {state.plant?.name}</p>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-gray-100 bg-ant-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${i < step ? 'bg-ant-sx text-white' : i === step ? 'bg-ant-sx text-white ring-2 ring-ant-sx/30' : 'bg-gray-100 text-ant-text-secondary'}`}>
                {i < step ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-5 h-px ${i < step ? 'bg-ant-sx' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Input */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Người báo cáo</label>
                <input type="text" value={reporter} onChange={(e) => setReporter(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Bộ phận</label>
                  <input type="text" value={dept} onChange={(e) => setDept(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Ca</label>
                  <select value={shift} onChange={(e) => setShift(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
                    <option>Ca 1</option><option>Ca 2</option><option>Ca lỡ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Lệnh SX</label>
                <select value={selectedPO} onChange={(e) => { setSelectedPO(e.target.value); const po = PO_OPTIONS.find((p) => p.id === e.target.value); if (po) { setSelectedProduct(po.productCode); setMaterialBatch(po.batch); } }}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
                  {PO_OPTIONS.map((po) => <option key={po.id} value={po.id}>{po.id} — {po.productCode}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Lô nguyên liệu nguồn</label>
                <input type="text" value={materialBatch} onChange={(e) => setMaterialBatch(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-mono text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
              </div>

              <div className="bg-ant-sx/5 rounded-lg p-3 space-y-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">KL đầu vào (KG)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const n = Math.max(0, inputQty - 500); setInputQty(n); setCartonQty(Math.round(n / cartonWeight)); }}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold">−</button>
                    <div className="flex-1 rounded-xl bg-white py-2.5 text-center"><span className="text-xl font-bold text-ant-sx">{inputQty.toLocaleString()}</span></div>
                    <button onClick={() => { const n = inputQty + 500; setInputQty(n); setCartonQty(Math.round(n / cartonWeight)); }}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
                <InfoRow label="~Số thùng (10KG/thùng)" value={`~${calculatedCartons} thùng`} />
              </div>
            </div>
            <button onClick={() => setStep(1)} disabled={!inputQty}
              className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ghi hao hụt</button>
          </>
        )}

        {/* Step 1: Loss */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-bold text-ant-text mb-2">Ghi nhận hao hụt & đóng thùng</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Số thùng</label>
                  <input type="number" value={cartonQty} onChange={(e) => setCartonQty(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-nk bg-ant-nk/5 focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Số hộp/thùng</label>
                  <input type="number" value={boxQty} onChange={(e) => setBoxQty(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Hao hụt (KG)</label>
                  <input type="number" value={lossQty} onChange={(e) => setLossQty(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-ant-error/20 bg-ant-error/5 px-3 text-sm font-bold text-ant-error focus:outline-none focus:ring-2 focus:ring-ant-error/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Lý do hao hụt</label>
                  <select value={lossReason} onChange={(e) => setLossReason(e.target.value)}
                    className="w-full h-12 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
                    {MOCK_LOSS_REASONS.map((lr) => <option key={lr.code} value={lr.code}>{lr.code} — {lr.name}</option>)}
                  </select>
                </div>
              </div>

              {lossReason === 'LR-999' && (
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Ghi chú lý do khác (bắt buộc)</label>
                  <textarea placeholder="Nhập lý do..." maxLength={500}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-ant-sx/50" />
                </div>
              )}

              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">QA xác nhận</label>
                <div className="flex gap-2">
                  <button onClick={() => setQaConfirm('OK')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${qaConfirm === 'OK' ? 'bg-ant-sx border-ant-sx text-white' : 'bg-gray-50 border-gray-200 text-ant-text-secondary'}`}>OK</button>
                  <button onClick={() => setQaConfirm('Cần kiểm tra')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${qaConfirm === 'Cần kiểm tra' ? 'bg-ant-warning border-ant-warning text-white' : 'bg-gray-50 border-gray-200 text-ant-text-secondary'}`}>Cần kiểm tra</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký</button>
            </div>
          </>
        )}

        {/* Step 2: Sign */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký xác nhận — BC-DTTP-01</p>
              <div className="bg-ant-bg rounded-lg p-3 mb-4 space-y-1">
                <InfoRow label="PO" value={selectedPO} mono />
                <InfoRow label="Sản phẩm" value={selectedProduct} />
                <InfoRow label="Lô NL" value={materialBatch} mono />
                <InfoRow label="KL vào" value={`${inputQty.toLocaleString()} KG`} />
                <InfoRow label="Số thùng" value={`${cartonQty} thùng`} bold />
                <InfoRow label="Hao hụt" value={`${lossQty} KG (${lossReason})`} />
                <InfoRow label="QA" value={qaConfirm} />
              </div>

              <MultiRoleSignature label="Người đóng thùng" roleLabel={reporter + ' · ' + dept} requiredPermission="PRODUCTION_SIGN"
                signedInfo={prodSign} onSign={handleSignProd} className="mb-3" otherSignerUsername={qaSign?.signerUsername} />
              <MultiRoleSignature label="QA xác nhận" roleLabel="Lê Văn Cường · KCS/QM" requiredPermission="QM_HOLD"
                signedInfo={qaSign} onSign={handleSignQa} otherSignerUsername={prodSign?.signerUsername} />
            </div>

            <button onClick={handleComplete} disabled={!prodSign || !qaSign}
              className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">
              <i className="ri-check-line mr-1" />Hoàn tất báo cáo đóng thùng
            </button>
            <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
          </>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-xs font-medium text-ant-text ${bold ? 'font-bold' : ''} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}