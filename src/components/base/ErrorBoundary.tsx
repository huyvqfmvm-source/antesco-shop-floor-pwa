import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ANTESCO ErrorBoundary] Caught:', error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-ant-bg flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-ant-error/10 flex items-center justify-center mb-5">
            <i className="ri-error-warning-line text-3xl text-ant-error" />
          </div>
          <h2 className="text-xl font-bold text-ant-text mb-2">Đã xảy ra lỗi</h2>
          <p className="text-sm text-ant-text-secondary mb-4 max-w-sm">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
          </p>
          {this.state.error && (
            <p className="text-xs text-ant-text-secondary/60 mb-6 font-mono bg-gray-50 rounded-lg px-3 py-2 max-w-sm break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-2" />
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}