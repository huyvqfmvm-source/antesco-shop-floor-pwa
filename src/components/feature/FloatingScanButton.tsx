import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { hasPermission, useApp, type PermissionAction } from '@/store/AppContext';
import ScannerModal from './ScannerModal';

const SCANNER_PERMISSIONS: PermissionAction[] = [
  'PRODUCTION_VIEW',
  'PRODUCTION_PALLET',
  'INBOUND_VIEW',
  'INBOUND_PUTAWAY',
  'INBOUND_RECEIVE_RM',
  'INBOUND_FG_RECEIVING',
  'OUTBOUND_VIEW',
  'OUTBOUND_CONTAINER_LOADING',
  'OUTBOUND_CONTAINER_CHECK',
  'QM_VIEW',
  'QM_CYCLE_COUNT',
  'QM_CONTAINER_CHECK',
  'QM_HOLD',
  'ERROR_QUEUE_RESOLVE',
  'TRANSFER_ORDER',
  'VIEW_DOCUMENTS',
];

export default function FloatingScanButton() {
  const location = useLocation();
  const { state } = useApp();
  const [pressed, setPressed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const hiddenRoutes = ['/settings', '/account', '/reports', '/accounting'];
  const moduleRootRoutes = ['/production', '/inbound', '/outbound', '/internal-qm'];
  const hasScannerAccess = SCANNER_PERMISSIONS.some((permission) => hasPermission(state.role?.id, permission));
  const shouldHide = hiddenRoutes.some((route) => location.pathname.startsWith(route)) || !hasScannerAccess;
  const needsBottomNavClearance = moduleRootRoutes.includes(location.pathname);
  const isColdStorage = state.coldStorageUI;

  const fabBottom = isColdStorage
    ? (needsBottomNavClearance ? 'calc(env(safe-area-inset-bottom, 0px) + 108px)' : 'calc(env(safe-area-inset-bottom, 0px) + 32px)')
    : (needsBottomNavClearance ? 'calc(env(safe-area-inset-bottom, 0px) + 84px)' : 'calc(env(safe-area-inset-bottom, 0px) + 24px)');

  const handleOpen = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 250);
    setShowScanner(true);
  };

  if (shouldHide) return null;

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed z-50 w-12 h-12 rounded-2xl bg-ant-sx text-white flex items-center justify-center shadow-lg shadow-ant-sx/30 transition-all duration-300 active:scale-90 hover:bg-ant-sx-dark hover:shadow-xl hover:shadow-ant-sx/40 cursor-pointer fab-button no-cs-mega ${
          pressed ? 'scale-90 bg-ant-sx-dark' : ''
        }`}
        aria-label="Quét mã"
        style={{
          right: 'max(20px, calc((100vw - 430px) / 2 + 20px))',
          bottom: fabBottom,
          boxShadow: '0 4px 20px rgba(22, 163, 74, 0.35), 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <i className="ri-qr-scan-line text-xl" />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full animate-ping bg-white/20" style={{ animationDuration: '2s' }} />
        </div>
      </button>

      <ScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </>
  );
}
