import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';

const PO_STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'sync' }> = {
  'Chưa nhập': { label: 'Chưa nhập', variant: 'default' },
  'Đang nhập': { label: 'Đang nhập', variant: 'sync' },
  'Đã nhập một phần': { label: 'Đã nhập một phần', variant: 'warning' },
  'Đã nhập hết': { label: 'Đã nhập hết', variant: 'success' },
  'Đã quyết toán': { label: 'Đã quyết toán', variant: 'success' },
};

export default function POWaitingListPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const suppliers = useMemo(() => [...new Set(state.purchaseOrders.map((po) => po.supplierName))], [state.purchaseOrders]);

  const filteredPOs = useMemo(() => {
    return state.purchaseOrders.filter((po) => {
      if (statusFilter && po.status !== statusFilter) return false;
      if (supplierFilter && po.supplierName !== supplierFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return po.poNo.toLowerCase().includes(q) || po.materialName.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [state.purchaseOrders, statusFilter, supplierFilter, searchQuery]);

  const pendingCount = state.purchaseOrders.filter((po) => po.status === 'Chưa nhập' || po.status === 'Đã nhập một phần').length;

  const handleExportCSV = useCallback(() => {
    const headers = 'PO No,Nhà cung cấp,Vật tư/nguyên liệu,Mã vật tư,Số lượng đặt,ĐVT,Ngày dự kiến,Nhà máy,Trạng thái\n';
    const rows = filteredPOs.map((po) =>
      `"${po.poNo}","${po.supplierName}","${po.materialName}","${po.materialCode}",${po.plannedQty},"${po.uom}","${po.expectedDate}","${po.plant}","${po.status}"`
    ).join('\n');
    const csvContent = headers + rows;
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PO-cho-nhap-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredPOs]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-nk text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/inbound')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">PO chờ nhập</h1>
          <p className="text-xs text-white/70">{state.plant?.name} · {pendingCount} PO chờ nhập</p>
        </div>
        <button onClick={handleExportCSV} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" title="Export CSV">
          <i className="ri-file-download-line text-lg" />
        </button>
        <span className="bg-white/20 text-white text-xxs font-bold px-2 py-1 rounded-full">{state.purchaseOrders.length} PO</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ant-nk/5 rounded-xl p-3 border border-ant-nk/10">
            <p className="text-xxs text-ant-nk font-bold"><i className="ri-inbox-line mr-1" />Chưa nhập</p>
            <p className="text-lg font-bold text-ant-nk">{state.purchaseOrders.filter((po) => po.status === 'Chưa nhập').length}</p>
          </div>
          <div className="bg-ant-warning/5 rounded-xl p-3 border border-ant-warning/10">
            <p className="text-xxs text-ant-warning font-bold"><i className="ri-loader-4-line mr-1" />Đang nhập</p>
            <p className="text-lg font-bold text-ant-warning">{state.purchaseOrders.filter((po) => po.status === 'Đang nhập' || po.status === 'Đã nhập một phần').length}</p>
          </div>
          <div className="bg-ant-sx/5 rounded-xl p-3 border border-ant-sx/10">
            <p className="text-xxs text-ant-sx font-bold"><i className="ri-check-line mr-1" />Đã nhập</p>
            <p className="text-lg font-bold text-ant-sx">{state.purchaseOrders.filter((po) => po.status === 'Đã nhập hết').length}</p>
          </div>
        </div>

        {/* Search & filters */}
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ant-text-secondary" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm PO, NCC, vật tư..." className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-gray-200 px-2 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20">
            <option value="">Tất cả TT</option>
            <option value="Chưa nhập">Chưa nhập</option>
            <option value="Đang nhập">Đang nhập</option>
            <option value="Đã nhập một phần">Đã nhập 1 phần</option>
            <option value="Đã nhập hết">Đã nhập hết</option>
            <option value="Đã quyết toán">Đã quyết toán</option>
          </select>
        </div>

        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-nk/20">
          <option value="">Tất cả nhà cung cấp</option>
          {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* PO List */}
        {filteredPOs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-file-list-3-line text-2xl text-ant-text-secondary" />
            </div>
            <p className="text-sm text-ant-text-secondary">Không có PO nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPOs.map((po) => {
              const st = PO_STATUS_MAP[po.status] || PO_STATUS_MAP['Chưa nhập'];
              return (
                <div key={po.id} className="bg-ant-card rounded-xl border border-gray-100 p-4 active:scale-[0.99] transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-bold text-ant-text">{po.poNo}</p>
                      <p className="text-xs text-ant-text-secondary mt-0.5">{po.materialName}</p>
                    </div>
                    <StatusBadge variant={st.variant} label={st.label} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ant-text-secondary mb-2">
                    <span><i className="ri-building-line mr-0.5" />{po.supplierName}</span>
                    <span className="font-medium text-ant-text">{po.plannedQty.toLocaleString()} {po.uom}</span>
                    <span className="bg-gray-50 px-1.5 py-0.5 rounded">{po.plant}</span>
                  </div>
                  <div className="flex items-center justify-between text-xxs text-ant-text-secondary">
                    <span><i className="ri-calendar-line mr-0.5" />Dự kiến: {po.expectedDate}</span>
                    {po.relatedDocuments.length > 0 && (
                      <span className="text-ant-nk font-medium">{po.relatedDocuments.length} chứng từ</span>
                    )}
                  </div>
                  {(po.status === 'Chưa nhập' || po.status === 'Đang nhập' || po.status === 'Đã nhập một phần') && (
                    <button
                      onClick={() => navigate('/inbound/receive-rm')}
                      className="w-full mt-3 py-2.5 rounded-lg bg-ant-nk/5 text-ant-nk text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <i className="ri-archive-line" />Tiếp nhận ngay
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}