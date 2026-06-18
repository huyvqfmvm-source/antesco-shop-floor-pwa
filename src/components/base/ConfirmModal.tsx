interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen, title, message, icon = 'ri-question-line', iconColor = 'bg-ant-warning/10 text-ant-warning',
  confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', confirmColor = 'bg-ant-sx', onConfirm, onCancel, loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-ant-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
          <i className={`${icon} text-xl`} />
        </div>
        <h3 className="text-base font-bold text-ant-text text-center mb-1">{title}</h3>
        <p className="text-sm text-ant-text-secondary text-center mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary hover:bg-ant-bg active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-xl text-white text-sm font-bold active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 ${confirmColor} hover:opacity-90 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}