interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  compact?: boolean;
}

export default function LoadingState({ message = 'Đang tải dữ liệu...', subMessage, compact = false }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-10' : 'min-h-[320px]'}`}>
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-3 border-ant-sx/20 border-t-ant-sx animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-ant-sx/10 border-t-ant-sx/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="ri-loader-4-line text-ant-sx text-base animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      </div>
      <p className="text-sm font-bold text-ant-text">{message}</p>
      {subMessage && <p className="text-xs text-ant-text-secondary mt-1">{subMessage}</p>}
      <div className="mt-4 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-ant-sx/40 animate-pulse-soft" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-ant-sx/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-ant-sx/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}