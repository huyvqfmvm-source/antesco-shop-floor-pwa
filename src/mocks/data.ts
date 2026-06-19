export const MOCK_ROLES = [
  { id: 'cong-nhan-san-xuat', name: 'Công nhân sản xuất' },
  { id: 'thu-kho', name: 'Thủ kho' },
  { id: 'kcs-qm', name: 'KCS/QM' },
  { id: 'ky-thuat', name: 'Kỹ thuật' },
  { id: 'quan-doc', name: 'Quản đốc/Tổ trưởng' },
  { id: 'ke-toan-kho', name: 'Kế toán kho mock' },
  { id: 'admin', name: 'Admin mock' },
];

export const MOCK_PLANTS = [
  { id: 'MA', name: 'Mỹ An', code: 'MA' },
  { id: 'BK', name: 'Bình Khánh', code: 'BK' },
];

export const MOCK_SHIFTS = [
  { id: 'ca-1', name: 'Ca 1', time: '06:00–18:00' },
  { id: 'ca-2', name: 'Ca 2', time: '18:00–06:00' },
  { id: 'ca-lo', name: 'Ca lỡ', time: '10:00–18:00' },
];

export const MOCK_PRODUCTION_ORDERS = [
  {
    id: '10000456',
    productCode: 'TP0061',
    productName: 'Xoài đông IQF cắt xí ngầu 1.5cm',
    plannedQty: 5000,
    unit: 'KG',
    plant: 'MA',
    shift: 'ca-1',
    status: 'CRTD',
    startDate: '2026-06-15',
    dueDate: '2026-06-17',
    batchFg: '002216225',
    huFg: 'HU-2026-MA-FG-XN-0005',
    huBtp: 'HU-2026-MA-BTP-XOAI-0001',
    wipQty: 0,
    fgQty: 0,
    scrapQty: 0,
    currentOperation: '',
  },
  {
    id: '10000457',
    productCode: 'TP0042',
    productName: 'Thanh long đông IQF cắt lát 2cm',
    plannedQty: 3200,
    unit: 'KG',
    plant: 'MA',
    shift: 'ca-1',
    status: 'REL',
    startDate: '2026-06-16',
    dueDate: '2026-06-18',
    batchFg: '002216226',
    huFg: 'HU-2026-MA-FG-TL-0008',
    huBtp: 'HU-2026-MA-BTP-TL-0004',
    wipQty: 0,
    fgQty: 0,
    scrapQty: 0,
    currentOperation: '',
  },
  {
    id: '10000458',
    productCode: 'TP0078',
    productName: 'Mít đông IQF nguyên múi',
    plannedQty: 1800,
    unit: 'KG',
    plant: 'BK',
    shift: 'ca-2',
    status: 'CRTD',
    startDate: '2026-06-16',
    dueDate: '2026-06-19',
    batchFg: '002216227',
    huFg: 'HU-2026-BK-FG-MIT-0003',
    huBtp: 'HU-2026-BK-BTP-MIT-0002',
    wipQty: 0,
    fgQty: 0,
    scrapQty: 0,
    currentOperation: '',
  },
];

export const MOCK_BATCHES = [
  { id: '002216225', product: 'TP0061 - Xoài đông IQF', qty: 5000, unit: 'KG', plant: 'MA', status: 'Đang SX', productionOrder: '10000456' },
  { id: '002216226', product: 'TP0042 - Thanh long đông IQF', qty: 3200, unit: 'KG', plant: 'MA', status: 'Hoàn thành', productionOrder: '10000457' },
  { id: '002216227', product: 'TP0078 - Mít đông IQF', qty: 1800, unit: 'KG', plant: 'BK', status: 'Đang SX', productionOrder: '10000458' },
  { id: '002216228', product: 'TP0061 - Xoài đông IQF', qty: 2000, unit: 'KG', plant: 'MA', status: 'Blocked Stock', productionOrder: '10000456' },
  { id: 'RM-2026-MA-XOAI-162-001', product: 'Xoài cát nguyên liệu tươi', qty: 8380, unit: 'KG', plant: 'MA', status: 'QI Stock', productionOrder: '' },
];

