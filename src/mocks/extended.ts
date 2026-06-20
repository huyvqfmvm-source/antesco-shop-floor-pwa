import {
  MOCK_ROLES,
  MOCK_PLANTS,
  MOCK_SHIFTS,
  MOCK_PRODUCTION_ORDERS as _MOCK_PRODUCTION_ORDERS,
  MOCK_BATCHES as _MOCK_BATCHES,
  MOCK_HANDLING_UNITS as _MOCK_HANDLING_UNITS,
  MOCK_BINS as _MOCK_BINS,
  MOCK_WAREHOUSES as _MOCK_WAREHOUSES,
  MOCK_TRANSFER_ORDERS as _MOCK_TRANSFER_ORDERS,
  MOCK_OUTBOUND_DELIVERIES as _MOCK_OUTBOUND_DELIVERIES,
  MOCK_QUALITY_HOLDS as _MOCK_QUALITY_HOLDS,
  MOCK_ACTIVITY_LOGS as _MOCK_ACTIVITY_LOGS,
  MOCK_USERS,
  MOCK_RM_RECEIPTS as _MOCK_RM_RECEIPTS,
  MOCK_CYCLE_COUNTS as _MOCK_CYCLE_COUNTS,
  MOCK_DEFECT_CODES,
  MOCK_BOM_PO_10000456,
  MOCK_OPERATIONS,
  MOCK_SUPPLIERS,
  type MockUser,
} from './data';

// Re-export new mock data modules
export { MOCK_FORM_TEMPLATES, MOCK_FORM_INSTANCES } from './form-templates';
export type { FormTemplate, FormTemplateField, FormInstance } from './form-templates';
export { MOCK_ALL_MATERIAL_NORMS, MOCK_BOM_XOAI_IQF_15CM, MOCK_BOM_THANHLONG_IQF, MOCK_BOM_MIT_IQF, MOCK_BOM_XOAI_IQF_3MM, getBomByProductCode, calculateMaterialRequirements } from './material-norms';
export type { MaterialNorm, MaterialNormItem } from './material-norms';
export { MOCK_PURCHASE_ORDERS, MOCK_QC_INSPECTIONS, MOCK_MATERIAL_ISSUE_REQUESTS, MOCK_BTP_REPORTS, MOCK_FG_CARTON_REPORTS, MOCK_FG_WAREHOUSE_REQUESTS, MOCK_TEMPORARY_STOCKS, isSyncConfirmed } from './business-entities';
export type { PurchaseOrder, QCInspection, MaterialIssueRequest, MaterialIssueRequestItem, BTPReport, BTPReportItem, FGCartonReport, FGWarehouseRequest, TemporaryStock, SyncQueueItem } from './business-entities';
export { MOCK_LOSS_REASONS, getLossReasonOptions, getLossReasonByCode } from './loss-reasons';
export type { LossReason } from './loss-reasons';

export { MOCK_ROLES, MOCK_PLANTS, MOCK_SHIFTS, MOCK_SUPPLIERS, MOCK_OPERATIONS, MOCK_DEFECT_CODES };
export type { MockUser };

export const MOCK_BATCHES = [
  ..._MOCK_BATCHES,
  { id: 'FG-2026-MA-0061-166-001', product: 'TP0061 - Xoài đông IQF', qty: 5000, unit: 'KG', plant: 'MA', status: 'Unrestricted', productionOrder: '10000456' },
  { id: 'FG-2026-MA-0042-166-002', product: 'TP0042 - Thanh long đông IQF', qty: 3200, unit: 'KG', plant: 'MA', status: 'Unrestricted', productionOrder: '10000457' },
  { id: 'FG-2026-BK-0078-166-003', product: 'TP0078 - Mít đông IQF', qty: 1800, unit: 'KG', plant: 'BK', status: 'QI Stock', productionOrder: '10000458' },
  { id: 'RM-2026-BK-XOAI-163-001', product: 'Xoài cát nguyên liệu tươi', qty: 6200, unit: 'KG', plant: 'BK', status: 'QI Stock', productionOrder: '' },
  { id: 'RM-2026-MA-TL-164-001', product: 'Thanh long nguyên liệu tươi', qty: 4200, unit: 'KG', plant: 'MA', status: 'Unrestricted', productionOrder: '' },
];

