import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import { generateMockPdfUrl } from '@/services/pdf-export';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';

const WAREHOUSES = ['KL-01', 'KL-02', 'KL-03', 'KL-04', 'KL-05', 'KL-06', 'KL-07', 'KL-08'];

const MOCK_FG_BATCHES = [
  { id: 'FGWR-2026-0001', po: '10000456', productCode: 'TP0061', productName: 'Xoài đông IQF cắt xí ngầu 1.5cm', batch: '002216225', qtyKg: 4500, qtyCarton: 450 },
  { id: 'FGWR-2026-0002', po: '10000460', productCode: 'TP0042', productName: 'Thanh long đông IQF cắt lát 2cm', batch: 'FG-2026-BK-0042-167-002', qtyKg: 3800, qtyCarton: 380 },
];

export default function FGWarehouseReqPage() {
  const { state, addToast, addActivityLog, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedFG, setSelectedFG] = useState('FGWR-2026-0001');
  const [warehouse, setWarehouse] = useState('KL-03');
  const [qtyKg, setQtyKg] = useState(4500);
  const [qtyCarton, setQtyCarton] = useState(450);
  const [note, setNote] = useState('');
  const [prodSign, setProdSign] = useState<SignedInfo | null>(null);
  const [whSign, setWhSign] = useState<SignedInfo | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  const selectedData = MOCK_FG_BATCHES.find((f) => f.id === selectedFG);
  const receiptNo = `BM-NM-09-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  const steps = ['Chọn lô TP', 'Kiểm tra thông tin', 'Ký bàn giao', 'Hoàn tất'];

  const handleSignProd = useCallback((info: SignedInfo) => {
    setProdSign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký SX (BM-NM-09)', `${info.signerName} · ${receiptNo}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptNo]);

  const handleSignWh = useCallback((info: SignedInfo) => {
    setWhSign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký Kho (BM-NM-09)', `${info.signerName} · ${receiptNo}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptNo]);

  const handleComplete = () => {
    dispatch({ type: 'UPDATE_PRODUCTION_ORDER', payload: { id: selectedData?.po || '10000456', updates: { status: 'CNF' } } });
    addActivityLog(state.currentUser, state.role?.name || '', 'Yêu cầu NK TP', `${receiptNo} · ${selectedData?.productName} · ${qtyKg.toLocaleString()} KG`);
    addToast('success', `Đã tạo phiếu yêu cầu nhập kho TP ${receiptNo}`);
    setShowPdf(true);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Yêu cầu nhập kho TP</h1>
          <p className="text-xs text-white/70">BM-NM-09 (Excel 2025) · {state.plant?.name}</p>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-gray-100 bg-ant-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${i < step ? 'bg-ant-sx text-white' : i === step ? 'bg-ant-sx text-white ring-2 ring-ant-sx/30' : 'bg-gray-100 text-ant-text-secondary'}`}>
                {i < step ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              {i < 3 && <div className={`w-5 h-px ${i < step ? 'bg-ant-sx' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Select FG batch */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Chọn lô thành phẩm cần nhập kho</p>
              <div className="space-y-2">
                {MOCK_FG_BATCHES.map((fg) => (
                  <button key={fg.id} onClick={() => { setSelectedFG(fg.id); setQtyKg(fg.qtyKg); setQtyCarton(fg.qtyCarton); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedFG === fg.id ? 'border-ant-sx/30 bg-ant-sx/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-ant-text">{fg.productName}</p>
                      <span className="text-xs font-bold text-ant-sx">{fg.qtyKg.toLocaleString()} KG</span>
                    </div>
                    <p className="text-xs text-ant-text-secondary mt-0.5">PO {fg.po} · Batch {fg.batch} · {fg.qtyCarton} thùng</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục</button>
          </>
        )}

        {/* Step 1: Review */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-ant-text">Thông tin phiếu BM-NM-09</p>
                <span className="text-xxs bg-ant-sx/10 text-ant-sx px-2 py-0.5 rounded-full font-bold">Excel 2025</span>
              </div>

              {selectedData && (
                <div className="bg-ant-bg rounded-lg p-3 space-y-1">
                  <InfoRow label="PO" value={selectedData.po} mono />
                  <InfoRow label="Mã SP" value={selectedData.productCode} mono />
                  <InfoRow label="Tên SP" value={selectedData.productName} />
                  <InfoRow label="Số lô" value={selectedData.batch} mono />
                </div>
              )}

              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Kho nhập</label>
                <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
                  {WAREHOUSES.map((wh) => <option key={wh} value={wh}>{wh}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">KL (KG)</label>
                  <input type="number" value={qtyKg} onChange={(e) => setQtyKg(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-sx bg-ant-sx/5 focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Số thùng</label>
                  <input type="number" value={qtyCarton} onChange={(e) => setQtyCarton(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-nk bg-ant-nk/5 focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
              </div>

              <div>
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Ghi chú</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú..." maxLength={500}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-ant-sx/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký bàn giao</button>
            </div>
          </>
        )}

        {/* Step 2: Sign */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký bàn giao — BM-NM-09</p>
              <MultiRoleSignature label="Bộ phận sản xuất" roleLabel="Nguyễn Văn An · Công nhân SX MA" requiredPermission="PRODUCTION_SIGN"
                signedInfo={prodSign} onSign={handleSignProd} className="mb-3" otherSignerUsername={whSign?.signerUsername} />
              <MultiRoleSignature label="Bộ phận kho" roleLabel="Trần Thị Bình · Thủ kho MA" requiredPermission="INBOUND_SIGN_WH"
                signedInfo={whSign} onSign={handleSignWh} otherSignerUsername={prodSign?.signerUsername} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={handleComplete} disabled={!prodSign || !whSign}
                className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">
                <i className="ri-check-line mr-1" />Hoàn tất yêu cầu NK TP
              </button>
            </div>
          </>
        )}

        {/* Step 3: Done + PDF */}
        {step === 3 && showPdf && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-ant-sx/10 flex items-center justify-center mb-4">
              <i className="ri-check-line text-3xl text-ant-sx" />
            </div>
            <h3 className="text-lg font-bold text-ant-text mb-2">Đã tạo phiếu BM-NM-09!</h3>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 w-full space-y-2 mb-4">
              <InfoRow label="Số phiếu" value={receiptNo} mono />
              <InfoRow label="Sản phẩm" value={selectedData?.productName || ''} />
              <InfoRow label="KL" value={`${qtyKg.toLocaleString()} KG`} bold />
              <InfoRow label="Kho" value={warehouse} />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => navigate('/production')} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Về Sản xuất</button>
              <button onClick={() => { addToast('info', 'Đã xuất PDF (Excel 2025 mock)'); generateMockPdfUrl('BM-NM-09', receiptNo); }}
                className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">
                <i className="ri-file-pdf-line mr-1" />Export PDF
              </button>
            </div>
          </div>
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