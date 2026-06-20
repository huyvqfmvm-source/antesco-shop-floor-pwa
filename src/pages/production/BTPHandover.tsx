import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import MultiRoleSignature from '@/components/base/MultiRoleSignature';
import PermissionBanner from '@/components/base/PermissionBanner';
import type { SignedInfo } from '@/components/base/MultiRoleSignature';

const BTP_PALLETS = [
  { id: 'HU-2026-MA-BTP-XOAI-0001', product: 'Xoài BTP xí ngầu 1.5cm', qtyKg: 3200, qtyCrate: 320, crateKg: 10, location: 'KL-01-A1-T1', po: '10000456' },
  { id: 'HU-2026-MA-BTP-XOAI-0002', product: 'Xoài BTP xí ngầu 1.5cm', qtyKg: 1600, qtyCrate: 160, crateKg: 10, location: 'KL-01-A1-T2', po: '10000456' },
  { id: 'HU-2026-MA-BTP-TL-0005', product: 'Thanh long BTP cắt lát 2cm', qtyKg: 1600, qtyCrate: 160, crateKg: 10, location: 'KL-02-A2-T1', po: '10000457' },
  { id: 'HU-2026-BK-BTP-MIT-0004', product: 'Mít BTP nguyên múi', qtyKg: 900, qtyCrate: 90, crateKg: 10, location: '', po: '10000458' },
];

