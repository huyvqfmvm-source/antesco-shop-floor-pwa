import { useState, useRef, useEffect, useCallback } from 'react';

interface SignatureBoxProps {
  label: string;
  roleLabel: string;
  onSign?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
}

export default function SignatureBox({
  label,
  roleLabel,
  onSign,
  disabled = false,
  disabledReason = '',
  className = '',
}: SignatureBoxProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signTime, setSignTime] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = getCanvasContext();
    if (!ctx || !lastPos.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((v) => v !== 0);
    if (hasContent && !hasSigned) {
      setHasSigned(true);
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      setSignTime(ts);
      onSign?.();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignTime('');
    resizeCanvas();
  };

  return (
    <div className={`bg-ant-card rounded-xl border ${hasSigned ? 'border-ant-sx/40 bg-ant-sx-light/30' : 'border-gray-200'} p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold ${hasSigned ? 'text-ant-sx' : 'text-ant-text-secondary'}`}>
          {label}
        </span>
        {hasSigned && (
          <button
            onClick={handleClear}
            className="text-xxs text-ant-text-secondary hover:text-ant-error flex items-center gap-1"
          >
            <i className="ri-close-line text-xs" />Xóa
          </button>
        )}
      </div>

      {hasSigned ? (
        <div className="text-center py-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx flex items-center justify-center mb-2">
            <i className="ri-check-line text-2xl text-white" />
          </div>
          <p className="text-xs font-bold text-ant-sx">Đã ký</p>
          <p className="text-xxs text-ant-text-secondary mt-0.5">
            {roleLabel}
          </p>
          <p className="text-xxs text-ant-text-secondary/60 mt-0.5 font-mono">
            {signTime}
          </p>
        </div>
      ) : disabled ? (
        <div className="bg-ant-bg rounded-lg p-3 text-center" ref={containerRef}>
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-1.5">
            <i className="ri-lock-line text-sm text-ant-text-secondary/50" />
          </div>
          <p className="text-xs text-ant-text-secondary/60 font-medium">{disabledReason}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative bg-ant-bg rounded-lg border-2 border-dashed border-gray-200 cursor-crosshair overflow-hidden"
          style={{ height: '96px' }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-ant-text-secondary/30 font-medium">
              Ký tại đây
            </span>
          </div>
        </div>
      )}
    </div>
  );
}