import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Chờ nhập kho TP', label: 'Chờ nhập kho TP', color: 'bg-ant-nk/10 text-ant-nk' },
  { value: 'Chờ putaway', label: 'Chờ putaway', color: 'bg-ant-warning/10 text-ant-warning' },
  { value: 'Đã xếp kệ', label: 'Đã xếp kệ', color: 'bg-ant-sx/10 text-ant-sx' },
  { value: 'Chờ đồng bộ putaway', label: 'Chờ đồng bộ putaway', color: 'bg-ant-offline/10 text-ant-offline' },
  { value: 'Đang điều chuyển', label: 'Đang điều chuyển', color: 'bg-ant-qm/10 text-ant-qm' },
  { value: 'Blocked Stock', label: 'Blocked Stock', color: 'bg-ant-error/10 text-ant-error' },
];

export default function PendingListPage() {
  const { state } = useApp();
  const [statusFilter, setStatusFilter] = useState('');
  const [plantFilter, setPlantFilter] = useState(state.plant?.code || '');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHUs = useMemo(() => {
    return state.handlingUnits.filter((hu) => {
      if (statusFilter && hu.status !== statusFilter) return false;
      if (plantFilter && hu.plant !== plantFilter) return false;
      if (warehouseFilter && hu.location && !hu.location.startsWith(warehouseFilter)) return false;
      if (searchQuery && !hu.id.toLowerCase().includes(searchQuery.toLowerCase()) && !hu.product.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [state.handlingUnits, statusFilter, plantFilter, warehouseFilter, searchQuery]);

  const warehouses = useMemo(() => {
    return state.warehouses.filter((w) => !plantFilter || w.plant === plantFilter);
  }, [state.warehouses, plantFilter]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Chờ nhập kho': case 'Chờ nhập kho TP': return 'bg-ant-nk/10 text-ant-nk border-ant-nk/20';
      case 'Chờ putaway': return 'bg-ant-warning/10 text-ant-warning border-ant-warning/20';
      case 'Đã xếp kệ': return 'bg-ant-sx/10 text-ant-sx border-ant-sx/20';
      case 'Chờ đồng bộ': case 'Chờ đồng bộ putaway': return 'bg-ant-offline/10 text-ant-offline border-ant-offline/20';
      case 'Chờ chế biến': return 'bg-ant-qm/10 text-ant-qm border-ant-qm/20';
      case 'Đang điều chuyển': return 'bg-ant-qm/10 text-ant-qm border-ant-qm/20';
      case 'Blocked Stock': return 'bg-ant-error/10 text-ant-error border-ant-error/20';
      case 'Đã picking': return 'bg-ant-xk/10 text-ant-xk border-ant-xk/20';
      case 'Đã xuất kho': return 'bg-ant-sx/10 text-ant-sx border-ant-sx/20';
      default: return 'bg-gray-100 text-ant-text-secondary border-gray-200';
    }
  };

  const typeBadge = (type: string) => {
    return type === 'FG'
      ? 'bg-ant-nk/10 text-ant-nk text-xxs px-1.5 py-0.5 rounded-full'
      : 'bg-ant-qm/10 text-ant-qm text-xxs px-1.5 py-0.5 rounded-full';
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-ant-card border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/inbound" className="no-cs-mega w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <i className="ri-arrow-left-line text-lg text-ant-text-secondary" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Danh sách pallet chờ xử lý</h1>
          <p className="text-xs text-ant-text-secondary truncate">{filteredHUs.length} pallet</p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-ant-card border-b border-gray-100 px-4 py-3 space-y-2">
        {/* Search */}
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ant-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã HU hoặc sản phẩm..."
            className="w-full h-10 rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-nk/20 focus:border-ant-nk"
          />
        </div>

        {/* Filter row */}
        <div className="flex gap-2">
          {/* Plant filter */}
          <select
            value={plantFilter}
            onChange={(e) => { setPlantFilter(e.target.value); setWarehouseFilter(''); }}
            className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-nk/20"
          >
            <option value="">Tất cả nhà máy</option>
            <option value="MA">Mỹ An (MA)</option>
            <option value="BK">Bình Khánh (BK)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-nk/20"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Warehouse filter */}
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ant-nk/20"
        >
          <option value="">Tất cả kho</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>{wh.name} ({wh.id}) · {wh.temp}</option>
          ))}
        </select>

        {/* Active filter chips */}
        {(statusFilter || plantFilter || warehouseFilter || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xxs text-ant-text-secondary">Bộ lọc:</span>
            {statusFilter && (
              <span className="text-xxs px-2 py-0.5 rounded-full bg-ant-nk/10 text-ant-nk font-medium">
                {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                <button onClick={() => setStatusFilter('')} className="ml-1"><i className="ri-close-line" /></button>
              </span>
            )}
            {plantFilter && (
              <span className="text-xxs px-2 py-0.5 rounded-full bg-ant-qm/10 text-ant-qm font-medium">
                {plantFilter === 'MA' ? 'Mỹ An' : 'Bình Khánh'}
                <button onClick={() => { setPlantFilter(''); setWarehouseFilter(''); }} className="ml-1"><i className="ri-close-line" /></button>
              </span>
            )}
            {warehouseFilter && (
              <span className="text-xxs px-2 py-0.5 rounded-full bg-ant-xk/10 text-ant-xk font-medium">
                {warehouseFilter}
                <button onClick={() => setWarehouseFilter('')} className="ml-1"><i className="ri-close-line" /></button>
              </span>
            )}
            <button
              onClick={() => { setStatusFilter(''); setPlantFilter(''); setWarehouseFilter(''); setSearchQuery(''); }}
              className="text-xxs text-ant-error font-medium hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto p-4">
        {filteredHUs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-inbox-line text-2xl text-ant-text-secondary" />
            </div>
            <p className="text-sm font-medium text-ant-text-secondary">Không có pallet nào</p>
            <p className="text-xs text-ant-text-secondary mt-1">Thử thay đổi bộ lọc</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ant-text-secondary font-medium">
                {filteredHUs.length} pallet
                {statusFilter && ` — ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}`}
              </span>
            </div>

            {filteredHUs.map((hu) => (
              <div
                key={hu.id}
                className="bg-ant-card rounded-xl border border-gray-100 p-4 active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-mono font-bold text-ant-text truncate">{hu.id}</p>
                      <span className={`text-xxs px-1.5 py-0.5 rounded-full border ${typeBadge(hu.type)}`}>
                        {hu.type}
                      </span>
                    </div>
                    <p className="text-xs text-ant-text-secondary">{hu.product}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs font-bold text-ant-text">{hu.qty.toLocaleString()}</p>
                      <p className="text-xxs text-ant-text-secondary">{hu.unit}</p>
                    </div>
                    {hu.location ? (
                      <div className="flex items-center gap-1 text-xs">
                        <i className="ri-map-pin-line text-ant-text-secondary text-xs" />
                        <span className="font-mono font-medium text-ant-text">{hu.location}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-ant-text-secondary italic">—</span>
                    )}
                    <span className="text-xxs text-ant-text-secondary">{hu.plant}</span>
                  </div>
                  <span className={`text-xxs px-2 py-0.5 rounded-full border font-medium ${statusBadge(hu.status)}`}>
                    {hu.status}
                  </span>
                </div>

                {/* Action hint based on status */}
                {hu.status === 'Chờ nhập kho' && (
                  <Link
                    to="/inbound/fg-receiving"
                    className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-ant-nk/5 text-ant-nk text-xs font-bold active:scale-[0.98] transition-all"
                  >
                    <i className="ri-archive-drawer-line" /> Nhập kho ngay
                  </Link>
                )}
                {hu.status === 'Chờ nhập kho TP' && (
                  <Link
                    to="/inbound/fg-receiving"
                    className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-ant-nk/5 text-ant-nk text-xs font-bold active:scale-[0.98] transition-all"
                  >
                    <i className="ri-archive-drawer-line" /> Nhập kho ngay
                  </Link>
                )}
                {hu.status === 'Chờ putaway' && (
                  <Link
                    to="/inbound/putaway"
                    className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-ant-warning/5 text-ant-warning text-xs font-bold active:scale-[0.98] transition-all"
                  >
                    <i className="ri-layout-grid-line" /> Putaway ngay
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}