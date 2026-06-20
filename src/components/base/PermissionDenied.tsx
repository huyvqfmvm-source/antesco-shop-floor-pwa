import { Link } from 'react-router-dom';

interface PermissionDeniedProps {
  requiredPermission?: string;
  requiredRole?: string;
  currentRole?: string;
  moduleName?: string;
}

export default function PermissionDenied({
  requiredPermission,
  requiredRole,
  currentRole,
  moduleName,
}: PermissionDeniedProps) {
  return (
    <div className="min-h-screen bg-ant-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-ant-error/10 flex items-center justify-center mb-5">
        <i className="ri-shield-keyhole-line text-3xl text-ant-error" />
      </div>
      <h2 className="text-xl font-bold text-ant-text mb-2">Không có quyền truy cập</h2>
      <p className="text-sm text-ant-text-secondary mb-1">
        Vai trò <strong className="text-ant-text">{currentRole || 'hiện tại'}</strong> không được phép truy cập {moduleName || 'trang này'}.
      </p>
      {requiredPermission && (
        <p className="text-xs text-ant-text-secondary/70 mb-6">
          Quyền yêu cầu: <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-ant-text font-mono text-xxs">{requiredPermission}</code>
        </p>
      )}
      {requiredRole && (
        <p className="text-xs text-ant-text-secondary/70 mb-6">
          Yêu cầu vai trò: <strong>{requiredRole}</strong>
        </p>
      )}
      <div className="flex gap-3">
        <Link
          to="/home"
          className="px-5 py-2.5 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <i className="ri-home-line mr-1.5" />Về trang chủ
        </Link>
        <Link
          to="/settings"
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-ant-text text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <i className="ri-settings-3-line mr-1.5" />Cài đặt
        </Link>
      </div>
    </div>
  );
}