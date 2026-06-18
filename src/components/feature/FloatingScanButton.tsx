import { useState } from 'react';
import ScannerModal from './ScannerModal';

export default function FloatingScanButton() {
  const [pressed, setPressed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleOpen = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 250);
    setShowScanner(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed z-50 w-14 h-14 rounded-2xl bg-ant-sx text-white flex items-center justify-center shadow-lg shadow-ant-sx/30 transition-all duration-300 active:scale-90 hover:bg-ant-sx-dark hover:shadow-xl hover:shadow-ant-sx/40 cursor-pointer bottom-24 right-4 ${
          pressed ? 'scale-90 bg-ant-sx-dark' : ''
        }`}
        aria-label="Quét mã"
        style={{
          boxShadow: '0 4px 20px rgba(22, 163, 74, 0.35), 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <i className="ri-qr-scan-line text-2xl" />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full animate-ping bg-white/20" style={{ animationDuration: '2s' }} />
        </div>
      </button>

      <ScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </>
  );
}