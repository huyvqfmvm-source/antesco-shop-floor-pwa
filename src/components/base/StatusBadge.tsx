const STATUS_VARIANTS: Record<string, { bg: string; text: string; dot?: string }> = {
  success: { bg: 'bg-ant-success/10', text: 'text-ant-success', dot: 'bg-ant-success' },
  warning: { bg: 'bg-ant-warning/10', text: 'text-ant-warning', dot: 'bg-ant-warning' },
  error: { bg: 'bg-ant-error/10', text: 'text-ant-error', dot: 'bg-ant-error' },
  info: { bg: 'bg-ant-nk/10', text: 'text-ant-nk', dot: 'bg-ant-nk' },
  offline: { bg: 'bg-ant-offline/10', text: 'text-ant-offline', dot: 'bg-ant-offline' },
  sync: { bg: 'bg-ant-sync/10', text: 'text-ant-sync', dot: 'bg-ant-sync' },
  sx: { bg: 'bg-ant-sx/10', text: 'text-ant-sx', dot: 'bg-ant-sx' },
  nk: { bg: 'bg-ant-nk/10', text: 'text-ant-nk', dot: 'bg-ant-nk' },
  xk: { bg: 'bg-ant-xk/10', text: 'text-ant-xk', dot: 'bg-ant-xk' },
  qm: { bg: 'bg-ant-qm/10', text: 'text-ant-qm', dot: 'bg-ant-qm' },
  neutral: { bg: 'bg-gray-100', text: 'text-ant-text-secondary', dot: 'bg-gray-400' },
};

interface StatusBadgeProps {
  variant?: keyof typeof STATUS_VARIANTS;
  label: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({ variant = 'neutral', label, size = 'sm', pulse = false, className = '' }: StatusBadgeProps) {
  const v = STATUS_VARIANTS[variant] || STATUS_VARIANTS.neutral;
  const sizeClass = size === 'sm' ? 'text-xxs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClass} ${v.bg} ${v.text} ${className}`}>
      {v.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${v.dot} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  );
}