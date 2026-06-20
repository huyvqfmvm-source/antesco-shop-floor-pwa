import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type Dispatch, type ReactNode } from 'react';
import {
  MOCK_ROLES,
  MOCK_PLANTS,
  MOCK_SHIFTS,
  MOCK_PRODUCTION_ORDERS,
  MOCK_BATCHES,
  MOCK_HANDLING_UNITS,
  MOCK_BINS,
  MOCK_WAREHOUSES,
  MOCK_TRANSFER_ORDERS,
  MOCK_OUTBOUND_DELIVERIES,
  MOCK_QUALITY_HOLDS,
  MOCK_ACTIVITY_LOGS,
  MOCK_EXTENDED_USERS,
  MOCK_RM_RECEIPTS,
  MOCK_CYCLE_COUNTS,
  MOCK_DEFECT_CODES,
  MOCK_FORM_TEMPLATES,
  MOCK_FORM_INSTANCES,
  MOCK_PURCHASE_ORDERS,
  MOCK_QC_INSPECTIONS,
  MOCK_MATERIAL_ISSUE_REQUESTS,
  MOCK_BTP_REPORTS,
  MOCK_FG_CARTON_REPORTS,
  MOCK_FG_WAREHOUSE_REQUESTS,
  MOCK_TEMPORARY_STOCKS,
} from '@/mocks/extended';
import type {
  MockUser,
  FormTemplate,
  FormInstance,
  PurchaseOrder,
  QCInspection,
  MaterialIssueRequest,
  BTPReport,
  FGCartonReport,
  FGWarehouseRequest,
  TemporaryStock,
} from '@/mocks/extended';

export interface Role { id: string; name: string; }
export interface Plant { id: string; name: string; code: string; }
export interface Shift { id: string; name: string; time: string; }
export interface ProductionOrder {
  id: string; productCode: string; productName: string; plannedQty: number; unit: string;
  plant: string; shift: string; status: string; startDate: string; dueDate: string;
  batchFg: string; huFg: string; huBtp: string;
  wipQty?: number; fgQty?: number; scrapQty?: number; scrapReason?: string; currentOperation?: string;
}
export interface Batch {
  id: string; product: string; qty: number; unit: string; plant: string; status: string; productionOrder: string;
}
export interface HandlingUnit {
  id: string; type: string; product: string; qty: number; unit: string; location: string; plant: string; status: string;
}
export interface Bin {
  id: string; warehouse: string; row: string; tier: string; position: string; plant: string; status: string;
}
export interface Warehouse {
  id: string; name: string; type: string; plant: string; temp: string;
}
export interface TransferOrder {
  id: string; fromPlant: string; fromWarehouse: string; toPlant: string; toWarehouse: string;
  items: { product: string; qty: number; unit: string; hu: string }[];
  status: string; createdDate: string;
}
export interface OutboundDelivery {
  id: string; customer: string; plant: string; container: string; seal: string;
  items: { product: string; qty: number; unit: string; batch: string }[];
  status: string; shipDate: string;
}
export interface QualityHold {
  id: string; batch: string; reason: string; plant: string; status: string; createdDate: string;
}
export interface ActivityLog {
  id: string; timestamp: string; user: string; role: string; action: string; detail: string; plant: string;
  beforeStatus?: string; afterStatus?: string; note?: string;
}
export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}
export interface OfflineQueueItem {
  queueId: string;
  type: 'PUTAWAY' | 'QM_HOLD' | 'FG_RECEIVING' | 'FEFO_PICKING' | 'CYCLE_COUNT' | 'TRANSFER_ORDER' | 'RECEIVE_TRANSFER';
  user: string;
  role: string;
  plant: string;
  shift: string;
  huId?: string;
  batchId?: string;
  binId?: string;
  odId?: string;
  transferId?: string;
  defectCode?: string;
  photos?: string[];
  reason?: string;
  quantity?: number;
  unit?: string;
  additionalData?: Record<string, unknown>;
  createdAt: string;
  status: 'Local Saved' | 'Pending User Confirm' | 'Ready To Sync' | 'Pending Sync' | 'Syncing' | 'Synced' | 'Sync Failed' | 'Conflict' | 'Cancelled';
  retryCount: number;
  mockMovement: string;
  maxHoldHours: number;
}
export interface ErrorQueueItem {
  id: string;
  transactionCode: string;
  type: string;
  user: string;
  role: string;
  createdAt: string;
  originalData: Record<string, unknown>;
  errorMessage: string;
  errorReasonVi: string;
  status: 'Pending' | 'Resolved' | 'Cancelled' | 'Need Review' | 'Conflict';
  resolvedBy?: string;
  resolution?: string;
  resolutionTime?: string;
  history: { timestamp: string; action: string; user: string }[];
}
export interface BomItem {
  materialCode: string;
  materialName: string;
  requiredLot: string;
  requiredQty: number;
  unit: string;
  category: 'raw' | 'chemical' | 'packaging';
}
export interface Operation {
  code: string;
  name: string;
  seq: number;
}
export interface RawMaterialReceipt {
  id: string;
  poNumber: string;
  supplier: string;
  licensePlate: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  gradeI: number;
  gradeII: number;
  reject: number;
  batchRm: string;
  qcStatus: string;
  plant: string;
  status: string;
  createdDate: string;
}
export interface CycleCount {
  id: string;
  bin: string;
  plant: string;
  expectedPallets: number;
  actualPallets: number;
  expectedQty: number;
  actualQty: number;
  unit: string;
  status: string;
  countedBy: string;
  note: string;
  imageCount: number;
  createdDate: string;
}

export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'error';

