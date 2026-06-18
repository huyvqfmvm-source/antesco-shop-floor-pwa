import { useApp } from '@/store/AppContext';

interface ActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export default function ActivityFeed({ maxItems = 5, compact = false }: ActivityFeedProps) {
  const { state } = useApp();
  const logs = state.activityLogs.slice(0, maxItems);

  const getActionColor = (action: string): string => {
    if (action.includes('Quét') || action.includes('Nhập kho')) return 'text-ant-nk';
    if (action.includes('Xuất kho') || action.includes('Điều chuyển')) return 'text-ant-xk';
    if (action.includes('chất lượng') || action.includes('Giữ')) return 'text-ant-error';
    if (action.includes('SX') || action.includes('Duyệt') || action.includes('Báo cáo')) return 'text-ant-sx';
    return 'text-ant-qm';
  };

  const getActionIcon = (action: string): string => {
    if (action.includes('Quét')) return 'ri-qr-scan-line';
    if (action.includes('Nhập kho')) return 'ri-archive-drawer-line';
    if (action.includes('Xuất kho')) return 'ri-truck-line';
    if (action.includes('Điều chuyển')) return 'ri-arrow-left-right-line';
    if (action.includes('chất lượng') || action.includes('Giữ')) return 'ri-error-warning-line';
    if (action.includes('SX') || action.includes('Duyệt')) return 'ri-check-double-line';
    if (action.includes('Báo cáo')) return 'ri-file-chart-line';
    if (action.includes('Kiểm tra')) return 'ri-tools-line';
    return 'ri-information-line';
  };

  return (
    <div className={compact ? '' : 'bg-ant-card rounded-xl border border-gray-100 p-4'}>
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ant-text">Hoạt động gần đây</h3>
          <a
            href="/home"
            onClick={(e) => { e.preventDefault(); window.REACT_APP_NAVIGATE?.('/home'); }}
            className="text-xs text-ant-nk font-medium"
          >
            Xem tất cả
          </a>
        </div>
      )}
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className={`flex items-start gap-3 ${compact ? 'py-1.5' : 'py-2'} border-b border-gray-50 last:border-0`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              getActionColor(log.action).replace('text-', 'bg-') + '/10'
            }`}>
              <i className={`${getActionIcon(log.action)} ${getActionColor(log.action)} text-sm`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-ant-text">{log.user}</span>
                <span className={`text-xxs font-medium ${getActionColor(log.action)}`}>{log.action}</span>
              </div>
              <p className="text-xs text-ant-text-secondary truncate">{log.detail}</p>
              <p className="text-xxs text-ant-text-secondary/60 mt-0.5">{log.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}