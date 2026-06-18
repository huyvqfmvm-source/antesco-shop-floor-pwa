import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, hasPermission, getPermissionExplanation } from '@/store/AppContext';

interface UtilityField {
  key: string;
  label: string;
  unit: string;
  icon: string;
  startVal: number;
  endVal: number;
  threshold: number;
  thresholdWarn: string;
}

const UTILITY_FIELDS: UtilityField[] = [
  {
    key: 'dien', label: 'Điện', unit: 'kWh', icon: 'ri-plug-line',
    startVal: 850200, endVal: 854500, threshold: 5000,
    thresholdWarn: 'Tiêu hao điện vượt ngưỡng 5,000 kWh/ca',
  },
  {
    key: 'nuoc', label: 'Nước', unit: 'm³', icon: 'ri-drop-line',
    startVal: 12450, endVal: 12485, threshold: 40,
    thresholdWarn: 'Tiêu hao nước vượt ngưỡng 40 m³/ca',
  },
  {
    key: 'hoi', label: 'Hơi bão hòa', unit: 'Tấn', icon: 'ri-fire-line',
    startVal: 320, endVal: 333, threshold: 15,
    thresholdWarn: 'Tiêu hao hơi vượt ngưỡng 15 tấn/ca',
  },
];

export default function ProductionUtilityPage() {
  const navigate = useNavigate();
  const { state, addToast, addActivityLog, simulateAction } = useApp();
  const canUtility = hasPermission(state.role?.id, 'PRODUCTION_UTILITY');

  const [fields, setFields] = useState(UTILITY_FIELDS.map((f) => ({
    ...f,
    currentStart: f.startVal,
    currentEnd: f.endVal,
  })));
  const [saving, setSaving] = useState(false);

  const updateStart = (key: string, delta: number) => {
    setFields((prev) => prev.map((f) =>
      f.key === key ? { ...f, currentStart: Math.max(0, f.currentStart + delta) } : f
    ));
  };

  const updateEnd = (key: string, delta: number) => {
    setFields((prev) => prev.map((f) =>
      f.key === key ? { ...f, currentEnd: Math.max(0, f.currentEnd + delta) } : f
    ));
  };

  const handleSave = () => {
    // Validate
    const errors = fields.filter((f) => f.currentEnd < f.currentStart);
    if (errors.length > 0) {
      const names = errors.map((e) => e.label).join(', ');
      addToast('error', `Chỉ số cuối nhỏ hơn đầu: ${names}. Vui lòng kiểm tra lại!`);
      return;
    }

    setSaving(true);
    const details = fields.map((f) => {
      const consumed = f.currentEnd - f.currentStart;
      return `${f.label}: ${consumed.toLocaleString()} ${f.unit}`;
    }).join(' · ');

    simulateAction(
      'Ghi tiêu hao tiện ích',
      details,
      `Đã ghi tiêu hao tiện ích — ${state.currentUser}`,
      () => {
        setSaving(false);
      }
    );
  };

  const getConsumptionColor = (f: typeof fields[0]) => {
    const consumed = f.currentEnd - f.currentStart;
    if (consumed < 0) return 'text-ant-error';
    if (consumed > f.threshold) return 'text-ant-warning';
    return 'text-ant-sx';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ant-text-secondary hover:text-ant-text transition-colors">
        <i className="ri-arrow-left-line" />
        Sản xuất
      </button>

      {/* Header */}
      <div className="bg-ant-sx rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-plug-line text-sm" />
          <span className="text-xs font-medium opacity-80">GHI TIÊU HAO TIỆN ÍCH</span>
        </div>
        <h2 className="text-lg font-bold">Cuối ca</h2>
        <p className="text-xs text-white/70 mt-1">
          {state.plant?.name} · {state.role?.name} · {state.currentUser}
        </p>
      </div>

      {/* Utility Cards */}
      <div className="space-y-3">
        {fields.map((f) => {
          const consumed = f.currentEnd - f.currentStart;
          const hasError = consumed < 0;
          const hasWarning = consumed > f.threshold && !hasError;

          return (
            <div
              key={f.key}
              className={`bg-ant-card rounded-xl border p-4 ${
                hasError ? 'border-ant-error/30 bg-ant-error/5' :
                hasWarning ? 'border-ant-warning/30 bg-ant-warning/5' :
                'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasError ? 'bg-ant-error/10' : hasWarning ? 'bg-ant-warning/10' : 'bg-ant-sx/10'
                }`}>
                  <i className={`${f.icon} text-sm ${
                    hasError ? 'text-ant-error' : hasWarning ? 'text-ant-warning' : 'text-ant-sx'
                  }`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ant-text">{f.label}</h4>
                  <p className="text-xxs text-ant-text-secondary">Đơn vị: {f.unit}</p>
                </div>
              </div>

              {/* Start */}
              <div className="mb-3">
                <label className="text-xxs font-medium text-ant-text-secondary mb-1 block">Chỉ số đầu ca</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateStart(f.key, -10)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-ant-text hover:bg-gray-200 active:scale-90"
                  >−</button>
                  <div className="flex-1 bg-ant-bg rounded-lg px-3 py-2.5 text-center">
                    <p className="text-lg font-mono font-bold text-ant-text">{f.currentStart.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => updateStart(f.key, +10)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-ant-text hover:bg-gray-200 active:scale-90"
                  >+</button>
                </div>
              </div>

              {/* End */}
              <div className="mb-3">
                <label className="text-xxs font-medium text-ant-text-secondary mb-1 block">Chỉ số cuối ca</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateEnd(f.key, -10)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-ant-text hover:bg-gray-200 active:scale-90"
                  >−</button>
                  <div className="flex-1 bg-ant-bg rounded-lg px-3 py-2.5 text-center">
                    <p className={`text-lg font-mono font-bold ${
                      hasError ? 'text-ant-error' : 'text-ant-text'
                    }`}>{f.currentEnd.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => updateEnd(f.key, +10)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-ant-text hover:bg-gray-200 active:scale-90"
                  >+</button>
                </div>
              </div>

              {/* Result */}
              <div className={`rounded-lg px-3 py-2.5 mt-2 ${
                hasError ? 'bg-ant-error/10' : hasWarning ? 'bg-ant-warning/10' : 'bg-ant-success/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ant-text-secondary">Tiêu hao</span>
                  <span className={`text-base font-bold ${getConsumptionColor(f)}`}>
                    {consumed.toLocaleString()} {f.unit}
                  </span>
                </div>
                {hasError && (
                  <p className="text-xs text-ant-error font-medium mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line text-xxs" />
                    Chỉ số cuối nhỏ hơn đầu!
                  </p>
                )}
                {hasWarning && (
                  <p className="text-xs text-ant-warning font-medium mt-1 flex items-center gap-1">
                    <i className="ri-alert-line text-xxs" />
                    {f.thresholdWarn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      {canUtility ? (
        <button
          onClick={handleSave}
          disabled={saving || fields.some((f) => f.currentEnd < f.currentStart)}
          className={`w-full px-4 py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            saving || fields.some((f) => f.currentEnd < f.currentStart)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-ant-sx hover:bg-ant-sx-dark'
          }`}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-save-line text-lg" />
              </div>
              Lưu tiêu hao tiện ích
            </>
          )}
        </button>
      ) : (
        <div className="bg-ant-warning/10 rounded-xl p-4 border border-ant-warning/20">
          <p className="text-xs text-ant-warning font-medium">{getPermissionExplanation('PRODUCTION_UTILITY')}</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}