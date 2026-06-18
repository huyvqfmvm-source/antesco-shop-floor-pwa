interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <i className={`${icon} text-2xl text-ant-text-secondary`} />
      </div>
      <p className="text-sm font-bold text-ant-text mb-1">{title}</p>
      {description && <p className="text-xs text-ant-text-secondary max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 h-10 px-5 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}