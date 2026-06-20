import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import { generateMockPdfUrl } from '@/services/pdf-export';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';

const WAREHOUSES = ['KL-01', 'KL-02', 'KL-03', 'KM-01', 'KM-02', 'NL-01'];

export default function ReceiptNotePage() {
  const { state, addToast, addActivityLog, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [poNumber, setPoNumber] = useState('PO-2026-00089');
  const [supplier, setSupplier] = useState('Đại lý Nguyễn Văn Tài');
  const [deliveryPerson, setDeliveryPerson] = useState('Ông Nguyễn Văn Tài');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [materialName, setMaterialName] = useState('Xoài cát tươi nguyên liệu');
  const [materialCode, setMaterialCode] = useState('RM-XC-001');
  const [plannedQty, setPlannedQty] = useState(8500);
  const [actualQty, setActualQty] = useState(8380);
  const [unitPrice, setUnitPrice] = useState(40000);
  const [warehouse, setWarehouse] = useState('KM-01');
  const [batchRm, setBatchRm] = useState('RM-2026-MA-XOAI-162-001');
  const [note, setNote] = useState('');
  const [whSignInfo, setWhSignInfo] = useState<SignedInfo | null>(null);
  const [accSignInfo, setAccSignInfo] = useState<SignedInfo | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  const totalAmount = actualQty * unitPrice;
  const receiptNo = `PNK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  const steps = ['Nhập thông tin', 'Kiểm tra + sinh batch', 'Ký xác nhận', 'Hoàn tất'];

  const handleSignWh = useCallback((info: SignedInfo) => {
    setWhSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký thủ kho (PNK)', `${info.signerName} · ${receiptNo}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptNo]);

  const handleSignAcc = useCallback((info: SignedInfo) => {
    setAccSignInfo(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký kế toán (PNK)', `${info.signerName} · ${receiptNo}`);
  }, [addActivityLog, state.currentUser, state.role?.name, receiptNo]);

  const handleComplete = () => {
    dispatch({ type: 'ADD_BATCH', payload: { id: batchRm, product: materialName, qty: actualQty, unit: 'KG', plant: state.plant?.code || 'MA', status: 'QI Stock', productionOrder: '' } });
    dispatch({ type: 'ADD_RAW_MATERIAL_RECEIPT', payload: { id: `RM-RCPT-${Date.now()}`, poNumber, supplier, licensePlate: '', grossWeight: actualQty + 120, tareWeight: 120, netWeight: actualQty, gradeI: 85, gradeII: 10, reject: 5, batchRm, qcStatus: 'Đạt', plant: state.plant?.code || 'MA', status: 'Đã nhập', createdDate: new Date().toISOString().split('T')[0] } });
    addActivityLog(state.currentUser, state.role?.name || '', 'Tạo phiếu nhập kho', `${receiptNo} · ${materialName} · ${actualQty.toLocaleString()} KG · ${totalAmount.toLocaleString()} VNĐ`);
    addToast('success', `Đã tạo phiếu nhập kho ${receiptNo}`);
    setShowPdf(true);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-nk text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/inbound')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Phiếu nhập kho điện tử</h1>
          <p className="text-xs text-white/70">PNK-01 · {state.plant?.name}</p>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-gray-100 bg-ant-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${i < step ? 'bg-ant-nk text-white' : i === step ? 'bg-ant-nk text-white ring-2 ring-ant-nk/30' : 'bg-gray-100 text-ant-text-secondary'}`}>
                {i < step ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              {i < 3 && <div className={`w-5 h-px ${i < step ? 'bg-ant-nk' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Input info */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-bold text-ant-text mb-2">Thông tin phiếu nhập</p>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Số PO</label>
                <input type="text" value={poNumber} onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-mono text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Nhà cung cấp</label>
                <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Người giao hàng</label>
                <input type="text" value={deliveryPerson} onChange={(e) => setDeliveryPerson(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Số hóa đơn (nếu có)</label>
                  <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Kho nhập</label>
                  <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20">
                    {WAREHOUSES.map((wh) => <option key={wh} value={wh}>{wh}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Mã vật tư</label>
                  <input type="text" value={materialCode} onChange={(e) => setMaterialCode(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-mono text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Tên vật tư</label>
                  <input type="text" value={materialName} onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">SL đặt</label>
                  <input type="number" value={plannedQty} onChange={(e) => setPlannedQty(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">SL thực tế</label>
                  <input type="number" value={actualQty} onChange={(e) => setActualQty(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-sx bg-ant-sx/5 focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">ĐVT</label>
                  <input type="text" value="KG" readOnly
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-text bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Đơn giá (VNĐ/KG)</label>
                <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
              </div>
              <div className="bg-ant-sx/5 rounded-xl p-3 flex justify-between">
                <span className="text-xs text-ant-text-secondary">Thành tiền</span>
                <span className="text-sm font-bold text-ant-sx">{totalAmount.toLocaleString()} VNĐ</span>
              </div>
              <div>
                <label className="text-xxs font-bold text-ant-text-secondary uppercase block mb-1">Ghi chú</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú phiếu nhập..." maxLength={500}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-nk/50" />
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] transition-all whitespace-nowrap">
              Tiếp tục — Kiểm tra & Sinh batch
            </button>
          </>
        )}

        {/* Step 1: Review + batch */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Kiểm tra thông tin & Sinh batch tạm</p>
              <div className="space-y-2 mb-3">
                <InfoRow label="Số phiếu" value={receiptNo} mono />
                <InfoRow label="PO" value={poNumber} mono />
                <InfoRow label="NCC" value={supplier} />
                <InfoRow label="Vật tư" value={`${materialCode} — ${materialName}`} />
                <InfoRow label="SL yêu cầu" value={`${plannedQty.toLocaleString()} KG`} />
                <InfoRow label="SL thực tế" value={`${actualQty.toLocaleString()} KG`} bold />
                <InfoRow label="Đơn giá" value={`${unitPrice.toLocaleString()} VNĐ/KG`} />
                <InfoRow label="Thành tiền" value={`${totalAmount.toLocaleString()} VNĐ`} bold />
                <InfoRow label="Kho" value={warehouse} />
              </div>

              <div className="bg-ant-nk/5 rounded-lg p-3 border border-ant-nk/10 mb-3">
                <p className="text-xs font-bold text-ant-nk mb-1"><i className="ri-barcode-line mr-1" />Batch tạm do app sinh</p>
                <p className="text-sm font-mono font-bold text-ant-text">{batchRm}</p>
                <p className="text-xxs text-ant-text-secondary mt-1">Batch tạm sẽ được gửi lên SAP/mock SAP khi online và user xác nhận đồng bộ</p>
              </div>

              {actualQty !== plannedQty && (
                <div className="bg-ant-warning/5 rounded-lg p-3 border border-ant-warning/20">
                  <p className="text-xs text-ant-warning font-bold"><i className="ri-error-warning-line mr-1" />Chênh lệch SL: {actualQty > plannedQty ? '+' : ''}{actualQty - plannedQty} KG</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký xác nhận</button>
            </div>
          </>
        )}

        {/* Step 2: Sign */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký xác nhận phiếu nhập kho</p>
              <MultiRoleSignature label="Thủ kho" roleLabel="Trần Thị Bình · Thủ kho MA" requiredPermission="INBOUND_SIGN_WH" signedInfo={whSignInfo} onSign={handleSignWh} className="mb-3" otherSignerUsername={accSignInfo?.signerUsername} />
              <MultiRoleSignature label="Kế toán kho" roleLabel="Ngô Thị Phương · Kế toán kho MA" requiredPermission="VIEW_DOCUMENTS" signedInfo={accSignInfo} onSign={handleSignAcc} otherSignerUsername={whSignInfo?.signerUsername} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={handleComplete} disabled={!whSignInfo || !accSignInfo}
                className="flex-1 py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">
                <i className="ri-check-line mr-1" />Hoàn tất phiếu nhập kho
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
            <h3 className="text-lg font-bold text-ant-text mb-2">Phiếu nhập kho đã tạo!</h3>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 w-full space-y-2 mb-4">
              <InfoRow label="Số phiếu" value={receiptNo} mono />
              <InfoRow label="Batch RM" value={batchRm} mono />
              <InfoRow label="Tổng tiền" value={`${totalAmount.toLocaleString()} VNĐ`} bold />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => navigate('/inbound')} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Về Nhập kho</button>
              <button onClick={() => { addToast('info', 'Đã xuất PDF phiếu nhập kho (mock)'); generateMockPdfUrl('PNK-01', receiptNo); }}
                className="flex-1 py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">
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
    <div className="flex justify-between items-center">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm text-ant-text ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}