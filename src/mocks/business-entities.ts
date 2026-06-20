// ============================================================
// Business Entities Mock Data
// PurchaseOrder, QCInspection, MaterialIssueRequest,
// BTPReport, FGCartonReport, FGWarehouseRequest, TemporaryStock
// ANTECO Shop Floor & Warehouse
// ============================================================

// ============================================================
// PURCHASE ORDER
// ============================================================
export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  plannedQty: number;
  uom: string;
  expectedDate: string;
  status: 'Chưa nhập' | 'Đang nhập' | 'Đã nhập một phần' | 'Đã nhập hết' | 'Đã quyết toán';
  relatedDocuments: string[];
  plant: string;
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-00089',
    poNo: 'PO-2026-00089',
    supplierId: 'SUP-DL-NVT',
    supplierName: 'Đại lý Nguyễn Văn Tài',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    plannedQty: 8500,
    uom: 'KG',
    expectedDate: '2026-06-15',
    status: 'Đã nhập hết',
    relatedDocuments: ['RM-RCPT-001', 'PNK-2026-0001'],
    plant: 'MA',
  },
  {
    id: 'PO-2026-00092',
    poNo: 'PO-2026-00092',
    supplierId: 'SUP-DL-LVH',
    supplierName: 'Đại lý Lê Văn Hùng',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    plannedQty: 7200,
    uom: 'KG',
    expectedDate: '2026-06-17',
    status: 'Đã nhập một phần',
    relatedDocuments: ['RM-RCPT-002'],
    plant: 'BK',
  },
  {
    id: 'PO-2026-00095',
    poNo: 'PO-2026-00095',
    supplierId: 'SUP-DL-PTQ',
    supplierName: 'Đại lý Phan Thị Quyên',
    materialCode: 'RM-TL-001',
    materialName: 'Thanh long tươi nguyên liệu',
    plannedQty: 5000,
    uom: 'KG',
    expectedDate: '2026-06-18',
    status: 'Đã nhập một phần',
    relatedDocuments: ['RM-RCPT-003'],
    plant: 'MA',
  },
  {
    id: 'PO-2026-00098',
    poNo: 'PO-2026-00098',
    supplierId: 'SUP-DL-NVT',
    supplierName: 'Đại lý Nguyễn Văn Tài',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    plannedQty: 10000,
    uom: 'KG',
    expectedDate: '2026-06-22',
    status: 'Chưa nhập',
    relatedDocuments: [],
    plant: 'MA',
  },
  {
    id: 'PO-2026-00101',
    poNo: 'PO-2026-00101',
    supplierId: 'SUP-DL-LVH',
    supplierName: 'Đại lý Lê Văn Hùng',
    materialCode: 'RM-MIT-001',
    materialName: 'Mít tươi nguyên liệu',
    plannedQty: 4000,
    uom: 'KG',
    expectedDate: '2026-06-24',
    status: 'Chưa nhập',
    relatedDocuments: [],
    plant: 'BK',
  },
  {
    id: 'PO-2026-00105',
    poNo: 'PO-2026-00105',
    supplierId: 'SUP-DL-PTQ',
    supplierName: 'Đại lý Phan Thị Quyên',
    materialCode: 'RM-TL-001',
    materialName: 'Thanh long tươi nguyên liệu',
    plannedQty: 6500,
    uom: 'KG',
    expectedDate: '2026-06-25',
    status: 'Chưa nhập',
    relatedDocuments: [],
    plant: 'MA',
  },
  {
    id: 'PO-2026-00108',
    poNo: 'PO-2026-00108',
    supplierId: 'SUP-DL-NVT',
    supplierName: 'Đại lý Nguyễn Văn Tài',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    plannedQty: 9200,
    uom: 'KG',
    expectedDate: '2026-06-26',
    status: 'Chưa nhập',
    relatedDocuments: [],
    plant: 'BK',
  },
  {
    id: 'PO-2026-00110',
    poNo: 'PO-2026-00110',
    supplierId: 'SUP-DL-LVH',
    supplierName: 'Đại lý Lê Văn Hùng',
    materialCode: 'PK-THUNGNHUA-012',
    materialName: 'Thùng nhựa tạm 10KG — Bao bì',
    plannedQty: 2000,
    uom: 'Cái',
    expectedDate: '2026-06-20',
    status: 'Đã nhập hết',
    relatedDocuments: [],
    plant: 'MA',
  },
  {
    id: 'PO-2026-00112',
    poNo: 'PO-2026-00112',
    supplierId: 'SUP-DL-PTQ',
    supplierName: 'Đại lý Phan Thị Quyên',
    materialCode: 'CH-SPX-015',
    materialName: 'Sopuroxid 15 — Hóa chất rửa',
    plannedQty: 500,
    uom: 'L',
    expectedDate: '2026-06-21',
    status: 'Đã quyết toán',
    relatedDocuments: [],
    plant: 'MA',
  },
];

