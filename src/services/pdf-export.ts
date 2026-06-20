// PDF Export Service — ANTECO Shop Floor & Warehouse
// Hỗ trợ tất cả biểu mẫu chính: PNK, KTNL, BM-NM-07, BC-BTP, PGN-BTP, BC-DTTP, BM-NM-09, PGK
// + Watermark, chữ ký điện tử, ảnh bằng chứng, version tracking

export interface PdfExportOptions {
  templateCode: string;
  formInstanceId: string;
  title: string;
  includeSignatureImages: boolean;
  watermark: string;
  language: string;
  version: string;
  issueDate: string;
  createdBy: string;
  signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
  attachments: { id: string; label: string; url: string; type: string }[];
  fieldValues: Record<string, unknown>;
}

export function generateMockPdfUrl(options: PdfExportOptions): string {
  const params = new URLSearchParams();
  params.set('template', options.templateCode);
  params.set('id', options.formInstanceId);
  params.set('title', options.title);
  params.set('version', options.version);
  params.set('createdBy', options.createdBy);
  params.set('language', options.language);
  if (options.includeSignatureImages) params.set('signatures', 'true');
  if (options.watermark) params.set('watermark', options.watermark);
  return '/mock-pdf/' + options.templateCode + '-' + options.formInstanceId + '.pdf?' + params.toString();
}

export function generatePdfBlobUrl(options: PdfExportOptions): string {
  // Generate a mock PDF as a data blob
  const lines: string[] = [];
  lines.push('ANTECO SHOP FLOOR & WAREHOUSE');
  lines.push('================================');
  lines.push(`BIỂU MẪU: ${options.templateCode}`);
  lines.push(`Tên: ${options.title}`);
  lines.push(`Version: ${options.version} — Ngày ban hành: ${options.issueDate}`);
  lines.push(`Số phiếu: ${options.formInstanceId}`);
  lines.push(`Người lập: ${options.createdBy}`);
  lines.push(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`);
  lines.push('--------------------------------');

  if (options.fieldValues && Object.keys(options.fieldValues).length > 0) {
    lines.push('DỮ LIỆU BIỂU MẪU:');
    Object.entries(options.fieldValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        lines.push(`  ${key}: ${String(value)}`);
      }
    });
    lines.push('--------------------------------');
  }

  if (options.signatures.length > 0) {
    lines.push('CHỮ KÝ:');
    options.signatures.forEach((sig) => {
      lines.push(`  ${sig.position}: ${sig.signedBy} (${sig.signedRole}) — ${sig.signedAt}`);
    });
    lines.push('--------------------------------');
  }

  if (options.attachments.length > 0) {
    lines.push('TÀI LIỆU ĐÍNH KÈM:');
    options.attachments.forEach((att) => {
      lines.push(`  [${att.type}] ${att.label}: ${att.url}`);
    });
    lines.push('--------------------------------');
  }

  if (options.watermark) {
    lines.push(`WATERMARK: ${options.watermark}`);
  }

  lines.push('================================');
  lines.push('Tài liệu được tạo tự động bởi ANTECO PWA');
  lines.push('Đây là bản PDF mock — Bản chính thức sẽ được xuất khi tích hợp SAP');

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  return URL.createObjectURL(blob);
}

export const PDF_EXPORT_TEMPLATES: Record<string, { label: string; icon: string; color: string; version: string; issueDate: string }> = {
  'PNK-01': {
    label: 'Phiếu nhập kho',
    icon: 'ri-file-list-3-line',
    color: 'ant-nk',
    version: '2.0',
    issueDate: '2024-06-01',
  },
  'BM-KTNL-01': {
    label: 'Biểu mẫu kiểm thu nguyên liệu',
    icon: 'ri-shield-check-line',
    color: 'ant-qm',
    version: '3.0',
    issueDate: '2025-04-01',
  },
  'BM-NM-07': {
    label: 'Phiếu đề xuất cấp NVL',
    icon: 'ri-file-list-3-line',
    color: 'ant-sx',
    version: '3.0',
    issueDate: '2025-01-15',
  },
  'BC-BTP-01': {
    label: 'Báo cáo bán thành phẩm',
    icon: 'ri-file-chart-line',
    color: 'ant-sx',
    version: '2.0',
    issueDate: '2025-02-01',
  },
  'PGN-BTP-01': {
    label: 'Phiếu giao nhận BTP',
    icon: 'ri-file-list-3-line',
    color: 'ant-warning',
    version: '2.0',
    issueDate: '2025-02-01',
  },
  'BC-DTTP-01': {
    label: 'Báo cáo đóng thùng thành phẩm',
    icon: 'ri-file-chart-line',
    color: 'ant-sx',
    version: '2.0',
    issueDate: '2025-03-15',
  },
  'BM-NM-09': {
    label: 'Phiếu yêu cầu nhập kho TP (Excel 2025)',
    icon: 'ri-file-list-3-line',
    color: 'ant-nk',
    version: '4.0',
    issueDate: '2025-03-01',
  },
  'PGN-TP-01': {
    label: 'Phiếu giao nhận thành phẩm',
    icon: 'ri-file-list-3-line',
    color: 'ant-nk',
    version: '2.0',
    issueDate: '2025-06-01',
  },
  'BC-KK-01': {
    label: 'Báo cáo kiểm kê',
    icon: 'ri-clipboard-line',
    color: 'ant-qm',
    version: '1.0',
    issueDate: '2025-01-01',
  },
  'ERR-SYNC-01': {
    label: 'Báo cáo Error/Sync Queue',
    icon: 'ri-error-warning-line',
    color: 'ant-error',
    version: '1.0',
    issueDate: '2025-01-01',
  },
};

// Helper to get PDF export options from form instance
export function getPdfOptionsFromFormInstance(
  formInstance: {
    id: string;
    templateId: string;
    code: string;
    status: string;
    createdBy: string;
    createdAt: string;
    signatures: { position: string; signedBy: string; signedRole: string; signedAt: string }[];
    attachments: { id: string; label: string; url: string; type: string }[];
    fieldValues: Record<string, unknown>;
  },
  templateCode: string
): PdfExportOptions {
  const tpl = PDF_EXPORT_TEMPLATES[templateCode];
  return {
    templateCode,
    formInstanceId: formInstance.id,
    title: tpl?.label || templateCode,
    includeSignatureImages: formInstance.signatures.length > 0,
    watermark: formInstance.status === 'Draft' ? 'BẢN NHÁP' : '',
    language: 'vi',
    version: tpl?.version || '1.0',
    issueDate: tpl?.issueDate || '2025-01-01',
    createdBy: formInstance.createdBy,
    signatures: formInstance.signatures,
    attachments: formInstance.attachments,
    fieldValues: formInstance.fieldValues,
  };
}