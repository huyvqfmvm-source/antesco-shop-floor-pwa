import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

interface TempAlert {
  id: string;
  warehouse: string;
  warehouseName: string;
  plant: string;
  targetTemp: number;
  currentTemp: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
  sensor: string;
  duration: string;
  acknowledged: boolean;
}

const MOCK_TEMP_ALERTS: TempAlert[] = [
  { id: 'TMP-001', warehouse: 'KL-03', warehouseName: 'Kho lạnh 03', plant: 'MA', targetTemp: -18, currentTemp: -17.2, threshold: -16, status: 'warning', timestamp: '2026-06-20 07:15', sensor: 'Sensor KL-03-B2', duration: '45 phút', acknowledged: false },
  { id: 'TMP-002', warehouse: 'KL-01', warehouseName: 'Kho lạnh 01', plant: 'MA', targetTemp: -18, currentTemp: -18.4, threshold: -16, status: 'normal', timestamp: '2026-06-20 07:20', sensor: 'Sensor KL-01-A1', duration: '--', acknowledged: true },
  { id: 'TMP-003', warehouse: 'KL-05', warehouseName: 'Kho lạnh 05', plant: 'BK', targetTemp: -18, currentTemp: -14.8, threshold: -16, status: 'critical', timestamp: '2026-06-20 06:50', sensor: 'Sensor KL-05-C2', duration: '1h 10m', acknowledged: false },
  { id: 'TMP-004', warehouse: 'KL-04', warehouseName: 'Kho lạnh 04', plant: 'MA', targetTemp: -22, currentTemp: -21.5, threshold: -20, status: 'normal', timestamp: '2026-06-20 07:10', sensor: 'Sensor KL-04-A1', duration: '--', acknowledged: true },
  { id: 'TMP-005', warehouse: 'KL-07', warehouseName: 'Kho lạnh 07', plant: 'BK', targetTemp: -22, currentTemp: -19.3, threshold: -20, status: 'warning', timestamp: '2026-06-20 06:30', sensor: 'Sensor KL-07-B2', duration: '50 phút', acknowledged: false },
  { id: 'TMP-006', warehouse: 'KL-02', warehouseName: 'Kho lạnh 02', plant: 'MA', targetTemp: -18, currentTemp: -18.1, threshold: -16, status: 'normal', timestamp: '2026-06-20 07:18', sensor: 'Sensor KL-02-A3', duration: '--', acknowledged: true },
  { id: 'TMP-007', warehouse: 'KL-06', warehouseName: 'Kho lạnh 06', plant: 'BK', targetTemp: -18, currentTemp: -17.5, threshold: -16, status: 'normal', timestamp: '2026-06-20 07:12', sensor: 'Sensor KL-06-A1', duration: '--', acknowledged: true },
  { id: 'TMP-008', warehouse: 'KL-08', warehouseName: 'Kho lạnh 08', plant: 'BK', targetTemp: -18, currentTemp: -16.1, threshold: -16, status: 'warning', timestamp: '2026-06-20 07:05', sensor: 'Sensor KL-08-C2', duration: '15 phút', acknowledged: false },
  { id: 'TMP-009', warehouse: 'KM-01', warehouseName: 'Kho mát 01', plant: 'MA', targetTemp: 4, currentTemp: 5.8, threshold: 6, status: 'warning', timestamp: '2026-06-20 07:00', sensor: 'Sensor KM-01-A1', duration: '20 phút', acknowledged: false },
  { id: 'TMP-010', warehouse: 'KM-02', warehouseName: 'Kho mát 02', plant: 'MA', targetTemp: 4, currentTemp: 6.5, threshold: 6, status: 'critical', timestamp: '2026-06-20 06:45', sensor: 'Sensor KM-02-A1', duration: '35 phút', acknowledged: false },
];

const STATUS_ICONS: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  normal: { icon: 'ri-check-line', color: 'text-ant-sx', bg: 'bg-ant-sx/10', label: 'Bình thường' },
  warning: { icon: 'ri-alert-line', color: 'text-ant-warning', bg: 'bg-ant-warning/10', label: 'Cảnh báo' },
  critical: { icon: 'ri-error-warning-line', color: 'text-ant-error', bg: 'bg-ant-error/10', label: 'Nguy cấp' },
};