// Mock SAP error responses for Error Queue
export const MOCK_SAP_ERRORS: ErrorQueueItem[] = [
  {
    id: 'err-sap-001',
    transactionCode: 'MIGO-311-001',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-16 10:45',
    originalData: { huId: 'HU-2026-MA-FG-XN-0006', binId: 'KL-03-B2-T3', qty: 500 },
    errorMessage: 'Tồn kho không đủ — ô kệ đã đầy',
    errorReasonVi: 'Tồn kho không đủ. Ô kệ KL-03-B2-T3 đã đạt công suất tối đa (5 pallet/ô).',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 10:45', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-002',
    transactionCode: 'MIGO-311-002',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-16 11:20',
    originalData: { huId: 'HU-2026-MA-FG-XN-0007', binId: 'KL-01-B2-T3', qty: 3000 },
    errorMessage: 'Pallet đã được xử lý bởi giao dịch khác',
    errorReasonVi: 'Dữ liệu cần xác minh. Giao dịch khác đã xử lý pallet này trước (MIGO-311-001 lúc 10:45). Vui lòng kiểm tra lịch sử trước khi gửi lại.',
    status: 'Need Review',
    history: [
      { timestamp: '2026-06-16 11:20', action: 'Tạo lỗi', user: 'Hệ thống' },
      { timestamp: '2026-06-16 10:45', action: 'Xử lý trước bởi MIGO-311-001', user: 'Trần Thị Bình' },
    ],
  },
  {
    id: 'err-sap-003',
    transactionCode: 'MIGO-344-001',
    type: 'QM_HOLD',
    user: 'Lê Văn Cường',
    role: 'KCS/QM',
    createdAt: '2026-06-16 09:30',
    originalData: { batchId: '002216225', defectCode: 'DF-005', reason: 'Rách bao bì' },
    errorMessage: 'Batch đã bị khóa QC bởi giao dịch khác',
    errorReasonVi: 'Batch 002216225 đã bị khóa bởi QH-2026-0042 lúc 14:15. Không thể khóa trùng lặp.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 09:30', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-004',
    transactionCode: 'MIGO-311-003',
    type: 'PUTAWAY',
    user: 'Nguyễn Văn An',
    role: 'Công nhân sản xuất',
    createdAt: '2026-06-16 12:05',
    originalData: { huId: 'HU-2026-MA-FG-XN-0008', binId: 'KL-99-Z9-T9', qty: 3000 },
    errorMessage: 'Ô kệ không hợp lệ',
    errorReasonVi: 'Ô kệ KL-99-Z9-T9 không tồn tại trong hệ thống SAP. Vui lòng kiểm tra lại mã QR.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 12:05', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-005',
    transactionCode: 'MIGO-311-004',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-16 13:15',
    originalData: { huId: 'HU-2026-MA-FG-XN-0009', binId: 'KL-03-A1-T1', qty: 5000 },
    errorMessage: 'Số lượng vượt tồn — HU khai 5000 KG, thực tế 2000 KG',
    errorReasonVi: 'Số lượng thực tế của pallet không khớp với khai báo. HU-2026-MA-FG-XN-0009 khai 5000 KG nhưng tồn thực tế chỉ 2000 KG.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 13:15', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-006',
    transactionCode: 'MIGO-311-005',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-16 14:00',
    originalData: { huId: 'HU-2026-MA-FG-XN-0005', binId: 'KL-03-B2-T3', qty: 4500 },
    errorMessage: 'Trùng giao dịch — pallet đã được putaway trước đó',
    errorReasonVi: 'Pallet HU-2026-MA-FG-XN-0005 đã được xếp vào KL-03-B2-T3 lúc 13:50. Giao dịch trùng lặp.',
    status: 'Need Review',
    history: [
      { timestamp: '2026-06-16 14:00', action: 'Tạo lỗi', user: 'Hệ thống' },
      { timestamp: '2026-06-16 13:50', action: 'Đã putaway trước', user: 'Trần Thị Bình' },
    ],
  },
  {
    id: 'err-sap-007',
    transactionCode: 'MIGO-344-002',
    type: 'QM_HOLD',
    user: 'Lê Văn Cường',
    role: 'KCS/QM',
    createdAt: '2026-06-16 14:30',
    originalData: { batchId: '002216228', defectCode: 'DF-002', reason: 'Xoài dập úng' },
    errorMessage: 'Thiếu ảnh bằng chứng — yêu cầu tối thiểu 2 ảnh',
    errorReasonVi: 'Giao dịch QM Hold thiếu ảnh bằng chứng. Hệ thống SAP yêu cầu tối thiểu 2 ảnh cho mỗi lần khóa lô.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 14:30', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-008',
    transactionCode: 'MIGO-344-003',
    type: 'QM_HOLD',
    user: 'Lê Văn Cường',
    role: 'KCS/QM',
    createdAt: '2026-06-16 15:00',
    originalData: { batchId: '002216226', defectCode: '', reason: '' },
    errorMessage: 'Thiếu lý do override / thiếu mã DF',
    errorReasonVi: 'QM Hold không có mã lỗi DF. Vui lòng chọn mã lỗi hợp lệ (DF-001 đến DF-010) trước khi gửi.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 15:00', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-009',
    transactionCode: 'MIGO-311-006',
    type: 'PUTAWAY',
    user: 'Hoàng Văn Em',
    role: 'Kỹ thuật',
    createdAt: '2026-06-16 15:30',
    originalData: { huId: 'HU-2026-MA-FG-XN-0005', binId: 'KL-03-B2-T3', qty: 500 },
    errorMessage: 'Lỗi quyền người dùng — Kỹ thuật không có quyền Putaway',
    errorReasonVi: 'Vai trò Kỹ thuật không được phép thực hiện nghiệp vụ Putaway. Chỉ Thủ kho, Quản đốc, hoặc Admin mới có quyền này.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 15:30', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-010',
    transactionCode: 'MIGO-311-007',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-16 16:00',
    originalData: { huId: 'HU-2026-MA-FG-XN-0006', binId: 'KL-03-B2-T3', qty: 500 },
    errorMessage: 'SAP timeout — không phản hồi sau 30s',
    errorReasonVi: 'Hệ thống SAP không phản hồi sau 30 giây. Có thể do mạng chập chờn hoặc SAP server quá tải. Vui lòng thử lại.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-16 16:00', action: 'Tạo lỗi', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-011',
    transactionCode: 'MIGO-201-FEFO-001',
    type: 'FEFO_PICKING',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-17 08:15',
    originalData: { huId: 'HU-2026-MA-FG-TL-0008', odId: 'OD-2026-0098', batchId: '002216226' },
    errorMessage: 'Sai FEFO — lô 002216226 không phải lô cần xuất trước',
    errorReasonVi: 'Hệ thống SAP xác định lô 002216225 hết hạn trước và cần được xuất trước. Lô 002216226 vẫn còn hạn dài hơn. Vui lòng chọn đúng lô FEFO hoặc yêu cầu Quản đốc override.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-17 08:15', action: 'Tạo lỗi FEFO', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-012',
    transactionCode: 'MIGO-201-FEFO-002',
    type: 'FEFO_PICKING',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-17 09:00',
    originalData: { huId: 'HU-2026-MA-FG-XN-0005', odId: 'OD-2026-0108', batchId: '002216228' },
    errorMessage: 'Pallet bị QM Hold — không thể picking',
    errorReasonVi: 'Lô 002216228 đang bị QM Hold (QH-2026-0045: Rách bao bì DF-005). Tuyệt đối không được picking pallet từ lô bị khóa QC. Vui lòng liên hệ KCS/QM để mở khóa hoặc loại bỏ khỏi OD.',
    status: 'Need Review',
    history: [
      { timestamp: '2026-06-17 09:00', action: 'Tạo lỗi QM Hold', user: 'Hệ thống' },
      { timestamp: '2026-06-15 10:00', action: 'QM Hold QH-2026-0045', user: 'Lê Văn Cường' },
    ],
  },
  {
    id: 'err-sap-013',
    transactionCode: 'MIGO-311-BIN-001',
    type: 'PUTAWAY',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-17 10:30',
    originalData: { huId: 'HU-2026-MA-FG-XN-0007', binId: 'KL-01-A1-T2', qty: 3000 },
    errorMessage: 'Sai bin — pallet đã được putaway vào bin khác',
    errorReasonVi: 'Pallet HU-2026-MA-FG-XN-0007 đã tồn tại trong bin KL-01-A1-T1. Không thể putaway vào KL-01-A1-T2 vì trùng vị trí. Conflict bin location.',
    status: 'Conflict',
    history: [
      { timestamp: '2026-06-17 10:30', action: 'Tạo lỗi Conflict Bin', user: 'Hệ thống' },
      { timestamp: '2026-06-16 14:00', action: 'Đã putaway vào KL-01-A1-T1', user: 'Trần Thị Bình' },
    ],
  },
  {
    id: 'err-sap-014',
    transactionCode: 'MIGO-101-SIGN-001',
    type: 'FG_RECEIVING',
    user: 'Nguyễn Văn An',
    role: 'Công nhân sản xuất',
    createdAt: '2026-06-17 11:00',
    originalData: { huId: 'HU-2026-MA-FG-XN-0007', batchId: '002216225', qty: 3000 },
    errorMessage: 'Thiếu chữ ký bắt buộc — cần chữ ký Thủ kho',
    errorReasonVi: 'Phiếu nhập kho yêu cầu chữ ký của Thủ kho để xác nhận. Hiện chỉ có chữ ký của Công nhân SX. Vui lòng bổ sung chữ ký Thủ kho trước khi gửi SAP.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-17 11:00', action: 'Tạo lỗi thiếu chữ ký', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-015',
    transactionCode: 'MIGO-344-PHOTO-001',
    type: 'QM_HOLD',
    user: 'Lê Văn Cường',
    role: 'KCS/QM',
    createdAt: '2026-06-17 13:00',
    originalData: { batchId: '002216227', defectCode: 'DF-006', reason: 'Kết tinh tuyết bất thường' },
    errorMessage: 'Thiếu ảnh bằng chứng bắt buộc cho lỗi DF-006',
    errorReasonVi: 'Mã lỗi DF-006 (Kết tinh tuyết bất thường) yêu cầu tối thiểu 3 ảnh bằng chứng: ảnh tổng thể pallet, ảnh cận cảnh kết tinh, ảnh nhiệt kế. Hiện chưa có ảnh nào. Vui lòng bổ sung trước khi gửi.',
    status: 'Pending',
    history: [{ timestamp: '2026-06-17 13:00', action: 'Tạo lỗi thiếu ảnh', user: 'Hệ thống' }],
  },
  {
    id: 'err-sap-016',
    transactionCode: 'MIGO-311-CONF-001',
    type: 'CYCLE_COUNT',
    user: 'Trần Thị Bình',
    role: 'Thủ kho',
    createdAt: '2026-06-17 14:00',
    originalData: { binId: 'KL-03-B2-T3', expectedQty: 2500, actualQty: 2000, difference: 500 },
    errorMessage: 'Chênh lệch kiểm kê — thiếu 500 KG trong ô kệ',
    errorReasonVi: 'Kiểm kê ô kệ KL-03-B2-T3 phát hiện chênh lệch: kỳ vọng 2,500 KG nhưng thực tế chỉ có 2,000 KG. Thiếu 500 KG. Cần xác minh nguyên nhân và tạo báo cáo chênh lệch.',
    status: 'Need Review',
    history: [
      { timestamp: '2026-06-17 14:00', action: 'Tạo lỗi chênh lệch kiểm kê', user: 'Hệ thống' },
      { timestamp: '2026-06-17 13:50', action: 'Cycle Count CC-2026-0082', user: 'Trần Thị Bình' },
    ],
  },
];

