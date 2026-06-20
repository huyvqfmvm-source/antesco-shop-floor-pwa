// ============================================================
// FormTemplate & FormInstance — Lớp dữ liệu biểu mẫu nguồn
// ANTECO Shop Floor & Warehouse
// ============================================================

export interface FormTemplateField {
  fieldCode: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'signature' | 'photo' | 'table' | 'calculated';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  validationRule?: string;
  position: number;
}

export interface FormTemplate {
  id: string;
  code: string;
  name: string;
  version: string;
  issueDate: string;
  year: number;
  sourceFile: string;
  module: 'PRODUCTION' | 'INBOUND' | 'OUTBOUND' | 'QM' | 'WAREHOUSE' | 'ACCOUNTING' | 'TECHNICAL';
  description: string;
  fields: FormTemplateField[];
  requiredSignatures: { role: string; label: string; position: string }[];
  exportable: boolean;
  exportFormat: 'pdf' | 'excel' | 'both';
  copies: number;
}

export interface FormInstance {
  id: string;
  templateId: string;
  code: string;
  businessObjectType: string;
  businessObjectId: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Completed' | 'Cancelled' | 'Synced';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  attachments: { id: string; label: string; url: string; type: 'photo' | 'document' }[];
  exportPdfUrl: string;
  syncStatus: 'Local' | 'Pending Sync' | 'Synced' | 'Sync Failed';
  fieldValues: Record<string, unknown>;
}

// ============================================================
// 10 BIỂU MẪU CHUẨN ANTESCO
// ============================================================

