import { useApp } from '@/store/AppContext';

export default function ToastContainer() {
  const { state } = useApp();

  if (state.toasts.length === 0) return null;

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success': return 'bg-ant-sx text-white';
      case 'warning': return 'bg-ant-warning text-white';
      case 'error': return 'bg-ant-error text-white';
      case 'info': return 'bg-ant-nk text-white';
      default: return 'bg-ant-qm text-white';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return 'ri-checkbox-circle-line';
      case 'warning': return 'ri-alert-line';
      case 'error': return 'ri-close-circle-line';
      case 'info': return 'ri-information-line';
      default: return 'ri-information-line';
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-full max-w-mobile pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-down ${getToastStyle(toast.type)}`}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <i className={`${getToastIcon(toast.type)} text-base`} />
          </div>
          <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}