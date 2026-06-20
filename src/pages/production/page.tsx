import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, hasPermission } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';
import PermissionBanner from '@/components/base/PermissionBanner';

const PO_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; variant: 'success' | 'sync' | 'warning' | 'error' | 'offline' | 'default' }> = {
  CRTD: { label: 'Đã tạo', color: 'text-ant-qm', bg: 'bg-ant-qm/10', variant: 'default' },
  REL: { label: 'Đã phát hành', color: 'text-ant-nk', bg: 'bg-ant-nk/10', variant: 'sync' },
  STRT: { label: 'Đang SX', color: 'text-ant-sx', bg: 'bg-ant-sx/10', variant: 'success' },
  CNF: { label: 'Đã xác nhận', color: 'text-ant-warning', bg: 'bg-ant-warning/10', variant: 'warning' },
  TECO: { label: 'Hoàn tất', color: 'text-ant-success', bg: 'bg-ant-success/10', variant: 'success' },
};

const PLANT_OPTIONS = [
  { value: '', label: 'Tất cả nhà máy' },
  { value: 'MA', label: 'Mỹ An' },
  { value: 'BK', label: 'Bình Khánh' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'CRTD', label: 'Đã tạo' },
  { value: 'REL', label: 'Đã phát hành' },
  { value: 'STRT', label: 'Đang SX' },
  { value: 'CNF', label: 'Đã xác nhận' },
  { value: 'TECO', label: 'Hoàn tất' },
];

