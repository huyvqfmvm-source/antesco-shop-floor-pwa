import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

interface TraceNode {
  step: number;
  type: string;
  code: string;
  formTemplate: string;
  status: string;
  user: string;
  role: string;
  time: string;
  detail: string;
  link: string;
  hasPdf: boolean;
  icon: string;
  color: string;
}

function buildTraceData(state: ReturnType<typeof useApp>['state']): TraceNode[] {
  const nodes: TraceNode[] = [];

  // Step 1: PO Mua hàng
  state.purchaseOrders.slice(0, 2).forEach((po) => {
    nodes.push({
      step: 1,
      type: 'PO mua hàng',
      code: po.poNo,
      formTemplate: 'PO-SAP-ME21N',
      status: po.status,
      user: 'Phòng Mua hàng',
      role: 'Mua hàng',
      time: po.expectedDate,
      detail: `${po.supplierName} — ${po.materialName} — ${po.plannedQty.toLocaleString()} ${po.uom}`,
      link: '/inbound/po-waiting',
      hasPdf: false,
      icon: 'ri-shopping-cart-line',
      color: 'ant-nk',
    });
  });

  // Step 2: Phiếu nhập kho nguyên liệu
  state.rawMaterialReceipts.slice(0, 2).forEach((rm) => {
    nodes.push({
      step: 2,
      type: 'Phiếu nhập kho NL',
      code: rm.id,
      formTemplate: 'PNK-01',
      status: rm.status,
      user: 'Trần Thị Bình',
      role: 'Thủ kho',
      time: rm.createdDate,
      detail: `PO ${rm.poNumber} — Net ${rm.netWeight.toLocaleString()} KG — ${rm.supplier}`,
      link: '/inbound/receipt-note',
      hasPdf: true,
      icon: 'ri-archive-drawer-line',
      color: 'ant-nk',
    });
  });

  // Step 3: Batch nguyên liệu
  state.batches.filter((b) => b.id.startsWith('RM-')).slice(0, 2).forEach((b) => {
    nodes.push({
      step: 3,
      type: 'Batch NL (tạm)',
      code: b.id,
      formTemplate: 'SAP-MSC1N',
      status: b.status,
      user: 'Hệ thống',
      role: 'App',
      time: '2026-06-16 09:00',
      detail: `${b.product} — ${b.qty.toLocaleString()} ${b.unit}`,
      link: '/inbound/receipt-note',
      hasPdf: false,
      icon: 'ri-barcode-line',
      color: 'ant-warning',
    });
  });

  // Step 4: QC đầu vào
  state.qcInspections.slice(0, 2).forEach((qc) => {
    nodes.push({
      step: 4,
      type: 'QC đầu vào',
      code: qc.id,
      formTemplate: 'BM-KTNL-01',
      status: qc.result,
      user: qc.inspector,
      role: qc.inspectorRole,
      time: qc.createdAt,
      detail: `Grade I: ${qc.gradeI}% — Grade II: ${qc.gradeII}% — Reject: ${qc.reject}%`,
      link: '/inbound/qc-inspection',
      hasPdf: true,
      icon: 'ri-shield-check-line',
      color: 'ant-qm',
    });
  });

  // Step 5: Phiếu cấp NVL
  state.materialIssueRequests.slice(0, 2).forEach((mir) => {
    nodes.push({
      step: 5,
      type: 'Cấp NVL',
      code: mir.id,
      formTemplate: 'BM-NM-07',
      status: mir.status,
      user: mir.receiverName,
      role: 'Công nhân SX',
      time: mir.createdAt,
      detail: `PO ${mir.productionOrderId} — ${mir.items.length} dòng vật tư`,
      link: '/production/material-issue',
      hasPdf: true,
      icon: 'ri-file-list-3-line',
      color: 'ant-sx',
    });
  });

  // Step 6: Production Order
  state.productionOrders.slice(0, 2).forEach((po) => {
    nodes.push({
      step: 6,
      type: 'Lệnh sản xuất',
      code: po.id,
      formTemplate: 'SAP-CO01',
      status: po.status,
      user: 'Phạm Thị Dung',
      role: 'Quản đốc',
      time: po.startDate,
      detail: `${po.productName} — KH ${po.plannedQty.toLocaleString()} ${po.unit}`,
      link: `/production/detail/${po.id}`,
      hasPdf: false,
      icon: 'ri-file-list-3-line',
      color: 'ant-sx',
    });
  });

  // Step 7: WIP / BTP
  state.btpReports.slice(0, 1).forEach((btp) => {
    nodes.push({
      step: 7,
      type: 'Báo cáo BTP',
      code: btp.id,
      formTemplate: 'BC-BTP-01',
      status: 'Hoàn thành',
      user: 'Nguyễn Văn An',
      role: 'Công nhân SX',
      time: btp.createdAt,
      detail: `Input ${btp.inputQtyKG.toLocaleString()} KG — Grade I: ${btp.gradeIQty.toLocaleString()} KG`,
      link: '/production/wip/10000456',
      hasPdf: true,
      icon: 'ri-tools-line',
      color: 'ant-sx',
    });
  });

  // Step 8: Pallet BTP / Tồn kho tạm
  state.temporaryStocks.slice(0, 2).forEach((ts) => {
    nodes.push({
      step: 8,
      type: 'Tồn BTP tạm',
      code: ts.palletId,
      formTemplate: 'TMP-STOCK',
      status: ts.status,
      user: 'Nguyễn Văn An',
      role: 'Công nhân SX',
      time: ts.createdAt,
      detail: `${ts.productName} — ${ts.qty.toLocaleString()} ${ts.uom} — Bin: ${ts.bin || 'Chưa xếp'}`,
      link: '/production/btp-handover',
      hasPdf: false,
      icon: 'ri-stack-line',
      color: 'ant-warning',
    });
  });

  // Step 9: Báo cáo đóng thùng TP
  state.fgCartonReports.slice(0, 1).forEach((fgc) => {
    nodes.push({
      step: 9,
      type: 'Đóng thùng TP',
      code: fgc.id,
      formTemplate: 'BC-DTTP-01',
      status: fgc.qaConfirmation,
      user: 'Nguyễn Văn An',
      role: 'Công nhân SX',
      time: fgc.createdAt,
      detail: `${fgc.productName} — ${fgc.cartonQty} thùng — Hao hụt: ${fgc.lossQty} KG`,
      link: '/production/fg-carton-report',
      hasPdf: true,
      icon: 'ri-inbox-line',
      color: 'ant-sx',
    });
  });

  // Step 10: Batch thành phẩm
  state.batches.filter((b) => !b.id.startsWith('RM-')).slice(0, 2).forEach((b) => {
    nodes.push({
      step: 10,
      type: 'Batch TP',
      code: b.id,
      formTemplate: 'SAP-MSC1N',
      status: b.status,
      user: 'Hệ thống',
      role: 'App',
      time: '2026-06-16 15:00',
      detail: `${b.product} — ${b.qty.toLocaleString()} ${b.unit}`,
      link: '/production/fg-warehouse-req',
      hasPdf: false,
      icon: 'ri-barcode-line',
      color: 'ant-sx',
    });
  });

  // Step 11: Phiếu yêu cầu nhập kho TP
  state.fgWarehouseRequests.slice(0, 1).forEach((fgw) => {
    nodes.push({
      step: 11,
      type: 'Yêu cầu NK TP',
      code: fgw.id,
      formTemplate: 'BM-NM-09',
      status: fgw.status,
      user: 'Nguyễn Văn An',
      role: 'Công nhân SX',
      time: fgw.createdAt,
      detail: `${fgw.productName} — ${fgw.qtyKg.toLocaleString()} KG — ${fgw.qtyCarton} thùng`,
      link: '/production/fg-warehouse-req',
      hasPdf: true,
      icon: 'ri-file-list-3-line',
      color: 'ant-nk',
    });
  });

  // Step 12: Nhập kho TP
  state.handlingUnits.filter((hu) => hu.type === 'FG' && hu.status === 'Đã xếp kệ').slice(0, 2).forEach((hu) => {
    nodes.push({
      step: 12,
      type: 'Nhập kho TP',
      code: hu.id,
      formTemplate: 'SAP-MIGO-101',
      status: hu.status,
      user: 'Trần Thị Bình',
      role: 'Thủ kho',
      time: '2026-06-16 14:00',
      detail: `${hu.product} — ${hu.qty.toLocaleString()} ${hu.unit} — ${hu.location}`,
      link: '/inbound/fg-receiving',
      hasPdf: false,
      icon: 'ri-archive-drawer-line',
      color: 'ant-nk',
    });
  });

  // Step 13: Putaway
  nodes.push({
    step: 13,
    type: 'Putaway',
    code: 'MIGO-311-001',
    formTemplate: 'SAP-MIGO-311',
    status: 'Đã xếp kệ',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    time: '2026-06-16 14:30',
    detail: 'HU-2026-MA-FG-XN-0005 → KL-03-B2-T3',
    link: '/inbound/putaway',
    hasPdf: false,
    icon: 'ri-layout-grid-line',
    color: 'ant-warning',
  });

  // Step 14: FEFO Picking
  state.outboundDeliveries.slice(0, 2).forEach((od) => {
    nodes.push({
      step: 14,
      type: 'FEFO Picking',
      code: od.id,
      formTemplate: 'SAP-MIGO-201',
      status: od.status,
      user: 'Trần Thị Bình',
      role: 'Thủ kho',
      time: od.shipDate,
      detail: `${od.customer} — ${od.items.map((i) => `${i.qty} ${i.unit} ${i.product}`).join(', ')}`,
      link: `/outbound/fefo-picking/${od.id}`,
      hasPdf: false,
      icon: 'ri-arrow-up-down-line',
      color: 'ant-xk',
    });
  });

  // Step 15: Container / OD
  state.outboundDeliveries.filter((od) => od.container).slice(0, 2).forEach((od) => {
    nodes.push({
      step: 15,
      type: 'Đóng container',
      code: od.container,
      formTemplate: 'SAP-VL10',
      status: od.status,
      user: 'Trần Thị Bình',
      role: 'Thủ kho',
      time: od.shipDate,
      detail: `Container ${od.container} — Seal ${od.seal} — ${od.customer}`,
      link: `/outbound/container-loading/${od.id}`,
      hasPdf: false,
      icon: 'ri-ship-line',
      color: 'ant-xk',
    });
  });

  return nodes.sort((a, b) => a.step - b.step);
}

