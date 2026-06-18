import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ScannerModal from './ScannerModal';

export default function FloatingScanButton() {
  const location = useLocation();
  const [pressed, setPressed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const isHome = location.pathname === '/home';

  const handleOpen = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 250);
    setShowScanner(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed z-50 w-12 h-12 rounded-2xl bg-ant-sx text-white flex items-center justify-center shadow-lg shadow-ant-sx/30 transition-all duration-300 active:scale-90 hover:bg-ant-sx-dark hover:shadow-xl hover:shadow-ant-sx/40 cursor-pointer ${
          pressed ? 'scale-90 bg-ant-sx-dark' : ''
        }`}
        aria-label="Quét mã"
        style={{
          right: 'max(20px, calc((100vw - 430px) / 2 + 20px))',
          bottom: isHome ? 'calc(env(safe-area-inset-bottom, 0px) + 24px)' : 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
          boxShadow: '0 4px 20px rgba(22, 163, 74, 0.35), 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <i className="ri-qr-scan-line text-xl" />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full animate-ping bg-white/20" style={{ animationDuration: '2s' }} />
        </div>
      </button>

      <ScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </>
  );
}
