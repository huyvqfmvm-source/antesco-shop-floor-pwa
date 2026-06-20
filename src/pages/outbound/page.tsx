import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';
import EmptyState from '@/components/base/EmptyState';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ picking', label: 'Chờ picking' },
  { key: 'Đang picking', label: 'Đang picking' },
  { key: 'Đã loading', label: 'Đã loading' },
  { key: 'Đã xuất bến', label: 'Đã xuất bến' },
  { key: 'Có lỗi', label: 'Có lỗi' },
];

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'nk' | 'qm' | 'error'> = {
  'Chờ picking': 'warning',
  'Đang picking': 'success',
  'Đã loading': 'nk',
  'Đã xuất bến': 'qm',
  'Có lỗi': 'error',
};

export default function OutboundPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = state.outboundDeliveries.filter((od) => {
    if (statusFilter !== 'all' && od.status !== statusFilter) return false;
    if (searchTerm && !od.id.toLowerCase().includes(searchTerm.toLowerCase()) && !od.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Banner */}
      <div className="bg-ant-xk rounded-2xl mx-4 mt-4 p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i className="ri-truck-line text-sm" />
          </div>
          <span className="text-xs font-bold opacity-80 uppercase tracking-wider">XUẤT KHO</span>
        </div>
        <h2 className="text-xl font-bold">Phiếu xuất kho</h2>
        <p className="text-xs text-white/60 mt-1.5">{state.outboundDeliveries.length} phiếu · {state.plant?.name || ''}</p>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-ant-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã OD hoặc khách hàng..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-ant-card text-sm text-ant-text placeholder:text-ant-text-secondary focus:outline-none focus:border-ant-xk/40 transition-colors"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="px-4 pt-3 overflow-x-auto custom-scrollbar">
        <div className="flex gap-1.5 pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f.key
                  ? 'bg-ant-xk text-white shadow-sm shadow-ant-xk/20'
                  : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-truck-line"
            title="Không có phiếu xuất nào"
            description="Thử đổi bộ lọc hoặc tìm kiếm khác"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((od) => {
              const variant = STATUS_VARIANT[od.status] || 'qm';
              return (
                <div
                  key={od.id}
                  className="bg-ant-card rounded-xl border border-gray-100 p-4 active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => {
                    if (od.status === 'Chờ picking' || od.status === 'Đang picking') navigate(`/outbound/fefo-picking/${od.id}`);
                    else if (od.status === 'Đã loading') navigate(`/outbound/container-loading/${od.id}`);
                    else navigate(`/outbound/fefo-picking/${od.id}`);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-mono font-bold text-ant-text">{od.id}</span>
                        <StatusBadge variant={variant} label={od.status} size="sm" />
                      </div>
                      <p className="text-xs text-ant-text-secondary">{od.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xxs text-ant-text-secondary">Ngày xuất</p>
                      <p className="text-sm font-bold text-ant-xk">{od.shipDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {od.items.map((item, i) => (
                      <span key={i} className="text-xxs bg-gray-50 px-2 py-0.5 rounded-full text-ant-text-secondary font-medium">
                        {item.product} · {item.qty} {item.unit}
                      </span>
                    ))}
                  </div>

                  {od.container && (
                    <div className="flex items-center gap-3 pt-2.5 border-t border-gray-50">
                      <span className="text-xxs text-ant-text-secondary"><i className="ri-ship-line mr-1" />{od.container}</span>
                      <span className="text-xxs text-ant-text-secondary"><i className="ri-shield-check-line mr-1" />{od.seal}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-50">
                    {od.status === 'Chờ picking' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/outbound/fefo-picking/${od.id}`); }}
                        className="flex-1 h-10 rounded-xl bg-ant-xk text-white text-xs font-bold hover:bg-ant-xk-dark active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-arrow-up-down-line mr-1" />Bắt đầu Picking
                      </button>
                    )}
                    {od.status === 'Đang picking' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/outbound/fefo-picking/${od.id}`); }}
                        className="flex-1 h-10 rounded-xl bg-ant-xk text-white text-xs font-bold hover:bg-ant-xk-dark active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-play-line mr-1" />Tiếp tục Picking
                      </button>
                    )}
                    {od.status === 'Đã loading' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/outbound/container-loading/${od.id}`); }}
                        className="flex-1 h-10 rounded-xl bg-ant-nk text-white text-xs font-bold hover:bg-ant-nk-dark active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-ship-line mr-1" />Xuất bến
                      </button>
                    )}
                    {od.status === 'Đã xuất bến' && (
                      <span className="flex-1 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-xs text-ant-text-secondary font-medium">
                        <i className="ri-check-double-line mr-1 text-ant-sx" />Đã hoàn tất
                      </span>
                    )}
                    {od.status === 'Có lỗi' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/outbound/fefo-picking/${od.id}`); }}
                        className="flex-1 h-10 rounded-xl bg-ant-error/10 text-ant-error text-xs font-bold hover:bg-ant-error/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-error-warning-line mr-1" />Xem lỗi
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/outbound/btp-issue`); }}
                      className="h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-ant-text-secondary hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-stack-line mr-1" />Xuất BTP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
