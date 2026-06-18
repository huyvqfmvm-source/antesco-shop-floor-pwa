interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ title, description, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-ant-error/10 flex items-center justify-center mb-4">
        <i className="ri-error-warning-line text-2xl text-ant-error" />
      </div>
      <p className="text-sm font-bold text-ant-text mb-1">{title}</p>
      {description && <p className="text-xs text-ant-text-secondary max-w-xs">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 h-10 px-5 rounded-xl bg-ant-error/10 text-ant-error text-sm font-bold hover:bg-ant-error/20 active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-1.5" />Thử lại
        </button>
      )}
    </div>
  );
}