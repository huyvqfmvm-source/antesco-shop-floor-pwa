import { useNavigate } from 'react-router-dom';
import { MOCK_DEFECT_CODES } from '@/mocks/data';

const categoryIcons: Record<string, string> = {
  'Chất lượng cảm quan': 'ri-eye-line',
  'Hư hỏng nguyên liệu': 'ri-plant-line',
  'Sai quy cách': 'ri-ruler-line',
  'An toàn thực phẩm': 'ri-shield-flash-line',
  'Sự cố vật lý': 'ri-box-3-line',
  'Bảo quản lạnh': 'ri-snowflake-line',
  'Đóng gói': 'ri-archive-line',
  'Vận chuyển': 'ri-truck-line',
  'Xuất kho': 'ri-arrow-left-right-line',
};

export default function DefectCodesPage() {
  const navigate = useNavigate();

  const categories = [...new Set(MOCK_DEFECT_CODES.map((d) => d.category))];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <i className="ri-arrow-left-line text-ant-text-secondary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-ant-text">Danh sách Defect Code</h2>
          <p className="text-xxs text-ant-text-secondary">Mã lỗi chất lượng — QM</p>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-ant-qm/10 flex items-center justify-center">
              <i className={`${categoryIcons[cat] || 'ri-information-line'} text-ant-qm text-xs`} />
            </div>
            <h3 className="text-xs font-bold text-ant-text-secondary uppercase">{cat}</h3>
          </div>

          <div className="space-y-1.5">
            {MOCK_DEFECT_CODES.filter((d) => d.category === cat).map((dc) => (
              <div key={dc.code} className="bg-ant-card rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="px-2 py-1 rounded-lg bg-ant-error/10 shrink-0">
                  <span className="text-xs font-mono font-bold text-ant-error">{dc.code}</span>
                </div>
                <span className="text-sm text-ant-text">{dc.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-ant-qm/5 rounded-xl p-3 border border-ant-qm/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-information-line text-ant-qm text-xs" />
          </div>
          <p className="text-xs font-medium text-ant-qm">Hướng dẫn sử dụng</p>
        </div>
        <p className="text-xxs text-ant-text-secondary">
          Khi ghi nhận lỗi QM Hold, chọn mã lỗi phù hợp nhất. Mỗi mã lỗi ứng với một hướng xử lý riêng. Defect code DF-001 đến DF-005 yêu cầu Blocked Stock. DF-006 đến DF-010 có thể xử lý theo quy trình riêng.
        </p>
      </div>
    </div>
  );
}