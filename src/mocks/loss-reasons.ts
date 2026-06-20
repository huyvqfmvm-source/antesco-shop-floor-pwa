// ============================================================
// Danh mục lý do hao hụt/phế phẩm tạm thời
// ANTECO Shop Floor & Warehouse
// ============================================================

export interface LossReason {
  code: string;
  name: string;
  category: 'SẢN_XUẤT' | 'NGUYÊN_LIỆU' | 'BAO_BÌ' | 'KHO' | 'VẬN_CHUYỂN' | 'QC' | 'KHÁC';
  requiresNote: boolean;
  requiresPhoto: boolean;
  severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng';
}

export const MOCK_LOSS_REASONS: LossReason[] = [
  { code: 'LR-001', name: 'Hao hụt cân', category: 'SẢN_XUẤT', requiresNote: false, requiresPhoto: false, severity: 'Thấp' },
  { code: 'LR-002', name: 'Dập/nát', category: 'NGUYÊN_LIỆU', requiresNote: true, requiresPhoto: true, severity: 'Trung bình' },
  { code: 'LR-003', name: 'Sai quy cách', category: 'SẢN_XUẤT', requiresNote: true, requiresPhoto: true, severity: 'Trung bình' },
  { code: 'LR-004', name: 'Hư hỏng bao bì', category: 'BAO_BÌ', requiresNote: true, requiresPhoto: true, severity: 'Thấp' },
  { code: 'LR-005', name: 'Không đạt QC', category: 'QC', requiresNote: true, requiresPhoto: true, severity: 'Cao' },
  { code: 'LR-006', name: 'Rơi vãi', category: 'KHO', requiresNote: true, requiresPhoto: false, severity: 'Thấp' },
  { code: 'LR-007', name: 'Nhiệt độ bảo quản không đạt', category: 'KHO', requiresNote: true, requiresPhoto: true, severity: 'Cao' },
  { code: 'LR-008', name: 'Hư hỏng trong vận chuyển nội bộ', category: 'VẬN_CHUYỂN', requiresNote: true, requiresPhoto: true, severity: 'Trung bình' },
  { code: 'LR-009', name: 'Sai lệch cân nặng đóng gói', category: 'SẢN_XUẤT', requiresNote: true, requiresPhoto: false, severity: 'Thấp' },
  { code: 'LR-010', name: 'Lẫn tạp chất', category: 'QC', requiresNote: true, requiresPhoto: true, severity: 'Nghiêm trọng' },
  { code: 'LR-999', name: 'Khác', category: 'KHÁC', requiresNote: true, requiresPhoto: true, severity: 'Trung bình' },
];

// Helper: lấy danh sách loss reasons để hiển thị trong dropdown
export function getLossReasonOptions(): { value: string; label: string }[] {
  return MOCK_LOSS_REASONS.map((r) => ({ value: r.code, label: `${r.code} - ${r.name}` }));
}

// Helper: lấy loss reason theo code
export function getLossReasonByCode(code: string): LossReason | undefined {
  return MOCK_LOSS_REASONS.find((r) => r.code === code);
}