export const MOCK_FORM_TEMPLATES: FormTemplate[] = [
  // 1. BM-NM-07 — Phiếu đề xuất cấp nhiên vật liệu
  {
    id: 'FT-BM-NM-07',
    code: 'BM-NM-07',
    name: 'Phiếu đề xuất cấp nhiên vật liệu',
    version: '3.0',
    issueDate: '2025-01-15',
    year: 2025,
    sourceFile: 'BM-NM-07_v3.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Dùng cho đề xuất cấp NVL/công cụ. Hỗ trợ nhiều liên (Liên 1: Kho, Liên 2: Bộ phận đề xuất, Liên 3: Kế toán).',
    fields: [
      { fieldCode: 'issueDate', fieldName: 'Ngày đề xuất', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh sản xuất', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'department', fieldName: 'Bộ phận đề xuất', fieldType: 'select', required: true, options: ['Sản xuất', 'Kho', 'Kỹ thuật', 'QM/KCS'], position: 3 },
      { fieldCode: 'receiverName', fieldName: 'Người nhận', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'purpose', fieldName: 'Mục đích sử dụng', fieldType: 'textarea', required: true, position: 5 },
      { fieldCode: 'items', fieldName: 'Danh sách vật tư', fieldType: 'table', required: true, position: 6 },
      { fieldCode: 'copyNumber', fieldName: 'Liên số', fieldType: 'select', required: true, options: ['1', '2', '3'], defaultValue: '1', position: 7 },
      { fieldCode: 'approverName', fieldName: 'Người duyệt', fieldType: 'text', required: true, position: 8 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 9 },
    ],
    requiredSignatures: [
      { role: 'quan-doc', label: 'Người duyệt (Quản đốc/Tổ trưởng)', position: 'bottom-left' },
      { role: 'thu-kho', label: 'Người cấp (Thủ kho)', position: 'bottom-center' },
      { role: 'cong-nhan-san-xuat', label: 'Người nhận (Bộ phận đề xuất)', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 3,
  },

  // 2. BM-NM-09 — Phiếu yêu cầu nhập kho thành phẩm (bản Excel 2025)
  {
    id: 'FT-BM-NM-09',
    code: 'BM-NM-09',
    name: 'Phiếu yêu cầu nhập kho thành phẩm',
    version: '4.0',
    issueDate: '2025-03-01',
    year: 2025,
    sourceFile: 'BM-NM-09_v4.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Dùng bản Excel 2025. Yêu cầu nhập kho thành phẩm sau khi hoàn tất sản xuất. Cần chữ ký bộ phận SX và Kho.',
    fields: [
      { fieldCode: 'requestDate', fieldName: 'Ngày yêu cầu', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh sản xuất', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'productCode', fieldName: 'Mã sản phẩm', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'productName', fieldName: 'Tên sản phẩm', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'productBatch', fieldName: 'Số lô sản xuất', fieldType: 'text', required: true, position: 5 },
      { fieldCode: 'warehouse', fieldName: 'Kho nhập', fieldType: 'select', required: true, options: ['KL-01', 'KL-02', 'KL-03', 'KL-04', 'KL-05', 'KL-06', 'KL-07', 'KL-08'], position: 6 },
      { fieldCode: 'qtyKg', fieldName: 'Khối lượng (KG)', fieldType: 'number', required: true, validationRule: 'min:0', position: 7 },
      { fieldCode: 'qtyCarton', fieldName: 'Số thùng', fieldType: 'number', required: true, validationRule: 'min:0,integer', position: 8 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 9 },
    ],
    requiredSignatures: [
      { role: 'cong-nhan-san-xuat', label: 'Bộ phận sản xuất', position: 'bottom-left' },
      { role: 'quan-doc', label: 'Quản đốc/Tổ trưởng xác nhận', position: 'bottom-center' },
      { role: 'thu-kho', label: 'Bộ phận kho', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'both',
    copies: 2,
  },

  // 3. Phiếu nhập kho
  {
    id: 'FT-PNK-01',
    code: 'PNK-01',
    name: 'Phiếu nhập kho',
    version: '2.0',
    issueDate: '2024-06-01',
    year: 2024,
    sourceFile: 'PNK-01_v2.0_2024.docx',
    module: 'INBOUND',
    description: 'Phiếu nhập kho điện tử cho nguyên liệu và thành phẩm. Có hiển thị đơn giá/thành tiền nếu dữ liệu có. Thủ kho được phép xem giá.',
    fields: [
      { fieldCode: 'receiptDate', fieldName: 'Ngày nhập', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'receiptNo', fieldName: 'Số phiếu nhập', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'poNumber', fieldName: 'Số PO tham chiếu', fieldType: 'text', required: false, position: 3 },
      { fieldCode: 'supplierName', fieldName: 'Nhà cung cấp', fieldType: 'text', required: false, position: 4 },
      { fieldCode: 'warehouse', fieldName: 'Kho nhập', fieldType: 'select', required: true, options: ['KL-01', 'KL-02', 'KL-03', 'KL-04', 'KL-05', 'KL-06', 'KL-07', 'KL-08', 'KM-01', 'KM-02', 'KM-03', 'NL-01'], position: 5 },
      { fieldCode: 'items', fieldName: 'Danh sách hàng nhập', fieldType: 'table', required: true, position: 6 },
      { fieldCode: 'totalAmount', fieldName: 'Tổng tiền (VNĐ)', fieldType: 'number', required: false, position: 7 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 8 },
    ],
    requiredSignatures: [
      { role: 'thu-kho', label: 'Người nhập kho', position: 'bottom-left' },
      { role: 'ke-toan-kho', label: 'Kế toán kho xác nhận', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 2,
  },

  // 4. BM Kiểm thu nguyên liệu
  {
    id: 'FT-BM-KTNL-01',
    code: 'BM-KTNL-01',
    name: 'Biểu mẫu kiểm thu nguyên liệu',
    version: '3.0',
    issueDate: '2025-04-01',
    year: 2025,
    sourceFile: 'BM-KTNL-01_v3.0_2025.xlsx',
    module: 'QM',
    description: 'Dùng cho QC đầu vào. QC ghi nhận theo thực tế, không bắt buộc tổng tỷ lệ = 100%. Nếu phát sinh lỗi, bắt buộc ghi chú/ảnh.',
    fields: [
      { fieldCode: 'inspectionDate', fieldName: 'Ngày kiểm', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'receiptId', fieldName: 'Mã phiếu nhập', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'supplierName', fieldName: 'Nhà cung cấp', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'materialCode', fieldName: 'Mã nguyên liệu', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'materialName', fieldName: 'Tên nguyên liệu', fieldType: 'text', required: true, position: 5 },
      { fieldCode: 'batchRm', fieldName: 'Số lô nguyên liệu', fieldType: 'text', required: true, position: 6 },
      { fieldCode: 'netWeight', fieldName: 'Khối lượng tịnh (KG)', fieldType: 'number', required: true, position: 7 },
      { fieldCode: 'gradeI', fieldName: 'Loại I (%)', fieldType: 'number', required: false, position: 8 },
      { fieldCode: 'gradeII', fieldName: 'Loại II (%)', fieldType: 'number', required: false, position: 9 },
      { fieldCode: 'reject', fieldName: 'Loại bỏ (%)', fieldType: 'number', required: false, position: 10 },
      { fieldCode: 'qcResult', fieldName: 'Kết quả QC', fieldType: 'select', required: true, options: ['Đạt', 'Cần kiểm tra', 'Không đạt', 'QM Hold'], position: 11 },
      { fieldCode: 'defectCodes', fieldName: 'Mã lỗi (nếu có)', fieldType: 'text', required: false, position: 12 },
      { fieldCode: 'inspectorName', fieldName: 'Người kiểm', fieldType: 'text', required: true, position: 13 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 14 },
    ],
    requiredSignatures: [
      { role: 'kcs-qm', label: 'QC/KCS kiểm tra', position: 'bottom-left' },
      { role: 'thu-kho', label: 'Thủ kho xác nhận', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 1,
  },

  // 5. KH Sản xuất ngày/tuần/tháng
  {
    id: 'FT-KHSX-01',
    code: 'KH-SX-01',
    name: 'Kế hoạch sản xuất',
    version: '2.0',
    issueDate: '2025-01-01',
    year: 2025,
    sourceFile: 'KH-SX-01_v2.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Dùng làm nguồn tạo/kết nối Production Order mock. Map sản phẩm, ngày, ca, sản lượng kế hoạch, nhà máy.',
    fields: [
      { fieldCode: 'planDate', fieldName: 'Ngày sản xuất', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'shift', fieldName: 'Ca', fieldType: 'select', required: true, options: ['Ca 1', 'Ca 2', 'Ca lỡ'], position: 2 },
      { fieldCode: 'productCode', fieldName: 'Mã sản phẩm', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'productName', fieldName: 'Tên sản phẩm', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'plant', fieldName: 'Nhà máy', fieldType: 'select', required: true, options: ['MA', 'BK'], position: 5 },
      { fieldCode: 'plannedQty', fieldName: 'Sản lượng kế hoạch (KG)', fieldType: 'number', required: true, position: 6 },
      { fieldCode: 'line', fieldName: 'Chuyền', fieldType: 'text', required: false, position: 7 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 8 },
    ],
    requiredSignatures: [
      { role: 'quan-doc', label: 'Quản đốc/Tổ trưởng lập', position: 'bottom-left' },
    ],
    exportable: true,
    exportFormat: 'excel',
    copies: 1,
  },

  // 6. Định mức NVL hàng lạnh năm 2026 - QĐ01B
  {
    id: 'FT-DM-NVL-2026',
    code: 'QĐ01B-DM-NVL-2026',
    name: 'Định mức nguyên vật liệu hàng lạnh 2026',
    version: '1.0',
    issueDate: '2026-01-01',
    year: 2026,
    sourceFile: 'QD01B_DM-NVL-2026.xlsx',
    module: 'PRODUCTION',
    description: 'BOM/định mức nguyên vật liệu cho sản phẩm đông lạnh. Dùng để tính số lượng NVL cần cấp theo Production Order.',
    fields: [
      { fieldCode: 'productCode', fieldName: 'Mã sản phẩm', fieldType: 'text', required: true, position: 1 },
      { fieldCode: 'productName', fieldName: 'Tên sản phẩm', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'materialCode', fieldName: 'Mã vật tư', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'materialName', fieldName: 'Tên vật tư', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'standardQty', fieldName: 'Định mức (trên 1 KG TP)', fieldType: 'number', required: true, position: 5 },
      { fieldCode: 'uom', fieldName: 'Đơn vị tính', fieldType: 'select', required: true, options: ['KG', 'L', 'Cái', 'Túi', 'Thùng'], position: 6 },
      { fieldCode: 'lossRate', fieldName: 'Tỷ lệ hao hụt (%)', fieldType: 'number', required: true, position: 7 },
      { fieldCode: 'category', fieldName: 'Nhóm', fieldType: 'select', required: true, options: ['Nguyên liệu chính', 'Hóa chất', 'Bao bì'], position: 8 },
    ],
    requiredSignatures: [],
    exportable: true,
    exportFormat: 'excel',
    copies: 1,
  },

  // 7. Báo cáo bán thành phẩm (BTP)
  {
    id: 'FT-BC-BTP-01',
    code: 'BC-BTP-01',
    name: 'Báo cáo bán thành phẩm',
    version: '2.0',
    issueDate: '2025-02-01',
    year: 2025,
    sourceFile: 'BC-BTP-01_v2.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Báo cáo BTP theo ca sản xuất. Quản lý tồn BTP như tồn kho tạm.',
    fields: [
      { fieldCode: 'reportDate', fieldName: 'Ngày báo cáo', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh SX', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'shift', fieldName: 'Ca', fieldType: 'select', required: true, options: ['Ca 1', 'Ca 2', 'Ca lỡ'], position: 3 },
      { fieldCode: 'sourceMaterialBatch', fieldName: 'Lô nguyên liệu nguồn', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'inputQty', fieldName: 'KL đầu vào (KG)', fieldType: 'number', required: true, position: 5 },
      { fieldCode: 'gradeIQty', fieldName: 'Loại I (KG)', fieldType: 'number', required: true, position: 6 },
      { fieldCode: 'gradeIIQty', fieldName: 'Loại II (KG)', fieldType: 'number', required: false, position: 7 },
      { fieldCode: 'rejectedQty', fieldName: 'Phế phẩm (KG)', fieldType: 'number', required: false, position: 8 },
      { fieldCode: 'btpItems', fieldName: 'Danh sách pallet BTP', fieldType: 'table', required: true, position: 9 },
      { fieldCode: 'qaNote', fieldName: 'Ghi chú QA', fieldType: 'textarea', required: false, position: 10 },
    ],
    requiredSignatures: [
      { role: 'cong-nhan-san-xuat', label: 'Người lập báo cáo', position: 'bottom-left' },
      { role: 'quan-doc', label: 'Quản đốc xác nhận', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 1,
  },

  // 8. Phiếu giao nhận BTP
  {
    id: 'FT-PGN-BTP-01',
    code: 'PGN-BTP-01',
    name: 'Phiếu giao nhận bán thành phẩm',
    version: '2.0',
    issueDate: '2025-02-01',
    year: 2025,
    sourceFile: 'PGN-BTP-01_v2.0_2025.docx',
    module: 'PRODUCTION',
    description: 'Dùng cho bàn giao BTP giữa các công đoạn. Bắt buộc có chữ ký điện tử dạng ký tay trên màn hình của bên giao và bên nhận.',
    fields: [
      { fieldCode: 'handoverDate', fieldName: 'Ngày bàn giao', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'fromOperation', fieldName: 'Công đoạn giao', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'toOperation', fieldName: 'Công đoạn nhận', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh SX', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'btpPallets', fieldName: 'Danh sách pallet BTP', fieldType: 'table', required: true, position: 5 },
      { fieldCode: 'totalQty', fieldName: 'Tổng KL bàn giao (KG)', fieldType: 'number', required: true, position: 6 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 7 },
    ],
    requiredSignatures: [
      { role: 'cong-nhan-san-xuat', label: 'Bên giao (Sản xuất)', position: 'bottom-left' },
      { role: 'cong-nhan-san-xuat', label: 'Bên nhận (Sản xuất)', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 2,
  },

  // 9. Báo cáo đóng thùng thành phẩm lon
  {
    id: 'FT-BC-DTTP-01',
    code: 'BC-DTTP-01',
    name: 'Báo cáo đóng thùng thành phẩm',
    version: '2.0',
    issueDate: '2025-03-15',
    year: 2025,
    sourceFile: 'BC-DTTP-01_v2.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Ghi nhận số lượng, số thùng, lô nguyên liệu, hao hụt khi đóng thùng thành phẩm.',
    fields: [
      { fieldCode: 'reportDate', fieldName: 'Ngày báo cáo', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh SX', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'productCode', fieldName: 'Mã sản phẩm', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'productName', fieldName: 'Tên sản phẩm', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'sourceMaterialBatch', fieldName: 'Lô nguyên liệu nguồn', fieldType: 'text', required: true, position: 5 },
      { fieldCode: 'inputQty', fieldName: 'KL đầu vào (KG)', fieldType: 'number', required: true, position: 6 },
      { fieldCode: 'cartonQty', fieldName: 'Số thùng', fieldType: 'number', required: true, validationRule: 'min:0,integer', position: 7 },
      { fieldCode: 'boxQty', fieldName: 'Số hộp/thùng', fieldType: 'number', required: false, position: 8 },
      { fieldCode: 'lossQty', fieldName: 'Hao hụt (KG)', fieldType: 'number', required: false, position: 9 },
      { fieldCode: 'lossReason', fieldName: 'Lý do hao hụt', fieldType: 'select', required: false, options: [], position: 10 },
      { fieldCode: 'qaConfirmation', fieldName: 'QA xác nhận', fieldType: 'select', required: true, options: ['OK', 'Cần kiểm tra'], position: 11 },
    ],
    requiredSignatures: [
      { role: 'cong-nhan-san-xuat', label: 'Người đóng thùng', position: 'bottom-left' },
      { role: 'kcs-qm', label: 'QA xác nhận', position: 'bottom-center' },
      { role: 'quan-doc', label: 'Quản đốc duyệt', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'pdf',
    copies: 1,
  },

  // 10. Phiếu yêu cầu nhập kho thành phẩm (dùng BM-NM-09)
  // Note: BM-NM-09 is already template #2 above. This entry confirms its usage context.
  {
    id: 'FT-FG-WH-REQ',
    code: 'BM-NM-09-EXCEL',
    name: 'Phiếu yêu cầu nhập kho thành phẩm (Excel)',
    version: '4.0',
    issueDate: '2025-03-01',
    year: 2025,
    sourceFile: 'BM-NM-09_v4.0_2025.xlsx',
    module: 'PRODUCTION',
    description: 'Bản Excel 2025 của BM-NM-09. Dùng cho màn Yêu cầu nhập kho thành phẩm. Cần chữ ký bộ phận SX và Kho.',
    fields: [
      { fieldCode: 'requestDate', fieldName: 'Ngày yêu cầu', fieldType: 'date', required: true, position: 1 },
      { fieldCode: 'productionOrderId', fieldName: 'Mã lệnh SX', fieldType: 'text', required: true, position: 2 },
      { fieldCode: 'productCode', fieldName: 'Mã sản phẩm', fieldType: 'text', required: true, position: 3 },
      { fieldCode: 'productName', fieldName: 'Tên sản phẩm', fieldType: 'text', required: true, position: 4 },
      { fieldCode: 'productBatch', fieldName: 'Số lô', fieldType: 'text', required: true, position: 5 },
      { fieldCode: 'warehouse', fieldName: 'Kho nhập', fieldType: 'select', required: true, options: ['KL-01', 'KL-02', 'KL-03', 'KL-04', 'KL-05', 'KL-06', 'KL-07', 'KL-08'], position: 6 },
      { fieldCode: 'qtyKg', fieldName: 'KL (KG)', fieldType: 'number', required: true, position: 7 },
      { fieldCode: 'qtyCarton', fieldName: 'Số thùng', fieldType: 'number', required: true, position: 8 },
      { fieldCode: 'note', fieldName: 'Ghi chú', fieldType: 'textarea', required: false, position: 9 },
    ],
    requiredSignatures: [
      { role: 'cong-nhan-san-xuat', label: 'Bộ phận sản xuất', position: 'bottom-left' },
      { role: 'thu-kho', label: 'Bộ phận kho', position: 'bottom-right' },
    ],
    exportable: true,
    exportFormat: 'both',
    copies: 2,
  },
];

// MOCK FORM INSTANCES — các bản ghi biểu mẫu đã tạo
export const MOCK_FORM_INSTANCES: FormInstance[] = [
  {
    id: 'FI-2026-0001',
    templateId: 'FT-BM-NM-07',
    code: 'BM-NM-07-2026-0001',
    businessObjectType: 'MaterialIssueRequest',
    businessObjectId: 'MIR-2026-0001',
    status: 'Approved',
    createdBy: 'Phạm Thị Dung',
    createdAt: '2026-06-15 08:00',
    updatedAt: '2026-06-15 09:30',
    signatures: [
      { position: 'bottom-left', signedBy: 'Phạm Thị Dung', signedRole: 'Quản đốc/Tổ trưởng', signedAt: '2026-06-15 09:00' },
      { position: 'bottom-center', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-15 09:30' },
    ],
    attachments: [],
    exportPdfUrl: '/mock-pdf/BM-NM-07-2026-0001.pdf',
    syncStatus: 'Synced',
    fieldValues: { productionOrderId: '10000456', department: 'Sản xuất', copyNumber: '1' },
  },
  {
    id: 'FI-2026-0002',
    templateId: 'FT-PNK-01',
    code: 'PNK-2026-0001',
    businessObjectType: 'RawMaterialReceipt',
    businessObjectId: 'RM-RCPT-001',
    status: 'Completed',
    createdBy: 'Trần Thị Bình',
    createdAt: '2026-06-16 09:00',
    updatedAt: '2026-06-16 10:00',
    signatures: [
      { position: 'bottom-left', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-16 10:00' },
      { position: 'bottom-right', signedBy: 'Ngô Thị Phương', signedRole: 'Kế toán kho', signedAt: '2026-06-16 10:15' },
    ],
    attachments: [
      { id: 'att-001', label: 'Ảnh phiếu cân', url: '/mock-img/weigh-slip-001.jpg', type: 'photo' },
      { id: 'att-002', label: 'Ảnh biển số xe', url: '/mock-img/plate-001.jpg', type: 'photo' },
    ],
    exportPdfUrl: '/mock-pdf/PNK-2026-0001.pdf',
    syncStatus: 'Synced',
    fieldValues: { receiptNo: 'PNK-2026-0001', poNumber: 'PO-2026-00089', totalAmount: 335200000 },
  },
  {
    id: 'FI-2026-0003',
    templateId: 'FT-BM-NM-09',
    code: 'BM-NM-09-2026-0001',
    businessObjectType: 'FGWarehouseRequest',
    businessObjectId: 'FGWR-2026-0001',
    status: 'Completed',
    createdBy: 'Nguyễn Văn An',
    createdAt: '2026-06-16 14:00',
    updatedAt: '2026-06-16 15:30',
    signatures: [
      { position: 'bottom-left', signedBy: 'Nguyễn Văn An', signedRole: 'Công nhân sản xuất', signedAt: '2026-06-16 14:00' },
      { position: 'bottom-right', signedBy: 'Trần Thị Bình', signedRole: 'Thủ kho', signedAt: '2026-06-16 15:30' },
    ],
    attachments: [],
    exportPdfUrl: '/mock-pdf/BM-NM-09-2026-0001.pdf',
    syncStatus: 'Synced',
    fieldValues: { productionOrderId: '10000456', productCode: 'TP0061', productBatch: '002216225', warehouse: 'KL-03', qtyKg: 4500, qtyCarton: 450 },
  },
];