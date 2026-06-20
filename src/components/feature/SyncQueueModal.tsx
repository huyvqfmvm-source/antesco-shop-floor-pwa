import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/base/StatusBadge';

export default function SyncQueueModal() {
  const { state } = useApp();

  if (!state.showSyncModal) return null;

  const progress = state.syncProgress;
  const total = progress?.total || 0;
  const current = progress?.current || 0;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  const queueItems = state.offlineQueue.filter((q) =>
    q.status === 'Pending Sync' || q.status === 'Local Saved' || q.status === 'Syncing' || q.status === 'Sync Failed'
  );

  const getItemStatusVariant = (status: string): 'sync' | 'error' | 'success' | 'neutral' => {
    switch (status) {
      case 'Syncing': return 'sync';
      case 'Sync Failed': return 'error';
      case 'Synced': return 'success';
      default: return 'neutral';
    }
  };

  const getItemStatusLabel = (status: string): string => {
    switch (status) {
      case 'Syncing': return 'Đang gửi';
      case 'Sync Failed': return 'Lỗi';
      case 'Synced': return 'OK';
      default: return 'Chờ';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-ant-card rounded-2xl p-6 w-full max-w-sm animate-scale-in">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-ant-sync/10 flex items-center justify-center mb-4">
          <i className="ri-cloud-line text-2xl text-ant-sync" />
        </div>

        <h3 className="text-base font-bold text-ant-text text-center">Đang đồng bộ queue</h3>
        <p className="text-xs text-ant-text-secondary text-center mt-1">
          Đang gửi {total} giao dịch lên Mock SAP
        </p>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-ant-text-secondary">{current}/{total} giao dịch</span>
            <span className="text-sm font-bold text-ant-sync">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-ant-sync rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Queue items */}
        <div className="mt-4 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          {queueItems.map((item) => (
            <div
              key={item.queueId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                item.status === 'Syncing' ? 'bg-ant-sync/5 border border-ant-sync/15' :
                item.status === 'Sync Failed' ? 'bg-ant-error/5 border border-ant-error/15' :
                item.status === 'Synced' ? 'bg-ant-sx/5 border border-ant-sx/15' :
                'bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {item.status === 'Syncing' && (
                  <div className="w-4 h-4 border-2 border-ant-sync border-t-transparent rounded-full animate-spin" />
                )}
                {item.status === 'Sync Failed' && <i className="ri-close-circle-line text-ant-error text-sm" />}
                {item.status === 'Synced' && <i className="ri-checkbox-circle-line text-ant-sx text-sm" />}
                {(item.status === 'Pending Sync' || item.status === 'Local Saved') && <i className="ri-time-line text-ant-text-secondary text-sm" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ant-text truncate">{item.mockMovement}</p>
                <p className="text-xxs text-ant-text-secondary truncate">
                  {item.type === 'PUTAWAY' ? 'Putaway' : 'QM Hold'} · {item.huId || item.batchId}
                </p>
              </div>
              <StatusBadge
                variant={getItemStatusVariant(item.status)}
                label={getItemStatusLabel(item.status)}
                size="sm"
              />
            </div>
          ))}
        </div>

        {pct === 100 && (
          <div className="mt-4 py-2.5 rounded-xl bg-ant-sx/5 border border-ant-sx/15 flex items-center justify-center gap-2">
            <i className="ri-check-double-line text-ant-sx text-sm" />
            <p className="text-sm font-bold text-ant-sx">Hoàn tất đồng bộ!</p>
          </div>
        )}
      </div>
    </div>
  );
}