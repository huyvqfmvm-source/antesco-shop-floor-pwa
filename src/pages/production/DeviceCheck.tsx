import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';

const DEVICES = [
  { id: 'IQF-LINE-1', name: 'Máy cấp đông IQF Line 1', area: 'Xưởng SX 1 — MA', type: 'Thiết bị chính', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 06:00', icon: 'ri-snowflake-line', color: 'ant-sx' },
  { id: 'IQF-LINE-2', name: 'Máy cấp đông IQF Line 2', area: 'Xưởng SX 2 — BK', type: 'Thiết bị chính', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 18:00', icon: 'ri-snowflake-line', color: 'ant-sx' },
  { id: 'BLST-FRZR-01', name: 'Tủ cấp đông Blast Freezer', area: 'Khu đông lạnh nhanh', type: 'Thiết bị chính', checkInterval: 'Hàng ngày', lastCheck: '2026-06-18', icon: 'ri-temp-cold-line', color: 'ant-nk' },
  { id: 'CLD-STR-03A', name: 'Hệ thống lạnh Kho lạnh 03', area: 'Kho lạnh 03 — MA', type: 'Hạ tầng', checkInterval: 'Hàng tuần', lastCheck: '2026-06-15', icon: 'ri-building-line', color: 'ant-nk' },
  { id: 'CLD-STR-05B', name: 'Hệ thống lạnh Kho lạnh 05', area: 'Kho lạnh 05 — BK', type: 'Hạ tầng', checkInterval: 'Hàng tuần', lastCheck: '2026-06-16', icon: 'ri-building-line', color: 'ant-nk' },
  { id: 'CONV-BELT-A', name: 'Băng tải chuyền cắt A', area: 'Xưởng cắt — MA', type: 'Thiết bị phụ', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 06:00', icon: 'ri-settings-3-line', color: 'ant-qm' },
  { id: 'CONV-BELT-B', name: 'Băng tải chuyền cắt B', area: 'Xưởng cắt — BK', type: 'Thiết bị phụ', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 18:00', icon: 'ri-settings-3-line', color: 'ant-qm' },
  { id: 'WATER-CHL-01', name: 'Hệ thống nước lạnh Chiller', area: 'Khu kỹ thuật — MA', type: 'Hạ tầng', checkInterval: 'Hàng ngày', lastCheck: '2026-06-18', icon: 'ri-drop-line', color: 'ant-nk' },
  { id: 'CMPRSR-AIR-1', name: 'Máy nén khí Compressor 1', area: 'Khu kỹ thuật — MA', type: 'Hạ tầng', checkInterval: 'Hàng ngày', lastCheck: '2026-06-18', icon: 'ri-tools-line', color: 'ant-qm' },
  { id: 'MNTL-DTECT-01', name: 'Máy dò kim loại Line 1', area: 'QC Line — MA', type: 'Thiết bị QC', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 06:00', icon: 'ri-radar-line', color: 'ant-xk' },
  { id: 'MNTL-DTECT-02', name: 'Máy dò kim loại Line 2', area: 'QC Line — BK', type: 'Thiết bị QC', checkInterval: 'Mỗi ca', lastCheck: '2026-06-19 18:00', icon: 'ri-radar-line', color: 'ant-xk' },
  { id: 'TEMP-LOG-01', name: 'Data Logger nhiệt độ kho lạnh', area: 'Toàn kho lạnh — MA', type: 'Thiết bị QC', checkInterval: 'Hàng ngày', lastCheck: '2026-06-19', icon: 'ri-database-2-line', color: 'ant-nk' },
];

const CHECKLIST_ITEMS_BY_TYPE: Record<string, { id: string; label: string }[]> = {
  'Thiết bị chính': [
    { id: 'temp', label: 'Nhiệt độ hoạt động trong ngưỡng' },
    { id: 'noise', label: 'Độ ồn bình thường' },
    { id: 'vibration', label: 'Không rung lắc bất thường' },
    { id: 'clean', label: 'Vệ sinh bề mặt thiết bị' },
    { id: 'belt', label: 'Dây curoa/băng tải hoạt động tốt' },
    { id: 'safety', label: 'Thiết bị an toàn hoạt động' },
    { id: 'control', label: 'Bảng điều khiển hoạt động' },
  ],
  'Hạ tầng': [
    { id: 'pressure', label: 'Áp suất trong ngưỡng cho phép' },
    { id: 'leak', label: 'Không rò rỉ gas/nước' },
    { id: 'filter', label: 'Lọc/bộ trao đổi nhiệt sạch' },
    { id: 'electrical', label: 'Tủ điện khô ráo, không chập' },
    { id: 'drain', label: 'Đường thoát nước ngưng thông' },
  ],
  'Thiết bị phụ': [
    { id: 'alignment', label: 'Căn chỉnh băng tải đúng' },
    { id: 'motor', label: 'Motor không nóng bất thường' },
    { id: 'rollers', label: 'Con lăn quay trơn tru' },
  ],
  'Thiết bị QC': [
    { id: 'calibration', label: 'Hiệu chuẩn trong hạn' },
    { id: 'sensor', label: 'Cảm biến nhạy, phản hồi tốt' },
    { id: 'alarm', label: 'Cảnh báo/còi hoạt động' },
    { id: 'log', label: 'Data log đầy đủ' },
  ],
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  'Chưa kiểm tra': { label: 'Chưa kiểm tra', color: 'text-ant-text-secondary', bg: 'bg-gray-100', icon: 'ri-checkbox-blank-circle-line' },
  'OK': { label: 'Đạt', color: 'text-ant-sx', bg: 'bg-ant-sx/10', icon: 'ri-checkbox-circle-line' },
  'Cần bảo trì': { label: 'Cần bảo trì', color: 'text-ant-warning', bg: 'bg-ant-warning/10', icon: 'ri-alert-line' },
  'Lỗi': { label: 'Lỗi/Dừng máy', color: 'text-ant-error', bg: 'bg-ant-error/10', icon: 'ri-close-circle-line' },
};

export default function DeviceCheckPage() {
  const navigate = useNavigate();
  const { state, addToast, addActivityLog, simulateAction } = useApp();

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [checklistResults, setChecklistResults] = useState<Record<string, string>>({});
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, string>>(
    Object.fromEntries(DEVICES.map((d) => [d.id, 'Chưa kiểm tra']))
  );
  const [note, setNote] = useState('');
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const activeDevice = DEVICES.find((d) => d.id === selectedDevice);
  const checklistItems = activeDevice ? (CHECKLIST_ITEMS_BY_TYPE[activeDevice.type] || CHECKLIST_ITEMS_BY_TYPE['Thiết bị chính']) : [];

  const okCount = Object.values(deviceStatuses).filter((s) => s === 'OK').length;
  const warningCount = Object.values(deviceStatuses).filter((s) => s === 'Cần bảo trì').length;
  const errorCount = Object.values(deviceStatuses).filter((s) => s === 'Lỗi').length;

  const handleScanDevice = (deviceId: string) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSelectedDevice(deviceId);
      const device = DEVICES.find((d) => d.id === deviceId);
      if (device) {
        addToast('success', `Đã quét thiết bị: ${device.id}`);
        const items = CHECKLIST_ITEMS_BY_TYPE[device.type] || CHECKLIST_ITEMS_BY_TYPE['Thiết bị chính'];
        setChecklistResults(Object.fromEntries(items.map((it) => [it.id, ''])));
      }
    }, 600);
  };

  const toggleCheckItem = (itemId: string) => {
    setChecklistResults((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === 'OK' ? 'Cần bảo trì' : prev[itemId] === 'Cần bảo trì' ? 'Lỗi' : 'OK',
    }));
  };

  const handleSaveDevice = () => {
    if (!activeDevice) return;

    const results = checklistItems.map((it) => checklistResults[it.id] || '');
    const allOk = results.every((r) => r === 'OK');
    const hasError = results.some((r) => r === 'Lỗi');
    const status = hasError ? 'Lỗi' : allOk ? 'OK' : 'Cần bảo trì';

    setConfirming(true);
    const details = `Thiết bị ${activeDevice.id} — ${checklistItems.length} mục kiểm: ${results.filter((r) => r === 'OK').length} OK · ${results.filter((r) => r === 'Cần bảo trì').length} cần bảo trì · ${results.filter((r) => r === 'Lỗi').length} lỗi`;

    simulateAction(
      'Kiểm tra thiết bị',
      details,
      status === 'OK'
        ? `Đã kiểm tra ${activeDevice.id} — Tất cả đạt`
        : status === 'Lỗi'
        ? `Đã kiểm tra ${activeDevice.id} — Có lỗi cần xử lý gấp!`
        : `Đã kiểm tra ${activeDevice.id} — Cần bảo trì`,
      () => {
        setDeviceStatuses((prev) => ({ ...prev, [activeDevice.id]: status }));
        addActivityLog(
          state.currentUser, state.role?.name || '',
          'Kiểm tra thiết bị',
          `${activeDevice.id} — ${activeDevice.name} · ${status}`,
          'Chưa kiểm tra', status,
          note || undefined
        );
        if (hasError) {
          addToast('error', `THIẾT BỊ ${activeDevice.id} CÓ LỖI — Cần báo ngay Quản đốc!`);
        }
        setSelectedDevice(null);
        setNote('');
        setConfirming(false);
      }
    );
  };

  const statusSort = (a: string, b: string) => {
    const order = { 'Lỗi': 0, 'Cần bảo trì': 1, 'Chưa kiểm tra': 2, 'OK': 3 };
    return (order[a as keyof typeof order] || 4) - (order[b as keyof typeof order] || 4);
  };

  const sortedDevices = [...DEVICES].sort((a, b) => statusSort(deviceStatuses[a.id], deviceStatuses[b.id]));

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Kiểm tra thiết bị</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{state.plant?.name} · {state.currentUser}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${errorCount > 0 ? 'bg-ant-error/10 text-ant-error' : 'bg-ant-sx/10 text-ant-sx'}`}>
            {errorCount > 0 ? `${errorCount} lỗi` : `${okCount} OK`}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ant-sx/5 rounded-xl border border-ant-sx/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-sx">{okCount}</p>
            <p className="text-xxs text-ant-text-secondary">Đạt</p>
          </div>
          <div className="bg-ant-warning/5 rounded-xl border border-ant-warning/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-warning">{warningCount}</p>
            <p className="text-xxs text-ant-text-secondary">Cần bảo trì</p>
          </div>
          <div className="bg-ant-error/5 rounded-xl border border-ant-error/10 p-3 text-center">
            <p className="text-xl font-bold text-ant-error">{errorCount}</p>
            <p className="text-xxs text-ant-text-secondary">Lỗi</p>
          </div>
        </div>

        {/* Device List or Detail */}
        {!selectedDevice ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider">Danh sách thiết bị ({DEVICES.length})</h3>
              <span className="text-xxs text-ant-text-secondary">{state.plant?.name}</span>
            </div>

            {/* Filter by status */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  className={`h-8 px-2.5 rounded-xl text-xxs font-bold whitespace-nowrap flex items-center gap-1 ${val.bg} ${val.color}`}
                >
                  <i className={`${val.icon} text-xs`} />
                  {val.label} ({Object.values(deviceStatuses).filter((s) => s === key).length})
                </button>
              ))}
            </div>

            {/* Device Grid */}
            <div className="space-y-2">
              {sortedDevices.map((device) => {
                const status = deviceStatuses[device.id];
                const sc = STATUS_CONFIG[status] || STATUS_CONFIG['Chưa kiểm tra'];
                return (
                  <button
                    key={device.id}
                    onClick={() => handleScanDevice(device.id)}
                    disabled={scanning}
                    className={`w-full p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      status === 'Lỗi' ? 'border-ant-error/30 bg-ant-error/5' :
                      status === 'Cần bảo trì' ? 'border-ant-warning/30 bg-ant-warning/5' :
                      status === 'OK' ? 'border-ant-sx/20 bg-ant-sx/5' :
                      'border-gray-100 bg-ant-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        status === 'Lỗi' ? 'bg-ant-error/10' :
                        status === 'Cần bảo trì' ? 'bg-ant-warning/10' :
                        status === 'OK' ? 'bg-ant-sx/10' :
                        'bg-gray-100'
                      }`}>
                        <i className={`${device.icon} text-sm ${
                          status === 'Lỗi' ? 'text-ant-error' :
                          status === 'Cần bảo trì' ? 'text-ant-warning' :
                          status === 'OK' ? 'text-ant-sx' :
                          'text-ant-text-secondary'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ant-text">{device.id}</p>
                            <p className="text-xs text-ant-text-secondary truncate">{device.name}</p>
                          </div>
                          <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xxs text-ant-text-secondary">
                          <span><i className="ri-map-pin-line mr-0.5" />{device.area}</span>
                          <span>Kiểm cuối: {device.lastCheck}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Device Detail + Checklist */}
            <button onClick={() => setSelectedDevice(null)} className="flex items-center gap-1.5 text-xs text-ant-text-secondary hover:text-ant-text transition-colors">
              <i className="ri-arrow-left-line" />Quay lại danh sách
            </button>

            {/* Device Info */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-ant-sx/10 flex items-center justify-center shrink-0">
                  <i className={`${activeDevice?.icon} text-ant-sx text-lg`} />
                </div>
                <div>
                  <p className="text-sm font-mono font-bold text-ant-text">{activeDevice?.id}</p>
                  <p className="text-xs text-ant-text-secondary">{activeDevice?.name}</p>
                  <p className="text-xxs text-ant-text-secondary mt-0.5">{activeDevice?.area} · {activeDevice?.type} · Kiểm: {activeDevice?.checkInterval}</p>
                </div>
              </div>
              <div className="text-xxs text-ant-text-secondary bg-ant-bg rounded-lg p-2.5">
                Lần kiểm cuối: <strong className="text-ant-text">{activeDevice?.lastCheck}</strong>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-ant-text mb-3">Checklist kiểm tra ({checklistItems.length} mục)</h3>
              <div className="space-y-1.5">
                {checklistItems.map((item) => {
                  const result = checklistResults[item.id];
                  const sc = result === 'OK' ? STATUS_CONFIG['OK'] :
                             result === 'Cần bảo trì' ? STATUS_CONFIG['Cần bảo trì'] :
                             result === 'Lỗi' ? STATUS_CONFIG['Lỗi'] :
                             STATUS_CONFIG['Chưa kiểm tra'];
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        result === 'Lỗi' ? 'border-ant-error/30 bg-ant-error/5' :
                        result === 'Cần bảo trì' ? 'border-ant-warning/30 bg-ant-warning/5' :
                        result === 'OK' ? 'border-ant-sx/20 bg-ant-sx/5' :
                        'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${sc.bg}`}>
                          <i className={`${sc.icon} ${sc.color} text-xs`} />
                        </div>
                        <span className="text-xs text-ant-text text-left">{item.label}</span>
                      </div>
                      <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setChecklistResults(Object.fromEntries(checklistItems.map((it) => [it.id, 'OK'])));
                    addToast('success', 'Đã đánh dấu tất cả ĐẠT');
                  }}
                  className="flex-1 h-9 rounded-lg bg-ant-sx/10 text-ant-sx text-xs font-bold hover:bg-ant-sx/20 transition-colors flex items-center justify-center gap-1"
                >
                  <i className="ri-check-double-line text-sm" />Tất cả Đạt
                </button>
                <button
                  onClick={() => setChecklistResults(Object.fromEntries(checklistItems.map((it) => [it.id, ''])))}
                  className="flex-1 h-9 rounded-lg bg-gray-100 text-ant-text-secondary text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <i className="ri-refresh-line text-sm" />Bỏ chọn hết
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-medium text-ant-text-secondary mb-1.5 block">Ghi chú (nếu có lỗi hoặc cần bảo trì)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mô tả chi tiết lỗi, vị trí, mức độ nghiêm trọng..."
                maxLength={500}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-ant-text bg-white resize-none h-20 focus:outline-none focus:border-ant-sx/50"
              />
              <p className="text-xxs text-ant-text-secondary text-right mt-1">{note.length}/500</p>
            </div>

            {/* Save */}
            <button
              onClick={handleSaveDevice}
              disabled={confirming}
              className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                confirming ? 'bg-gray-300 cursor-not-allowed' : 'bg-ant-sx'
              }`}
            >
              {confirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-save-line text-lg" />
                  </div>
                  Lưu kết quả kiểm tra
                </>
              )}
            </button>
          </>
        )}

        {/* Error alerts banner */}
        {errorCount > 0 && (
          <div className="bg-ant-error/5 rounded-xl p-4 border border-ant-error/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-ant-error/20 flex items-center justify-center">
                <i className="ri-error-warning-line text-ant-error text-xs" />
              </div>
              <p className="text-xs font-bold text-ant-error">THIẾT BỊ CÓ LỖI CẦN XỬ LÝ NGAY</p>
            </div>
            <div className="space-y-1">
              {DEVICES.filter((d) => deviceStatuses[d.id] === 'Lỗi').map((d) => (
                <div key={d.id} className="text-xs text-ant-text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ant-error shrink-0" />
                  <span className="font-mono font-bold text-ant-error">{d.id}</span>
                  <span className="text-ant-text-secondary">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}