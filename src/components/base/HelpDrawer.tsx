import { useEffect, useRef } from 'react';
import { useApp } from '@/store/AppContext';

export interface HelpSection {
  title: string;
  icon: string;
  content: string;
  steps?: { step: number; text: string }[];
  tips?: string[];
  roles?: string[];
}

export interface HelpContent {
  moduleName: string;
  moduleIcon: string;
  description: string;
  sections: HelpSection[];
}

// Pre-defined help content for all modules
export const HELP_CONTENT: Record<string, HelpContent> = {
  'production': {
    moduleName: 'Sản xuất',
    moduleIcon: 'ri-tools-line',
    description: 'Quản lý toàn bộ quy trình sản xuất từ lệnh sản xuất, cấp NVL, ghi WIP, tạo pallet BTP đến xác nhận thành phẩm.',
    sections: [
      {
        title: 'Luồng sản xuất chuẩn',
        icon: 'ri-flow-chart',
        content: 'Kế hoạch SX → Lệnh SX → Phát lệnh (Quản đốc) → Cấp NVL → Ghi WIP → Báo cáo BTP → Đóng thùng TP → Yêu cầu NK TP.',
        steps: [
          { step: 1, text: 'Quản đốc xem Kế hoạch SX và tạo/phát hành Production Order.' },
          { step: 2, text: 'Lập BM-NM-07 đề xuất cấp NVL theo BOM/định mức QĐ01B.' },
          { step: 3, text: 'Quản đốc duyệt phiếu cấp NVL → Thủ kho xuất nguyên liệu.' },
          { step: 4, text: 'Công nhân vào Ghi WIP: nhập số lượng đầu vào, phân loại Loại I/II/Loại bỏ.' },
          { step: 5, text: 'Lập Báo cáo BTP → Tạo pallet BTP → BTP vào tồn kho tạm.' },
          { step: 6, text: 'Lập Báo cáo đóng thùng TP → Tạo BM-NM-09 yêu cầu nhập kho TP.' },
        ],
        roles: ['Quản đốc (phát lệnh, duyệt NVL)', 'Công nhân SX (ghi WIP, tạo pallet)', 'Thủ kho (cấp NVL)'],
      },
      {
        title: 'BOM / Định mức NVL',
        icon: 'ri-file-list-3-line',
        content: 'Xem định mức NVL theo QĐ01B-2026 cho từng sản phẩm. Hệ thống tự tính lượng NVL cần cấp dựa trên sản lượng kế hoạch.',
        tips: ['Định mức đã bao gồm hao hụt dự kiến (3-4% tùy NVL).', 'NVL được chia 3 loại: nguyên liệu chính, hóa chất, bao bì.'],
      },
      {
        title: 'Ghi WIP & Báo cáo BTP',
        icon: 'ri-tools-line',
        content: 'Công nhân ghi nhận sản lượng theo từng công đoạn. BTP tạo ra được lưu vào tồn kho tạm và có thể bàn giao cho công đoạn sau.',
        tips: ['Nếu có Loại bỏ/hao hụt, phải chọn lý do từ danh sách Loss Reasons.', 'Nếu chọn "Khác", bắt buộc nhập ghi chú chi tiết.', 'BTP phải được QC kiểm tra trước khi bàn giao cho công đoạn sau.'],
      },
    ],
  },
  'inbound': {
    moduleName: 'Nhập kho',
    moduleIcon: 'ri-archive-drawer-line',
    description: 'Quản lý toàn bộ quy trình nhập kho: PO chờ nhập → Tiếp nhận nguyên liệu → QC đầu vào → Phiếu nhập kho → Nhập kho TP → Putaway.',
    sections: [
      {
        title: 'Luồng nhập kho chuẩn',
        icon: 'ri-flow-chart',
        content: 'PO chờ nhập → Tiếp nhận NL (quét PO, cân, OCR) → QC đầu vào (BM-KTNL-01) → Phiếu nhập kho (PNK-01) → Nhập kho TP (BM-NM-09) → Putaway.',
        steps: [
          { step: 1, text: 'Thủ kho xem danh sách PO chờ nhập, chọn PO cần tiếp nhận.' },
          { step: 2, text: 'Quét PO, nhập biển số xe, cân nặng (Gross/Tare/Net Weight).' },
          { step: 3, text: 'Chuyển QC đầu vào: KCS kiểm tra chất lượng, phân loại Loại I/II/Loại bỏ.' },
          { step: 4, text: 'Tạo Phiếu nhập kho điện tử: sinh batch tạm, ký xác nhận, export PDF.' },
          { step: 5, text: 'Nhập kho TP: quét pallet, đồng kiểm SX-Kho, ký giao/nhận.' },
          { step: 6, text: 'Putaway: quét pallet → app đề xuất bin → quét bin → xác nhận xếp kệ.' },
        ],
        roles: ['Thủ kho (tiếp nhận, nhập kho, putaway)', 'KCS/QM (QC đầu vào)', 'Công nhân SX (ký giao TP)'],
      },
      {
        title: 'QC đầu vào',
        icon: 'ri-shield-check-line',
        content: 'KCS kiểm tra chất lượng nguyên liệu theo BM-KTNL-01. Ghi nhận phân loại Loại I, Loại II, Loại bỏ. KHÔNG bắt buộc tổng tỷ lệ = 100%.',
        tips: ['Nếu kết quả "Không đạt" hoặc "QM Hold", bắt buộc nhập mã lỗi DF và chụp ảnh bằng chứng.', 'QC ghi nhận như thực tế quan sát, không cần tính toán tỷ lệ.'],
      },
      {
        title: 'Putaway',
        icon: 'ri-layout-grid-line',
        content: 'Xếp pallet vào ô kệ sau khi nhập kho. App tự đề xuất bin dựa trên loại hàng, kho và sức chứa.',
        tips: ['Sai bin → cảnh báo đỏ, cần quyền override của Quản đốc.', 'Pallet QM Hold → chặn tuyệt đối, không cho putaway.', 'Offline kho lạnh: putaway vẫn hoạt động, lưu vào Offline Queue.'],
      },
    ],
  },
  'outbound': {
    moduleName: 'Xuất kho',
    moduleIcon: 'ri-truck-line',
    description: 'Quản lý xuất kho: FEFO Picking, Xuất BTP, Đóng container và xuất bến.',
    sections: [
      {
        title: 'Luồng xuất kho chuẩn',
        icon: 'ri-flow-chart',
        content: 'OD chờ picking → FEFO Picking → Xuất BTP (nếu có) → Đóng container → Xuất bến.',
        steps: [
          { step: 1, text: 'Thủ kho chọn OD, app trả về lô/pallet nên lấy theo FEFO từ mock SAP.' },
          { step: 2, text: 'Quét bin → quét pallet. Nếu sai FEFO, chỉ Quản đốc được override.' },
          { step: 3, text: 'Pallet QM Hold bị chặn tuyệt đối, không thể picking.' },
          { step: 4, text: 'Đóng container: quét pallet đã picking, OCR container/seal, checklist.' },
          { step: 5, text: 'Ký xác nhận → Xuất bến → Chờ xác nhận gửi mock SAP.' },
        ],
        roles: ['Thủ kho (picking, đóng container)', 'Quản đốc (override FEFO)', 'KCS/QM (kiểm container)'],
      },
      {
        title: 'FEFO Picking',
        icon: 'ri-arrow-up-down-line',
        content: 'Hệ thống tự đề xuất lô cần xuất trước dựa trên nguyên tắc FEFO (First Expired First Out). App hiển thị kết quả từ mock SAP, không tự quyết định.',
        tips: ['Sai FEFO: cảnh báo đỏ + yêu cầu Quản đốc override + bắt buộc nhập lý do.', 'Pallet QM Hold: chặn tuyệt đối, không có ngoại lệ.', 'Scan sai loại mã: hiển thị lý do cụ thể.'],
      },
    ],
  },
  'internal-qm': {
    moduleName: 'Nội bộ & QM',
    moduleIcon: 'ri-shield-check-line',
    description: 'Quản lý chất lượng và nội bộ: QM Hold, Điều chuyển liên nhà máy, Kiểm kê chu kỳ, Mã lỗi DF, Error Queue.',
    sections: [
      {
        title: 'QM Hold / Khóa lô',
        icon: 'ri-lock-line',
        content: 'KCS/QM khóa lô/batch khi phát hiện lỗi chất lượng. Lô bị khóa sẽ bị chặn ở tất cả các khâu xuất kho.',
        steps: [
          { step: 1, text: 'Quét batch/pallet cần khóa.' },
          { step: 2, text: 'Chọn mã lỗi DF từ danh sách (DF-001 đến DF-020).' },
          { step: 3, text: 'Nhập ghi chú chi tiết + chụp ảnh bằng chứng (tối thiểu 2 ảnh).' },
          { step: 4, text: 'Ký xác nhận → Batch chuyển sang Blocked Stock.' },
        ],
        roles: ['KCS/QM (khóa lô)', 'Quản đốc (xem + xử lý Error Queue)'],
      },
      {
        title: 'Kiểm kê chu kỳ',
        icon: 'ri-clipboard-line',
        content: 'Kiểm kê định kỳ từng ô kệ. So sánh số lượng thực tế với tồn kho hệ thống.',
        tips: ['Nếu chênh lệch, bắt buộc nhập lý do và chụp ảnh.', 'Chênh lệch > 5% tự động tạo Error Queue.', 'Offline: kiểm kê vẫn hoạt động, lưu local.'],
      },
      {
        title: 'Error Queue Resolver',
        icon: 'ri-error-warning-line',
        content: 'Chỉ Quản đốc và Admin được truy cập. Xử lý các lỗi đồng bộ: sửa dữ liệu, gửi lại, hủy, hoặc đánh dấu cần xác minh.',
        tips: ['Mỗi lần xử lý đều được ghi audit log.', 'Conflict cần xem lịch sử giao dịch trước khi quyết định.', 'Gửi lại thành công sẽ cập nhật dữ liệu thật (HU, bin, batch).'],
      },
    ],
  },
  'offline-queue': {
    moduleName: 'Offline Queue',
    moduleIcon: 'ri-cloud-off-line',
    description: 'Quản lý các giao dịch được tạo khi offline. Khi có mạng trở lại, user phải xác nhận trước khi gửi lên SAP.',
    sections: [
      {
        title: 'Nguyên tắc Offline',
        icon: 'ri-wifi-off-line',
        content: 'Offline KHÔNG tự động gửi giao dịch lên SAP/mock SAP. User phải chủ động vào Xác nhận đồng bộ, kiểm tra lại thông tin rồi mới gửi.',
        steps: [
          { step: 1, text: 'Bật chế độ Offline trong Settings.' },
          { step: 2, text: 'Thực hiện nghiệp vụ (Putaway, QM Hold, Nhập kho TP, Kiểm kê...).' },
          { step: 3, text: 'Giao dịch được lưu local với trạng thái "Local Saved".' },
          { step: 4, text: 'Bật Online → Vào Sync Confirm để kiểm tra từng giao dịch.' },
          { step: 5, text: 'Xác nhận từng giao dịch → chuyển sang "Ready To Sync".' },
          { step: 6, text: 'Bấm "Đồng bộ ngay" → gửi lên mock SAP.' },
        ],
        roles: ['Thủ kho (tạo giao dịch)', 'Quản đốc (xác nhận, xử lý lỗi)'],
      },
      {
        title: 'Các loại giao dịch hỗ trợ offline',
        icon: 'ri-list-check',
        content: 'Putaway, QM Hold, Nhập kho TP, FEFO Picking, Kiểm kê, Điều chuyển, Nhận điều chuyển.',
        tips: ['Giao dịch đã Synced sẽ tự xóa khỏi queue.', 'Sync Failed → chuyển vào Error Queue.', 'Conflict → cần Quản đốc xử lý.'],
      },
    ],
  },
  'reports': {
    moduleName: 'Báo cáo',
    moduleIcon: 'ri-bar-chart-line',
    description: 'Xem báo cáo tổng hợp: Sản lượng, Tỷ lệ lỗi, QM Hold, Nhập/Xuất, Offline/Error Queue.',
    sections: [
      {
        title: 'Các loại báo cáo',
        icon: 'ri-file-chart-line',
        content: '6 tab báo cáo: Sản lượng, Tỷ lệ lỗi, QM Hold, Nhập/Xuất, Offline/Error, Truy xuất lô.',
        tips: ['Filter theo nhà máy (MA/BK), sản phẩm, ca.', 'Export CSV cho tất cả các tab (BOM UTF-8).', 'Tab Truy xuất lô: xem toàn bộ chuỗi 15 bước từ PO đến container.'],
      },
    ],
  },
  'production/wip': {
    moduleName: 'Ghi WIP',
    moduleIcon: 'ri-tools-line',
    description: 'Ghi nhận sản lượng theo từng công đoạn sản xuất.',
    sections: [
      {
        title: 'Cách ghi WIP',
        icon: 'ri-edit-line',
        content: 'Chọn Production Order đã phát hành → Chọn công đoạn → Nhập số lượng đầu vào → Phân loại Loại I/II/Loại bỏ.',
        steps: [
          { step: 1, text: 'Chọn PO từ danh sách lệnh đã phát hành (REL/STRT).' },
          { step: 2, text: 'Chọn công đoạn: Rửa, Cắt, Chần, IQF, Đóng gói...' },
          { step: 3, text: 'Nhập nguyên liệu được cấp và mã lô.' },
          { step: 4, text: 'Nhập số lượng Loại I, Loại II, Loại bỏ.' },
          { step: 5, text: 'Nếu có hao hụt, chọn lý do từ danh sách Loss Reasons.' },
          { step: 6, text: 'Lưu WIP → Tự động cập nhật tiến độ PO.' },
        ],
        roles: ['Công nhân SX', 'Quản đốc'],
      },
    ],
  },
};

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleKey?: string;
}

