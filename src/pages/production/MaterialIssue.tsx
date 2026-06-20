import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_ALL_MATERIAL_NORMS, calculateMaterialRequirements } from '@/mocks/material-norms';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';
import type { MaterialNormItem } from '@/mocks/material-norms';

const PRODUCTION_ORDERS = [
  { id: '10000456', productCode: 'TP0061', productName: 'Xoài đông IQF cắt xí ngầu 1.5cm', plannedQty: 5000, status: 'REL' },
  { id: '10000457', productCode: 'TP0042', productName: 'Thanh long đông IQF cắt lát 2cm', plannedQty: 3200, status: 'REL' },
  { id: '10000461', productCode: 'TP0078', productName: 'Mít đông IQF nguyên múi', plannedQty: 2400, status: 'REL' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'Draft': { label: 'Bản nháp', color: 'text-gray-500' },
  'Chờ duyệt': { label: 'Chờ duyệt', color: 'text-ant-warning' },
  'Đã duyệt': { label: 'Đã duyệt', color: 'text-ant-nk' },
  'Đã cấp': { label: 'Đã cấp', color: 'text-ant-sx' },
  'Hoàn tất': { label: 'Hoàn tất', color: 'text-ant-success' },
  'Hủy': { label: 'Hủy', color: 'text-ant-error' },
};

export default function MaterialIssuePage() {
  const { state, addToast, addActivityLog } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedPO, setSelectedPO] = useState('10000456');
  const [receiverName, setReceiverName] = useState('Nguyễn Văn An');
  const [department, setDepartment] = useState('Sản xuất');
  const [purpose, setPurpose] = useState('');
  const [copyNumber, setCopyNumber] = useState('1');
  const [status, setStatus] = useState<keyof typeof STATUS_CONFIG>('Draft');
  const [approvalSign, setApprovalSign] = useState<SignedInfo | null>(null);
  const [issueSign, setIssueSign] = useState<SignedInfo | null>(null);
  const [receiveSign, setReceiveSign] = useState<SignedInfo | null>(null);

  const selectedOrder = PRODUCTION_ORDERS.find((po) => po.id === selectedPO);
  const bom = MOCK_ALL_MATERIAL_NORMS.find((b) => b.productCode === selectedOrder?.productCode);

  const calculatedItems = selectedOrder && bom
    ? calculateMaterialRequirements(bom.id, selectedOrder.plannedQty)
    : [];

  const steps = ['Chọn PO', 'Xem NVL đề xuất', 'Duyệt phiếu', 'Ký giao/nhận'];

  const handleSubmitApproval = () => {
    setStatus('Chờ duyệt');
    addToast('info', 'Phiếu đề xuất đã gửi duyệt. Chờ Quản đốc/Tổ trưởng duyệt.');
    setStep(2);
  };

  const handleApprove = useCallback((info: SignedInfo) => {
    setApprovalSign(info);
    setStatus('Đã duyệt');
    addActivityLog(state.currentUser, state.role?.name || '', 'Duyệt cấp NVL', `PO ${selectedPO} · BM-NM-07`);
    addToast('success', 'Đã duyệt phiếu đề xuất cấp NVL');
  }, [addActivityLog, addToast, state.currentUser, state.role?.name, selectedPO]);

  const handleIssue = useCallback((info: SignedInfo) => {
    setIssueSign(info);
    setStatus('Đã cấp');
    addActivityLog(state.currentUser, state.role?.name || '', 'Cấp NVL', `PO ${selectedPO} · Ký giao`);
    addToast('success', 'Thủ kho đã ký cấp phát');
  }, [addActivityLog, addToast, state.currentUser, state.role?.name, selectedPO]);

  const handleReceive = useCallback((info: SignedInfo) => {
    setReceiveSign(info);
    setStatus('Hoàn tất');
    addActivityLog(state.currentUser, state.role?.name || '', 'Nhận NVL', `PO ${selectedPO} · Ký nhận`);
    addToast('success', 'Đã hoàn tất cấp phát NVL');
  }, [addActivityLog, addToast, state.currentUser, state.role?.name, selectedPO]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Đề xuất cấp NVL/Công cụ</h1>
          <p className="text-xs text-white/70">BM-NM-07 · {STATUS_CONFIG[status]?.label || 'Bản nháp'}</p>
        </div>
        <span className={`text-xxs font-bold px-2 py-0.5 rounded-full bg-white/20 ${STATUS_CONFIG[status]?.color || ''}`}>{STATUS_CONFIG[status]?.label}</span>
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

      <PermissionBanner module="Sản xuất — Cấp NVL" moduleIcon="ri-archive-line" moduleColor="sx" requiredPermissions={['PRODUCTION_MATERIAL', 'PRODUCTION_CREATE_ORDER', 'PRODUCTION_VIEW']} className="mx-4 mt-3" />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Select PO */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Chọn lệnh sản xuất</p>
              <div className="space-y-2">
                {PRODUCTION_ORDERS.map((po) => (
                  <button key={po.id} onClick={() => { setSelectedPO(po.id); setPurpose(`Cấp NVL cho PO ${po.id} — ${po.productName}, KH ${po.plannedQty.toLocaleString()} KG`); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPO === po.id ? 'border-ant-sx/30 bg-ant-sx/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-ant-text">{po.id}</p>
                      <span className="text-xxs bg-ant-nk/10 text-ant-nk px-1.5 py-0.5 rounded-full">{po.status}</span>
                    </div>
                    <p className="text-xs text-ant-text-secondary mt-0.5">{po.productName}</p>
                    <p className="text-xs text-ant-sx font-medium mt-0.5">KH: {po.plannedQty.toLocaleString()} KG</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Thông tin phiếu</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Người nhận</label>
                  <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Bộ phận</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Mục đích sử dụng</label>
                  <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={500}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-sx/50" />
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Liên số</label>
                  <select value={copyNumber} onChange={(e) => setCopyNumber(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
                    <option value="1">Liên 1 — Kho</option>
                    <option value="2">Liên 2 — Bộ phận đề xuất</option>
                    <option value="3">Liên 3 — Kế toán</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(1)} disabled={!selectedPO}
              className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-all whitespace-nowrap">Tiếp tục — Xem NVL đề xuất</button>
          </>
        )}

        {/* Step 1: BOM proposal */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">NVL đề xuất theo BOM (QĐ01B 2026)</p>
              {selectedOrder && bom && (
                <div className="mb-3">
                  <p className="text-xs text-ant-text-secondary">{selectedOrder.productName} · KH: {selectedOrder.plannedQty.toLocaleString()} KG</p>
                </div>
              )}
              <div className="space-y-2">
                {calculatedItems.map((item) => (
                  <div key={item.materialCode} className="bg-ant-bg rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-bold text-ant-text">{item.materialName}</p>
                      <span className="text-xs font-bold text-ant-sx">{item.requiredQty.toLocaleString()} {item.uom}</span>
                    </div>
                    <p className="text-xs text-ant-text-secondary font-mono">{item.materialCode}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={handleSubmitApproval} className="flex-1 py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Gửi duyệt</button>
            </div>
          </>
        )}

        {/* Step 2: Approval */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Duyệt phiếu cấp NVL — BM-NM-07</p>
              <div className="bg-ant-bg rounded-lg p-3 mb-4 space-y-1">
                <InfoRow label="PO" value={selectedPO} mono />
                <InfoRow label="Người nhận" value={receiverName} />
                <InfoRow label="Bộ phận" value={department} />
                <InfoRow label="Liên số" value={`Liên ${copyNumber}`} />
                <InfoRow label="Số dòng NVL" value={`${calculatedItems.length} dòng`} />
              </div>

              <MultiRoleSignature label="Quản đốc/Tổ trưởng duyệt" roleLabel="Phạm Thị Dung · Quản đốc MA"
                requiredPermission="PRODUCTION_CREATE_ORDER" signedInfo={approvalSign} onSign={handleApprove} className="mb-3" />
            </div>

            {status === 'Đã duyệt' && (
              <button onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký giao/nhận</button>
            )}
            <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
          </>
        )}

        {/* Step 3: Sign issue/receive */}
        {step === 3 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký giao — Ký nhận</p>
              <MultiRoleSignature label="Thủ kho — Ký giao" roleLabel="Trần Thị Bình · Thủ kho MA"
                requiredPermission="INBOUND_SIGN_WH" signedInfo={issueSign} onSign={handleIssue} className="mb-3"
                otherSignerUsername={receiveSign?.signerUsername} />
              <MultiRoleSignature label="Người nhận — Ký nhận" roleLabel="Nguyễn Văn An · Công nhân SX"
                requiredPermission="PRODUCTION_SIGN" signedInfo={receiveSign} onSign={handleReceive}
                otherSignerUsername={issueSign?.signerUsername} />
            </div>

            {status === 'Hoàn tất' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-ant-sx/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-3xl text-ant-sx" />
                </div>
                <h3 className="text-lg font-bold text-ant-text mb-2">Hoàn tất cấp NVL!</h3>
                <button onClick={() => navigate('/production')}
                  className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Về Sản xuất</button>
              </div>
            )}
            {status !== 'Hoàn tất' && (
              <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-ant-text-secondary">{label}</span>
      <span className={`text-sm font-medium text-ant-text ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}