export default function BTPHandoverPage() {
  const { state, addToast, addActivityLog, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedPallet, setSelectedPallet] = useState('HU-2026-MA-BTP-XOAI-0001');
  const [fromOp, setFromOp] = useState('0030');
  const [toOp, setToOp] = useState('0040');
  const [fromOpName] = useState('Định hình xí ngầu 1.5cm');
  const [toOpName] = useState('Cấp đông IQF');
  const [crateCount, setCrateCount] = useState(320);
  const [crateWeight, setCrateWeight] = useState(10);
  const [note, setNote] = useState('');
  const [deliverySign, setDeliverySign] = useState<SignedInfo | null>(null);
  const [receiveSign, setReceiveSign] = useState<SignedInfo | null>(null);

  const pallet = BTP_PALLETS.find((p) => p.id === selectedPallet);
  const totalKg = crateCount * crateWeight;

  const steps = ['Chọn BTP', 'Nhập số két/KL', 'Ký giao/nhận'];

  const handleSignDelivery = useCallback((info: SignedInfo) => {
    setDeliverySign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký giao BTP', `${info.signerName} · ${selectedPallet}`);
  }, [addActivityLog, state.currentUser, state.role?.name, selectedPallet]);

  const handleSignReceive = useCallback((info: SignedInfo) => {
    setReceiveSign(info);
    addActivityLog(state.currentUser, state.role?.name || '', 'Ký nhận BTP', `${info.signerName} · ${selectedPallet}`);
  }, [addActivityLog, state.currentUser, state.role?.name, selectedPallet]);

  const handleComplete = () => {
    dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: selectedPallet, updates: { status: 'BTP khả dụng', location: toOp === '0040' ? 'KL-04-A1-T1' : '' } } });
    addActivityLog(state.currentUser, state.role?.name || '', 'Bàn giao BTP', `${selectedPallet} · ${fromOpName} → ${toOpName} · ${totalKg.toLocaleString()} KG`);
    addToast('success', `Đã bàn giao BTP ${selectedPallet} — ${totalKg.toLocaleString()} KG`);
    navigate('/production');
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-nk text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Phiếu giao nhận BTP</h1>
          <p className="text-xs text-white/70">PGN-BTP-01 · {state.plant?.name}</p>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-gray-100 bg-ant-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold ${i < step ? 'bg-ant-nk text-white' : i === step ? 'bg-ant-nk text-white ring-2 ring-ant-nk/30' : 'bg-gray-100 text-ant-text-secondary'}`}>
                {i < step ? <i className="ri-check-line text-xs" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-5 h-px ${i < step ? 'bg-ant-nk' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-ant-text-secondary text-center mt-2">{steps[step]}</p>
      </div>

      <PermissionBanner module="Sản xuất — Bàn giao BTP" moduleIcon="ri-swap-line" moduleColor="nk" requiredPermissions={['PRODUCTION_SIGN', 'PRODUCTION_VIEW']} className="mx-4 mt-3" />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 0: Select BTP */}
        {step === 0 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Chọn Pallet BTP cần bàn giao</p>
              <div className="space-y-2">
                {BTP_PALLETS.map((p) => (
                  <button key={p.id} onClick={() => { setSelectedPallet(p.id); setCrateCount(p.qtyCrate); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPallet === p.id ? 'border-ant-nk/30 bg-ant-nk/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex justify-between">
                      <p className="text-sm font-mono font-bold text-ant-text">{p.id}</p>
                      <span className="text-xs font-bold text-ant-nk">{p.qtyKg.toLocaleString()} KG</span>
                    </div>
                    <p className="text-xs text-ant-text-secondary">{p.product} · {p.qtyCrate} két x {p.crateKg}KG</p>
                    <p className="text-xxs text-ant-text-secondary mt-0.5">PO {p.po} · {p.location || 'Chưa xếp kệ'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-3">Thông tin bàn giao</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Công đoạn giao</label>
                  <select value={fromOp} onChange={(e) => setFromOp(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20">
                    <option value="0010">0010 — Tiếp nhận NL</option>
                    <option value="0020">0020 — Gọt vỏ & Lạng má</option>
                    <option value="0030">0030 — Định hình</option>
                    <option value="0040">0040 — Cấp đông IQF</option>
                    <option value="0050">0050 — Đóng gói TP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Công đoạn nhận</label>
                  <select value={toOp} onChange={(e) => setToOp(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20">
                    <option value="0010">0010 — Tiếp nhận NL</option>
                    <option value="0020">0020 — Gọt vỏ & Lạng má</option>
                    <option value="0030">0030 — Định hình</option>
                    <option value="0040">0040 — Cấp đông IQF</option>
                    <option value="0050">0050 — Đóng gói TP</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold active:scale-[0.98] whitespace-nowrap">Tiếp tục</button>
          </>
        )}

        {/* Step 1: Crate/KG input */}
        {step === 1 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Nhập số két & trọng lượng</p>
              {pallet && (
                <div className="bg-ant-nk/5 rounded-lg p-3 mb-4">
                  <InfoRow label="Pallet" value={pallet.id} mono />
                  <InfoRow label="Sản phẩm" value={pallet.product} />
                  <InfoRow label="PO gốc" value={pallet.po} mono />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Số két</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCrateCount(Math.max(0, crateCount - 10))}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold">−</button>
                    <div className="flex-1 bg-ant-bg rounded-xl py-2.5 text-center">
                      <p className="text-xl font-bold text-ant-nk">{crateCount.toLocaleString()}</p>
                      <p className="text-xxs text-ant-text-secondary">két</p>
                    </div>
                    <button onClick={() => setCrateCount(crateCount + 10)}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold">+</button>
                  </div>
                </div>

                <div>
                  <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Trọng lượng 1 két (KG)</label>
                  <input type="number" value={crateWeight} onChange={(e) => setCrateWeight(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
                </div>

                <div className="bg-ant-nk/5 rounded-xl p-4 flex justify-between">
                  <span className="text-xs text-ant-text-secondary">Tổng khối lượng</span>
                  <span className="text-lg font-bold text-ant-nk">{totalKg.toLocaleString()} KG</span>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xxs font-bold text-ant-text-secondary block mb-1">Ghi chú (nếu có)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú bàn giao..." maxLength={500}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-ant-text bg-ant-bg resize-none h-16 focus:outline-none focus:border-ant-nk/50" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary active:scale-[0.98] whitespace-nowrap">Quay lại</button>
              <button onClick={() => setStep(2)} disabled={crateCount <= 0}
                className="flex-1 py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">Tiếp tục — Ký</button>
            </div>
          </>
        )}

        {/* Step 2: Sign */}
        {step === 2 && (
          <>
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-ant-text mb-4">Ký giao nhận BTP</p>
              <div className="bg-ant-bg rounded-lg p-3 mb-4 space-y-1">
                <InfoRow label="Pallet" value={selectedPallet} mono />
                <InfoRow label="Công đoạn giao" value={`${fromOp} — ${fromOpName}`} />
                <InfoRow label="Công đoạn nhận" value={`${toOp} — ${toOpName}`} />
                <InfoRow label="Số két" value={`${crateCount.toLocaleString()} két`} />
                <InfoRow label="Tổng KL" value={`${totalKg.toLocaleString()} KG`} bold />
              </div>

              <MultiRoleSignature label="Bên giao (Sản xuất)" roleLabel="Công nhân SX — Bên giao" requiredPermission="PRODUCTION_SIGN"
                signedInfo={deliverySign} onSign={handleSignDelivery} className="mb-3" otherSignerUsername={receiveSign?.signerUsername} />
              <MultiRoleSignature label="Bên nhận (Sản xuất)" roleLabel="Công nhân SX — Bên nhận" requiredPermission="PRODUCTION_SIGN"
                signedInfo={receiveSign} onSign={handleSignReceive} otherSignerUsername={deliverySign?.signerUsername} />
            </div>

            <button onClick={handleComplete} disabled={!deliverySign || !receiveSign}
              className="w-full py-3.5 rounded-xl bg-ant-nk text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] whitespace-nowrap">
              <i className="ri-check-line mr-1" />Hoàn tất bàn giao BTP
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
      <span className={`text-sm text-ant-text ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono font-bold' : ''}`}>{value}</span>
    </div>
  );
}