export default function TemperatureAlertsPage() {
  const navigate = useNavigate();
  const { state, addToast, addActivityLog } = useApp();

  const [alerts, setAlerts] = useState(MOCK_TEMP_ALERTS);
  const [filter, setFilter] = useState<'all' | 'warning' | 'critical' | 'normal'>('all');
  const [plantFilter, setPlantFilter] = useState(state.plant?.code || '');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (plantFilter && a.plant !== plantFilter) return false;
      return true;
    }).sort((a, b) => {
      const order = { critical: 0, warning: 1, normal: 2 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
  }, [alerts, filter, plantFilter]);

  const criticalCount = alerts.filter((a) => a.status === 'critical').length;
  const warningCount = alerts.filter((a) => a.status === 'warning').length;

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, acknowledged: true } : a));
    addToast('success', 'Đã xác nhận cảnh báo nhiệt độ');
    addActivityLog(state.currentUser, state.role?.name || '', 'Xác nhận cảnh báo nhiệt độ', `${alertId} — Đã acknowledged`);
  };

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Cảnh báo nhiệt độ kho</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{state.plant?.name} · Monitoring 24/7</p>
        </div>
        {(criticalCount > 0 || warningCount > 0) && (
          <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${criticalCount > 0 ? 'bg-ant-error/10 text-ant-error' : 'bg-ant-warning/10 text-ant-warning'}`}>
            {criticalCount > 0 ? `${criticalCount} nguy cấp` : `${warningCount} cảnh báo`}
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ant-error/5 rounded-xl border border-ant-error/10 p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-ant-error/20 flex items-center justify-center mb-1.5">
              <i className="ri-error-warning-line text-ant-error text-sm" />
            </div>
            <p className="text-xl font-bold text-ant-error">{criticalCount}</p>
            <p className="text-xxs text-ant-text-secondary">Nguy cấp</p>
          </div>
          <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-ant-warning/20 flex items-center justify-center mb-1.5">
              <i className="ri-alert-line text-ant-warning text-sm" />
            </div>
            <p className="text-xl font-bold text-ant-warning">{warningCount}</p>
            <p className="text-xxs text-ant-text-secondary">Cảnh báo</p>
          </div>
          <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-ant-sx/20 flex items-center justify-center mb-1.5">
              <i className="ri-check-line text-ant-sx text-sm" />
            </div>
            <p className="text-xl font-bold text-ant-sx">{alerts.filter((a) => a.status === 'normal').length}</p>
            <p className="text-xxs text-ant-text-secondary">Bình thường</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-ant-nk text-white' : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'}`}
            >
              Tất cả ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${filter === 'critical' ? 'bg-ant-error text-white' : 'bg-ant-error/10 text-ant-error hover:bg-ant-error/20'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Nguy cấp ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'warning' ? 'bg-ant-warning text-white' : 'bg-ant-warning/10 text-ant-warning hover:bg-ant-warning/20'}`}
            >
              Cảnh báo ({warningCount})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'normal' ? 'bg-ant-sx text-white' : 'bg-ant-sx/10 text-ant-sx hover:bg-ant-sx/20'}`}
            >
              Bình thường
            </button>
          </div>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="h-9 px-2 rounded-xl border border-gray-200 text-xs font-bold text-ant-text bg-white shrink-0"
          >
            <option value="">All NM</option>
            <option value="MA">Mỹ An</option>
            <option value="BK">Bình Khánh</option>
          </select>
        </div>

        {/* Alert Cards */}
        <div className="space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <i className="ri-check-line text-xl text-ant-text-secondary" />
              </div>
              <p className="text-sm text-ant-text-secondary">Không có cảnh báo nhiệt độ nào</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const st = STATUS_ICONS[alert.status];
              const diff = alert.currentTemp - alert.targetTemp;
              const diffStr = diff > 0 ? `+${diff.toFixed(1)}°C` : `${diff.toFixed(1)}°C`;
              const isRising = diff > 0;

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 transition-all ${
                    alert.status === 'critical' ? 'border-ant-error/30 bg-ant-error/5' :
                    alert.status === 'warning' ? 'border-ant-warning/30 bg-ant-warning/5' :
                    'border-gray-100 bg-ant-card'
                  }`}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.bg}`}>
                        <i className={`${st.icon} ${st.color} text-lg`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-bold text-ant-text">{alert.warehouse}</p>
                          <span className="text-xxs text-ant-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">{alert.plant}</span>
                        </div>
                        <p className="text-xs text-ant-text-secondary">{alert.warehouseName}</p>
                      </div>
                    </div>
                    <span className={`text-xxs font-bold px-2 py-1 rounded-full ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Temp Display */}
                  <div className="bg-ant-bg rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-ant-text-secondary">Nhiệt độ hiện tại</span>
                      <span className={`text-sm font-bold ${alert.status === 'critical' ? 'text-ant-error' : alert.status === 'warning' ? 'text-ant-warning' : 'text-ant-sx'}`}>
                        {alert.sensor}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-3">
                        <span className={`text-3xl font-bold ${
                          alert.status === 'critical' ? 'text-ant-error' :
                          alert.status === 'warning' ? 'text-ant-warning' :
                          'text-ant-sx'
                        }`}>
                          {alert.currentTemp.toFixed(1)}°C
                        </span>
                        <span className={`text-sm font-bold mb-1 ${isRising ? 'text-ant-error' : 'text-ant-nk'}`}>
                          {isRising ? <i className="ri-arrow-up-line mr-0.5" /> : <i className="ri-arrow-down-line mr-0.5" />}
                          {diffStr}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xxs text-ant-text-secondary">Mục tiêu</p>
                        <p className="text-sm font-bold text-ant-text">{alert.targetTemp}°C</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          alert.status === 'critical' ? 'bg-ant-error' :
                          alert.status === 'warning' ? 'bg-ant-warning' :
                          'bg-ant-sx'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, ((Math.abs(alert.currentTemp) - 10) / 15) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xxs mb-3">
                    <div>
                      <span className="text-ant-text-secondary">Thời gian: </span>
                      <span className="text-ant-text font-medium">{alert.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-ant-text-secondary">Kéo dài: </span>
                      <span className={`font-medium ${alert.status !== 'normal' ? 'text-ant-warning' : 'text-ant-text'}`}>{alert.duration}</span>
                    </div>
                    <div>
                      <span className="text-ant-text-secondary">Ngưỡng: </span>
                      <span className="text-ant-text font-medium">{alert.threshold}°C</span>
                    </div>
                    <div>
                      <span className="text-ant-text-secondary">Cảm biến: </span>
                      <span className="text-ant-text font-mono font-medium">{alert.sensor}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {alert.status !== 'normal' && !alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className={`w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        alert.status === 'critical'
                          ? 'bg-ant-error text-white'
                          : 'bg-ant-warning text-white'
                      }`}
                    >
                      <i className="ri-check-line text-sm" />
                      Xác nhận đã kiểm tra
                    </button>
                  )}
                  {alert.acknowledged && (
                    <div className="w-full h-10 rounded-xl bg-ant-sx/10 text-ant-sx text-xs font-bold flex items-center justify-center gap-1.5">
                      <i className="ri-check-double-line text-sm" />
                      Đã xác nhận kiểm tra
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="bg-ant-nk/5 rounded-xl p-3 border border-ant-nk/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-information-line text-ant-nk text-xs" />
            </div>
            <p className="text-xs font-medium text-ant-nk">Hướng dẫn xử lý</p>
          </div>
          <div className="space-y-1 text-xxs text-ant-text-secondary">
            <p><strong className="text-ant-error">Nguy cấp</strong>: Nhiệt độ vượt ngưỡng nguy hiểm — Gọi ngay kỹ thuật trực ca. Kiểm tra hệ thống lạnh, máy nén, gas.</p>
            <p><strong className="text-ant-warning">Cảnh báo</strong>: Nhiệt độ dao động bất thường — Theo dõi 30 phút. Nếu không cải thiện, báo kỹ thuật.</p>
            <p><strong className="text-ant-sx">Bình thường</strong>: Nhiệt độ trong ngưỡng an toàn — Ghi nhận định kỳ.</p>
          </div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}