// RBAC Permission Map — expanded with granular actions
export type PermissionAction =
  // Production
  | 'PRODUCTION_CREATE_ORDER'
  | 'PRODUCTION_WIP'
  | 'PRODUCTION_PALLET'
  | 'PRODUCTION_CONFIRM_FG'
  | 'PRODUCTION_UTILITY'
  | 'PRODUCTION_SIGN'
  | 'PRODUCTION_MATERIAL'
  | 'PRODUCTION_VIEW'
  // Inbound
  | 'INBOUND_RECEIVE_RM'
  | 'INBOUND_FG_RECEIVING'
  | 'INBOUND_PUTAWAY'
  | 'INBOUND_PENDING_VIEW'
  | 'INBOUND_SIGN_WH'
  | 'INBOUND_VIEW'
  // Outbound
  | 'OUTBOUND_FEFO_PICKING'
  | 'OUTBOUND_FEFO_OVERRIDE'
  | 'OUTBOUND_CONTAINER_LOADING'
  | 'OUTBOUND_CONTAINER_CHECK'
  | 'OUTBOUND_BTP_ISSUE'
  | 'OUTBOUND_VIEW'
  // Internal QM
  | 'QM_HOLD'
  | 'QM_CYCLE_COUNT'
  | 'QM_CONTAINER_CHECK'
  | 'QM_DEFECT_CODES'
  | 'QM_VIEW'
  // Transfer
  | 'TRANSFER_ORDER'
  | 'RECEIVE_TRANSFER'
  // Error Queue
  | 'ERROR_QUEUE_RESOLVE'
  // Documents (Kế toán)
  | 'VIEW_DOCUMENTS'
  | 'VIEW_INVOICE_STATUS'
  // Admin
  | 'ADMIN_ALL'
  | 'ADMIN_RBAC_MATRIX';

// Tab visibility — which tabs show in bottom nav
export const TAB_PERMISSIONS: Record<string, string[]> = {
  'cong-nhan-san-xuat': ['production'],
  'thu-kho': ['inbound', 'outbound', 'internal-qm'],
  'kcs-qm': ['internal-qm'],
  'ky-thuat': ['production'],
  'quan-doc': ['production', 'inbound', 'outbound', 'internal-qm'],
  'ke-toan-kho': ['inbound', 'outbound', 'internal-qm'],
  'admin': ['production', 'inbound', 'outbound', 'internal-qm'],
};

// Comprehensive action permissions
export const RBAC_PERMISSIONS: Record<string, PermissionAction[]> = {
  'cong-nhan-san-xuat': [
    'PRODUCTION_WIP', 'PRODUCTION_PALLET', 'PRODUCTION_SIGN',
    'PRODUCTION_VIEW',
  ],
  'thu-kho': [
    'INBOUND_RECEIVE_RM', 'INBOUND_FG_RECEIVING', 'INBOUND_PUTAWAY',
    'INBOUND_SIGN_WH', 'INBOUND_PENDING_VIEW', 'INBOUND_VIEW',
    'OUTBOUND_FEFO_PICKING', 'OUTBOUND_CONTAINER_LOADING',
    'OUTBOUND_BTP_ISSUE', 'OUTBOUND_VIEW',
    'TRANSFER_ORDER', 'RECEIVE_TRANSFER',
    'QM_CYCLE_COUNT', 'QM_CONTAINER_CHECK', 'QM_VIEW',
    'PRODUCTION_VIEW',
  ],
  'kcs-qm': [
    'QM_HOLD', 'QM_CYCLE_COUNT', 'QM_CONTAINER_CHECK',
    'QM_DEFECT_CODES', 'QM_VIEW',
    'INBOUND_VIEW', 'OUTBOUND_VIEW', 'PRODUCTION_VIEW',
  ],
  'ky-thuat': [
    'PRODUCTION_UTILITY', 'PRODUCTION_VIEW',
  ],
  'quan-doc': [
    'PRODUCTION_CREATE_ORDER', 'PRODUCTION_WIP', 'PRODUCTION_PALLET',
    'PRODUCTION_CONFIRM_FG', 'PRODUCTION_MATERIAL', 'PRODUCTION_SIGN',
    'PRODUCTION_VIEW',
    'INBOUND_RECEIVE_RM', 'INBOUND_FG_RECEIVING', 'INBOUND_PUTAWAY',
    'INBOUND_SIGN_WH', 'INBOUND_PENDING_VIEW', 'INBOUND_VIEW',
    'OUTBOUND_FEFO_PICKING', 'OUTBOUND_FEFO_OVERRIDE',
    'OUTBOUND_CONTAINER_LOADING', 'OUTBOUND_CONTAINER_CHECK',
    'OUTBOUND_BTP_ISSUE', 'OUTBOUND_VIEW',
    'QM_HOLD', 'QM_CYCLE_COUNT', 'QM_CONTAINER_CHECK',
    'QM_DEFECT_CODES', 'QM_VIEW',
    'TRANSFER_ORDER', 'RECEIVE_TRANSFER',
    'ERROR_QUEUE_RESOLVE',
  ],
  'ke-toan-kho': [
    'VIEW_DOCUMENTS', 'VIEW_INVOICE_STATUS',
    'INBOUND_VIEW', 'OUTBOUND_VIEW', 'QM_VIEW',
    'PRODUCTION_VIEW',
  ],
  'admin': ['ADMIN_ALL', 'ADMIN_RBAC_MATRIX'],
};

function cloneRoleTabs(input: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(input).map(([role, tabs]) => [role, [...tabs]]));
}

function cloneRolePermissions(input: Record<string, PermissionAction[]>): Record<string, PermissionAction[]> {
  return Object.fromEntries(Object.entries(input).map(([role, actions]) => [role, [...actions]]));
}

