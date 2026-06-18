import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';
import type { PermissionAction } from '@/store/AppContext';

interface PermissionBannerProps {
  module: string;
  moduleIcon: string;
  moduleColor: 'sx' | 'nk' | 'xk' | 'qm';
  requiredPermissions: PermissionAction[];
  className?: string;
}

const MODULE_COLORS = {
  sx: { bg: 'bg-ant-sx', text: 'text-ant-sx', light: 'bg-ant-sx/5', border: 'border-ant-sx/15' },
  nk: { bg: 'bg-ant-nk', text: 'text-ant-nk', light: 'bg-ant-nk/5', border: 'border-ant-nk/15' },
  xk: { bg: 'bg-ant-xk', text: 'text-ant-xk', light: 'bg-ant-xk/5', border: 'border-ant-xk/15' },
  qm: { bg: 'bg-ant-qm', text: 'text-ant-qm', light: 'bg-ant-qm/5', border: 'border-ant-qm/15' },
};

const PERMISSION_ACTION_LABELS: Record<string, string> = {
  'PRODUCTION_CREATE_ORDER': 'Phát lệnh SX',
  'PRODUCTION_WIP': 'Ghi WIP',
  'PRODUCTION_PALLET': 'Tạo pallet BTP',
  'PRODUCTION_CONFIRM_FG': 'Xác nhận TP',
  'PRODUCTION_UTILITY': 'Ghi tiện ích',
  'PRODUCTION_SIGN': 'Ký bàn giao',
  'PRODUCTION_MATERIAL': 'Cấp vật tư',
  'INBOUND_RECEIVE_RM': 'Nhập nguyên liệu',
  'INBOUND_FG_RECEIVING': 'Nhập kho TP',
  'INBOUND_PUTAWAY': 'Putaway',
  'INBOUND_SIGN_WH': 'Ký thủ kho',
  'OUTBOUND_FEFO_PICKING': 'FEFO Picking',
  'OUTBOUND_FEFO_OVERRIDE': 'Override FEFO',
  'OUTBOUND_CONTAINER_LOADING': 'Đóng container',
  'OUTBOUND_CONTAINER_CHECK': 'Kiểm container',
  'OUTBOUND_BTP_ISSUE': 'Xuất BTP',
  'QM_HOLD': 'QM Hold',
  'QM_CYCLE_COUNT': 'Kiểm kê',
  'QM_CONTAINER_CHECK': 'Kiểm container QM',
  'TRANSFER_ORDER': 'Điều chuyển',
  'RECEIVE_TRANSFER': 'Nhận điều chuyển',
  'ERROR_QUEUE_RESOLVE': 'Xử lý Error Queue',
  'VIEW_DOCUMENTS': 'Xem chứng từ',
  'VIEW_INVOICE_STATUS': 'Xem hóa đơn',
};

export default function PermissionBanner({
  module,
  moduleIcon,
  moduleColor,
  requiredPermissions,
  className = '',
}: PermissionBannerProps) {
  const { state } = useApp();
  const roleId = state.role?.id || '';
  const roleName = state.role?.name || 'Chưa đăng nhập';
  const colors = MODULE_COLORS[moduleColor];

  const grantedPermissions = requiredPermissions.filter((p) => hasPermission(roleId, p));
  const deniedPermissions = requiredPermissions.filter((p) => !hasPermission(roleId, p));

  const isViewOnly = grantedPermissions.length > 0 && grantedPermissions.every((p) => p.endsWith('_VIEW'));
  const hasSomeOps = grantedPermissions.some((p) => !p.endsWith('_VIEW'));

  let summaryText = '';
  if (roleId === 'admin') {
    summaryText = `Toàn quyền — được ${grantedPermissions.length > 0 ? 'thao tác tất cả chức năng' : 'xem tất cả'}`;
  } else if (isViewOnly) {
    summaryText = `Chỉ xem — không được thao tác`;
  } else if (hasSomeOps) {
    const ops = grantedPermissions.filter((p) => !p.endsWith('_VIEW'));
    const opLabels = ops.map((p) => PERMISSION_ACTION_LABELS[p] || p).join(', ');
    summaryText = `Được ${opLabels}`;
  } else if (deniedPermissions.length > 0) {
    summaryText = 'Không có quyền thao tác trong phân hệ này';
  } else {
    summaryText = `${roleName}`;
  }

  return (
    <div className={`${colors.light} ${colors.border} rounded-xl border px-3.5 py-2.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
          <i className={`${moduleIcon} text-white text-sm`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ant-text">{module}</p>
          <p className="text-xxs text-ant-text-secondary">
            Quyền hiện tại: <span className={`font-semibold ${hasSomeOps ? colors.text : 'text-ant-text-secondary'}`}>{roleName}</span>
            {summaryText && ` — ${summaryText}`}
          </p>
        </div>
        {deniedPermissions.length > 0 && deniedPermissions.some((p) => !p.endsWith('_VIEW')) && (
          <div className="w-5 h-5 rounded-full bg-ant-error/10 flex items-center justify-center shrink-0">
            <i className="ri-error-warning-line text-xs text-ant-error" />
          </div>
        )}
      </div>
      {deniedPermissions.length > 0 && deniedPermissions.some((p) => !p.endsWith('_VIEW')) && (
        <div className="mt-2 pt-2 border-t border-gray-200/60">
          <p className="text-xxs text-ant-text-secondary">
            <span className="text-ant-error font-medium">Hạn chế: </span>
            {deniedPermissions.filter((p) => !p.endsWith('_VIEW')).slice(0, 2).map((p) => (
              PERMISSION_ACTION_LABELS[p] || p
            )).join(', ')}
            {deniedPermissions.filter((p) => !p.endsWith('_VIEW')).length > 2 && '...'}
            {' — '}
            {getPermissionExplanation(deniedPermissions.find((p) => !p.endsWith('_VIEW')) || deniedPermissions[0])}
          </p>
        </div>
      )}
    </div>
  );
}