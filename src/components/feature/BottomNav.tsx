import { NavLink, useLocation } from 'react-router-dom';
import { useApp, canAccessTab } from '@/store/AppContext';

const ALL_NAV_ITEMS = [
  { to: '/production', tab: 'production', label: 'Sản xuất', icon: 'ri-tools-line', color: 'sx' },
  { to: '/inbound', tab: 'inbound', label: 'Nhập kho', icon: 'ri-archive-drawer-line', color: 'nk' },
  { to: '/outbound', tab: 'outbound', label: 'Xuất kho', icon: 'ri-truck-line', color: 'xk' },
  { to: '/internal-qm', tab: 'internal-qm', label: 'Nội bộ & QM', icon: 'ri-shield-check-line', color: 'qm' },
];

const ACTIVE_COLORS: Record<string, { text: string; bg: string; indicator: string; shadow: string }> = {
  sx: { text: 'text-ant-sx', bg: 'bg-ant-sx/8', indicator: 'bg-ant-sx', shadow: 'shadow-ant-sx/15' },
  nk: { text: 'text-ant-nk', bg: 'bg-ant-nk/8', indicator: 'bg-ant-nk', shadow: 'shadow-ant-nk/15' },
  xk: { text: 'text-ant-xk', bg: 'bg-ant-xk/8', indicator: 'bg-ant-xk', shadow: 'shadow-ant-xk/15' },
  qm: { text: 'text-ant-qm', bg: 'bg-ant-qm/8', indicator: 'bg-ant-qm', shadow: 'shadow-ant-qm/15' },
};

export default function BottomNav() {
  const { state } = useApp();
  const location = useLocation();

  const navItems = ALL_NAV_ITEMS.filter((item) => canAccessTab(state.role?.id, item.tab));

  if (navItems.length <= 1) {
    return null;
  }

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 bg-ant-card/85 backdrop-blur-2xl border-t border-gray-100/80" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
      <div className="flex items-stretch h-[60px] px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const ac = ACTIVE_COLORS[item.color] || ACTIVE_COLORS.sx;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative cursor-pointer ${
                isActive ? ac.text : 'text-ant-text-secondary/70 hover:text-ant-text'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className={`absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full ${ac.indicator} animate-scale-in`} />
              )}
              {/* Icon container */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? `${ac.bg} scale-105` : 'hover:bg-gray-50'}`}>
                <i className={`${item.icon} text-xl`} />
              </div>
              {/* Label */}
              <span className={`text-[10px] font-semibold whitespace-nowrap tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}