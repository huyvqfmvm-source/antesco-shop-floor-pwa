import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

const PLANT_OPTIONS = [
  { value: '', label: 'Tất cả nhà máy' },
  { value: 'MA', label: 'Mỹ An' },
  { value: 'BK', label: 'Bình Khánh' },
];

const PRODUCT_OPTIONS = [
  { value: '', label: 'Tất cả sản phẩm' },
  { value: 'TP0061', label: 'Xoài đông IQF' },
  { value: 'TP0042', label: 'Thanh long đông IQF' },
  { value: 'TP0078', label: 'Mít đông IQF' },
];

const SHIFT_OPTIONS = [
  { value: '', label: 'Tất cả ca' },
  { value: 'ca-1', label: 'Ca 1 (06:00-18:00)' },
  { value: 'ca-2', label: 'Ca 2 (18:00-06:00)' },
];

const REPORT_TABS = [
  { key: 'production', label: 'Sản lượng', icon: 'ri-bar-chart-line' },
  { key: 'defect', label: 'Tỷ lệ lỗi', icon: 'ri-bug-line' },
  { key: 'qm-hold', label: 'QM Hold', icon: 'ri-shield-flash-line' },
  { key: 'inventory', label: 'Nhập/Xuất', icon: 'ri-archive-line' },
  { key: 'queue', label: 'Offline/Error', icon: 'ri-cloud-line' },
  { key: 'trace', label: 'Truy xuất lô', icon: 'ri-search-line' },
];

