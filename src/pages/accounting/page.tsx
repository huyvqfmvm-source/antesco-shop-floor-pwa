import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_INVOICES } from '@/mocks/extended';

const INVOICE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Chưa lập': { label: 'Chưa lập', color: 'text-ant-text-secondary', bg: 'bg-gray-100' },
  'Chờ phát hành': { label: 'Chờ phát hành', color: 'text-ant-warning', bg: 'bg-ant-warning/10' },
  'Đã phát hành': { label: 'Đã phát hành', color: 'text-ant-sx', bg: 'bg-ant-sx/10' },
};

export default function AccountingPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const plantCode = state.plant?.code || 'MA';
  const completedODs = state.outboundDeliveries.filter((od) => od.status === 'Đã xuất bến');
  const loadingODs = state.outboundDeliveries.filter((od) => od.status === 'Đang loading');
  const plantRMs = state.rawMaterialReceipts.filter((r) => r.plant === plantCode);
  const plantInvoices = MOCK_INVOICES;

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Kế toán kho</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{state.plant?.name} · Chứng từ & Hóa đơn</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-ant-nk/5 rounded-xl border border-ant-nk/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-ant-nk/20 flex items-center justify-center">
                <i className="ri-file-list-3-line text-xs text-ant-nk" />
              </div>
              <span className="text-xxs text-ant-text-secondary">Phiếu nhập</span>
            </div>
            <p className="text-2xl font-bold text-ant-nk">{plantRMs.length}</p>
            <p className="text-xxs text-ant-text-secondary mt-1">Nguyên liệu & TP</p>
          </div>
          <div className="bg-ant-xk/5 rounded-xl border border-ant-xk/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-ant-xk/20 flex items-center justify-center">
                <i className="ri-truck-line text-xs text-ant-xk" />
              </div>
              <span className="text-xxs text-ant-text-secondary">Đã xuất bến</span>
            </div>
            <p className="text-2xl font-bold text-ant-xk">{completedODs.length}</p>
            <p className="text-xxs text-ant-text-secondary mt-1">Container</p>
          </div>
          <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-ant-sx/20 flex items-center justify-center">
                <i className="ri-bill-line text-xs text-ant-sx" />
              </div>
              <span className="text-xxs text-ant-text-secondary">Hóa đơn</span>
            </div>
            <p className="text-2xl font-bold text-ant-sx">{plantInvoices.filter((i) => i.status === 'Đã phát hành').length}</p>
            <p className="text-xxs text-ant-text-secondary mt-1">Đã phát hành</p>
          </div>
          <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-ant-warning/20 flex items-center justify-center">
                <i className="ri-time-line text-xs text-ant-warning" />
              </div>
              <span className="text-xxs text-ant-text-secondary">Chờ hóa đơn</span>
            </div>
            <p className="text-2xl font-bold text-ant-warning">{plantInvoices.filter((i) => i.status === 'Chờ phát hành' || i.status === 'Chưa lập').length}</p>
          </div>
        </div>

        {/* Phiếu nhập kho */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-file-list-3-line text-ant-nk text-sm" />
            Phiếu nhập kho — {plantCode}
          </h3>
          {plantRMs.length === 0 ? (
            <p className="text-xs text-ant-text-secondary text-center py-4">Chưa có phiếu nhập kho nào</p>
          ) : (
            <div className="space-y-2">
              {plantRMs.map((rm) => (
                <div key={rm.id} className="bg-ant-bg rounded-xl p-3 border border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-ant-text">{rm.poNumber}</span>
                    <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${rm.qcStatus === 'Đạt' ? 'bg-ant-sx/10 text-ant-sx' : 'bg-ant-error/10 text-ant-error'}`}>
                      {rm.qcStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <span className="text-ant-text-secondary">Nhà cung cấp</span>
                    <span className="text-ant-text font-medium text-right">{rm.supplier}</span>
                    <span className="text-ant-text-secondary">Net Weight</span>
                    <span className="text-ant-text font-bold text-right">{rm.netWeight.toLocaleString()} KG</span>
                    <span className="text-ant-text-secondary">Batch RM</span>
                    <span className="text-ant-text font-mono text-right text-xxs">{rm.batchRm}</span>
                    <span className="text-ant-text-secondary">Ngày nhập</span>
                    <span className="text-ant-text font-medium text-right">{rm.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Container đã xuất bến */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
            <i className="ri-ship-line text-ant-xk text-sm" />
            Container đã xuất bến
          </h3>
          {completedODs.length === 0 ? (
            <p className="text-xs text-ant-text-secondary text-center py-4">Chưa có container nào xuất bến</p>
          ) : (
            <div className="space-y-2">
              {completedODs.map((od) => {
                const invoice = plantInvoices.find((inv) => inv.odId === od.id);
                const invStatus = invoice?.status || 'Chưa lập';
                const isc = INVOICE_STATUS_CONFIG[invStatus] || INVOICE_STATUS_CONFIG['Chưa lập'];
                return (
                  <div key={od.id} className="bg-ant-bg rounded-xl p-3 border border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-ant-text">{od.id}</span>
                      <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${isc.bg} ${isc.color}`}>{isc.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <span className="text-ant-text-secondary">Khách hàng</span>
                      <span className="text-ant-text font-medium text-right">{od.customer}</span>
                      <span className="text-ant-text-secondary">Container</span>
                      <span className="text-ant-text font-mono text-right">{od.container}</span>
                      <span className="text-ant-text-secondary">Seal</span>
                      <span className="text-ant-text font-mono text-right">{od.seal}</span>
                      <span className="text-ant-text-secondary">Ngày xuất</span>
                      <span className="text-ant-text font-medium text-right">{od.shipDate}</span>
                      {invoice && (
                        <>
                          <span className="text-ant-text-secondary">Hóa đơn</span>
                          <span className="text-ant-text font-mono text-right text-xxs">{invoice.id} · {invoice.amount}</span>
                        </>
                      )}
                    </div>
                    {invoice && invStatus === 'Chờ phát hành' && (
                      <button className="mt-2 w-full h-9 rounded-lg bg-ant-sx/10 text-ant-sx text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-ant-sx/20 transition-colors">
                        <i className="ri-bill-line text-sm" />
                        Xuất hóa đơn mock
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Đang loading */}
        {loadingODs.length > 0 && (
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-ant-text mb-3 flex items-center gap-2">
              <i className="ri-loader-4-line text-ant-nk text-sm" />
              Đang loading — Chưa xuất bến
            </h3>
            <div className="space-y-2">
              {loadingODs.map((od) => (
                <div key={od.id} className="bg-ant-bg rounded-xl p-3 border border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ant-text">{od.id}</span>
                    <span className="text-xxs bg-ant-nk/10 text-ant-nk px-2 py-0.5 rounded-full">{od.status}</span>
                  </div>
                  <p className="text-xs text-ant-text-secondary mt-1">{od.customer} · {od.items.map((i) => i.product).join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-ant-qm/5 rounded-xl p-3 border border-ant-qm/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-ant-qm/20 flex items-center justify-center">
              <i className="ri-information-line text-ant-qm text-xs" />
            </div>
            <p className="text-xs font-medium text-ant-qm">Ghi chú</p>
          </div>
          <p className="text-xxs text-ant-text-secondary">
            Kế toán kho chỉ có quyền xem chứng từ và trạng thái hóa đơn. Mọi thao tác nghiệp vụ kho/sản xuất do các bộ phận liên quan thực hiện. Trạng thái hóa đơn hiện là mock data.
          </p>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}