export const MOCK_HANDLING_UNITS = [
  { id: 'HU-2026-MA-FG-XN-0005', type: 'FG', product: 'TP0061', qty: 4500, unit: 'KG', location: 'KL-03-B2-T3', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-BTP-XOAI-0001', type: 'BTP', product: 'TP0061-BTP', qty: 3200, unit: 'KG', location: 'KL-01-A1-T1', plant: 'MA', status: 'Chờ chế biến' },
  { id: 'HU-2026-BK-FG-MIT-0003', type: 'FG', product: 'TP0078', qty: 1800, unit: 'KG', location: '', plant: 'BK', status: 'Chờ putaway' },
  { id: 'HU-2026-MA-FG-TL-0008', type: 'FG', product: 'TP0042', qty: 3200, unit: 'KG', location: 'KL-02-A3-T2', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-FG-XN-0006', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-B2-T3', plant: 'MA', status: 'Chờ đồng bộ putaway' },
  { id: 'HU-2026-MA-FG-XN-0007', type: 'FG', product: 'TP0061', qty: 3000, unit: 'KG', location: '', plant: 'MA', status: 'Chờ nhập kho TP' },
  { id: 'HU-2026-BK-FG-MIT-0004', type: 'FG', product: 'TP0078', qty: 1200, unit: 'KG', location: '', plant: 'BK', status: 'Chờ putaway' },
  { id: 'HU-2026-MA-FG-XN-0008', type: 'FG', product: 'TP0061', qty: 3000, unit: 'KG', location: 'KL-03-B2-T3', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-2026-MA-FG-XN-0009', type: 'FG', product: 'TP0061', qty: 2000, unit: 'KG', location: 'KL-03-A1-T1', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-XN-01', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-B2-T3', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-XN-02', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-C1-T2', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-XN-03', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-B2-T3', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-XN-04', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-A1-T1', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-XN-05', type: 'FG', product: 'TP0061', qty: 500, unit: 'KG', location: 'KL-03-C1-T2', plant: 'MA', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-MIT-01', type: 'FG', product: 'TP0078', qty: 600, unit: 'KG', location: 'KL-05-C2-T4', plant: 'BK', status: 'Đã xếp kệ' },
  { id: 'HU-IQF-MIT-02', type: 'FG', product: 'TP0078', qty: 600, unit: 'KG', location: 'KL-05-C2-T4', plant: 'BK', status: 'Đã xếp kệ' },
];

export const MOCK_BINS = [
  { id: 'KL-03-B2-T3', warehouse: 'KL-03', row: 'B', tier: '2', position: '3', plant: 'MA', status: 'Có hàng' },
  { id: 'KL-01-A1-T1', warehouse: 'KL-01', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Có hàng' },
  { id: 'KL-05-C2-T4', warehouse: 'KL-05', row: 'C', tier: '2', position: '4', plant: 'BK', status: 'Trống' },
  { id: 'KL-02-A3-T2', warehouse: 'KL-02', row: 'A', tier: '3', position: '2', plant: 'MA', status: 'Trống' },
  { id: 'KL-03-A1-T1', warehouse: 'KL-03', row: 'A', tier: '1', position: '1', plant: 'MA', status: 'Trống' },
  { id: 'KL-01-B2-T3', warehouse: 'KL-01', row: 'B', tier: '2', position: '3', plant: 'MA', status: 'Trống' },
  { id: 'KL-03-C1-T2', warehouse: 'KL-03', row: 'C', tier: '1', position: '2', plant: 'MA', status: 'Có hàng' },
];

export const MOCK_WAREHOUSES = [
  { id: 'KL-01', name: 'Kho lạnh 01', type: 'FG', plant: 'MA', temp: '-18°C' },
  { id: 'KL-02', name: 'Kho lạnh 02', type: 'FG', plant: 'MA', temp: '-18°C' },
  { id: 'KL-03', name: 'Kho lạnh 03', type: 'FG', plant: 'MA', temp: '-18°C' },
  { id: 'KL-04', name: 'Kho lạnh 04', type: 'FG', plant: 'MA', temp: '-22°C' },
  { id: 'KL-05', name: 'Kho lạnh 05', type: 'FG', plant: 'BK', temp: '-18°C' },
  { id: 'KL-06', name: 'Kho lạnh 06', type: 'FG', plant: 'BK', temp: '-18°C' },
  { id: 'KL-07', name: 'Kho lạnh 07', type: 'FG', plant: 'BK', temp: '-22°C' },
  { id: 'KL-08', name: 'Kho lạnh 08', type: 'FG', plant: 'BK', temp: '-18°C' },
  { id: 'KM-01', name: 'Kho mát 01', type: 'RM', plant: 'MA', temp: '4°C' },
  { id: 'KM-02', name: 'Kho mát 02', type: 'RM', plant: 'MA', temp: '4°C' },
  { id: 'KM-03', name: 'Kho mát 03', type: 'RM', plant: 'BK', temp: '4°C' },
  { id: 'NL-01', name: 'Kho nguyên liệu', type: 'RM', plant: 'MA', temp: 'Thường' },
  { id: 'BB-01', name: 'Kho bao bì', type: 'PK', plant: 'MA', temp: 'Thường' },
  { id: 'HC-01', name: 'Kho hóa chất', type: 'CH', plant: 'MA', temp: 'Thường' },
];

export const MOCK_TRANSFER_ORDERS = [
  {
    id: 'ST-2026-0089',
    fromPlant: 'MA',
    fromWarehouse: 'KL-03',
    toPlant: 'BK',
    toWarehouse: 'KL-05',
    items: [
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-01' },
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-02' },
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-03' },
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-04' },
      { product: 'TP0061', qty: 500, unit: 'KG', hu: 'HU-IQF-XN-05' },
    ],
    status: 'Đang vận chuyển',
    createdDate: '2026-06-16',
  },
  {
    id: 'ST-2026-0091',
    fromPlant: 'BK',
    fromWarehouse: 'KL-06',
    toPlant: 'MA',
    toWarehouse: 'KL-01',
    items: [
      { product: 'TP0078', qty: 600, unit: 'KG', hu: 'HU-IQF-MIT-01' },
      { product: 'TP0078', qty: 600, unit: 'KG', hu: 'HU-IQF-MIT-02' },
    ],
    status: 'Đã gửi',
    createdDate: '2026-06-15',
  },
];

export const MOCK_OUTBOUND_DELIVERIES = [
  {
    id: 'OD-2026-0098',
    customer: 'Japan Frozen Food Co.',
    plant: 'MA',
    container: '',
    seal: '',
    items: [
      { product: 'TP0061', qty: 3000, unit: 'KG', batch: '002216225' },
      { product: 'TP0042', qty: 2000, unit: 'KG', batch: '002216226' },
    ],
    status: 'Chờ picking',
    shipDate: '2026-06-18',
  },
  {
    id: 'OD-2026-0102',
    customer: 'ANTESCO EU GmbH',
    plant: 'MA',
    container: 'TGBU1234567',
    seal: 'SEAL-889912',
    items: [
      { product: 'TP0061', qty: 4500, unit: 'KG', batch: '002216225' },
    ],
    status: 'Đang picking',
    shipDate: '2026-06-17',
  },
  {
    id: 'OD-2026-0105',
    customer: 'Asia Foods Import Co.',
    plant: 'BK',
    container: 'MSCU9876543',
    seal: 'SEAL-771234',
    items: [
      { product: 'TP0078', qty: 1800, unit: 'KG', batch: '002216227' },
    ],
    status: 'Đã loading',
    shipDate: '2026-06-16',
  },
  {
    id: 'OD-2026-0108',
    customer: 'Tokyo Gourmet Ltd.',
    plant: 'MA',
    container: 'OOLU1122334',
    seal: 'SEAL-556677',
    items: [
      { product: 'TP0061', qty: 2000, unit: 'KG', batch: '002216228' },
      { product: 'TP0042', qty: 1500, unit: 'KG', batch: '002216226' },
    ],
    status: 'Đã xuất bến',
    shipDate: '2026-06-15',
  },
  {
    id: 'OD-2026-0112',
    customer: 'Seoul Frozen Distribution',
    plant: 'MA',
    container: '',
    seal: '',
    items: [
      { product: 'TP0061', qty: 5000, unit: 'KG', batch: '002216225' },
    ],
    status: 'Có lỗi',
    shipDate: '2026-06-19',
  },
];

export const MOCK_QUALITY_HOLDS = [
  { id: 'QH-2026-0042', batch: '002216225', reason: 'Kiểm tra chỉ tiêu vi sinh', plant: 'MA', status: 'Đang giữ', createdDate: '2026-06-16' },
  { id: 'QH-2026-0045', batch: '002216228', reason: 'Rách bao bì — DF-005', plant: 'MA', status: 'Đã khóa', createdDate: '2026-06-15' },
];

export const MOCK_ACTIVITY_LOGS = [
  { id: 'act-001', timestamp: '2026-06-16 14:32', user: 'Nguyễn Văn An', role: 'Công nhân sản xuất', action: 'Quét HU', detail: 'HU-2026-MA-FG-XN-0005 → KL-03-B2-T3', plant: 'MA' },
  { id: 'act-002', timestamp: '2026-06-16 14:28', user: 'Trần Thị Bình', role: 'Thủ kho', action: 'Nhập kho', detail: 'Nhập 4,500 KG TP0061 vào KL-03', plant: 'MA' },
  { id: 'act-003', timestamp: '2026-06-16 14:15', user: 'Lê Văn Cường', role: 'KCS/QM', action: 'Giữ chất lượng', detail: 'Batch 002216225 — kiểm vi sinh', plant: 'MA' },
  { id: 'act-004', timestamp: '2026-06-16 13:50', user: 'Phạm Thị Dung', role: 'Quản đốc', action: 'Duyệt lệnh SX', detail: 'PO 10000456 — Xác nhận kế hoạch 5,000 KG', plant: 'MA' },
  { id: 'act-005', timestamp: '2026-06-16 13:30', user: 'Hoàng Văn Em', role: 'Kỹ thuật', action: 'Kiểm tra thiết bị', detail: 'Máy cấp đông IQF Line 2 — OK', plant: 'MA' },
  { id: 'act-006', timestamp: '2026-06-16 12:45', user: 'Ngô Thị Phương', role: 'Kế toán kho', action: 'Xuất kho', detail: 'OD-2026-0098 — Xuất container TGBU1234567', plant: 'MA' },
  { id: 'act-007', timestamp: '2026-06-16 11:20', user: 'Trần Văn Giang', role: 'Thủ kho', action: 'Điều chuyển', detail: 'ST-2026-0089 — MA → BK, 1,200 KG', plant: 'BK' },
  { id: 'act-008', timestamp: '2026-06-16 10:05', user: 'Lý Thị Hương', role: 'Công nhân sản xuất', action: 'Báo cáo ca', detail: 'Ca 1 — Sản lượng 2,100 KG TP0061', plant: 'MA' },
  { id: 'act-009', timestamp: '2026-06-16 09:30', user: 'Trần Thị Bình', role: 'Thủ kho', action: 'Nhập nguyên liệu', detail: 'PO-2026-00089 — Net 8,380 KG xoài cát. Batch RM-2026-MA-XOAI-162-001', plant: 'MA' },
];

export interface MockUser {
  name: string;
  username: string;
  password: string;
  role: string;
  plant: string;
  department: string;
  employeeCode: string;
  phone: string;
}

export const MOCK_USERS: MockUser[] = [
  { name: 'Nguyễn Văn An', username: 'an.nguyen', password: '123456', role: 'cong-nhan-san-xuat', plant: 'MA', department: 'Sản xuất', employeeCode: 'NV-001', phone: '0912 345 678' },
  { name: 'Trần Thị Bình', username: 'binh.tran', password: '123456', role: 'thu-kho', plant: 'MA', department: 'Kho', employeeCode: 'NV-002', phone: '0912 345 679' },
  { name: 'Lê Văn Cường', username: 'cuong.le', password: '123456', role: 'kcs-qm', plant: 'MA', department: 'QM/KCS', employeeCode: 'NV-003', phone: '0912 345 680' },
  { name: 'Phạm Thị Dung', username: 'dung.pham', password: '123456', role: 'quan-doc', plant: 'MA', department: 'Sản xuất', employeeCode: 'NV-004', phone: '0912 345 681' },
  { name: 'Hoàng Văn Em', username: 'em.hoang', password: '123456', role: 'ky-thuat', plant: 'BK', department: 'Kỹ thuật', employeeCode: 'NV-005', phone: '0912 345 682' },
  { name: 'Ngô Thị Phương', username: 'phuong.ngo', password: '123456', role: 'ke-toan-kho', plant: 'MA', department: 'Kế toán kho', employeeCode: 'NV-006', phone: '0912 345 683' },
  { name: 'Admin Hệ Thống', username: 'admin', password: 'admin123', role: 'admin', plant: 'MA', department: 'Quản trị', employeeCode: 'NV-000', phone: '0912 345 684' },
];

export const MOCK_BOM_PO_10000456 = [
  { materialCode: 'RM-XC-001', materialName: 'Xoài cát tươi nguyên liệu', requiredLot: '002210022', requiredQty: 7500, unit: 'KG', category: 'raw' as const },
  { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', requiredLot: '005', requiredQty: 15, unit: 'L', category: 'chemical' as const },
  { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm — Bao bì tạm', requiredLot: '012', requiredQty: 600, unit: 'Cái', category: 'packaging' as const },
  { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', requiredLot: '012', requiredQty: 500, unit: 'Cái', category: 'packaging' as const },
];

export const MOCK_OPERATIONS = [
  { code: '0010', name: 'Tiếp nhận nguyên liệu', seq: 1 },
  { code: '0020', name: 'Gọt vỏ & Lạng má xoài', seq: 2 },
  { code: '0030', name: 'Định hình xí ngầu 1.5cm', seq: 3 },
  { code: '0040', name: 'Cấp đông IQF', seq: 4 },
  { code: '0050', name: 'Đóng gói thành phẩm', seq: 5 },
];

export const MOCK_SUPPLIERS = [
  { id: 'SUP-DL-NVT', name: 'Đại lý Nguyễn Văn Tài', code: 'NVT', region: 'Tiền Giang' },
  { id: 'SUP-DL-LVH', name: 'Đại lý Lê Văn Hùng', code: 'LVH', region: 'Đồng Tháp' },
  { id: 'SUP-DL-PTQ', name: 'Đại lý Phan Thị Quyên', code: 'PTQ', region: 'Vĩnh Long' },
];

export const MOCK_DEFECT_CODES = [
  { code: 'DF-001', name: 'Không đạt màu sắc', category: 'Chất lượng cảm quan' },
  { code: 'DF-002', name: 'Xoài dập úng / Xì gôm', category: 'Hư hỏng nguyên liệu' },
  { code: 'DF-003', name: 'Sai quy cách cắt', category: 'Sai quy cách' },
  { code: 'DF-004', name: 'Nhiễm tạp chất', category: 'An toàn thực phẩm' },
  { code: 'DF-005', name: 'Rách bao bì / Rò rỉ khí', category: 'Sự cố vật lý' },
  { code: 'DF-006', name: 'Kết tinh tuyết bất thường', category: 'Bảo quản lạnh' },
  { code: 'DF-007', name: 'Sai nhãn / thùng', category: 'Đóng gói' },
  { code: 'DF-008', name: 'Thiếu số lượng thùng', category: 'Đóng gói' },
  { code: 'DF-009', name: 'Nhiệt độ container không đạt', category: 'Vận chuyển' },
  { code: 'DF-010', name: 'Lô không khớp FEFO', category: 'Xuất kho' },
];

export const MOCK_CYCLE_COUNTS = [
  {
    id: 'CC-2026-0081',
    bin: 'KL-03-B2-T3',
    plant: 'MA',
    expectedPallets: 5,
    actualPallets: 5,
    expectedQty: 2500,
    actualQty: 2500,
    unit: 'KG',
    status: 'Đã kiểm kê khớp',
    countedBy: 'Trần Thị Bình',
    note: '',
    imageCount: 0,
    createdDate: '2026-06-15',
  },
  {
    id: 'CC-2026-0082',
    bin: 'KL-02-A3-T2',
    plant: 'MA',
    expectedPallets: 3,
    actualPallets: 2,
    expectedQty: 1500,
    actualQty: 1000,
    unit: 'KG',
    status: 'Lệch số lượng',
    countedBy: 'Lê Văn Cường',
    note: 'Thiếu 1 pallet, nghi vấn sai vị trí putaway',
    imageCount: 2,
    createdDate: '2026-06-14',
  },
];

export const MOCK_RM_RECEIPTS = [
  {
    id: 'RM-RCPT-001',
    poNumber: 'PO-2026-00089',
    supplier: 'Đại lý Nguyễn Văn Tài',
    licensePlate: '67C-123.45',
    grossWeight: 8500,
    tareWeight: 120,
    netWeight: 8380,
    gradeI: 85,
    gradeII: 10,
    reject: 5,
    batchRm: 'RM-2026-MA-XOAI-162-001',
    qcStatus: 'Đạt',
    plant: 'MA',
    status: 'Đã nhập',
    createdDate: '2026-06-16',
  },
];