export default function ReportsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [plantFilter, setPlantFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [activeTab, setActiveTab] = useState('production');

  const filteredPOs = state.productionOrders.filter((po) => {
    if (plantFilter && po.plant !== plantFilter) return false;
    if (productFilter && po.productCode !== productFilter) return false;
    if (shiftFilter && po.shift !== shiftFilter) return false;
    return true;
  });
  const filteredBatches = state.batches.filter((b) => !plantFilter || b.plant === plantFilter);
  const filteredHUs = state.handlingUnits.filter((hu) => !plantFilter || hu.plant === plantFilter);
  const filteredRMs = state.rawMaterialReceipts.filter((r) => !plantFilter || r.plant === plantFilter);
  const filteredODs = state.outboundDeliveries.filter((od) => !plantFilter || od.plant === plantFilter);
  const filteredQHs = state.qualityHolds.filter((qh) => !plantFilter || qh.plant === plantFilter);

  const totalFgQty = filteredPOs.reduce((sum, po) => sum + (po.fgQty || 0), 0);
  const totalScrapQty = filteredPOs.reduce((sum, po) => sum + (po.scrapQty || 0), 0);
  const poCountByStatus: Record<string, number> = {};
  filteredPOs.forEach((po) => { poCountByStatus[po.status] = (poCountByStatus[po.status] || 0) + 1; });

  const qhByStatus: Record<string, number> = {};
  filteredQHs.forEach((qh) => { qhByStatus[qh.status] = (qhByStatus[qh.status] || 0) + 1; });

  const queuePending = state.offlineQueue.filter((q) => q.status === 'Pending Sync' || q.status === 'Local Saved').length;
  const errorPending = state.errorQueue.filter((e) => e.status === 'Pending' || e.status === 'Need Review').length;

  const handleExportCSV = () => {
    let csv = '';
    let filename = `antesco-report-${activeTab}`;
    if (activeTab === 'production') {
      csv = 'PO,Sản phẩm,Trạng thái,Kế hoạch (KG),WIP (KG),FG (KG),Phế (KG),Ca,Nhà máy,Ngày bắt đầu,Ngày hoàn thành\n';
      filteredPOs.forEach((po) => {
        csv += `${po.id},"${po.productName}",${po.status},${po.plannedQty},${po.wipQty || 0},${po.fgQty || 0},${po.scrapQty || 0},${po.shift},${po.plant},${po.startDate},${po.dueDate}\n`;
      });
    } else if (activeTab === 'inventory') {
      csv = 'Loại,Mã,Sản phẩm,Số lượng,Đơn vị,Vị trí,Trạng thái,Nhà máy\n';
      filteredHUs.forEach((hu) => {
        csv += `HU,${hu.id},${hu.product},${hu.qty},${hu.unit},${hu.location},${hu.status},${hu.plant}\n`;
      });
    } else if (activeTab === 'defect') {
      csv = 'Tỷ lệ lỗi theo PO\nPO,Sản phẩm,Kế hoạch (KG),Phế phẩm (KG),Tỷ lệ (%)\n';
      filteredPOs.filter((po) => (po.scrapQty || 0) > 0).forEach((po) => {
        const rate = po.plannedQty > 0 ? ((po.scrapQty || 0) / po.plannedQty * 100).toFixed(1) : '0';
        csv += `${po.id},"${po.productName}",${po.plannedQty},${po.scrapQty},${rate}\n`;
      });
      csv += '\nMã lỗi phổ biến\nMã,Tên,Số lần\n';
      csv += 'DF-001,Không đạt màu sắc,13\nDF-002,Dập úng/Xì gôm,11\nDF-005,Rách bao bì,9\nDF-006,Kết tinh tuyết,7\nDF-010,Sai FEFO,5\n';
    } else if (activeTab === 'qm-hold') {
      csv = 'ID QM Hold,Batch,Lý do,Trạng thái,Nhà máy,Ngày tạo\n';
      filteredQHs.forEach((qh) => {
        csv += `${qh.id},${qh.batch},"${qh.reason}",${qh.status},${qh.plant},${qh.createdDate}\n`;
      });
      filename = `antesco-report-qm-hold`;
    } else if (activeTab === 'queue') {
      csv = 'Offline Queue\nID,Movement,Loại,User,Người tạo,Trạng thái\n';
      state.offlineQueue.forEach((q) => {
        csv += `${q.queueId},${q.mockMovement},${q.type},${q.user},${q.createdAt},${q.status}\n`;
      });
      csv += '\nError Queue\nID,Giao dịch,Loại,Người tạo,Lỗi,Trạng thái\n';
      state.errorQueue.forEach((e) => {
        csv += `${e.id},${e.transactionCode},${e.type},${e.user},"${e.errorReasonVi}",${e.status}\n`;
      });
      filename = `antesco-report-queue`;
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Báo cáo</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{state.plant?.name || 'Toàn hệ thống'}</p>
        </div>
        <button onClick={handleExportCSV} className="h-9 px-3 rounded-xl bg-ant-sx text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all whitespace-nowrap cursor-pointer">
          <i className="ri-download-line text-sm" />
          Export CSV
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {PLANT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setPlantFilter(opt.value)}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all ${plantFilter === opt.value ? 'bg-ant-sx text-white' : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {activeTab === 'production' && (
          <div className="flex gap-2 flex-wrap">
            {PRODUCT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setProductFilter(opt.value)}
                className={`h-8 px-3 rounded-lg text-xxs font-bold transition-all ${productFilter === opt.value ? 'bg-ant-nk text-white' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'}`}>
                {opt.label}
              </button>
            ))}
            {SHIFT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setShiftFilter(opt.value)}
                className={`h-8 px-3 rounded-lg text-xxs font-bold transition-all ${shiftFilter === opt.value ? 'bg-ant-xk text-white' : 'bg-gray-50 text-ant-text-secondary hover:bg-gray-100'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {REPORT_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeTab === tab.key ? 'bg-ant-qm text-white shadow-sm' : 'bg-white border border-gray-100 text-ant-text-secondary hover:bg-gray-50'}`}>
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Production Report */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Tổng sản lượng đạt</p>
                <p className="text-2xl font-bold text-ant-sx">{totalFgQty.toLocaleString()} KG</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{filteredPOs.filter((p) => p.status === 'TECO').length} PO hoàn tất</p>
              </div>
              <div className="bg-ant-error/5 rounded-xl border border-ant-error/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Tổng phế phẩm</p>
                <p className="text-2xl font-bold text-ant-error">{totalScrapQty.toLocaleString()} KG</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{totalFgQty > 0 ? ((totalScrapQty / (totalFgQty + totalScrapQty)) * 100).toFixed(1) : 0}% tỷ lệ phế</p>
              </div>
              <div className="bg-ant-nk/5 rounded-xl border border-ant-nk/10 p-4">
                <p className="text-xxs text-ant-text-secondary">WIP hiện tại</p>
                <p className="text-2xl font-bold text-ant-nk">{filteredPOs.reduce((s, p) => s + (p.wipQty || 0), 0).toLocaleString()} KG</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{filteredPOs.filter((p) => p.status === 'STRT').length} PO đang SX</p>
              </div>
              <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Kế hoạch tổng</p>
                <p className="text-2xl font-bold text-ant-warning">{filteredPOs.reduce((s, p) => s + p.plannedQty, 0).toLocaleString()} KG</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{filteredPOs.length} PO</p>
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Theo trạng thái PO</h3>
              <div className="space-y-2">
                {['CRTD', 'REL', 'STRT', 'CNF', 'TECO'].map((status) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-xs text-ant-text-secondary">{status === 'CRTD' ? 'Đã tạo' : status === 'REL' ? 'Đã phát hành' : status === 'STRT' ? 'Đang SX' : status === 'CNF' ? 'Đã xác nhận' : 'Hoàn tất'}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${status === 'CRTD' ? 'bg-gray-400' : status === 'REL' ? 'bg-ant-nk' : status === 'STRT' ? 'bg-ant-sx' : status === 'CNF' ? 'bg-ant-warning' : 'bg-ant-success'}`}
                          style={{ width: `${filteredPOs.length > 0 ? ((poCountByStatus[status] || 0) / filteredPOs.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-ant-text w-6 text-right">{poCountByStatus[status] || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Chi tiết PO</h3>
              <div className="space-y-1.5">
                {filteredPOs.map((po) => (
                  <Link key={po.id} to={`/production/detail/${po.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-ant-bg hover:bg-gray-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-bold text-ant-text">{po.id}</p>
                      <p className="text-xxs text-ant-text-secondary truncate">{po.productName}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xxs text-ant-text-secondary">{po.wipQty || 0}/{po.plannedQty} KG</span>
                      <span className={`text-xs font-bold ${po.status === 'TECO' ? 'text-ant-success' : po.status === 'STRT' ? 'text-ant-sx' : 'text-ant-text-secondary'}`}>
                        {po.status === 'CRTD' ? 'Đã tạo' : po.status === 'REL' ? 'REL' : po.status === 'STRT' ? 'STRT' : po.status === 'CNF' ? 'CNF' : 'TECO'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Defect Report */}
        {activeTab === 'defect' && (
          <div className="space-y-4">
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Tỷ lệ lỗi theo PO</h3>
              <div className="space-y-2">
                {filteredPOs.filter((po) => (po.scrapQty || 0) > 0).map((po) => {
                  const scrapRate = po.plannedQty > 0 ? ((po.scrapQty || 0) / po.plannedQty * 100).toFixed(1) : '0';
                  return (
                    <div key={po.id} className="flex items-center justify-between p-3 rounded-xl bg-ant-bg">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-bold text-ant-text">{po.id}</p>
                        <p className="text-xxs text-ant-text-secondary truncate">{po.productName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-ant-error">{po.scrapQty?.toLocaleString()} KG</p>
                        <p className="text-xxs text-ant-error">{scrapRate}%</p>
                      </div>
                    </div>
                  );
                })}
                {filteredPOs.filter((po) => (po.scrapQty || 0) > 0).length === 0 && (
                  <p className="text-xs text-ant-text-secondary text-center py-4">Không có phế phẩm nào</p>
                )}
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Mã lỗi phổ biến</h3>
              <div className="space-y-2">
                {['DF-001', 'DF-002', 'DF-005', 'DF-006', 'DF-010'].map((code, idx) => (
                  <div key={code} className="flex items-center justify-between p-3 rounded-xl bg-ant-bg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-ant-error">{code}</span>
                      <span className="text-xs text-ant-text-secondary">
                        {code === 'DF-001' ? 'Không đạt màu sắc' : code === 'DF-002' ? 'Dập úng/Xì gôm' : code === 'DF-005' ? 'Rách bao bì' : code === 'DF-006' ? 'Kết tinh tuyết' : 'Sai FEFO'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-ant-text">{15 - idx * 2} lần</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QM Hold Report */}
        {activeTab === 'qm-hold' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              {['Đang giữ', 'Đã khóa', 'Đã mở khóa'].map((status) => (
                <div key={status} className={`rounded-xl border p-3 text-center ${status === 'Đang giữ' ? 'bg-ant-warning/5 border-ant-warning/10' : status === 'Đã khóa' ? 'bg-ant-error/5 border-ant-error/10' : 'bg-ant-sx/5 border-ant-sx/10'}`}>
                  <p className={`text-xl font-bold ${status === 'Đang giữ' ? 'text-ant-warning' : status === 'Đã khóa' ? 'text-ant-error' : 'text-ant-sx'}`}>
                    {qhByStatus[status] || 0}
                  </p>
                  <p className="text-xxs text-ant-text-secondary">{status}</p>
                </div>
              ))}
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Chi tiết QM Hold</h3>
              <div className="space-y-1.5">
                {filteredQHs.map((qh) => (
                  <div key={qh.id} className="flex items-center justify-between p-3 rounded-xl bg-ant-bg">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-bold text-ant-text">{qh.id}</p>
                      <p className="text-xxs text-ant-text-secondary truncate">Batch {qh.batch} · {qh.reason}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${qh.status === 'Đang giữ' ? 'bg-ant-warning/10 text-ant-warning' : qh.status === 'Đã khóa' ? 'bg-ant-error/10 text-ant-error' : 'bg-ant-sx/10 text-ant-sx'}`}>
                      {qh.status}
                    </span>
                  </div>
                ))}
                {filteredQHs.length === 0 && (
                  <p className="text-xs text-ant-text-secondary text-center py-4">Không có QM Hold nào</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Report */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-ant-nk/5 rounded-xl border border-ant-nk/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Pallet đã nhập</p>
                <p className="text-2xl font-bold text-ant-nk">{filteredHUs.filter((hu) => hu.status === 'Đã xếp kệ' || hu.status === 'Đã picking' || hu.status === 'Đã xuất kho').length}</p>
              </div>
              <div className="bg-ant-xk/5 rounded-xl border border-ant-xk/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Phiếu xuất</p>
                <p className="text-2xl font-bold text-ant-xk">{filteredODs.length}</p>
              </div>
              <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Phiếu nhập NL</p>
                <p className="text-2xl font-bold text-ant-sx">{filteredRMs.length}</p>
              </div>
              <div className="bg-ant-qm/5 rounded-xl border border-ant-qm/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Tổng pallet</p>
                <p className="text-2xl font-bold text-ant-qm">{filteredHUs.length}</p>
              </div>
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Pallet theo trạng thái</h3>
              <div className="space-y-1.5">
                {filteredHUs.slice(0, 10).map((hu) => (
                  <div key={hu.id} className="flex items-center justify-between p-2.5 rounded-xl bg-ant-bg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-bold text-ant-text">{hu.id}</p>
                      <p className="text-xxs text-ant-text-secondary">{hu.product} · {hu.qty.toLocaleString()} {hu.unit}</p>
                    </div>
                    <span className="text-xxs text-ant-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">{hu.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Queue Report */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-ant-offline/5 rounded-xl border border-ant-offline/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Offline Queue</p>
                <p className="text-2xl font-bold text-ant-offline">{queuePending}</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{state.offlineQueue.length} tổng</p>
              </div>
              <div className="bg-ant-error/5 rounded-xl border border-ant-error/10 p-4">
                <p className="text-xxs text-ant-text-secondary">Error Queue</p>
                <p className="text-2xl font-bold text-ant-error">{errorPending}</p>
                <p className="text-xxs text-ant-text-secondary mt-1">{state.errorQueue.length} tổng</p>
              </div>
            </div>

            <Link to="/offline-queue" className="no-cs-mega flex items-center justify-between p-4 rounded-xl bg-ant-offline/5 border border-ant-offline/10 hover:bg-ant-offline/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ant-offline/10 flex items-center justify-center">
                  <i className="ri-cloud-line text-ant-offline text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ant-offline">Quản lý Offline Queue</p>
                  <p className="text-xxs text-ant-text-secondary">{queuePending} giao dịch chờ đồng bộ</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-ant-offline" />
            </Link>

            <Link to="/sync-confirm" className="no-cs-mega flex items-center justify-between p-4 rounded-xl bg-ant-warning/5 border border-ant-warning/10 hover:bg-ant-warning/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ant-warning/10 flex items-center justify-center">
                  <i className="ri-check-double-line text-ant-warning text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ant-warning">Xác nhận đồng bộ SAP</p>
                  <p className="text-xxs text-ant-text-secondary">Kiểm tra và xác nhận giao dịch trước khi gửi SAP</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-ant-warning" />
            </Link>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Offline Queue Items</h3>
              {state.offlineQueue.length === 0 ? (
                <p className="text-xs text-ant-text-secondary text-center py-4">Không có giao dịch offline</p>
              ) : (
                <div className="space-y-1.5">
                  {state.offlineQueue.slice(0, 5).map((q) => (
                    <div key={q.queueId} className="flex items-center justify-between p-3 rounded-xl bg-ant-bg">
                      <div>
                        <p className="text-xs font-mono font-bold text-ant-text">{q.queueId}</p>
                        <p className="text-xxs text-ant-text-secondary">{q.type} · {q.mockMovement} · {q.createdAt}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.status === 'Pending Sync' || q.status === 'Local Saved' || q.status === 'Pending User Confirm' ? 'bg-ant-warning/10 text-ant-warning' : q.status === 'Ready To Sync' ? 'bg-ant-sx/10 text-ant-sx' : q.status === 'Synced' ? 'bg-ant-sx/10 text-ant-sx' : q.status === 'Sync Failed' ? 'bg-ant-error/10 text-ant-error' : 'bg-ant-offline/10 text-ant-offline'}`}>
                        {q.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Error Queue Summary</h3>
              {state.errorQueue.length === 0 ? (
                <p className="text-xs text-ant-text-secondary text-center py-4">Không có lỗi</p>
              ) : (
                <div className="space-y-1.5">
                  {state.errorQueue.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-ant-bg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-bold text-ant-text">{e.transactionCode}</p>
                        <p className="text-xxs text-ant-text-secondary truncate">{e.errorReasonVi}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ml-2 ${e.status === 'Pending' ? 'bg-ant-warning/10 text-ant-warning' : e.status === 'Need Review' || e.status === 'Conflict' ? 'bg-ant-error/10 text-ant-error' : 'bg-ant-sx/10 text-ant-sx'}`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Traceability */}
        {activeTab === 'trace' && (
          <div className="space-y-4">
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-ant-qm/10 flex items-center justify-center mb-4">
                <i className="ri-search-line text-2xl text-ant-qm" />
              </div>
              <h3 className="text-sm font-bold text-ant-text mb-2">Truy xuất nguồn gốc lô</h3>
              <p className="text-xs text-ant-text-secondary mb-4">
                Theo dõi toàn bộ hành trình của lô từ PO mua hàng đến container xuất khẩu.
                Xem đầy đủ 15 bước trong chuỗi trace: PO → Nhập kho NL → Batch → QC → Cấp NVL → SX → BTP → Tồn tạm → Đóng thùng → Batch TP → NK TP → Putaway → FEFO → Container.
              </p>
              <Link to="/traceability" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-ant-qm text-white text-sm font-bold active:scale-95 transition-all">
                <i className="ri-search-line" />Xem truy xuất lô
              </Link>
            </div>
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}