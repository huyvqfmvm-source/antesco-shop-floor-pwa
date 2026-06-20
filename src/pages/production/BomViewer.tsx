import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { MOCK_ALL_MATERIAL_NORMS } from '@/mocks/material-norms';
import type { MaterialNorm, MaterialNormItem } from '@/mocks/material-norms';

export default function BomViewerPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  const [selectedProduct, setSelectedProduct] = useState('TP0061');
  const [plannedQty, setPlannedQty] = useState(5000);
  const [quantityInput, setQuantityInput] = useState('5000');

  const selectedBom = useMemo(() => MOCK_ALL_MATERIAL_NORMS.find((b) => b.productCode === selectedProduct), [selectedProduct]);

  const calculateRequired = (item: MaterialNormItem) => {
    return Math.ceil(item.standardQty * plannedQty * (1 + item.lossRate / 100));
  };

  const totalMainMaterial = selectedBom
    ? Math.ceil(selectedBom.items.find((i) => i.category === 'Nguyên liệu chính')?.standardQty || 0 * plannedQty)
    : 0;

  return (
    <div className="min-h-screen bg-ant-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-ant-sx text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/production')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">Định mức NVL — QĐ01B 2026</h1>
          <p className="text-xs text-white/70">BOM/Định mức nguyên vật liệu</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Product selector */}
        <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
          <label className="text-xs font-bold text-ant-text-secondary uppercase block mb-2">Sản phẩm</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm text-ant-text bg-white focus:outline-none focus:ring-2 focus:ring-ant-sx/20 mb-3">
            {MOCK_ALL_MATERIAL_NORMS.map((b) => (
              <option key={b.productCode} value={b.productCode}>{b.productCode} — {b.productName}</option>
            ))}
          </select>

          <label className="text-xs font-bold text-ant-text-secondary uppercase block mb-2">Sản lượng kế hoạch (KG)</label>
          <div className="flex items-center gap-2 mb-3">
            <input type="text" inputMode="numeric" value={quantityInput}
              onChange={(e) => { setQuantityInput(e.target.value); const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) setPlannedQty(n); }}
              className="flex-1 h-12 rounded-xl border border-gray-200 px-3 text-sm font-bold text-ant-sx bg-ant-sx/5 focus:outline-none focus:ring-2 focus:ring-ant-sx/20" />
            <button onClick={() => { setPlannedQty(plannedQty + 500); setQuantityInput(String(plannedQty + 500)); }}
              className="w-10 h-10 rounded-xl bg-ant-sx/10 text-ant-sx font-bold text-lg">+</button>
            <button onClick={() => { const n = Math.max(0, plannedQty - 500); setPlannedQty(n); setQuantityInput(String(n)); }}
              className="w-10 h-10 rounded-xl bg-gray-100 text-ant-text-secondary font-bold text-lg">&minus;</button>
          </div>

          <div className="flex gap-2">
            {[1000, 3200, 5000, 8000].map((q) => (
              <button key={q} onClick={() => { setPlannedQty(q); setQuantityInput(String(q)); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${plannedQty === q ? 'bg-ant-sx text-white' : 'bg-gray-50 text-ant-text-secondary'}`}>
                {q.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* BOM Details */}
        {selectedBom && (
          <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-ant-text">{selectedBom.productName}</h3>
                <p className="text-xxs text-ant-text-secondary">Phiên bản: {selectedBom.version} · Năm {selectedBom.year} · Ban hành: {selectedBom.issueDate}</p>
              </div>
              <span className="text-xxs bg-ant-sx/10 text-ant-sx px-2 py-0.5 rounded-full font-bold">QĐ01B</span>
            </div>

            {/* Summary */}
            <div className="bg-ant-sx/5 rounded-lg p-3 mb-3 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xxs text-ant-text-secondary">Nguyên liệu chính</p>
                <p className="text-sm font-bold text-ant-sx">{totalMainMaterial.toLocaleString()} KG</p>
              </div>
              <div className="text-center">
                <p className="text-xxs text-ant-text-secondary">Tỷ lệ thu hồi</p>
                <p className="text-sm font-bold text-ant-sx">~67%</p>
              </div>
              <div className="text-center">
                <p className="text-xxs text-ant-text-secondary">Kế hoạch TP</p>
                <p className="text-sm font-bold text-ant-sx">{plannedQty.toLocaleString()} KG</p>
              </div>
            </div>

            {/* BOM items */}
            <div className="space-y-2">
              {selectedBom.items.map((item) => {
                const required = calculateRequired(item);
                return (
                  <div key={item.materialCode} className="bg-ant-bg rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xxs px-1.5 py-0.5 rounded font-bold ${
                          item.category === 'Nguyên liệu chính' ? 'bg-ant-sx/10 text-ant-sx' :
                          item.category === 'Hóa chất' ? 'bg-ant-warning/10 text-ant-warning' :
                          'bg-ant-nk/10 text-ant-nk'
                        }`}>{item.category}</span>
                        <p className="text-sm font-bold text-ant-text">{item.materialName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ant-text-secondary">
                      <span>MC: <span className="font-mono font-medium text-ant-text">{item.materialCode}</span></span>
                      <span>ĐM: <span className="font-bold text-ant-text">{item.standardQty} {item.uom}/KG TP</span></span>
                      <span>Hao hụt: <span className="font-bold text-ant-warning">{item.lossRate}%</span></span>
                    </div>
                    <div className="mt-2 p-2 bg-ant-sx/5 rounded-lg flex justify-between">
                      <span className="text-xxs text-ant-text-secondary">Cần cấp cho {plannedQty.toLocaleString()} KG TP:</span>
                      <span className="text-xs font-bold text-ant-sx">{required.toLocaleString()} {item.uom}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={() => navigate('/production/material-issue')}
          className="w-full py-3.5 rounded-xl bg-ant-sx text-white text-sm font-bold active:scale-[0.98] transition-all whitespace-nowrap">
          <i className="ri-file-add-line mr-1" />Tạo phiếu đề xuất cấp NVL
        </button>

        <div className="h-4" />
      </main>
    </div>
  );
}