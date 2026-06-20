// ============================================================
// Định mức NVL hàng lạnh năm 2026 — QĐ01B
// BOM/MaterialNorm theo sản phẩm
// ANTECO Shop Floor & Warehouse
// ============================================================

export interface MaterialNormItem {
  materialCode: string;
  materialName: string;
  standardQty: number;      // Định mức trên 1 KG thành phẩm
  uom: string;
  lossRate: number;         // Tỷ lệ hao hụt %
  category: 'Nguyên liệu chính' | 'Hóa chất' | 'Bao bì';
  note: string;
}

export interface MaterialNorm {
  id: string;
  productCode: string;
  productName: string;
  year: number;
  version: string;
  issueDate: string;
  items: MaterialNormItem[];
}

// Xoài đông IQF cắt xí ngầu 1.5cm (TP0061)
export const MOCK_BOM_XOAI_IQF_15CM: MaterialNorm = {
  id: 'BOM-TP0061-2026',
  productCode: 'TP0061',
  productName: 'Xoài đông IQF cắt xí ngầu 1.5cm',
  year: 2026,
  version: 'QĐ01B',
  issueDate: '2026-01-01',
  items: [
    { materialCode: 'RM-XC-001', materialName: 'Xoài cát tươi nguyên liệu', standardQty: 1.50, uom: 'KG', lossRate: 3.0, category: 'Nguyên liệu chính', note: 'Tỷ lệ thu hồi ~67%' },
    { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', standardQty: 0.003, uom: 'L', lossRate: 0.5, category: 'Hóa chất', note: 'Pha loãng 1:100' },
    { materialCode: 'CH-CHLOR-010', materialName: 'Chlorine 10% — Khử trùng nước rửa', standardQty: 0.0005, uom: 'L', lossRate: 0, category: 'Hóa chất', note: 'Nồng độ 50ppm' },
    { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm 5KG — Bao bì tạm', standardQty: 0.20, uom: 'Cái', lossRate: 1.0, category: 'Bao bì', note: '1 túi / 5 KG' },
    { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', standardQty: 0.10, uom: 'Cái', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG tạm' },
    { materialCode: 'PK-TUICARTON-020', materialName: 'Túi PE thành phẩm 1KG', standardQty: 1.00, uom: 'Túi', lossRate: 1.5, category: 'Bao bì', note: 'Đóng gói TP' },
    { materialCode: 'PK-CARTON-020', materialName: 'Thùng carton TP 10KG', standardQty: 0.10, uom: 'Thùng', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG TP' },
  ],
};

// Thanh long đông IQF cắt lát 2cm (TP0042)
export const MOCK_BOM_THANHLONG_IQF: MaterialNorm = {
  id: 'BOM-TP0042-2026',
  productCode: 'TP0042',
  productName: 'Thanh long đông IQF cắt lát 2cm',
  year: 2026,
  version: 'QĐ01B',
  issueDate: '2026-01-01',
  items: [
    { materialCode: 'RM-TL-001', materialName: 'Thanh long tươi nguyên liệu', standardQty: 1.50, uom: 'KG', lossRate: 3.5, category: 'Nguyên liệu chính', note: 'Tỷ lệ thu hồi ~67%' },
    { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', standardQty: 0.003, uom: 'L', lossRate: 0.5, category: 'Hóa chất', note: 'Pha loãng 1:100' },
    { materialCode: 'CH-CHLOR-010', materialName: 'Chlorine 10% — Khử trùng nước rửa', standardQty: 0.0005, uom: 'L', lossRate: 0, category: 'Hóa chất', note: 'Nồng độ 50ppm' },
    { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm 5KG — Bao bì tạm', standardQty: 0.20, uom: 'Cái', lossRate: 1.0, category: 'Bao bì', note: '1 túi / 5 KG' },
    { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', standardQty: 0.10, uom: 'Cái', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG tạm' },
    { materialCode: 'PK-TUICARTON-020', materialName: 'Túi PE thành phẩm 1KG', standardQty: 1.00, uom: 'Túi', lossRate: 1.5, category: 'Bao bì', note: 'Đóng gói TP' },
    { materialCode: 'PK-CARTON-020', materialName: 'Thùng carton TP 10KG', standardQty: 0.10, uom: 'Thùng', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG TP' },
  ],
};

// Mít đông IQF nguyên múi (TP0078)
export const MOCK_BOM_MIT_IQF: MaterialNorm = {
  id: 'BOM-TP0078-2026',
  productCode: 'TP0078',
  productName: 'Mít đông IQF nguyên múi',
  year: 2026,
  version: 'QĐ01B',
  issueDate: '2026-01-01',
  items: [
    { materialCode: 'RM-MIT-001', materialName: 'Mít tươi nguyên liệu', standardQty: 1.50, uom: 'KG', lossRate: 4.0, category: 'Nguyên liệu chính', note: 'Tỷ lệ thu hồi ~67%' },
    { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', standardQty: 0.003, uom: 'L', lossRate: 0.5, category: 'Hóa chất', note: 'Pha loãng 1:100' },
    { materialCode: 'CH-CHLOR-010', materialName: 'Chlorine 10% — Khử trùng nước rửa', standardQty: 0.0005, uom: 'L', lossRate: 0, category: 'Hóa chất', note: 'Nồng độ 50ppm' },
    { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm 5KG — Bao bì tạm', standardQty: 0.20, uom: 'Cái', lossRate: 1.0, category: 'Bao bì', note: '1 túi / 5 KG' },
    { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', standardQty: 0.10, uom: 'Cái', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG tạm' },
    { materialCode: 'PK-TUICARTON-020', materialName: 'Túi PE thành phẩm 1KG', standardQty: 1.00, uom: 'Túi', lossRate: 1.5, category: 'Bao bì', note: 'Đóng gói TP' },
    { materialCode: 'PK-CARTON-020', materialName: 'Thùng carton TP 10KG', standardQty: 0.10, uom: 'Thùng', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG TP' },
  ],
};

// Xoài đông IQF cắt lát 3mm (TP0092)
export const MOCK_BOM_XOAI_IQF_3MM: MaterialNorm = {
  id: 'BOM-TP0092-2026',
  productCode: 'TP0092',
  productName: 'Xoài đông IQF cắt lát 3mm',
  year: 2026,
  version: 'QĐ01B',
  issueDate: '2026-01-01',
  items: [
    { materialCode: 'RM-XC-001', materialName: 'Xoài cát tươi nguyên liệu', standardQty: 1.55, uom: 'KG', lossRate: 3.5, category: 'Nguyên liệu chính', note: 'Tỷ lệ thu hồi ~65% (cắt mỏng hao hơn)' },
    { materialCode: 'CH-SPX-015', materialName: 'Sopuroxid 15 — Hóa chất rửa', standardQty: 0.003, uom: 'L', lossRate: 0.5, category: 'Hóa chất', note: 'Pha loãng 1:100' },
    { materialCode: 'CH-CHLOR-010', materialName: 'Chlorine 10% — Khử trùng nước rửa', standardQty: 0.0005, uom: 'L', lossRate: 0, category: 'Hóa chất', note: 'Nồng độ 50ppm' },
    { materialCode: 'PK-TUIPE-012', materialName: 'Túi PE tạm 5KG — Bao bì tạm', standardQty: 0.20, uom: 'Cái', lossRate: 1.0, category: 'Bao bì', note: '1 túi / 5 KG' },
    { materialCode: 'PK-THUNGNHUA-012', materialName: 'Thùng nhựa tạm 10KG', standardQty: 0.10, uom: 'Cái', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG tạm' },
    { materialCode: 'PK-TUICARTON-020', materialName: 'Túi PE thành phẩm 1KG', standardQty: 1.00, uom: 'Túi', lossRate: 1.5, category: 'Bao bì', note: 'Đóng gói TP' },
    { materialCode: 'PK-CARTON-020', materialName: 'Thùng carton TP 10KG', standardQty: 0.10, uom: 'Thùng', lossRate: 0.5, category: 'Bao bì', note: '1 thùng / 10 KG TP' },
  ],
};

export const MOCK_ALL_MATERIAL_NORMS: MaterialNorm[] = [
  MOCK_BOM_XOAI_IQF_15CM,
  MOCK_BOM_THANHLONG_IQF,
  MOCK_BOM_MIT_IQF,
  MOCK_BOM_XOAI_IQF_3MM,
];

// Helper: lấy BOM theo productCode
export function getBomByProductCode(code: string): MaterialNorm | undefined {
  return MOCK_ALL_MATERIAL_NORMS.find((b) => b.productCode === code);
}

// Helper: tính số lượng NVL cần cấp theo PO
export function calculateMaterialRequirements(bomId: string, plannedQty: number): { materialCode: string; materialName: string; requiredQty: number; uom: string }[] {
  const bom = MOCK_ALL_MATERIAL_NORMS.find((b) => b.id === bomId);
  if (!bom) return [];
  return bom.items.map((item) => ({
    materialCode: item.materialCode,
    materialName: item.materialName,
    requiredQty: Math.ceil(item.standardQty * plannedQty * (1 + item.lossRate / 100)),
    uom: item.uom,
  }));
}