// ============================================================
// QC INSPECTION
// ============================================================
export interface QCInspection {
  id: string;
  sourceType: 'RM_RECEIPT' | 'FG_RECEIVING' | 'BATCH' | 'WIP';
  sourceObjectId: string;
  materialCode: string;
  materialName: string;
  batchId: string;
  inspector: string;
  inspectorRole: string;
  result: 'Đạt' | 'Cần kiểm tra' | 'Không đạt' | 'QM Hold';
  gradeI: number;
  gradeII: number;
  reject: number;
  defectCodes: string[];
  note: string;
  images: { id: string; label: string; url: string }[];
  createdAt: string;
}

export const MOCK_QC_INSPECTIONS: QCInspection[] = [
  {
    id: 'QC-2026-0001',
    sourceType: 'RM_RECEIPT',
    sourceObjectId: 'RM-RCPT-001',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    batchId: 'RM-2026-MA-XOAI-162-001',
    inspector: 'Lê Văn Cường',
    inspectorRole: 'KCS/QM',
    result: 'Đạt',
    gradeI: 85,
    gradeII: 10,
    reject: 5,
    defectCodes: [],
    note: 'Màu sắc đẹp, độ chín đồng đều. Một số quả dập nhẹ.',
    images: [
      { id: 'qc-img-001', label: 'Ảnh kiểm tra lô', url: '/mock-img/qc-rm-001.jpg' },
      { id: 'qc-img-002', label: 'Ảnh cận cảnh mẫu', url: '/mock-img/qc-rm-002.jpg' },
    ],
    createdAt: '2026-06-16 09:30',
  },
  {
    id: 'QC-2026-0002',
    sourceType: 'RM_RECEIPT',
    sourceObjectId: 'RM-RCPT-002',
    materialCode: 'RM-XC-001',
    materialName: 'Xoài cát tươi nguyên liệu',
    batchId: 'RM-2026-BK-XOAI-163-001',
    inspector: 'Đinh Văn Khánh',
    inspectorRole: 'KCS/QM',
    result: 'Cần kiểm tra',
    gradeI: 88,
    gradeII: 8,
    reject: 4,
    defectCodes: ['DF-001'],
    note: 'Màu sắc không đồng đều, cần kiểm tra kỹ hơn. Một số quả chưa đạt độ chín.',
    images: [
      { id: 'qc-img-003', label: 'Ảnh lô nguyên liệu', url: '/mock-img/qc-rm-003.jpg' },
    ],
    createdAt: '2026-06-17 10:00',
  },
  {
    id: 'QC-2026-0003',
    sourceType: 'RM_RECEIPT',
    sourceObjectId: 'RM-RCPT-003',
    materialCode: 'RM-TL-001',
    materialName: 'Thanh long tươi nguyên liệu',
    batchId: 'RM-2026-MA-TL-164-001',
    inspector: 'Lê Văn Cường',
    inspectorRole: 'KCS/QM',
    result: 'Đạt',
    gradeI: 92,
    gradeII: 5,
    reject: 3,
    defectCodes: [],
    note: 'Thanh long ruột đỏ đẹp, đạt chuẩn xuất khẩu.',
    images: [],
    createdAt: '2026-06-18 11:00',
  },
];