let runtimeTabPermissions: Record<string, string[]> = cloneRoleTabs(TAB_PERMISSIONS);
let runtimeRbacPermissions: Record<string, PermissionAction[]> = cloneRolePermissions(RBAC_PERMISSIONS);

function applyRuntimePermissions(roleTabs: Record<string, string[]>, rolePermissions: Record<string, PermissionAction[]>): void {
  runtimeTabPermissions = cloneRoleTabs(roleTabs);
  runtimeRbacPermissions = cloneRolePermissions(rolePermissions);
}

// Map actions to human-readable explanation for disabled buttons
export const PERMISSION_EXPLANATIONS: Record<string, string> = {
  'PRODUCTION_CREATE_ORDER': 'Chỉ Quản đốc/Tổ trưởng hoặc Admin được phát lệnh',
  'PRODUCTION_WIP': 'Chỉ Công nhân SX, Quản đốc/Tổ trưởng hoặc Admin được ghi WIP',
  'PRODUCTION_PALLET': 'Chỉ Công nhân SX, Quản đốc/Tổ trưởng hoặc Admin được tạo pallet',
  'PRODUCTION_CONFIRM_FG': 'Chỉ Quản đốc/Tổ trưởng hoặc Admin được xác nhận TP',
  'PRODUCTION_UTILITY': 'Chỉ Kỹ thuật, Quản đốc/Tổ trưởng hoặc Admin được ghi tiện ích',
  'PRODUCTION_SIGN': 'Chỉ Công nhân SX, Quản đốc/Tổ trưởng hoặc Admin được ký bàn giao',
  'PRODUCTION_MATERIAL': 'Chỉ Quản đốc/Tổ trưởng hoặc Admin được cấp phát vật tư',
  'PRODUCTION_VIEW': 'Bạn không có quyền xem phân hệ Sản xuất',
  'INBOUND_RECEIVE_RM': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được nhập NL',
  'INBOUND_FG_RECEIVING': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được nhập kho TP',
  'INBOUND_PUTAWAY': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được Putaway',
  'INBOUND_SIGN_WH': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được ký thủ kho',
  'OUTBOUND_FEFO_PICKING': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được picking',
  'OUTBOUND_FEFO_OVERRIDE': 'Chỉ Quản đốc/Tổ trưởng hoặc Admin được override FEFO',
  'OUTBOUND_CONTAINER_LOADING': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được đóng container',
  'OUTBOUND_CONTAINER_CHECK': 'Chỉ KCS/QM, Quản đốc/Tổ trưởng hoặc Admin được kiểm container',
  'OUTBOUND_BTP_ISSUE': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được xuất BTP',
  'QM_HOLD': 'Chỉ KCS/QM, Quản đốc/Tổ trưởng hoặc Admin được QM Hold',
  'QM_CYCLE_COUNT': 'Chỉ Thủ kho, KCS/QM, Quản đốc/Tổ trưởng hoặc Admin được kiểm kê',
  'QM_CONTAINER_CHECK': 'Chỉ KCS/QM, Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được kiểm container',
  'TRANSFER_ORDER': 'Chỉ Thủ kho, Quản đốc/Tổ trưởng hoặc Admin được điều chuyển',
  'RECEIVE_TRANSFER': 'Chỉ Thủ kho NM đích, Quản đốc/Tổ trưởng hoặc Admin được nhận ĐC',
  'ERROR_QUEUE_RESOLVE': 'Chỉ Quản đốc/Tổ trưởng hoặc Admin được xử lý Error Queue',
  'VIEW_DOCUMENTS': 'Chỉ Kế toán kho, Quản đốc/Tổ trưởng hoặc Admin được xem chứng từ',
  'VIEW_INVOICE_STATUS': 'Chỉ Kế toán kho, Quản đốc/Tổ trưởng hoặc Admin được xem trạng thái hóa đơn',
};

export function hasPermission(roleId: string | undefined, action: PermissionAction): boolean {
  if (!roleId) return false;
  if (roleId === 'admin') return true;
  const perms = runtimeRbacPermissions[roleId];
  if (!perms) return false;
  return perms.includes('ADMIN_ALL') || perms.includes(action);
}

export function canAccessTab(roleId: string | undefined, tab: string): boolean {
  if (!roleId) return false;
  if (roleId === 'admin') return true;
  const tabs = runtimeTabPermissions[roleId];
  if (!tabs) return false;
  return tabs.includes(tab);
}

export function canAccessScreen(roleId: string | undefined, action: PermissionAction): boolean {
  return hasPermission(roleId, action);
}

export function getPermissionExplanation(action: PermissionAction): string {
  return PERMISSION_EXPLANATIONS[action] || 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Quản đốc/Tổ trưởng.';
}

export function getRoleHomeHint(roleId: string | undefined): { title: string; subtitle: string } {
  const map: Record<string, { title: string; subtitle: string }> = {
    'cong-nhan-san-xuat': { title: 'Công nhân SX', subtitle: 'Ghi WIP · Tạo pallet · Ký bàn giao' },
    'thu-kho': { title: 'Thủ kho', subtitle: 'Nhập kho · Putaway · Picking · Đóng container' },
    'kcs-qm': { title: 'KCS/QM', subtitle: 'QM Hold · Kiểm kê · Kiểm container' },
    'ky-thuat': { title: 'Kỹ thuật', subtitle: 'Ghi tiện ích · Kiểm tra thiết bị' },
    'quan-doc': { title: 'Quản đốc/Tổ trưởng', subtitle: 'Phát lệnh · Duyệt ngoại lệ · Error Queue' },
    'ke-toan-kho': { title: 'Kế toán kho mock', subtitle: 'Chứng từ · Hóa đơn · Xuất bến' },
    'admin': { title: 'Admin mock', subtitle: 'Toàn quyền · Ma trận phân quyền' },
  };
  return map[roleId || ''] || { title: 'Chưa rõ vai trò', subtitle: 'Vui lòng đăng nhập lại' };
}

export function getOfflineAllowedActions(): PermissionAction[] {
  return ['INBOUND_PUTAWAY', 'QM_HOLD', 'INBOUND_FG_RECEIVING', 'OUTBOUND_FEFO_PICKING', 'QM_CYCLE_COUNT', 'TRANSFER_ORDER', 'RECEIVE_TRANSFER'];
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser: string;
  currentUserData: MockUser | null;
  role: Role | null;
  plant: Plant | null;
  shift: Shift | null;
  networkStatus: NetworkStatus;
  deviceId: string;
  lastSyncedAt: string;
  lastLocalUpdateAt: string;
  highContrast: boolean;
  coldStorageUI: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  productionOrders: ProductionOrder[];
  batches: Batch[];
  handlingUnits: HandlingUnit[];
  bins: Bin[];
  warehouses: Warehouse[];
  transferOrders: TransferOrder[];
  outboundDeliveries: OutboundDelivery[];
  qualityHolds: QualityHold[];
  rawMaterialReceipts: RawMaterialReceipt[];
  cycleCounts: CycleCount[];
  formTemplates: FormTemplate[];
  formInstances: FormInstance[];
  purchaseOrders: PurchaseOrder[];
  qcInspections: QCInspection[];
  materialIssueRequests: MaterialIssueRequest[];
  btpReports: BTPReport[];
  fgCartonReports: FGCartonReport[];
  fgWarehouseRequests: FGWarehouseRequest[];
  temporaryStocks: TemporaryStock[];
  offlineQueue: OfflineQueueItem[];
  errorQueue: ErrorQueueItem[];
  activityLogs: ActivityLog[];
  toasts: ToastItem[];
  syncProgress: { current: number; total: number } | null;
  showSyncModal: boolean;
  showLogoutConfirm: boolean;
  registeredUsers: MockUser[];
  roleTabs: Record<string, string[]>;
  rolePermissions: Record<string, PermissionAction[]>;
}