export const MOCK_HANDLING_UNITS = [
  ..._MOCK_HANDLING_UNITS,
  { id: 'HU-2026-MA-RM-XOAI-0001', type: 'RM', product: 'RM-XC-001', qty: 2000, unit: 'KG', location: 'KM-01-A1-T1', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-RM-XOAI-0002', type: 'RM', product: 'RM-XC-001', qty: 2000, unit: 'KG', location: 'KM-01-A2-T1', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-RM-XOAI-0003', type: 'RM', product: 'RM-XC-001', qty: 2000, unit: 'KG', location: 'KM-01-B1-T2', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-RM-XOAI-0004', type: 'RM', product: 'RM-XC-001', qty: 2380, unit: 'KG', location: 'KM-02-A1-T1', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-BK-RM-XOAI-0005', type: 'RM', product: 'RM-XC-001', qty: 3100, unit: 'KG', location: 'KM-03-A1-T1', plant: 'BK', status: 'Đã xếp kệ' },
  { id: 'HU-2026-BK-RM-XOAI-0006', type: 'RM', product: 'RM-XC-001', qty: 3100, unit: 'KG', location: 'KM-03-A2-T1', plant: 'BK', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-BTP-XOAI-0002', type: 'BTP', product: 'TP0061-BTP', qty: 1600, unit: 'KG', location: 'KL-01-A1-T2', plant: 'MA', status: 'BTP khả dụng' },
  { id: 'HU-2026-MA-BTP-XOAI-0003', type: 'BTP', product: 'TP0061-BTP', qty: 1600, unit: 'KG', location: 'KL-01-A1-T3', plant: 'MA', status: 'BTP khả dụng' },
  { id: 'HU-2026-BK-BTP-MIT-0004', type: 'BTP', product: 'TP0078-BTP', qty: 900, unit: 'KG', location: '', plant: 'BK', status: 'BTP khả dụng' },
  { id: 'HU-2026-MA-BTP-TL-0005', type: 'BTP', product: 'TP0042-BTP', qty: 1600, unit: 'KG', location: 'KL-02-A2-T1', plant: 'MA', status: 'BTP khả dụng' },
];

export const MOCK_BINS = [
  ..._MOCK_BINS,
  { id: 'KM-01-A1-T1', warehouse: 'KM-01', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Có hàng' },
  { id: 'KM-01-A2-T1', warehouse: 'KM-01', row: 'A', tier: '2', position: '1', plant: 'MA', status: 'Có hàng' },
  { id: 'KM-01-B1-T2', warehouse: 'KM-01', row: 'B', tier: '1', position: '2', plant: 'MA', status: 'Có hàng' },
  { id: 'KM-02-A1-T1', warehouse: 'KM-02', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Có hàng' },
  { id: 'KM-03-A1-T1', warehouse: 'KM-03', row: 'A', tier: '1', position: '1', plant: 'BK', status: 'Có hàng' },
  { id: 'KM-03-A2-T1', warehouse: 'KM-03', row: 'A', tier: '2', position: '1', plant: 'BK', status: 'Có hàng' },
  { id: 'KL-01-A1-T2', warehouse: 'KL-01', row: 'A', tier: '1', position: '2', plant: 'MA', status: 'Có hàng' },
  { id: 'KL-01-A1-T3', warehouse: 'KL-01', row: 'A', tier: '1', position: '3', plant: 'MA', status: 'Có hàng' },
  { id: 'KL-04-A1-T1', warehouse: 'KL-04', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Trống' },
  { id: 'KL-04-A1-T2', warehouse: 'KL-04', row: 'A', tier: '1', position: '2', plant: 'MA', status: 'Trống' },
  { id: 'KL-06-A1-T1', warehouse: 'KL-06', row: 'A', tier: '1', position: '1', plant: 'BK', status: 'Trống' },
  { id: 'KL-06-A1-T2', warehouse: 'KL-06', row: 'A', tier: '1', position: '2', plant: 'BK', status: 'Trống' },
  { id: 'KL-06-B1-T3', warehouse: 'KL-06', row: 'B', tier: '1', position: '3', plant: 'BK', status: 'Trống' },
  { id: 'KL-07-A1-T1', warehouse: 'KL-07', row: 'A', tier: '1', position: '1', plant: 'BK', status: 'Trống' },
  { id: 'KL-07-B2-T4', warehouse: 'KL-07', row: 'B', tier: '2', position: '4', plant: 'BK', status: 'Trống' },
  { id: 'KL-08-A1-T1', warehouse: 'KL-08', row: 'A', tier: '1', position: '1', plant: 'BK', status: 'Trống' },
  { id: 'KL-08-C2-T3', warehouse: 'KL-08', row: 'C', tier: '2', position: '3', plant: 'BK', status: 'Trống' },
  { id: 'NL-01-B1-T1', warehouse: 'NL-01', row: 'B', tier: '1', position: '1', plant: 'MA', status: 'Trống' },
  { id: 'BB-01-A1-T1', warehouse: 'BB-01', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Trống' },
  { id: 'HC-01-A1-T1', warehouse: 'HC-01', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Trống' },
  { id: 'KM-02-B1-T2', warehouse: 'KM-02', row: 'B', tier: '1', position: '2', plant: 'MA', status: 'Trống' },
  { id: 'KM-03-B2-T1', warehouse: 'KM-03', row: 'B', tier: '2', position: '1', plant: 'BK', status: 'Trống' },
];

export const MOCK_WAREHOUSES = _MOCK_WAREHOUSES;

export const MOCK_TRANSFER_ORDERS = [
  ..._MOCK_TRANSFER_ORDERS,
  {
    id: 'ST-2026-0095',
    fromPlant: 'MA',
    fromWarehouse: 'KL-01',
    toPlant: 'BK',
    toWarehouse: 'KL-06',
    items: [
      { product: 'TP0061-BTP', qty: 800, unit: 'KG', hu: 'HU-2026-MA-BTP-XOAI-0001' },
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-05' },
    ],
    status: 'Đã tạo',
    createdDate: '2026-06-18',
  },
  {
    id: 'ST-2026-0096',
    fromPlant: 'BK',
    fromWarehouse: 'KL-06',
    toPlant: 'MA',
    toWarehouse: 'KL-04',
    items: [
      { product: 'TP0078', qty: 600, unit: 'KG', hu: 'HU-IQF-MIT-01' },
    ],
    status: 'Đã nhận',
    createdDate: '2026-06-17',
  },
];

export const MOCK_OUTBOUND_DELIVERIES = _MOCK_OUTBOUND_DELIVERIES;

export const MOCK_QUALITY_HOLDS = [
  ..._MOCK_QUALITY_HOLDS,
  { id: 'QH-2026-0048', batch: 'RM-2026-MA-XOAI-162-001', reason: 'Tạp chất lạ phát hiện khi kiểm tra đầu vào', plant: 'MA', status: 'Đang giữ', createdDate: '2026-06-17' },
  { id: 'QH-2026-0049', batch: 'FG-2026-MA-0061-166-001', reason: 'Kết tinh tuyết bất thường — DF-006', plant: 'MA', status: 'Đã mở khóa', createdDate: '2026-06-16' },
];

export const MOCK_ACTIVITY_LOGS = [
  ..._MOCK_ACTIVITY_LOGS,
  { id: 'act-010', timestamp: '2026-06-17 08:15', user: 'Phạm Thị Dung', role: 'Quản đốc', action: 'Phát lệnh SX', detail: 'PO 10000458 — Mít đông IQF · 1,800 KG', plant: 'BK' },
  { id: 'act-011', timestamp: '2026-06-17 09:00', user: 'Hoàng Văn Em', role: 'Kỹ thuật', action: 'Ghi tiện ích', detail: 'Điện: 4,500 kWh · Nước: 42 m³ · Hơi: 14 tấn', plant: 'BK' },
  { id: 'act-012', timestamp: '2026-06-17 10:30', user: 'Trần Thị Bình', role: 'Thủ kho', action: 'Putaway', detail: 'HU-2026-MA-FG-XN-0007 → KL-03-A1-T1', plant: 'MA' },
  { id: 'act-013', timestamp: '2026-06-17 11:45', user: 'Lê Văn Cường', role: 'KCS/QM', action: 'QM Hold', detail: 'Batch RM-2026-MA-XOAI-162-001 — Tạp chất lạ · QH-2026-0048', plant: 'MA' },
  { id: 'act-014', timestamp: '2026-06-17 13:20', user: 'Trần Thị Bình', role: 'Thủ kho', action: 'FEFO Picking', detail: 'OD-2026-0098 — 5 pallet · 2,500 KG', plant: 'MA' },
  { id: 'act-015', timestamp: '2026-06-17 15:00', user: 'Nguyễn Văn An', role: 'Công nhân SX', action: 'Ghi WIP', detail: 'PO 10000456 — Op 0020 · 3,200 KG', plant: 'MA' },
  { id: 'act-016', timestamp: '2026-06-17 16:30', user: 'Trần Thị Bình', role: 'Thủ kho', action: 'Xuất bến', detail: 'OD-2026-0108 — Container OOLU1122334 · Seal SEAL-556677', plant: 'MA' },
  { id: 'act-017', timestamp: '2026-06-18 07:00', user: 'Admin Hệ Thống', role: 'Admin', action: 'Cập nhật RBAC', detail: 'Trần Văn Giang → Thủ kho · BK', plant: 'BK' },
];

export const MOCK_DEFECT_CODES_EXTENDED = [
  ...MOCK_DEFECT_CODES,
  { code: 'DF-011', name: 'Nhiễm vi sinh vượt ngưỡng', category: 'An toàn thực phẩm' },
  { code: 'DF-012', name: 'Dư lượng thuốc BVTV', category: 'An toàn thực phẩm' },
  { code: 'DF-013', name: 'Sai nhiệt độ bảo quản', category: 'Bảo quản lạnh' },
  { code: 'DF-014', name: 'Sai trọng lượng đơn vị', category: 'Đóng gói' },
  { code: 'DF-015', name: 'Container bị rò rỉ khí lạnh', category: 'Vận chuyển' },
  { code: 'DF-016', name: 'Seal container bị hỏng', category: 'Vận chuyển' },
  { code: 'DF-017', name: 'Sai nhãn mác phụ', category: 'Đóng gói' },
  { code: 'DF-018', name: 'Dị vật kim loại', category: 'An toàn thực phẩm' },
  { code: 'DF-019', name: 'Màu sắc không đồng đều', category: 'Chất lượng cảm quan' },
  { code: 'DF-020', name: 'Kích thước cắt không đạt', category: 'Sai quy cách' },
];

export const MOCK_DEFECT_CODES_WITH_GUIDE = [
  { code: 'DF-001', name: 'Không đạt màu sắc', category: 'Chất lượng cảm quan', severity: 'Trung bình', guide: 'Đánh giá lại lô theo bảng màu chuẩn. Nếu lệch &gt; 2 bậc: Blocked Stock và chờ QM quyết định.' },
  { code: 'DF-002', name: 'Xoài dập úng / Xì gôm', category: 'Hư hỏng nguyên liệu', severity: 'Cao', guide: 'Cô lập ngay pallet bị ảnh hưởng. Blocked Stock toàn bộ batch. Gửi mẫu kiểm vi sinh 24h.' },
  { code: 'DF-003', name: 'Sai quy cách cắt', category: 'Sai quy cách', severity: 'Thấp', guide: 'Điều chỉnh máy cắt. Tái chế lô bị sai về công đoạn định hình.' },
  { code: 'DF-004', name: 'Nhiễm tạp chất', category: 'An toàn thực phẩm', severity: 'Nghiêm trọng', guide: 'Blocked Stock ngay lập tức. Cô lập toàn bộ batch. Gửi mẫu kiểm nghiệm. Báo cáo QM trưởng.' },
  { code: 'DF-005', name: 'Rách bao bì / Rò rỉ khí', category: 'Sự cố vật lý', severity: 'Trung bình', guide: 'Kiểm tra từng thùng trong pallet. Thay bao bì mới cho thùng bị rách. Nếu &gt; 20% số thùng: Blocked Stock.' },
  { code: 'DF-006', name: 'Kết tinh tuyết bất thường', category: 'Bảo quản lạnh', severity: 'Trung bình', guide: 'Kiểm tra nhiệt độ kho lạnh. Nếu nhiệt độ dao động &gt; ±3°C: Blocked Stock và kiểm tra hệ thống lạnh.' },
  { code: 'DF-007', name: 'Sai nhãn / thùng', category: 'Đóng gói', severity: 'Thấp', guide: 'In lại nhãn đúng. Dán đè lên nhãn cũ. Ghi nhận lỗi đóng gói.' },
  { code: 'DF-008', name: 'Thiếu số lượng thùng', category: 'Đóng gói', severity: 'Thấp', guide: 'Kiểm tra lại toàn bộ pallet. Bổ sung thùng thiếu từ lô dự phòng. Ghi nhận chênh lệch.' },
  { code: 'DF-009', name: 'Nhiệt độ container không đạt', category: 'Vận chuyển', severity: 'Trung bình', guide: 'Không cho xuất bến. Báo đội kỹ thuật kiểm tra hệ thống lạnh container. Chờ container đạt -18°C.' },
  { code: 'DF-010', name: 'Lô không khớp FEFO', category: 'Xuất kho', severity: 'Thấp', guide: 'Chỉ Quản đốc/Admin được Override. Bắt buộc nhập lý do override. Ghi audit log.' },
];

export const MOCK_BOM_PO_10000457 = [
  { materialCode: 'RM-TL-001', materialName: 'Thanh long tươi nguyên liệu', requiredLot: '002210025', requiredQty: 4800, unit: 'KG', category: 'raw' as const },
  { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', requiredLot: '005', requiredQty: 10, unit: 'L', category: 'chemical' as const },
  { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm — Bao bì tạm', requiredLot: '012', requiredQty: 400, unit: 'Cái', category: 'packaging' as const },
  { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', requiredLot: '012', requiredQty: 320, unit: 'Cái', category: 'packaging' as const },
];

export const MOCK_BOM_PO_10000458 = [
  { materialCode: 'RM-MIT-001', materialName: 'Mít tươi nguyên liệu', requiredLot: '002210026', requiredQty: 2700, unit: 'KG', category: 'raw' as const },
  { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', requiredLot: '005', requiredQty: 6, unit: 'L', category: 'chemical' as const },
  { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm — Bao bì tạm', requiredLot: '012', requiredQty: 200, unit: 'Cái', category: 'packaging' as const },
  { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', requiredLot: '012', requiredQty: 180, unit: 'Cái', category: 'packaging' as const },
];

export const MOCK_PRODUCTION_ORDERS = [
  ..._MOCK_PRODUCTION_ORDERS,
  {
    id: '10000459',
    productCode: 'TP0092',
    productName: 'Xoài đông IQF cắt lát 3mm',
    plannedQty: 3500,
    unit: 'KG',
    plant: 'MA',
    shift: 'ca-1',
    status: 'STRT',
    startDate: '2026-06-17',
    dueDate: '2026-06-19',
    batchFg: 'FG-2026-MA-0092-167-001',
    huFg: 'HU-2026-MA-FG-XOAI-L3MM-0001',
    huBtp: 'HU-2026-MA-BTP-XOAI-L3MM-0001',
    wipQty: 1800,
    fgQty: 0,
    scrapQty: 0,
    currentOperation: 'Op 0020 — Gọt vỏ & Lạng má',
  },
  {
    id: '10000460',
    productCode: 'TP0042',
    productName: 'Thanh long đông IQF cắt lát 2cm',
    plannedQty: 4000,
    unit: 'KG',
    plant: 'BK',
    shift: 'ca-2',
    status: 'CNF',
    startDate: '2026-06-16',
    dueDate: '2026-06-18',
    batchFg: 'FG-2026-BK-0042-167-002',
    huFg: 'HU-2026-BK-FG-TL-0010',
    huBtp: 'HU-2026-BK-BTP-TL-0006',
    wipQty: 4200,
    fgQty: 3800,
    scrapQty: 400,
    scrapReason: 'Lỗi định hình — méo lát cắt 15%',
    currentOperation: 'CNF — Chờ nhập kho TP',
  },
  {
    id: '10000461',
    productCode: 'TP0078',
    productName: 'Mít đông IQF nguyên múi',
    plannedQty: 2400,
    unit: 'KG',
    plant: 'MA',
    shift: 'ca-1',
    status: 'REL',
    startDate: '2026-06-19',
    dueDate: '2026-06-21',
    batchFg: '',
    huFg: '',
    huBtp: '',
    wipQty: 0,
    fgQty: 0,
    scrapQty: 0,
    currentOperation: '',
  },
  {
    id: '10000462',
    productCode: 'TP0061',
    productName: 'Xoài đông IQF cắt xí ngầu 1.5cm',
    plannedQty: 6000,
    unit: 'KG',
    plant: 'BK',
    shift: 'ca-2',
    status: 'TECO',
    startDate: '2026-06-14',
    dueDate: '2026-06-16',
    batchFg: 'FG-2026-BK-0061-165-001',
    huFg: 'HU-2026-BK-FG-XN-0011',
    huBtp: 'HU-2026-BK-BTP-XOAI-0007',
    wipQty: 6200,
    fgQty: 5800,
    scrapQty: 400,
    scrapReason: 'Xoài dập úng giai đoạn định hình',
    currentOperation: 'TECO — Hoàn tất',
  },
];

export const MOCK_INVOICES = [
  { id: 'INV-2026-0042', odId: 'OD-2026-0108', customer: 'Tokyo Gourmet Ltd.', amount: '¥2,450,000', status: 'Đã phát hành', date: '2026-06-16', currency: 'JPY' },
  { id: 'INV-2026-0041', odId: 'OD-2026-0105', customer: 'Asia Foods Import Co.', amount: '$18,500', status: 'Chờ phát hành', date: '2026-06-17', currency: 'USD' },
  { id: 'INV-2026-0040', odId: 'OD-2026-0102', customer: 'ANTESCO EU GmbH', amount: '€22,350', status: 'Chưa lập', date: '', currency: 'EUR' },
];

export const MOCK_RM_RECEIPTS = [
  ..._MOCK_RM_RECEIPTS,
  {
    id: 'RM-RCPT-002',
    poNumber: 'PO-2026-00092',
    supplier: 'Đại lý Lê Văn Hùng',
    licensePlate: '66C-789.12',
    grossWeight: 7200,
    tareWeight: 110,
    netWeight: 7090,
    gradeI: 88,
    gradeII: 8,
    reject: 4,
    batchRm: 'RM-2026-BK-XOAI-163-001',
    qcStatus: 'Đạt',
    plant: 'BK',
    status: 'Đã nhập',
    createdDate: '2026-06-17',
  },
  {
    id: 'RM-RCPT-003',
    poNumber: 'PO-2026-00095',
    supplier: 'Đại lý Phan Thị Quyên',
    licensePlate: '64C-456.78',
    grossWeight: 4800,
    tareWeight: 95,
    netWeight: 4705,
    gradeI: 92,
    gradeII: 5,
    reject: 3,
    batchRm: 'RM-2026-MA-TL-164-001',
    qcStatus: 'Đạt',
    plant: 'MA',
    status: 'Đã nhập',
    createdDate: '2026-06-18',
  },
];

export const MOCK_CYCLE_COUNTS = [
  ..._MOCK_CYCLE_COUNTS,
  {
    id: 'CC-2026-0083',
    bin: 'KL-05-C2-T4',
    plant: 'BK',
    expectedPallets: 4,
    actualPallets: 4,
    expectedQty: 2400,
    actualQty: 2400,
    unit: 'KG',
    status: 'Đã kiểm kê khớp',
    countedBy: 'Trần Văn Giang',
    note: '',
    imageCount: 0,
    createdDate: '2026-06-17',
  },
  {
    id: 'CC-2026-0084',
    bin: 'KM-01-A1-T1',
    plant: 'MA',
    expectedPallets: 2,
    actualPallets: 2,
    expectedQty: 4000,
    actualQty: 4000,
    unit: 'KG',
    status: 'Đã kiểm kê khớp',
    countedBy: 'Trần Thị Bình',
    note: '',
    imageCount: 0,
    createdDate: '2026-06-18',
  },
];

export const MOCK_CONTAINER_CHECKLISTS = [
  {
    id: 'CHK-OD-2026-0102',
    odId: 'OD-2026-0102',
    container: 'TGBU1234567',
    seal: 'SEAL-889912',
    truckPlate: '51C-234.56',
    checklistItems: [
      { id: 'chk-1', label: 'Nhiệt độ container &le; -18°C', required: true, checked: false },
      { id: 'chk-2', label: 'Seal container còn nguyên vẹn', required: true, checked: false },
      { id: 'chk-3', label: 'Sàn container sạch, không mùi lạ', required: true, checked: false },
      { id: 'chk-4', label: 'Đèn container hoạt động', required: false, checked: false },
      { id: 'chk-5', label: 'Cửa container đóng kín', required: true, checked: false },
      { id: 'chk-6', label: 'Giấy chứng nhận vệ sinh container', required: true, checked: false },
      { id: 'chk-7', label: 'Ghi nhận nhiệt độ thực tế (°C)', required: true, checked: false },
      { id: 'chk-8', label: 'Chụp ảnh seal trước khi cắt', required: true, checked: false },
    ],
    status: 'Chưa kiểm',
    checkedBy: '',
    checkedDate: '',
  },
  {
    id: 'CHK-OD-2026-0105',
    odId: 'OD-2026-0105',
    container: 'MSCU9876543',
    seal: 'SEAL-771234',
    truckPlate: '50LD-089.12',
    checklistItems: [
      { id: 'chk-1', label: 'Nhiệt độ container &le; -18°C', required: true, checked: false },
      { id: 'chk-2', label: 'Seal container còn nguyên vẹn', required: true, checked: false },
      { id: 'chk-3', label: 'Sàn container sạch, không mùi lạ', required: true, checked: false },
      { id: 'chk-4', label: 'Đèn container hoạt động', required: false, checked: false },
      { id: 'chk-5', label: 'Cửa container đóng kín', required: true, checked: false },
      { id: 'chk-6', label: 'Ghi nhận nhiệt độ thực tế (°C)', required: true, checked: false },
      { id: 'chk-7', label: 'Chụp ảnh seal trước khi cắt', required: true, checked: false },
    ],
    status: 'Đã kiểm',
    checkedBy: 'Lê Văn Cường',
    checkedDate: '2026-06-17 14:00',
  },
  {
    id: 'CHK-OD-2026-0108',
    odId: 'OD-2026-0108',
    container: 'OOLU1122334',
    seal: 'SEAL-556677',
    truckPlate: '51C-789.01',
    checklistItems: [
      { id: 'chk-1', label: 'Nhiệt độ container &le; -18°C', required: true, checked: true },
      { id: 'chk-2', label: 'Seal container còn nguyên vẹn', required: true, checked: true },
      { id: 'chk-3', label: 'Sàn container sạch, không mùi lạ', required: true, checked: true },
      { id: 'chk-4', label: 'Đèn container hoạt động', required: false, checked: true },
      { id: 'chk-5', label: 'Cửa container đóng kín', required: true, checked: true },
      { id: 'chk-6', label: 'Giấy chứng nhận vệ sinh container', required: true, checked: true },
      { id: 'chk-7', label: 'Ghi nhận nhiệt độ thực tế (°C)', required: true, checked: true },
      { id: 'chk-8', label: 'Chụp ảnh seal trước khi cắt', required: true, checked: true },
    ],
    status: 'Đã kiểm',
    checkedBy: 'Lê Văn Cường',
    checkedDate: '2026-06-15 10:30',
  },
];

export const MOCK_BATCHES_FULL = [
  ...MOCK_BATCHES,
  { id: 'FG-2026-MA-0061-166-005', product: 'TP0061 - Xoài đông IQF', qty: 5000, unit: 'KG', plant: 'MA', status: 'Unrestricted', productionOrder: '10000456' },
  { id: 'FG-2026-MA-0042-166-006', product: 'TP0042 - Thanh long đông IQF', qty: 3200, unit: 'KG', plant: 'MA', status: 'Đã xuất', productionOrder: '10000457' },
  { id: 'FG-2026-MA-0061-166-007', product: 'TP0061 - Xoài đông IQF', qty: 2000, unit: 'KG', plant: 'MA', status: 'Cần kiểm', productionOrder: '10000459' },
  { id: 'FG-2026-BK-0042-167-008', product: 'TP0042 - Thanh long đông IQF', qty: 4000, unit: 'KG', plant: 'BK', status: 'Unrestricted', productionOrder: '10000460' },
  { id: 'RM-2026-MA-MIT-165-001', product: 'Mít tươi nguyên liệu', qty: 2700, unit: 'KG', plant: 'MA', status: 'Cần kiểm', productionOrder: '' },
  { id: 'RM-2026-BK-XOAI-166-002', product: 'Xoài cát nguyên liệu tươi', qty: 3500, unit: 'KG', plant: 'BK', status: 'Unrestricted', productionOrder: '' },
];

export const MOCK_EXTENDED_USERS: MockUser[] = [
  { name: 'Nguyễn Văn An', username: 'an.nguyen', password: '123456', role: 'cong-nhan-san-xuat', plant: 'MA', department: 'Sản xuất', employeeCode: 'NV-001', phone: '0912 345 678' },
  { name: 'Trần Thị Bình', username: 'binh.tran', password: '123456', role: 'thu-kho', plant: 'MA', department: 'Kho', employeeCode: 'NV-002', phone: '0912 345 679' },
  { name: 'Lê Văn Cường', username: 'cuong.le', password: '123456', role: 'kcs-qm', plant: 'MA', department: 'QM/KCS', employeeCode: 'NV-003', phone: '0912 345 680' },
  { name: 'Phạm Thị Dung', username: 'dung.pham', password: '123456', role: 'quan-doc', plant: 'MA', department: 'Sản xuất', employeeCode: 'NV-004', phone: '0912 345 681' },
  { name: 'Hoàng Văn Em', username: 'em.hoang', password: '123456', role: 'ky-thuat', plant: 'BK', department: 'Kỹ thuật', employeeCode: 'NV-005', phone: '0912 345 682' },
  { name: 'Ngô Thị Phương', username: 'phuong.ngo', password: '123456', role: 'ke-toan-kho', plant: 'MA', department: 'Kế toán kho', employeeCode: 'NV-006', phone: '0912 345 683' },
  { name: 'Admin Hệ Thống', username: 'admin', password: 'admin123', role: 'admin', plant: 'MA', department: 'Quản trị', employeeCode: 'NV-000', phone: '0912 345 684' },
  { name: 'Trần Văn Giang', username: 'giang.tran', password: '123456', role: 'thu-kho', plant: 'BK', department: 'Kho', employeeCode: 'NV-007', phone: '0912 345 685' },
  { name: 'Lý Thị Hương', username: 'huong.ly', password: '123456', role: 'cong-nhan-san-xuat', plant: 'BK', department: 'Sản xuất', employeeCode: 'NV-008', phone: '0912 345 686' },
  { name: 'Đinh Văn Khánh', username: 'khanh.dinh', password: '123456', role: 'kcs-qm', plant: 'BK', department: 'QM/KCS', employeeCode: 'NV-009', phone: '0912 345 687' },
  { name: 'Vũ Thị Lan', username: 'lan.vu', password: '123456', role: 'quan-doc', plant: 'BK', department: 'Sản xuất', employeeCode: 'NV-010', phone: '0912 345 688' },
  { name: 'Mai Văn Nam', username: 'nam.mai', password: '123456', role: 'ky-thuat', plant: 'MA', department: 'Kỹ thuật', employeeCode: 'NV-011', phone: '0912 345 689' },
  { name: 'Đỗ Thị Oanh', username: 'oanh.do', password: '123456', role: 'ke-toan-kho', plant: 'BK', department: 'Kế toán kho', employeeCode: 'NV-012', phone: '0912 345 690' },
];

export const MOCK_SCAN_LOG_SUMMARY = {
  totalScans: 15,
  successRate: 80,
  byCodeType: { PO: 2, HU: 4, Batch: 1, Bin: 2, OD: 1, Container: 1, Seal: 1, TruckPlate: 1, WeighSlip: 1, Device: 1 },
  byResult: { success: 12, duplicate: 1, wrong_type: 1, wrong_code: 1 },
};