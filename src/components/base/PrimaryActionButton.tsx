interface PrimaryActionButtonProps {
  onClick: () => void;
  icon?: string;
  label: string;
  color?: 'sx' | 'nk' | 'xk' | 'qm' | 'error' | 'warning' | 'offline' | 'sync';
  size?: 'md' | 'lg' | 'xl';
  outline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const COLOR_STYLES: Record<string, { solid: string; outline: string }> = {
  sx: { solid: 'bg-ant-sx text-white hover:bg-ant-sx-dark', outline: 'border-ant-sx/30 text-ant-sx bg-ant-sx/5 hover:bg-ant-sx/10' },
  nk: { solid: 'bg-ant-nk text-white hover:bg-ant-nk-dark', outline: 'border-ant-nk/30 text-ant-nk bg-ant-nk/5 hover:bg-ant-nk/10' },
  xk: { solid: 'bg-ant-xk text-white hover:bg-ant-xk-dark', outline: 'border-ant-xk/30 text-ant-xk bg-ant-xk/5 hover:bg-ant-xk/10' },
  qm: { solid: 'bg-ant-qm text-white hover:bg-ant-qm-dark', outline: 'border-ant-qm/30 text-ant-qm bg-ant-qm/5 hover:bg-ant-qm/10' },
  error: { solid: 'bg-ant-error text-white hover:bg-red-700', outline: 'border-ant-error/30 text-ant-error bg-ant-error/5 hover:bg-ant-error/10' },
  warning: { solid: 'bg-ant-warning text-white hover:bg-amber-600', outline: 'border-ant-warning/30 text-ant-warning bg-ant-warning/5 hover:bg-ant-warning/10' },
  offline: { solid: 'bg-ant-offline text-white hover:bg-ant-offline/80', outline: 'border-ant-offline/30 text-ant-offline bg-ant-offline/5 hover:bg-ant-offline/10' },
  sync: { solid: 'bg-ant-sync text-white hover:bg-ant-sync/80', outline: 'border-ant-sync/30 text-ant-sync bg-ant-sync/5 hover:bg-ant-sync/10' },
};

const SIZE_CLASSES = {
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-sm rounded-xl',
  xl: 'h-14 px-6 text-base rounded-xl',
};

export default function PrimaryActionButton({
  onClick, icon, label, color = 'sx', size = 'lg', outline = false, disabled = false, loading = false, className = '', fullWidth = false,
}: PrimaryActionButtonProps) {
  const cs = COLOR_STYLES[color] || COLOR_STYLES.sx;
  const style = outline ? cs.outline : cs.solid;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${SIZE_CLASSES[size]} ${style} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {icon && (
            <span className="w-5 h-5 flex items-center justify-center">
              <i className={`${icon} text-lg`} />
            </span>
          )}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}