export default function HelpDrawer({ isOpen, onClose, moduleKey = 'production' }: HelpDrawerProps) {
  const { state } = useApp();
  const drawerRef = useRef<HTMLDivElement>(null);

  const content = HELP_CONTENT[moduleKey] || HELP_CONTENT['production'];

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative w-full max-w-[400px] bg-ant-bg h-full overflow-y-auto custom-scrollbar shadow-2xl animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ant-sx/10 flex items-center justify-center shrink-0">
            <i className={`${content.moduleIcon} text-ant-sx text-lg`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-ant-text">Hướng dẫn</h2>
            <p className="text-xs text-ant-text-secondary truncate">{content.moduleName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center active:scale-90 transition-all cursor-pointer shrink-0"
          >
            <i className="ri-close-line text-lg text-ant-text-secondary" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Description */}
          <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-4">
            <p className="text-sm text-ant-text leading-relaxed">{content.description}</p>
          </div>

          {/* Sections */}
          {content.sections.map((section, idx) => (
            <div key={idx} className="bg-ant-card rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ant-qm/10 flex items-center justify-center shrink-0">
                  <i className={`${section.icon} text-ant-qm text-sm`} />
                </div>
                <h3 className="text-sm font-bold text-ant-text">{section.title}</h3>
              </div>

              <p className="text-xs text-ant-text-secondary leading-relaxed">{section.content}</p>

              {/* Steps */}
              {section.steps && section.steps.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-xxs font-bold text-ant-text-secondary uppercase tracking-wider">Các bước thực hiện</p>
                  <div className="space-y-1.5">
                    {section.steps.map((step) => (
                      <div key={step.step} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-ant-sx/10 text-ant-sx text-xxs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {step.step}
                        </span>
                        <p className="text-xs text-ant-text-secondary leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {section.tips && section.tips.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xxs font-bold text-ant-warning uppercase tracking-wider">Lưu ý</p>
                  {section.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <i className="ri-lightbulb-line text-ant-warning text-xs mt-0.5 shrink-0" />
                      <p className="text-xs text-ant-text-secondary">{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Roles */}
              {section.roles && section.roles.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xxs font-bold text-ant-text-secondary uppercase tracking-wider mb-1.5">Phân quyền</p>
                  <div className="flex flex-wrap gap-1">
                    {section.roles.map((role, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-ant-nk/10 text-ant-nk text-xxs font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Role hint */}
          <div className="bg-ant-card rounded-xl border border-ant-warning/20 p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-ant-warning/10 flex items-center justify-center shrink-0">
                <i className="ri-user-line text-ant-warning text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-ant-text">Vai trò hiện tại của bạn</p>
                <p className="text-xs text-ant-text-secondary mt-0.5">
                  <strong>{state.role?.name || 'Chưa đăng nhập'}</strong> — {state.plant?.name || ''}
                </p>
                <p className="text-xxs text-ant-text-secondary mt-1">
                  Một số thao tác có thể bị giới hạn tùy theo vai trò của bạn.
                  Nếu không thấy nút thao tác, hãy kiểm tra dòng "Quyền hiện tại" ở đầu mỗi màn hình.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}