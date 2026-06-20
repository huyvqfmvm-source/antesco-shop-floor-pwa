import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_ALL_MATERIAL_NORMS, getBomByProductCode } from '@/mocks/material-norms';

const SHIFTS = ['Ca 1', 'Ca 2', 'Ca lỡ'];
const PRODUCTS = [
  { code: 'TP0061', name: 'Xoài đông IQF cắt xí ngầu 1.5cm', bom: 'BOM-TP0061-2026' },
  { code: 'TP0042', name: 'Thanh long đông IQF cắt lát 2cm', bom: 'BOM-TP0042-2026' },
  { code: 'TP0078', name: 'Mít đông IQF nguyên múi', bom: 'BOM-TP0078-2026' },
  { code: 'TP0092', name: 'Xoài đông IQF cắt lát 3mm', bom: 'BOM-TP0092-2026' },
];

interface PlanItem {
  id: string;
  date: string;
  week: number;
  shift: string;
  productCode: string;
  productName: string;
  plant: string;
  plannedQty: number;
  line: string;
  linkedPO: string;
  status: 'Kế hoạch' | 'Đã tạo PO' | 'Đang SX' | 'Hoàn thành';
}

const MOCK_PLANS: PlanItem[] = [
  { id: 'PL-2026-0001', date: '2026-06-15', week: 25, shift: 'Ca 1', productCode: 'TP0061', productName: 'Xoài đông IQF cắt xí ngầu 1.5cm', plant: 'MA', plannedQty: 5000, line: 'Line 1', linkedPO: '10000456', status: 'Hoàn thành' },
  { id: 'PL-2026-0002', date: '2026-06-16', week: 25, shift: 'Ca 1', productCode: 'TP0042', productName: 'Thanh long đông IQF cắt lát 2cm', plant: 'MA', plannedQty: 3200, line: 'Line 2', linkedPO: '10000457', status: 'Hoàn thành' },
  { id: 'PL-2026-0003', date: '2026-06-17', week: 25, shift: 'Ca 2', productCode: 'TP0078', productName: 'Mít đông IQF nguyên múi', plant: 'BK', plannedQty: 1800, line: 'Line 3', linkedPO: '10000458', status: 'Đang SX' },
  { id: 'PL-2026-0004', date: '2026-06-17', week: 25, shift: 'Ca 1', productCode: 'TP0092', productName: 'Xoài đông IQF cắt lát 3mm', plant: 'MA', plannedQty: 3500, line: 'Line 2', linkedPO: '10000459', status: 'Đang SX' },
  { id: 'PL-2026-0005', date: '2026-06-18', week: 25, shift: 'Ca 2', productCode: 'TP0042', productName: 'Thanh long đông IQF cắt lát 2cm', plant: 'BK', plannedQty: 4000, line: 'Line 1', linkedPO: '10000460', status: 'Đã tạo PO' },
  { id: 'PL-2026-0006', date: '2026-06-19', week: 26, shift: 'Ca 1', productCode: 'TP0078', productName: 'Mít đông IQF nguyên múi', plant: 'MA', plannedQty: 2400, line: 'Line 3', linkedPO: '10000461', status: 'Đã tạo PO' },
  { id: 'PL-2026-0007', date: '2026-06-20', week: 26, shift: 'Ca 1', productCode: 'TP0061', productName: 'Xoài đông IQF cắt xí ngầu 1.5cm', plant: 'BK', plannedQty: 6000, line: 'Line 1', linkedPO: '10000462', status: 'Đã tạo PO' },
  { id: 'PL-2026-0008', date: '2026-06-22', week: 26, shift: 'Ca 1', productCode: 'TP0061', productName: 'Xoài đông IQF cắt xí ngầu 1.5cm', plant: 'MA', plannedQty: 4500, line: 'Line 1', linkedPO: '', status: 'Kế hoạch' },
];

const STATUS_COLOR: Record<string, string> = {
  'Kế hoạch': 'bg-gray-100 text-ant-text-secondary',
  'Đã tạo PO': 'bg-ant-nk/10 text-ant-nk',
  'Đang SX': 'bg-ant-sx/10 text-ant-sx',
  'Hoàn thành': 'bg-ant-success/10 text-ant-success',
};

export default function ProductionPlanPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  const [shiftFilter, setShiftFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return MOCK_PLANS.filter((p) => {
      if (shiftFilter && p.shift !== shiftFilter) return false;
      if (productFilter && p.productCode !== productFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [shiftFilter, productFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Kế hoạch sản xuất</h1>
          <p className="text-xs text-white/70">KH-SX-01 · {state.plant?.name}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="h-10 rounded-xl border border-gray-200 px-2 text-xs text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
            <option value="">Tất cả ca</option>
            {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="h-10 rounded-xl border border-gray-200 px-2 text-xs text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
            <option value="">Tất cả SP</option>
            {PRODUCTS.map((p) => <option key={p.code} value={p.code}>{p.code}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-xl border border-gray-200 px-2 text-xs text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20">
            <option value="">Tất cả TT</option>
            <option value="Kế hoạch">Kế hoạch</option>
            <option value="Đã tạo PO">Đã tạo PO</option>
            <option value="Đang SX">Đang SX</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>

        {/* Plan list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-calendar-line text-2xl text-ant-text-secondary" />
            </div>
            <p className="text-sm text-ant-text-secondary">Không có kế hoạch nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((plan) => (
              <div key={plan.id} className="bg-ant-card rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ant-text">{plan.productName}</p>
                    <p className="text-xxs text-ant-text-secondary mt-0.5">{plan.productCode} · {plan.line}</p>
                  </div>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[plan.status]}`}>{plan.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ant-text-secondary mb-2">
                  <span><i className="ri-calendar-line mr-0.5" />{plan.date} · Tuần {plan.week}</span>
                  <span><i className="ri-sun-line mr-0.5" />{plan.shift}</span>
                  <span className="font-medium text-ant-text">{plan.plannedQty.toLocaleString()} KG</span>
                </div>
                <div className="flex items-center justify-between text-xxs">
                  <span className="bg-gray-50 px-1.5 py-0.5 rounded">{plan.plant}</span>
                  {plan.linkedPO ? (
                    <button onClick={() => navigate(`/production/detail/${plan.linkedPO}`)} className="text-ant-sx font-bold hover:underline">
                      PO {plan.linkedPO} <i className="ri-arrow-right-line text-xs" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/production/detail/10000456')}
                      className="text-ant-nk font-bold hover:underline">Tạo PO <i className="ri-add-line text-xs" /></button>
                  )}
                </div>
                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                  <button onClick={() => navigate(`/production/bom-viewer`)}
                    className="flex-1 py-2 rounded-lg bg-ant-sx/5 text-ant-sx text-xs font-bold hover:bg-ant-sx/10 transition-all whitespace-nowrap">
                    <i className="ri-file-list-3-line mr-1" />Xem định mức
                  </button>
                  {plan.linkedPO && (
                    <button onClick={() => navigate(`/production/detail/${plan.linkedPO}`)}
                      className="flex-1 py-2 rounded-lg bg-ant-nk/5 text-ant-nk text-xs font-bold hover:bg-ant-nk/10 transition-all whitespace-nowrap">
                      <i className="ri-bar-chart-line mr-1" />Tiến độ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-4" />
      </main>
    </div>
  );
}