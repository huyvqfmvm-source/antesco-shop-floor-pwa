import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex justify-center min-h-screen bg-ant-bg">
      <div className="w-full max-w-mobile flex flex-col items-center justify-center min-h-screen bg-ant-bg px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-ant-qm-light flex items-center justify-center mb-5">
          <i className="ri-error-warning-line text-3xl text-ant-qm" />
        </div>
        <h1 className="text-2xl font-bold text-ant-text mb-2">404</h1>
        <p className="text-sm text-ant-text-secondary mb-6">Trang không tồn tại hoặc đã bị di chuyển</p>
        <Link
          to="/home"
          className="px-6 py-3 rounded-xl bg-ant-sx text-white text-sm font-medium hover:bg-ant-sx-dark transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}