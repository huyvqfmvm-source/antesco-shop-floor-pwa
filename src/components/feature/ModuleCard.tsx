import { Link } from 'react-router-dom';

interface ModuleCardProps {
  to: string;
  icon: string;
  label: string;
  sub?: string;
  badge?: string;
  badgeVariant?: string;
  color: 'sx' | 'nk' | 'xk' | 'qm' | 'error' | 'warning' | 'offline' | 'sync';
  className?: string;
}

const COLOR_MAP: Record<string, { card: string; bg: string; text: string; badge: string }> = {
  sx: { card: 'bg-ant-sx', bg: 'bg-ant-sx/10', text: 'text-ant-sx', badge: 'bg-ant-sx/10 text-ant-sx' },
  nk: { card: 'bg-ant-nk', bg: 'bg-ant-nk/10', text: 'text-ant-nk', badge: 'bg-ant-nk/10 text-ant-nk' },
  xk: { card: 'bg-ant-xk', bg: 'bg-ant-xk/10', text: 'text-ant-xk', badge: 'bg-ant-xk/10 text-ant-xk' },
  qm: { card: 'bg-ant-qm', bg: 'bg-ant-qm/10', text: 'text-ant-qm', badge: 'bg-ant-qm/10 text-ant-qm' },
  error: { card: 'bg-ant-error', bg: 'bg-ant-error/10', text: 'text-ant-error', badge: 'bg-ant-error/10 text-ant-error' },
  warning: { card: 'bg-ant-warning', bg: 'bg-ant-warning/10', text: 'text-ant-warning', badge: 'bg-ant-warning/10 text-ant-warning' },
  offline: { card: 'bg-ant-offline', bg: 'bg-ant-offline/10', text: 'text-ant-offline', badge: 'bg-ant-offline/10 text-ant-offline' },
  sync: { card: 'bg-ant-sync', bg: 'bg-ant-sync/10', text: 'text-ant-sync', badge: 'bg-ant-sync/10 text-ant-sync' },
};

export default function ModuleCard({ to, icon, label, sub, badge, badgeVariant, color, className = '' }: ModuleCardProps) {
  const cm = COLOR_MAP[color] || COLOR_MAP.qm;

  return (
    <Link
      to={to}
      className={`no-cs-mega flex items-center gap-3.5 bg-ant-card rounded-xl border border-gray-100 p-4 active:scale-[0.98] transition-all hover:border-gray-200 cursor-pointer ${className}`}
    >
      <div className={`w-11 h-11 rounded-xl ${cm.bg} flex items-center justify-center shrink-0`}>
        <i className={`${icon} ${cm.text} text-lg`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ant-text">{label}</p>
        {sub && <p className="text-xs text-ant-text-secondary mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-xxs px-2 py-0.5 rounded-full font-semibold ${badgeVariant || cm.badge}`}>
            {badge}
          </span>
        )}
        <i className="ri-arrow-right-s-line text-ant-text-secondary text-lg" />
      </div>
    </Link>
  );
}