// ============================================================
// MATERIAL ISSUE REQUEST (BM-NM-07)
// ============================================================
export interface MaterialIssueRequestItem {
  materialCode: string;
  materialName: string;
  requestedQty: number;
  issuedQty: number;
  uom: string;
  requiredLot: string;
}

export interface MaterialIssueRequest {
  id: string;
  formTemplateCode: string;
  productionOrderId: string;
  receiverName: string;
  department: string;
  items: MaterialIssueRequestItem[];
  purpose: string;
  status: 'Draft' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã cấp' | 'Hoàn tất' | 'Hủy';
  approver: string;
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  issueLinks: number[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_MATERIAL_ISSUE_REQUESTS: MaterialIssueRequest[] = [
  {
    id: 'MIR-2026-0001',
    formTemplateCode: 'BM-NM-07',
    productionOrderId: '10000456',
    receiverName: 'Nguyễn Văn An',
    department: 'Sản xuất',
    items: [
      { materialCode: 'RM-XC-001', materialName: 'Xoài cát nguyên liệu', requestedQty: 7725, issuedQty: 7500, uom: 'KG', requiredLot: '002210022' },
      { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15', requestedQty: 15, issuedQty: 15, uom: 'L', requiredLot: '005' },
      { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm', requestedQty: 606, issuedQty: 600, uom: 'Cái', requiredLot: '012' },
      { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm', requestedQty: 503, issuedQty: 500, uom: 'Cái', requiredLot: '012' },
    ],
    purpose: 'Cấp NVL cho PO 10000456 — Xoài IQF xí ngầu 1.5cm, KH 5,000 KG',
    status: 'Đã cấp',
    approver: 'Phạm Thị Dung',
    signatures: [
      { position: 'bottom-left', signedBy: 'Phạm Thị Dung', signedRole: 'Quản đốc/Tổ trưởng', signedAt: '2026-06-15 09:00' },
      { position: 'bottom-center', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-15 09:30' },
      { position: 'bottom-right', signedBy: 'Nguyễn Văn An', signedRole: 'Công nhân SX', signedAt: '2026-06-15 10:00' },
    ],
    issueLinks: [1, 2, 3],
    createdAt: '2026-06-15 08:00',
    updatedAt: '2026-06-15 10:00',
  },
  {
    id: 'MIR-2026-0002',
    formTemplateCode: 'BM-NM-07',
    productionOrderId: '10000461',
    receiverName: 'Lý Thị Hương',
    department: 'Sản xuất',
    items: [
      { materialCode: 'RM-MIT-001', materialName: 'Mít tươi nguyên liệu', requestedQty: 3744, issuedQty: 0, uom: 'KG', requiredLot: '002210026' },
      { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15', requestedQty: 7, issuedQty: 0, uom: 'L', requiredLot: '005' },
      { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm', requestedQty: 242, issuedQty: 0, uom: 'Cái', requiredLot: '012' },
    ],
    purpose: 'Cấp NVL cho PO 10000461 — Mít IQF nguyên múi, KH 2,400 KG',
    status: 'Chờ duyệt',
    approver: '',
    signatures: [],
    issueLinks: [1],
    createdAt: '2026-06-19 08:00',
    updatedAt: '2026-06-19 08:00',
  },
  {
    id: 'MIR-2026-0003',
    formTemplateCode: 'BM-NM-07',
    productionOrderId: '10000457',
    receiverName: 'Nguyễn Văn An',
    department: 'Sản xuất',
    items: [
      { materialCode: 'RM-TL-001', materialName: 'Thanh long nguyên liệu', requestedQty: 4968, issuedQty: 4800, uom: 'KG', requiredLot: '002210025' },
      { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15', requestedQty: 10, issuedQty: 10, uom: 'L', requiredLot: '005' },
    ],
    purpose: 'Cấp NVL cho PO 10000457 — Thanh long IQF cắt lát 2cm',
    status: 'Hoàn tất',
    approver: 'Phạm Thị Dung',
    signatures: [
      { position: 'bottom-left', signedBy: 'Phạm Thị Dung', signedRole: 'Quản đốc/Tổ trưởng', signedAt: '2026-06-16 07:00' },
      { position: 'bottom-center', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-16 08:00' },
    ],
    issueLinks: [1, 2, 3],
    createdAt: '2026-06-16 06:30',
    updatedAt: '2026-06-16 08:00',
  },
];

// ============================================================
// BTP REPORT
// ============================================================
export interface BTPReportItem {
  huCode: string;
  qtyKg: number;
  qtyCarton: number;
  grade: 'I' | 'II';
  status: 'Đã tạo' | 'Đã bàn giao' | 'Đã nhập kho tạm';
}

export interface BTPReport {
  id: string;
  productionOrderId: string;
  shift: string;
  sourceMaterialBatch: string;
  inputQtyKG: number;
  gradeIQty: number;
  gradeIIQty: number;
  rejectedQty: number;
  btpItems: BTPReportItem[];
  qaNote: string;
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  createdAt: string;
  plant: string;
}

export const MOCK_BTP_REPORTS: BTPReport[] = [
  {
    id: 'BTP-RPT-2026-0001',
    productionOrderId: '10000456',
    shift: 'Ca 1',
    sourceMaterialBatch: 'RM-2026-MA-XOAI-162-001',
    inputQtyKG: 7500,
    gradeIQty: 6500,
    gradeIIQty: 600,
    rejectedQty: 400,
    btpItems: [
      { huCode: 'HU-2026-MA-BTP-XOAI-0001', qtyKg: 3200, qtyCarton: 320, grade: 'I', status: 'Đã tạo' },
      { huCode: 'HU-2026-MA-BTP-XOAI-0002', qtyKg: 1600, qtyCarton: 160, grade: 'I', status: 'Đã bàn giao' },
      { huCode: 'HU-2026-MA-BTP-XOAI-0003', qtyKg: 1600, qtyCarton: 160, grade: 'II', status: 'Đã tạo' },
    ],
    qaNote: 'BTP Loại II có màu sắc hơi sậm, nhưng vẫn đạt tiêu chuẩn.',
    signatures: [
      { position: 'bottom-left', signedBy: 'Nguyễn Văn An', signedRole: 'Công nhân SX', signedAt: '2026-06-17 16:00' },
      { position: 'bottom-right', signedBy: 'Phạm Thị Dung', signedRole: 'Quản đốc', signedAt: '2026-06-17 16:30' },
    ],
    createdAt: '2026-06-17 16:00',
    plant: 'MA',
  },
];

// ============================================================
// FG CARTON REPORT
// ============================================================
export interface FGCartonReport {
  id: string;
  productionOrderId: string;
  productCode: string;
  productName: string;
  sourceMaterialBatch: string;
  inputQty: number;
  cartonQty: number;
  boxQty: number;
  lossQty: number;
  lossReason: string;
  qaConfirmation: 'OK' | 'Cần kiểm tra';
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  createdAt: string;
  plant: string;
}

export const MOCK_FG_CARTON_REPORTS: FGCartonReport[] = [
  {
    id: 'FG-CRT-2026-0001',
    productionOrderId: '10000456',
    productCode: 'TP0061',
    productName: 'Xoài đông IQF cắt xí ngầu 1.5cm',
    sourceMaterialBatch: 'RM-2026-MA-XOAI-162-001',
    inputQty: 4500,
    cartonQty: 450,
    boxQty: 4500,
    lossQty: 45,
    lossReason: 'LR-009',
    qaConfirmation: 'OK',
    signatures: [
      { position: 'bottom-left', signedBy: 'Nguyễn Văn An', signedRole: 'Công nhân SX', signedAt: '2026-06-17 18:00' },
      { position: 'bottom-center', signedBy: 'Lê Văn Cường', signedRole: 'KCS/QM', signedAt: '2026-06-17 18:15' },
      { position: 'bottom-right', signedBy: 'Phạm Thị Dung', signedRole: 'Quản đốc', signedAt: '2026-06-17 18:30' },
    ],
    createdAt: '2026-06-17 18:00',
    plant: 'MA',
  },
];

// ============================================================
// FG WAREHOUSE REQUEST (BM-NM-09)
// ============================================================
export interface FGWarehouseRequest {
  id: string;
  formTemplateCode: string;
  productionOrderId: string;
  productCode: string;
  productName: string;
  productBatch: string;
  warehouse: string;
  qtyKg: number;
  qtyCarton: number;
  note: string;
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  status: 'Draft' | 'Chờ ký' | 'Đã ký SX' | 'Đã ký Kho' | 'Hoàn tất';
  createdAt: string;
  updatedAt: string;
  exportPdfUrl: string;
}

export const MOCK_FG_WAREHOUSE_REQUESTS: FGWarehouseRequest[] = [
  {
    id: 'FGWR-2026-0001',
    formTemplateCode: 'BM-NM-09',
    productionOrderId: '10000456',
    productCode: 'TP0061',
    productName: 'Xoài đông IQF cắt xí ngầu 1.5cm',
    productBatch: '002216225',
    warehouse: 'KL-03',
    qtyKg: 4500,
    qtyCarton: 450,
    note: 'Lô sản xuất ngày 14-17/06/2026. Đạt QC, không có lỗi.',
    signatures: [
      { position: 'bottom-left', signedBy: 'Nguyễn Văn An', signedRole: 'Công nhân SX', signedAt: '2026-06-16 14:00' },
      { position: 'bottom-right', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-16 15:30' },
    ],
    status: 'Hoàn tất',
    createdAt: '2026-06-16 14:00',
    updatedAt: '2026-06-16 15:30',
    exportPdfUrl: '/mock-pdf/BM-NM-09-2026-0001.pdf',
  },
  {
    id: 'FGWR-2026-0002',
    formTemplateCode: 'BM-NM-09',
    productionOrderId: '10000460',
    productCode: 'TP0042',
    productName: 'Thanh long đông IQF cắt lát 2cm',
    productBatch: 'FG-2026-BK-0042-167-002',
    warehouse: 'KL-06',
    qtyKg: 3800,
    qtyCarton: 380,
    note: 'Lô sản xuất BK, đã xác nhận TP.',
    signatures: [],
    status: 'Chờ ký',
    createdAt: '2026-06-18 10:00',
    updatedAt: '2026-06-18 10:00',
    exportPdfUrl: '',
  },
];

// ============================================================
// TEMPORARY STOCK (BTP tồn kho tạm)
// ============================================================
export interface TemporaryStock {
  id: string;
  stockType: 'RM' | 'BTP' | 'FG';
  batchId: string;
  palletId: string;
  productCode: string;
  productName: string;
  qty: number;
  uom: string;
  warehouse: string;
  bin: string;
  status: 'Khả dụng' | 'Tạm giữ QC' | 'Blocked' | 'Đã chuyển';
  sourceProductionOrder: string;
  qcStatus: 'Chưa QC' | 'Đạt' | 'Cần kiểm' | 'Không đạt';
  createdAt: string;
  updatedAt: string;
}

export const MOCK_TEMPORARY_STOCKS: TemporaryStock[] = [
  {
    id: 'TMP-STK-001',
    stockType: 'BTP',
    batchId: 'RM-2026-MA-XOAI-162-001',
    palletId: 'HU-2026-MA-BTP-XOAI-0001',
    productCode: 'TP0061-BTP',
    productName: 'Xoài BTP xí ngầu 1.5cm',
    qty: 3200,
    uom: 'KG',
    warehouse: 'KL-01',
    bin: 'KL-01-A1-T1',
    status: 'Khả dụng',
    sourceProductionOrder: '10000456',
    qcStatus: 'Đạt',
    createdAt: '2026-06-17 16:00',
    updatedAt: '2026-06-17 16:00',
  },
  {
    id: 'TMP-STK-002',
    stockType: 'BTP',
    batchId: 'RM-2026-MA-XOAI-162-001',
    palletId: 'HU-2026-MA-BTP-XOAI-0002',
    productCode: 'TP0061-BTP',
    productName: 'Xoài BTP xí ngầu 1.5cm',
    qty: 1600,
    uom: 'KG',
    warehouse: 'KL-01',
    bin: 'KL-01-A1-T2',
    status: 'Khả dụng',
    sourceProductionOrder: '10000456',
    qcStatus: 'Đạt',
    createdAt: '2026-06-17 17:00',
    updatedAt: '2026-06-17 17:00',
  },
  {
    id: 'TMP-STK-003',
    stockType: 'BTP',
    batchId: 'RM-2026-MA-XOAI-162-001',
    palletId: 'HU-2026-MA-BTP-XOAI-0003',
    productCode: 'TP0061-BTP',
    productName: 'Xoài BTP xí ngầu 1.5cm (Loại II)',
    qty: 1600,
    uom: 'KG',
    warehouse: 'KL-01',
    bin: 'KL-01-A1-T3',
    status: 'Tạm giữ QC',
    sourceProductionOrder: '10000456',
    qcStatus: 'Cần kiểm',
    createdAt: '2026-06-17 17:30',
    updatedAt: '2026-06-17 18:00',
  },
  {
    id: 'TMP-STK-004',
    stockType: 'BTP',
    batchId: 'RM-2026-MA-TL-164-001',
    palletId: 'HU-2026-MA-BTP-TL-0005',
    productCode: 'TP0042-BTP',
    productName: 'Thanh long BTP cắt lát 2cm',
    qty: 1600,
    uom: 'KG',
    warehouse: 'KL-02',
    bin: 'KL-02-A2-T1',
    status: 'Khả dụng',
    sourceProductionOrder: '10000457',
    qcStatus: 'Đạt',
    createdAt: '2026-06-16 15:00',
    updatedAt: '2026-06-16 15:00',
  },
  {
    id: 'TMP-STK-005',
    stockType: 'BTP',
    batchId: 'RM-2026-BK-XOAI-163-001',
    palletId: 'HU-2026-BK-BTP-MIT-0004',
    productCode: 'TP0078-BTP',
    productName: 'Mít BTP nguyên múi',
    qty: 900,
    uom: 'KG',
    warehouse: '',
    bin: '',
    status: 'Khả dụng',
    sourceProductionOrder: '10000458',
    qcStatus: 'Chưa QC',
    createdAt: '2026-06-17 10:00',
    updatedAt: '2026-06-17 10:00',
  },
];

// ============================================================
// SYNC QUEUE ITEM (yêu cầu user xác nhận trước khi sync)
// ============================================================
export interface SyncQueueItem {
  id: string;
  sourceType: 'PUTAWAY' | 'QM_HOLD' | 'FG_RECEIVING' | 'FEFO_PICKING' | 'CYCLE_COUNT' | 'TRANSFER_ORDER' | 'RECEIVE_TRANSFER' | 'MATERIAL_ISSUE' | 'BTP_HANDOVER' | 'FG_WAREHOUSE_REQ';
  sourceId: string;
  localStatus: 'Local Saved' | 'Pending User Confirm' | 'Confirmed' | 'Sent to SAP' | 'SAP OK' | 'SAP Error' | 'Conflict';
  requiresUserConfirmBeforeSync: boolean;
  payload: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  lastSyncAttempt: string;
  syncResult: string;
}

// Add default function for hasUserConfirmed to make it always return true in mock
export function isSyncConfirmed(item: SyncQueueItem): boolean {
  return item.localStatus === 'Confirmed' || item.localStatus === 'Sent to SAP' || item.localStatus === 'SAP OK';
}