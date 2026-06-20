import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DEFECT_CODES_WITH_GUIDE } from '@/mocks/extended';

const CATEGORY_ICONS: Record<string, string> = {
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

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Thấp': { label: 'Thấp', color: 'text-ant-sx', bg: 'bg-ant-sx/10' },
  'Trung bình': { label: 'Trung bình', color: 'text-ant-warning', bg: 'bg-ant-warning/10' },
  'Cao': { label: 'Cao', color: 'text-ant-error', bg: 'bg-ant-error/10' },
  'Nghiêm trọng': { label: 'Nghiêm trọng', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function DefectCodesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = useMemo(() => [...new Set(MOCK_DEFECT_CODES_WITH_GUIDE.map((d) => d.category))], []);

  const filtered = useMemo(() => {
    return MOCK_DEFECT_CODES_WITH_GUIDE.filter((dc) => {
      if (categoryFilter && dc.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return dc.code.toLowerCase().includes(q) || dc.name.toLowerCase().includes(q) || dc.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, categoryFilter]);

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-ant-card/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/internal-qm')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <i className="ri-arrow-left-line text-lg text-ant-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-ant-text truncate">Mã lỗi DF/QM</h1>
          <p className="text-xxs text-ant-text-secondary truncate">{MOCK_DEFECT_CODES_WITH_GUIDE.length} mã lỗi</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-ant-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã lỗi, tên hoặc nhóm..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-ant-text focus:outline-none focus:border-ant-qm/40"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setCategoryFilter('')}
            className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!categoryFilter ? 'bg-ant-qm text-white' : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'}`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${categoryFilter === cat ? 'bg-ant-qm text-white' : 'bg-gray-100 text-ant-text-secondary hover:bg-gray-200'}`}
            >
              <i className={`${CATEGORY_ICONS[cat] || 'ri-information-line'} text-sm`} />
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="ri-search-line text-xl text-ant-text-secondary" />
            </div>
            <p className="text-sm text-ant-text-secondary">Không tìm thấy mã lỗi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((dc) => {
              const sev = SEVERITY_CONFIG[dc.severity] || SEVERITY_CONFIG['Thấp'];
              return (
                <div key={dc.code} className="bg-ant-card rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="min-w-[60px] h-7 px-2 rounded-lg bg-ant-error/10 text-ant-error text-xs font-mono font-bold flex items-center justify-center">
                          {dc.code}
                        </span>
                        <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                      </div>
                      <span className="text-xxs text-ant-text-secondary bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className={`${CATEGORY_ICONS[dc.category] || 'ri-information-line'} text-[10px]`} />
                        {dc.category}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ant-text mb-2">{dc.name}</p>
                    <div className="bg-ant-bg rounded-lg p-2.5">
                      <p className="text-xxs text-ant-text-secondary leading-relaxed">
                        <span className="font-bold text-ant-qm">Hướng xử lý: </span>
                        {dc.guide}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-ant-qm/5 rounded-xl p-3 border border-ant-qm/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-information-line text-ant-qm text-xs" />
            </div>
            <p className="text-xs font-medium text-ant-qm">Hướng dẫn sử dụng</p>
          </div>
          <p className="text-xxs text-ant-text-secondary">
            Chọn mã lỗi phù hợp nhất khi ghi nhận QM Hold. DF-001 đến DF-005 mức Trung bình trở lên yêu cầu Blocked Stock. DF-006 đến DF-010 có thể xử lý theo quy trình riêng. Với lỗi Nghiêm trọng (DF-004), phải báo cáo QM trưởng ngay.
          </p>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}