const initialRegisteredUsers = [...MOCK_EXTENDED_USERS];

const APP_STORAGE_KEY = 'antesco_shop_floor_pwa_state_v3';
const APP_DEVICE_KEY = 'antesco_shop_floor_device_id';
const APP_BROADCAST_CHANNEL = 'antesco-shop-floor-realtime';

function nowIso(): string {
  return new Date().toISOString();
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  const existing = window.localStorage.getItem(APP_DEVICE_KEY);
  if (existing) return existing;
  const id = `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(APP_DEVICE_KEY, id);
  return id;
}

const initialState: AppState = {
  isLoggedIn: false,
  currentUser: '',
  currentUserData: null,
  role: null,
  plant: null,
  shift: null,
  networkStatus: 'online',
  deviceId: getDeviceId(),
  lastSyncedAt: '',
  lastLocalUpdateAt: nowIso(),
  highContrast: false,
  coldStorageUI: false,
  darkMode: false,
  soundEnabled: true,
  vibrationEnabled: true,
  productionOrders: MOCK_PRODUCTION_ORDERS,
  batches: MOCK_BATCHES,
  handlingUnits: MOCK_HANDLING_UNITS,
  bins: MOCK_BINS,
  warehouses: MOCK_WAREHOUSES,
  transferOrders: MOCK_TRANSFER_ORDERS,
  outboundDeliveries: MOCK_OUTBOUND_DELIVERIES,
  qualityHolds: MOCK_QUALITY_HOLDS,
  rawMaterialReceipts: MOCK_RM_RECEIPTS,
  cycleCounts: MOCK_CYCLE_COUNTS,
  formTemplates: MOCK_FORM_TEMPLATES,
  formInstances: MOCK_FORM_INSTANCES,
  purchaseOrders: MOCK_PURCHASE_ORDERS,
  qcInspections: MOCK_QC_INSPECTIONS,
  materialIssueRequests: MOCK_MATERIAL_ISSUE_REQUESTS,
  btpReports: MOCK_BTP_REPORTS,
  fgCartonReports: MOCK_FG_CARTON_REPORTS,
  fgWarehouseRequests: MOCK_FG_WAREHOUSE_REQUESTS,
  temporaryStocks: MOCK_TEMPORARY_STOCKS,
  offlineQueue: [],
  errorQueue: MOCK_SAP_ERRORS,
  activityLogs: MOCK_ACTIVITY_LOGS,
  toasts: [],
  syncProgress: null,
  showSyncModal: false,
  showLogoutConfirm: false,
  registeredUsers: initialRegisteredUsers,
  roleTabs: cloneRoleTabs(TAB_PERMISSIONS),
  rolePermissions: cloneRolePermissions(RBAC_PERMISSIONS),
};

type PersistedAppState = Omit<AppState, 'toasts' | 'syncProgress' | 'showSyncModal' | 'showLogoutConfirm' | 'networkStatus'> & {
  networkStatus: NetworkStatus;
};

function toPersistedState(state: AppState): PersistedAppState {
  const { toasts, syncProgress, showSyncModal, showLogoutConfirm, ...persisted } = state;
  void toasts;
  void syncProgress;
  void showSyncModal;
  void showLogoutConfirm;
  return {
    ...persisted,
    networkStatus: state.networkStatus === 'syncing' ? 'online' : state.networkStatus,
  };
}

function normalizePersistedState(input: Partial<AppState> | null | undefined): AppState {
  if (!input) return initialState;
  const normalized = {
    ...initialState,
    ...input,
    deviceId: getDeviceId(),
    toasts: [],
    syncProgress: null,
    showSyncModal: false,
    showLogoutConfirm: false,
    networkStatus: input.networkStatus === 'syncing' ? 'online' : input.networkStatus || 'online',
    registeredUsers: input.registeredUsers?.length ? input.registeredUsers : initialRegisteredUsers,
    roleTabs: input.roleTabs ? cloneRoleTabs(input.roleTabs) : cloneRoleTabs(TAB_PERMISSIONS),
    rolePermissions: input.rolePermissions ? cloneRolePermissions(input.rolePermissions) : cloneRolePermissions(RBAC_PERMISSIONS),
  };
  applyRuntimePermissions(normalized.roleTabs, normalized.rolePermissions);
  return normalized;
}

function loadPersistedState(): AppState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as { state?: Partial<AppState> };
    return normalizePersistedState(parsed.state);
  } catch {
    return initialState;
  }
}

function savePersistedState(state: AppState): void {
  if (typeof window === 'undefined') return;
  const payload = {
    version: 3,
    sourceDeviceId: state.deviceId,
    savedAt: nowIso(),
    state: toPersistedState(state),
  };
  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
}

let toastCounter = 0;
function genToastId(): string { toastCounter++; return `toast-${Date.now()}-${toastCounter}`; }
let activityCounter = 0;
function genActivityId(): string { activityCounter++; return `act-${Date.now()}-${activityCounter}`; }
let errorCounter = 0;
function genErrorId(): string { errorCounter++; return `err-${Date.now()}-${errorCounter}`; }
let offlineCounter = 0;
function genOfflineId(): string { offlineCounter++; return `off-${Date.now()}-${offlineCounter}`; }

type Action =
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'LOGIN'; payload: { user: string; role: Role; plant: Plant; shift: Shift; userData: MockUser } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_PLANT'; payload: Plant }
  | { type: 'SET_SHIFT'; payload: Shift }
  | { type: 'SET_NETWORK'; payload: NetworkStatus }
  | { type: 'SET_LAST_SYNCED_AT'; payload: string }
  | { type: 'TOGGLE_HIGH_CONTRAST' }
  | { type: 'TOGGLE_COLD_STORAGE_UI' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_VIBRATION' }
  | { type: 'RESET_MOCK_DATA' }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLog }
  | { type: 'ADD_OFFLINE_QUEUE'; payload: OfflineQueueItem }
  | { type: 'UPDATE_OFFLINE_QUEUE_STATUS'; payload: { queueId: string; status: OfflineQueueItem['status'] } }
  | { type: 'REMOVE_OFFLINE_QUEUE'; payload: string }
  | { type: 'CLEAR_OFFLINE_QUEUE' }
  | { type: 'ADD_ERROR'; payload: ErrorQueueItem }
  | { type: 'UPDATE_ERROR_STATUS'; payload: { id: string; status: ErrorQueueItem['status']; resolvedBy?: string; resolution?: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_TOAST'; payload: ToastItem }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_SYNC_PROGRESS'; payload: { current: number; total: number } | null }
  | { type: 'SET_SHOW_SYNC_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_LOGOUT_CONFIRM'; payload: boolean }
  | { type: 'UPDATE_PRODUCTION_ORDER_STATUS'; payload: { id: string; status: string } }
  | { type: 'UPDATE_PRODUCTION_ORDER'; payload: { id: string; updates: Partial<ProductionOrder> } }
  | { type: 'ADD_HANDLING_UNIT'; payload: HandlingUnit }
  | { type: 'UPDATE_HANDLING_UNIT'; payload: { id: string; updates: Partial<HandlingUnit> } }
  | { type: 'UPDATE_HANDLING_UNIT_LOCATION'; payload: { id: string; location: string } }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'ADD_QUALITY_HOLD'; payload: QualityHold }
  | { type: 'UPDATE_QUALITY_HOLD_STATUS'; payload: { id: string; status: string } }
  | { type: 'UPDATE_BIN_STATUS'; payload: { id: string; status: string } }
  | { type: 'ADD_RAW_MATERIAL_RECEIPT'; payload: RawMaterialReceipt }
  | { type: 'UPDATE_RAW_MATERIAL_RECEIPT'; payload: { id: string; updates: Partial<RawMaterialReceipt> } }
  | { type: 'UPDATE_OUTBOUND_DELIVERY'; payload: { id: string; updates: Partial<OutboundDelivery> } }
  | { type: 'UPDATE_BATCH_STATUS'; payload: { id: string; status: string } }
  | { type: 'UPDATE_TRANSFER_ORDER'; payload: { id: string; updates: Partial<TransferOrder> } }
  | { type: 'ADD_CYCLE_COUNT'; payload: CycleCount }
  | { type: 'REGISTER_USER'; payload: MockUser }
  | { type: 'CHANGE_PASSWORD'; payload: { username: string; newPassword: string } }
  | { type: 'UPDATE_USER_ACCESS'; payload: { username: string; role: string; plant: string; department?: string } }
  | { type: 'UPDATE_ROLE_PERMISSIONS'; payload: { roleId: string; permissions: PermissionAction[]; tabs: string[] } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return normalizePersistedState(action.payload);
    case 'LOGIN':
      return { ...state, isLoggedIn: true, currentUser: action.payload.user, currentUserData: action.payload.userData, role: action.payload.role, plant: action.payload.plant, shift: action.payload.shift };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, currentUser: '', currentUserData: null, role: null, plant: null, shift: null, showLogoutConfirm: false };
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_PLANT':
      return { ...state, plant: action.payload };
    case 'SET_SHIFT':
      return { ...state, shift: action.payload };
    case 'SET_NETWORK':
      return { ...state, networkStatus: action.payload };
    case 'SET_LAST_SYNCED_AT':
      return { ...state, lastSyncedAt: action.payload };
    case 'TOGGLE_HIGH_CONTRAST': {
      const next = !state.highContrast;
      return { ...state, highContrast: next, darkMode: next ? false : state.darkMode, coldStorageUI: next ? false : state.coldStorageUI };
    }
    case 'TOGGLE_COLD_STORAGE_UI': {
      const next = !state.coldStorageUI;
      return { ...state, coldStorageUI: next, darkMode: next ? false : state.darkMode, highContrast: next ? false : state.highContrast };
    }
    case 'TOGGLE_DARK_MODE': {
      const next = !state.darkMode;
      return { ...state, darkMode: next, highContrast: next ? false : state.highContrast, coldStorageUI: next ? false : state.coldStorageUI };
    }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_VIBRATION':
      return { ...state, vibrationEnabled: !state.vibrationEnabled };
    case 'RESET_MOCK_DATA':
      return {
        ...state,
        productionOrders: MOCK_PRODUCTION_ORDERS,
        batches: MOCK_BATCHES,
        handlingUnits: MOCK_HANDLING_UNITS,
        bins: MOCK_BINS,
        warehouses: MOCK_WAREHOUSES,
        transferOrders: MOCK_TRANSFER_ORDERS,
        outboundDeliveries: MOCK_OUTBOUND_DELIVERIES,
        qualityHolds: MOCK_QUALITY_HOLDS,
        rawMaterialReceipts: MOCK_RM_RECEIPTS,
        cycleCounts: MOCK_CYCLE_COUNTS,
        formTemplates: MOCK_FORM_TEMPLATES,
        formInstances: MOCK_FORM_INSTANCES,
        purchaseOrders: MOCK_PURCHASE_ORDERS,
        qcInspections: MOCK_QC_INSPECTIONS,
        materialIssueRequests: MOCK_MATERIAL_ISSUE_REQUESTS,
        btpReports: MOCK_BTP_REPORTS,
        fgCartonReports: MOCK_FG_CARTON_REPORTS,
        fgWarehouseRequests: MOCK_FG_WAREHOUSE_REQUESTS,
        temporaryStocks: MOCK_TEMPORARY_STOCKS,
        activityLogs: MOCK_ACTIVITY_LOGS,
        offlineQueue: [],
        errorQueue: MOCK_SAP_ERRORS,
        toasts: [],
        syncProgress: null,
        lastSyncedAt: '',
        lastLocalUpdateAt: nowIso(),
        showSyncModal: false,
        showLogoutConfirm: false,
        roleTabs: cloneRoleTabs(TAB_PERMISSIONS),
        rolePermissions: cloneRolePermissions(RBAC_PERMISSIONS),
      };
    case 'ADD_ACTIVITY':
      return { ...state, activityLogs: [action.payload, ...state.activityLogs].slice(0, 200) };
    case 'ADD_OFFLINE_QUEUE':
      return { ...state, offlineQueue: [...state.offlineQueue, action.payload] };
    case 'UPDATE_OFFLINE_QUEUE_STATUS':
      return {
        ...state,
        offlineQueue: state.offlineQueue.map((q) =>
          q.queueId === action.payload.queueId ? { ...q, status: action.payload.status } : q
        ),
      };
    case 'REMOVE_OFFLINE_QUEUE':
      return { ...state, offlineQueue: state.offlineQueue.filter((q) => q.queueId !== action.payload) };
    case 'CLEAR_OFFLINE_QUEUE':
      return { ...state, offlineQueue: [] };
    case 'ADD_ERROR':
      return { ...state, errorQueue: [action.payload, ...state.errorQueue] };
    case 'UPDATE_ERROR_STATUS':
      return {
        ...state,
        errorQueue: state.errorQueue.map((e) =>
          e.id === action.payload.id ? {
            ...e,
            status: action.payload.status,
            resolvedBy: action.payload.resolvedBy,
            resolution: action.payload.resolution,
            resolutionTime: new Date().toISOString(),
          } : e
        ),
      };
    case 'CLEAR_ERRORS':
      return { ...state, errorQueue: [] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'SET_SYNC_PROGRESS':
      return { ...state, syncProgress: action.payload };
    case 'SET_SHOW_SYNC_MODAL':
      return { ...state, showSyncModal: action.payload };
    case 'SET_SHOW_LOGOUT_CONFIRM':
      return { ...state, showLogoutConfirm: action.payload };
    case 'UPDATE_PRODUCTION_ORDER_STATUS':
      return {
        ...state,
        productionOrders: state.productionOrders.map((po) =>
          po.id === action.payload.id ? { ...po, status: action.payload.status } : po
        ),
      };
    case 'UPDATE_PRODUCTION_ORDER':
      return {
        ...state,
        productionOrders: state.productionOrders.map((po) =>
          po.id === action.payload.id ? { ...po, ...action.payload.updates } : po
        ),
      };
    case 'ADD_HANDLING_UNIT':
      return { ...state, handlingUnits: [...state.handlingUnits, action.payload] };
    case 'UPDATE_HANDLING_UNIT':
      return {
        ...state,
        handlingUnits: state.handlingUnits.map((hu) =>
          hu.id === action.payload.id ? { ...hu, ...action.payload.updates } : hu
        ),
      };
    case 'UPDATE_HANDLING_UNIT_LOCATION':
      return {
        ...state,
        handlingUnits: state.handlingUnits.map((hu) =>
          hu.id === action.payload.id ? { ...hu, location: action.payload.location } : hu
        ),
      };
    case 'ADD_BATCH':
      return { ...state, batches: [...state.batches, action.payload] };
    case 'ADD_QUALITY_HOLD':
      return { ...state, qualityHolds: [...state.qualityHolds, action.payload] };
    case 'UPDATE_QUALITY_HOLD_STATUS':
      return {
        ...state,
        qualityHolds: state.qualityHolds.map((qh) =>
          qh.id === action.payload.id ? { ...qh, status: action.payload.status } : qh
        ),
      };
    case 'UPDATE_BIN_STATUS':
      return {
        ...state,
        bins: state.bins.map((b) =>
          b.id === action.payload.id ? { ...b, status: action.payload.status } : b
        ),
      };
    case 'ADD_RAW_MATERIAL_RECEIPT':
      return { ...state, rawMaterialReceipts: [...state.rawMaterialReceipts, action.payload] };
    case 'UPDATE_RAW_MATERIAL_RECEIPT':
      return {
        ...state,
        rawMaterialReceipts: state.rawMaterialReceipts.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };
    case 'UPDATE_OUTBOUND_DELIVERY':
      return {
        ...state,
        outboundDeliveries: state.outboundDeliveries.map((od) =>
          od.id === action.payload.id ? { ...od, ...action.payload.updates } : od
        ),
      };
    case 'UPDATE_BATCH_STATUS':
      return {
        ...state,
        batches: state.batches.map((b) =>
          b.id === action.payload.id ? { ...b, status: action.payload.status } : b
        ),
      };
    case 'UPDATE_TRANSFER_ORDER':
      return {
        ...state,
        transferOrders: state.transferOrders.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'ADD_CYCLE_COUNT':
      return { ...state, cycleCounts: [action.payload, ...state.cycleCounts] };
    case 'REGISTER_USER':
      return { ...state, registeredUsers: [...state.registeredUsers, action.payload] };
    case 'CHANGE_PASSWORD':
      return {
        ...state,
        registeredUsers: state.registeredUsers.map((u) =>
          u.username === action.payload.username ? { ...u, password: action.payload.newPassword } : u
        ),
      };
    case 'UPDATE_USER_ACCESS': {
      const updatedUsers = state.registeredUsers.map((u) =>
        u.username === action.payload.username
          ? {
              ...u,
              role: action.payload.role,
              plant: action.payload.plant,
              department: action.payload.department ?? u.department,
            }
          : u
      );
      const updatedCurrentUser = updatedUsers.find((u) => u.username === state.currentUserData?.username) || state.currentUserData;
      const updatedRole = MOCK_ROLES.find((r) => r.id === updatedCurrentUser?.role) || state.role;
      const updatedPlant = MOCK_PLANTS.find((p) => p.id === updatedCurrentUser?.plant) || state.plant;

      return {
        ...state,
        registeredUsers: updatedUsers,
        currentUserData: updatedCurrentUser,
        role: updatedRole,
        plant: updatedPlant,
      };
    }
    case 'UPDATE_ROLE_PERMISSIONS':
      return {
        ...state,
        roleTabs: {
          ...state.roleTabs,
          [action.payload.roleId]: [...action.payload.tabs],
        },
        rolePermissions: {
          ...state.rolePermissions,
          [action.payload.roleId]: [...action.payload.permissions],
        },
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (userData: MockUser) => { success: boolean; error?: string };
  changePassword: (username: string, oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  addToast: (type: ToastItem['type'], message: string) => void;
  addActivityLog: (user: string, role: string, action: string, detail: string, beforeStatus?: string, afterStatus?: string, note?: string) => void;
  simulateAction: (actionName: string, detail: string, successMsg: string, callback?: () => void) => void;
  syncOfflineQueue: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(appReducer, initialState, loadPersistedState);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const applyingRemoteStateRef = useRef(false);

  useEffect(() => {
    applyRuntimePermissions(state.roleTabs, state.rolePermissions);
  }, [state.roleTabs, state.rolePermissions]);

  const dispatch = useCallback<Dispatch<Action>>((action) => {
    baseDispatch(action);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(APP_BROADCAST_CHANNEL);
    broadcastRef.current = channel;
    channel.onmessage = (event: MessageEvent<{ sourceDeviceId?: string; state?: Partial<AppState> }>) => {
      if (!event.data?.state || event.data.sourceDeviceId === state.deviceId) return;
      applyingRemoteStateRef.current = true;
      baseDispatch({ type: 'HYDRATE_STATE', payload: event.data.state });
    };

    return () => {
      channel.close();
      broadcastRef.current = null;
    };
  }, [state.deviceId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    savePersistedState(state);

    if (applyingRemoteStateRef.current) {
      applyingRemoteStateRef.current = false;
      return;
    }

    broadcastRef.current?.postMessage({
      sourceDeviceId: state.deviceId,
      state: toPersistedState(state),
      sentAt: nowIso(),
    });
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { sourceDeviceId?: string; state?: Partial<AppState> };
        if (!parsed.state || parsed.sourceDeviceId === state.deviceId) return;
        applyingRemoteStateRef.current = true;
        baseDispatch({ type: 'HYDRATE_STATE', payload: parsed.state });
      } catch {
        // Ignore corrupted storage events; the current in-memory state remains usable.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [state.deviceId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOffline = () => dispatch({ type: 'SET_NETWORK', payload: 'offline' });
    const handleOnline = () => {
      if (state.networkStatus === 'offline') dispatch({ type: 'SET_NETWORK', payload: 'online' });
    };

    if (!navigator.onLine && state.networkStatus !== 'offline') {
      dispatch({ type: 'SET_NETWORK', payload: 'offline' });
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch, state.networkStatus]);

  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const allUsers = state.registeredUsers;
    const user = allUsers.find((u) => u.username === username);

    if (!user) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    const role = MOCK_ROLES.find((r) => r.id === user.role);
    if (!role) {
      return { success: false, error: 'Tài khoản thiếu thông tin vai trò. Vui lòng liên hệ quản trị viên.' };
    }

    const plant = MOCK_PLANTS.find((p) => p.id === user.plant);
    if (!plant) {
      return { success: false, error: 'Tài khoản thiếu thông tin nhà máy. Vui lòng liên hệ quản trị viên.' };
    }

    const shift = MOCK_SHIFTS[0]; // default shift, not displayed

    dispatch({ type: 'LOGIN', payload: { user: user.name, role, plant, shift, userData: user } });
    return { success: true };
  }, [dispatch, state.registeredUsers]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const register = useCallback((userData: MockUser): { success: boolean; error?: string } => {
    // Check unique username
    const exists = state.registeredUsers.find((u) => u.username === userData.username);
    if (exists) {
      return { success: false, error: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.' };
    }

    dispatch({ type: 'REGISTER_USER', payload: userData });
    return { success: true };
  }, [dispatch, state.registeredUsers]);

  const changePassword = useCallback((username: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } => {
    const user = state.registeredUsers.find((u) => u.username === username);
    if (!user) {
      return { success: false, error: 'Không tìm thấy tài khoản.' };
    }
    if (user.password !== oldPassword) {
      return { success: false, error: 'Mật khẩu cũ không chính xác.' };
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' };
    }
    dispatch({ type: 'CHANGE_PASSWORD', payload: { username, newPassword } });
    return { success: true };
  }, [dispatch, state.registeredUsers]);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const toast: ToastItem = { id: genToastId(), type, message };
    dispatch({ type: 'ADD_TOAST', payload: toast });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), 3500);
  }, [dispatch]);

  const addActivityLog = useCallback((user: string, role: string, action: string, detail: string, beforeStatus?: string, afterStatus?: string, note?: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: { id: genActivityId(), timestamp, user, role, action, detail, plant: state.plant?.code || '--', beforeStatus, afterStatus, note },
    });
  }, [dispatch, state.plant?.code]);

  const simulateAction = useCallback((actionName: string, detail: string, successMsg: string, callback?: () => void) => {
    dispatch({ type: 'SET_NETWORK', payload: 'syncing' });
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: { id: genActivityId(), timestamp, user: state.currentUser, role: state.role?.name || '', action: actionName, detail, plant: state.plant?.code || '--' },
    });
    const delay = 300 + Math.random() * 500;
    setTimeout(() => {
      dispatch({ type: 'SET_NETWORK', payload: 'online' });
      addToast('success', successMsg);
      callback?.();
    }, delay);
  }, [dispatch, state.currentUser, state.role?.name, state.plant?.code, addToast]);

  const syncOfflineQueue = useCallback(() => {
    // CHỈ SYNC CÁC ITEMS ĐÃ ĐƯỢC USER XÁC NHẬN (Ready To Sync)
    // Items ở trạng thái Local Saved hoặc Pending Sync cần được user xác nhận trước
    const queue = state.offlineQueue.filter((q) => q.status === 'Ready To Sync');
    if (queue.length === 0) {
      const pendingConfirm = state.offlineQueue.filter((q) => q.status === 'Local Saved' || q.status === 'Pending Sync' || q.status === 'Pending User Confirm');
      if (pendingConfirm.length > 0) {
        addToast('warning', `${pendingConfirm.length} giao dịch cần xác nhận trước khi đồng bộ. Vào Xác nhận đồng bộ để kiểm tra.`);
      } else {
        addToast('info', 'Không có giao dịch nào cần đồng bộ');
      }
      return;
    }

    // BẮT ĐẦU SYNC — Hiển thị modal
    dispatch({ type: 'SET_SHOW_SYNC_MODAL', payload: true });
    dispatch({ type: 'SET_SYNC_PROGRESS', payload: { current: 0, total: queue.length } });

    const sapErrorMode = state.networkStatus === 'error';

    queue.forEach((item, idx) => {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNC_PROGRESS', payload: { current: idx + 1, total: queue.length } });
        dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: item.queueId, status: 'Syncing' } });

        setTimeout(() => {
          if (sapErrorMode) {
            dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: item.queueId, status: 'Sync Failed' } });
            dispatch({
              type: 'ADD_ERROR',
              payload: {
                id: genErrorId(),
                transactionCode: `${item.mockMovement}-${String(idx + 1).padStart(3, '0')}`,
                type: item.type,
                user: item.user,
                role: item.role,
                createdAt: new Date().toISOString(),
                originalData: { huId: item.huId, batchId: item.batchId, binId: item.binId, odId: item.odId, transferId: item.transferId, quantity: item.quantity },
                errorMessage: 'SAP không phản hồi — lỗi giả lập',
                errorReasonVi: 'Hệ thống SAP giả lập lỗi. Vui lòng kiểm tra kết nối và thử lại.',
                status: 'Pending',
                history: [{ timestamp: new Date().toISOString(), action: 'Sync thất bại từ Offline Queue', user: item.user }],
              },
            });
          } else {
            dispatch({ type: 'UPDATE_OFFLINE_QUEUE_STATUS', payload: { queueId: item.queueId, status: 'Synced' } });
            // Handle each type
            if (item.type === 'PUTAWAY' && item.huId && item.binId) {
              dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: item.huId, updates: { status: 'Đã xếp kệ', location: item.binId } } });
              dispatch({ type: 'UPDATE_BIN_STATUS', payload: { id: item.binId, status: 'Có hàng' } });
            }
            if (item.type === 'QM_HOLD' && item.batchId) {
              dispatch({ type: 'UPDATE_BATCH_STATUS', payload: { id: item.batchId, status: 'Blocked Stock' } });
              dispatch({
                type: 'ADD_QUALITY_HOLD',
                payload: {
                  id: `QH-${String(Date.now()).slice(-4)}`,
                  batch: item.batchId,
                  reason: `${item.defectCode || 'DF-000'}: ${item.reason?.slice(0, 80) || ''}`,
                  plant: item.plant,
                  status: 'Đã khóa',
                  createdDate: new Date().toISOString().slice(0, 10),
                },
              });
            }
            if (item.type === 'FG_RECEIVING' && item.huId) {
              dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: item.huId, updates: { status: 'Chờ putaway', qty: item.quantity || 0 } } });
            }
            if (item.type === 'FEFO_PICKING' && item.huId && item.odId) {
              dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: item.huId, updates: { status: 'Đã picking', location: '' } } });
              dispatch({ type: 'UPDATE_OUTBOUND_DELIVERY', payload: { id: item.odId, updates: { status: 'Đang picking' } } });
            }
            if (item.type === 'CYCLE_COUNT' && item.binId) {
              dispatch({
                type: 'ADD_CYCLE_COUNT',
                payload: {
                  id: `CC-${String(Date.now()).slice(-4)}`,
                  bin: item.binId,
                  plant: item.plant,
                  expectedPallets: (item.additionalData?.expectedPallets as number) || 0,
                  actualPallets: (item.additionalData?.actualPallets as number) || 0,
                  expectedQty: (item.additionalData?.expectedQty as number) || 0,
                  actualQty: item.quantity || 0,
                  unit: item.unit || 'KG',
                  status: (item.additionalData?.expectedQty === item.quantity) ? 'Đã kiểm kê khớp' : 'Lệch số lượng',
                  countedBy: item.user,
                  note: item.reason || '',
                  imageCount: item.photos?.length || 0,
                  createdDate: new Date().toISOString().slice(0, 10),
                },
              });
            }
            if (item.type === 'TRANSFER_ORDER' && item.huId && item.transferId) {
              dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: item.huId, updates: { status: 'Đang vận chuyển' } } });
              dispatch({ type: 'UPDATE_TRANSFER_ORDER', payload: { id: item.transferId, updates: { status: 'Đang vận chuyển' } } });
            }
            if (item.type === 'RECEIVE_TRANSFER' && item.huId && item.transferId) {
              dispatch({ type: 'UPDATE_HANDLING_UNIT', payload: { id: item.huId, updates: { status: 'Đã nhận ĐC', location: item.binId || '' } } });
              dispatch({ type: 'UPDATE_TRANSFER_ORDER', payload: { id: item.transferId, updates: { status: 'Đã nhận' } } });
            }
            setTimeout(() => {
              dispatch({ type: 'REMOVE_OFFLINE_QUEUE', payload: item.queueId });
            }, 500);
          }
          if (idx === queue.length - 1) {
            setTimeout(() => {
              dispatch({ type: 'SET_SHOW_SYNC_MODAL', payload: false });
              dispatch({ type: 'SET_SYNC_PROGRESS', payload: null });
              dispatch({ type: 'SET_LAST_SYNCED_AT', payload: nowIso() });
              const syncedCount = sapErrorMode ? 0 : queue.length;
              if (sapErrorMode) {
                addToast('error', `Đồng bộ thất bại: ${queue.length} giao dịch lỗi — đã đẩy vào Error Queue`);
              } else {
                addToast('success', `Đồng bộ SAP thành công (${syncedCount}/${queue.length} giao dịch)`);
              }
            }, 400);
          }
        }, 300);
      }, idx * 800);
    });
  }, [dispatch, state.offlineQueue, state.networkStatus, addToast]);

  // OFFLINE RULE: Không tự động sync khi online lại.
  // User phải chủ động vào xác nhận đồng bộ.
  // Auto-sync đã bị vô hiệu hóa để tuân thủ quy tắc:
  // "Offline không được phát sinh giao dịch gửi SAP/mock SAP.
  //  Khi online lại, user phải xác nhận lại thông tin rồi mới gửi."
  // useEffect auto-sync removed — sync only triggered manually via "Đồng bộ ngay" button.

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, register, changePassword, addToast, addActivityLog, simulateAction, syncOfflineQueue }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { MOCK_ROLES, MOCK_PLANTS, MOCK_SHIFTS, MOCK_EXTENDED_USERS, genToastId, genActivityId, genErrorId, genOfflineId };