const STEP_COLORS: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700 border-amber-200',
  2: 'bg-ant-nk/10 text-ant-nk border-ant-nk/20',
  3: 'bg-ant-warning/10 text-ant-warning border-ant-warning/20',
  4: 'bg-ant-qm/10 text-ant-qm border-ant-qm/20',
  5: 'bg-ant-sx/10 text-ant-sx border-ant-sx/20',
  6: 'bg-ant-sx/10 text-ant-sx border-ant-sx/20',
  7: 'bg-ant-sx/10 text-ant-sx border-ant-sx/20',
  8: 'bg-ant-warning/10 text-ant-warning border-ant-warning/20',
  9: 'bg-ant-sx/10 text-ant-sx border-ant-sx/20',
  10: 'bg-ant-sx/10 text-ant-sx border-ant-sx/20',
  11: 'bg-ant-nk/10 text-ant-nk border-ant-nk/20',
  12: 'bg-ant-nk/10 text-ant-nk border-ant-nk/20',
  13: 'bg-ant-warning/10 text-ant-warning border-ant-warning/20',
  14: 'bg-ant-xk/10 text-ant-xk border-ant-xk/20',
  15: 'bg-ant-xk/10 text-ant-xk border-ant-xk/20',
};

const BATCH_FILTERS = [
  { value: 'all', label: 'Tất cả', icon: 'ri-list-unordered' },
  { value: 'RM-2026-MA-XOAI-162-001', label: 'Xoài MA', icon: 'ri-leaf-line' },
  { value: 'RM-2026-BK-XOAI-163-001', label: 'Xoài BK', icon: 'ri-leaf-line' },
  { value: 'RM-2026-MA-TL-164-001', label: 'Thanh long MA', icon: 'ri-leaf-line' },
  { value: '002216225', label: 'TP Xoài IQF', icon: 'ri-shopping-bag-line' },
  { value: '002216226', label: 'TP Thanh long IQF', icon: 'ri-shopping-bag-line' },
  { value: '002216227', label: 'TP Mít IQF', icon: 'ri-shopping-bag-line' },
];