export default function ProductionPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const [plantFilter, setPlantFilter] = useState(state.plant?.code || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPOs = useMemo(() => {
    return state.productionOrders.filter((po) => {
      if (plantFilter && po.plant !== plantFilter) return false;
      if (statusFilter && po.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          po.id.toLowerCase().includes(q) ||
          po.productCode.toLowerCase().includes(q) ||
          po.productName.toLowerCase().includes(q) ||
          po.batchFg.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.productionOrders, plantFilter, statusFilter, searchQuery]);

  const canCreateOrder = hasPermission(state.role?.id, 'PRODUCTION_CREATE_ORDER');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.productionOrders.forEach((po) => {
      counts[po.status] = (counts[po.status] || 0) + 1;
    });
    return counts;
  }, [state.productionOrders]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <Link to="/home" className="no-cs-mega w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Sản xuất</h1>
          <p className="text-xxs text-ant-text-secondary truncate">
            {state.plant?.name} · {filteredPOs.length} lệnh · {state.productionOrders.filter(p => p.status === 'STRT').length} đang chạy
          </p>
        </div>
        {/* Flow indicator */}
        <div className="hidden sm:flex items-center gap-0.5 text-xxs text-ant-text-secondary">
          <span className={state.productionOrders.filter(p => p.status === 'CRTD').length > 0 ? 'text-ant-qm font-bold' : ''}>CRTD</span>
          <i className="ri-arrow-right-s-line text-[10px]" />
          <span className={state.productionOrders.filter(p => p.status === 'REL').length > 0 ? 'text-ant-nk font-bold' : ''}>REL</span>
          <i className="ri-arrow-right-s-line text-[10px]" />
          <span className={state.productionOrders.filter(p => p.status === 'STRT').length > 0 ? 'text-ant-sx font-bold' : ''}>STRT</span>
          <i className="ri-arrow-right-s-line text-[10px]" />
          <span>CNF/TECO</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <PermissionBanner
          module="Sản xuất"
          moduleIcon="ri-tools-line"
          moduleColor="sx"
          requiredPermissions={['PRODUCTION_CREATE_ORDER', 'PRODUCTION_WIP', 'PRODUCTION_PALLET', 'PRODUCTION_CONFIRM_FG', 'PRODUCTION_MATERIAL', 'PRODUCTION_VIEW']}
          className="mx-4 mt-3"
        />
        <div className="p-4 space-y-4">
          {/* Status Summary Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setStatusFilter('')}
              className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 transition-all ${
                statusFilter === '' ? 'bg-ant-sx text-white shadow-sm shadow-ant-sx/20' : 'bg-white border border-gray-100 text-ant-text-secondary hover:bg-gray-50'
              }`}
            >
              <span>Tất cả</span>
              <span className={`min-w-5 h-5 px-1 rounded-full inline-flex items-center justify-center text-xxs ${statusFilter === '' ? 'bg-white/20 text-white' : 'bg-gray-100 text-ant-text-secondary'}`}>{state.productionOrders.length}</span>
            </button>
            {STATUS_FILTERS.filter((f) => f.value).map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(statusFilter === f.value ? '' : f.value)}
                className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 border transition-all ${
                  statusFilter === f.value
                    ? `${PO_STATUS_CONFIG[f.value]?.bg || 'bg-gray-100'} ${PO_STATUS_CONFIG[f.value]?.color || 'text-ant-text'} border-gray-200`
                    : 'bg-white border-gray-100 text-ant-text-secondary hover:bg-gray-50'
                }`}
              >
                <span>{f.label}</span>
                <span className="min-w-5 h-5 px-1 rounded-full bg-gray-100/80 text-ant-text-secondary inline-flex items-center justify-center text-xxs">{statusCounts[f.value] || 0}</span>
              </button>
            ))}
          </div>

          {/* Search + Plant Filter */}
          <div className="grid grid-cols-[minmax(0,1fr)_128px] gap-2">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ant-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm PO, sản phẩm, batch..."
                className="w-full h-12 rounded-2xl border border-gray-200 pl-9 pr-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20 focus:border-ant-sx"
              />
            </div>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="h-12 min-w-0 rounded-2xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20"
            >
              {PLANT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(statusFilter || plantFilter || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xxs text-ant-text-secondary">Bộ lọc:</span>
              {statusFilter && (
                <span className={`h-8 px-2.5 rounded-xl inline-flex items-center gap-1 text-xxs font-bold whitespace-nowrap ${PO_STATUS_CONFIG[statusFilter]?.bg} ${PO_STATUS_CONFIG[statusFilter]?.color}`}>
                  {PO_STATUS_CONFIG[statusFilter]?.label}
                  <button onClick={() => setStatusFilter('')} className="ml-1"><i className="ri-close-line" /></button>
                </span>
              )}
              {plantFilter && (
                <span className="h-8 px-2.5 rounded-xl inline-flex items-center gap-1 text-xxs font-bold whitespace-nowrap bg-ant-qm/10 text-ant-qm">
                  {plantFilter === 'MA' ? 'Mỹ An' : 'Bình Khánh'}
                  <button onClick={() => setPlantFilter('')} className="ml-1"><i className="ri-close-line" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="h-8 px-2.5 rounded-xl inline-flex items-center gap-1 text-xxs font-bold whitespace-nowrap bg-ant-nk/10 text-ant-nk">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')} className="ml-1"><i className="ri-close-line" /></button>
                </span>
              )}
              <button
                onClick={() => { setStatusFilter(''); setPlantFilter(''); setSearchQuery(''); }}
                className="text-xxs text-ant-error font-medium hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => navigate('/production/plan')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-nk/10 text-ant-nk text-xs font-bold hover:bg-ant-nk/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-calendar-line text-sm" />
              </div>
              KH Sản xuất
            </button>
            <button
              onClick={() => navigate('/production/bom-viewer')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-qm/10 text-ant-qm text-xs font-bold hover:bg-ant-qm/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-list-3-line text-sm" />
              </div>
              BOM/Định mức
            </button>
            {canCreateOrder && (
              <button
                onClick={() => navigate('/production/detail/10000456')}
                className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-sx/10 text-ant-sx text-xs font-bold hover:bg-ant-sx/20 transition-all shrink-0 active:scale-[0.98]"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-add-line text-sm" />
                </div>
                Phát lệnh SX
              </button>
            )}
            <button
              onClick={() => navigate('/production/material-issue')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-warning/10 text-ant-warning text-xs font-bold hover:bg-ant-warning/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-add-line text-sm" />
              </div>
              Cấp NVL
            </button>
            <button
              onClick={() => navigate('/production/btp-handover')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-nk/10 text-ant-nk text-xs font-bold hover:bg-ant-nk/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-swap-line text-sm" />
              </div>
              Bàn giao BTP
            </button>
            <button
              onClick={() => navigate('/production/fg-carton-report')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-xk/10 text-ant-xk text-xs font-bold hover:bg-ant-xk/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-archive-line text-sm" />
              </div>
              Đóng thùng TP
            </button>
            <button
              onClick={() => navigate('/production/fg-warehouse-req')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-sx/10 text-ant-sx text-xs font-bold hover:bg-ant-sx/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-pdf-line text-sm" />
              </div>
              NK TP BM-NM-09
            </button>
            <button
              onClick={() => navigate('/production/utility')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-offline/10 text-ant-offline text-xs font-bold hover:bg-ant-offline/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-plug-line text-sm" />
              </div>
              Utility Log
            </button>
            <button
              onClick={() => navigate('/production/device-check')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-xk/10 text-ant-xk text-xs font-bold hover:bg-ant-xk/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-tools-line text-sm" />
              </div>
              Kiểm tra TB
            </button>
            <button
              onClick={() => navigate('/production/temperature-alerts')}
              className="h-11 flex items-center gap-2 px-4 rounded-2xl bg-ant-warning/10 text-ant-warning text-xs font-bold hover:bg-ant-warning/20 transition-all shrink-0 active:scale-[0.98]"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-temp-cold-line text-sm" />
              </div>
              Nhiệt độ kho
            </button>
          </div>

          {/* PO List */}
          {filteredPOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <i className="ri-file-list-3-line text-2xl text-ant-text-secondary" />
              </div>
              <p className="text-sm font-medium text-ant-text-secondary">Không có lệnh sản xuất nào</p>
              <p className="text-xs text-ant-text-secondary mt-1">Thử thay đổi bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPOs.map((po) => {
                const sc = PO_STATUS_CONFIG[po.status] || PO_STATUS_CONFIG.CRTD;
                const progressPct = po.status === 'CRTD' ? 0 : po.status === 'REL' ? 20 : po.status === 'STRT' ? 50 : po.status === 'CNF' ? 80 : 100;

                return (
                  <Link
                    key={po.id}
                    to={`/production/detail/${po.id}`}
                    className="no-cs-mega block bg-ant-card rounded-xl border border-gray-100 p-4 active:scale-[0.99] transition-all hover:border-ant-sx/20"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-ant-text">{po.id}</span>
                          <span className="text-xxs text-ant-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">
                            {po.productCode}
                          </span>
                        </div>
                        <p className="text-xs text-ant-text-secondary mt-0.5 truncate">{po.productName}</p>
                      </div>
                      <StatusBadge variant={sc.variant} label={sc.label} />
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-100 mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          po.status === 'CRTD' ? 'bg-gray-300' :
                          po.status === 'REL' ? 'bg-ant-nk' :
                          po.status === 'STRT' ? 'bg-ant-sx' :
                          po.status === 'CNF' ? 'bg-ant-warning' :
                          'bg-ant-success'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between text-xxs">
                      <div className="flex items-center gap-3 text-ant-text-secondary">
                        <span>
                          <i className="ri-calendar-line mr-0.5" />
                          {po.startDate} → {po.dueDate}
                        </span>
                        <span className="font-medium text-ant-text">{po.plannedQty.toLocaleString()} {po.unit}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {po.wipQty ? (
                          <span className="text-ant-sx font-medium">
                            <i className="ri-tools-line mr-0.5" />WIP {po.wipQty?.toLocaleString()} KG
                          </span>
                        ) : null}
                        {po.fgQty ? (
                          <span className="text-ant-warning font-medium">
                            <i className="ri-checkbox-circle-line mr-0.5" />FG {po.fgQty?.toLocaleString()} KG
                          </span>
                        ) : null}
                        <span className="text-ant-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
                          {po.plant === 'MA' ? 'Mỹ An' : 'Bình Khánh'}
                        </span>
                      </div>
                    </div>

                    {/* Action hint */}
                    {po.status === 'CRTD' && (
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-xxs text-ant-sx font-medium">
                        <i className="ri-send-plane-line text-xs" />
                        Sẵn sàng phát lệnh — cần Quản đốc/Tổ trưởng
                      </div>
                    )}
                    {po.status === 'REL' && (
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-xxs text-ant-nk font-medium">
                        <i className="ri-archive-line text-xs" />
                        Cần cấp phát vật tư
                      </div>
                    )}
                    {po.status === 'STRT' && (
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-xxs text-ant-sx font-medium">
                        <i className="ri-tools-line text-xs" />
                        Đang chạy — {po.currentOperation || 'Op 0020'} · {po.wipQty?.toLocaleString() || 0} KG
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}