export default function TraceabilityPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [batchFilter, setBatchFilter] = useState('all');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const allNodes = useMemo(() => buildTraceData(state), [state]);

  const filteredNodes = useMemo(() => {
    if (batchFilter === 'all') return allNodes;
    // Filter nodes that reference the selected batch
    return allNodes.filter((n) => {
      const detail = n.detail.toLowerCase();
      const code = n.code.toLowerCase();
      const filter = batchFilter.toLowerCase();
      return detail.includes(filter) || code.includes(filter);
    });
  }, [allNodes, batchFilter]);

  const groupedByStep = useMemo(() => {
    const groups: Record<number, TraceNode[]> = {};
    filteredNodes.forEach((n) => {
      if (!groups[n.step]) groups[n.step] = [];
      groups[n.step].push(n);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredNodes]);

  const handleExportTracePdf = () => {
    const blob = new Blob(['\uFEFF' + 'Chuỗi truy xuất lô ANTECO\n\n' + filteredNodes.map((n) =>
      `Bước ${n.step}: ${n.type}\nMã: ${n.code}\nBiểu mẫu: ${n.formTemplate}\nTrạng thái: ${n.status}\nNgười thực hiện: ${n.user} (${n.role})\nThời gian: ${n.time}\nChi tiết: ${n.detail}\n---`
    ).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traceability-${batchFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/home')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Truy xuất lô</h1>
          <p className="text-xxs text-ant-text-secondary truncate">Traceability — {filteredNodes.length} node</p>
        </div>
        <button onClick={handleExportTracePdf} className="h-9 px-3 rounded-xl bg-ant-qm text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
          <i className="ri-download-line text-sm" />
          Export CSV
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Batch Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {BATCH_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setBatchFilter(f.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                batchFilter === f.value ? 'bg-ant-qm text-white' : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'
              }`}>
              <i className={`${f.icon} text-xs`} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Trace Chain Visualization */}
        {groupedByStep.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <i className="ri-search-line text-2xl text-ant-text-secondary/40" />
            </div>
            <p className="text-sm font-bold text-ant-text">Không tìm thấy dữ liệu truy xuất</p>
            <p className="text-xs text-ant-text-secondary mt-1">Thử thay đổi bộ lọc batch</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gray-200" style={{ zIndex: 0 }} />

            <div className="space-y-0 relative z-10">
              {groupedByStep.map(([stepStr, nodes]) => {
                const step = Number(stepStr);
                const stepStyle = STEP_COLORS[step] || 'bg-gray-100 text-ant-text-secondary border-gray-200';
                const isExpanded = expandedStep === step;
                return (
                  <div key={step} className="relative">
                    {/* Step header */}
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : step)}
                      className="w-full flex items-center gap-3 py-2 group cursor-pointer"
                    >
                      <div className={`w-[46px] h-[46px] rounded-full ${stepStyle} border-2 flex items-center justify-center shrink-0 font-bold text-sm shadow-sm`}>
                        {step}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-bold text-ant-text">{nodes[0].type}</p>
                        <p className="text-xxs text-ant-text-secondary">{nodes.length} node · {nodes[0].formTemplate}</p>
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        {isExpanded ? (
                          <i className="ri-arrow-up-s-line text-ant-text-secondary" />
                        ) : (
                          <i className="ri-arrow-down-s-line text-ant-text-secondary" />
                        )}
                      </div>
                    </button>

                    {/* Nodes */}
                    {isExpanded && (
                      <div className="ml-[58px] space-y-2 pb-2">
                        {nodes.map((node, idx) => (
                          <div key={`${node.code}-${idx}`} className="bg-ant-card rounded-xl border border-gray-100 p-3 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-lg bg-${node.color}/10 flex items-center justify-center shrink-0`}>
                                  <i className={`${node.icon} text-${node.color} text-xs`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-mono font-bold text-ant-text truncate">{node.code}</p>
                                  <p className="text-xxs text-ant-text-secondary">{node.formTemplate}</p>
                                </div>
                              </div>
                              <span className={`text-xxs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                node.status === 'Đạt' || node.status === 'Hoàn tất' || node.status === 'Đã xếp kệ'
                                  ? 'bg-ant-sx/10 text-ant-sx'
                                  : node.status === 'Blocked Stock' || node.status === 'QM Hold' || node.status === 'Không đạt'
                                  ? 'bg-ant-error/10 text-ant-error'
                                  : 'bg-ant-warning/10 text-ant-warning'
                              }`}>
                                {node.status}
                              </span>
                            </div>

                            <p className="text-xs text-ant-text-secondary mb-2">{node.detail}</p>

                            <div className="flex items-center justify-between text-xxs">
                              <span className="text-ant-text-secondary">{node.user} ({node.role}) · {node.time}</span>
                              <div className="flex items-center gap-2">
                                <Link to={node.link} className="text-ant-nk font-bold hover:underline flex items-center gap-0.5">
                                  <i className="ri-external-link-line text-[10px]" />Chi tiết
                                </Link>
                                {node.hasPdf && (
                                  <span className="text-ant-sx font-bold flex items-center gap-0.5 cursor-pointer">
                                    <i className="ri-file-pdf-line text-[10px]" />PDF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-2">Chú thích chuỗi trace</h3>
          <div className="text-xxs text-ant-text-secondary space-y-1">
            <p><span className="font-bold">Bước 1-4:</span> Mua hàng, Nhập kho NL, Batch NL, QC đầu vào</p>
            <p><span className="font-bold">Bước 5-8:</span> Cấp NVL, Lệnh SX, WIP/BTP, Tồn BTP tạm</p>
            <p><span className="font-bold">Bước 9-12:</span> Đóng thùng TP, Batch TP, Yêu cầu NK TP, Nhập kho TP</p>
            <p><span className="font-bold">Bước 13-15:</span> Putaway, FEFO Picking, Container/OD</p>
          </div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}