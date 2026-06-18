interface PhotoEvidenceGridProps {
  photos: number[];
  requiredCount?: number;
  maxCount?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  className?: string;
}

export default function PhotoEvidenceGrid({
  photos,
  requiredCount = 2,
  maxCount = 4,
  onAdd,
  onRemove,
  className = '',
}: PhotoEvidenceGridProps) {
  const missingCount = requiredCount - photos.length;
  const slots = Math.max(maxCount, requiredCount);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-ant-text-secondary">
          Ảnh bằng chứng
        </span>
        <span className={`text-xxs font-medium ${missingCount > 0 ? 'text-ant-error' : 'text-ant-sx'}`}>
          {photos.length}/{requiredCount} {missingCount > 0 ? `(thiếu ${missingCount})` : '✓ đủ'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: slots }).map((_, idx) => {
          const hasPhoto = idx < photos.length;
          return (
            <div
              key={idx}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${
                hasPhoto
                  ? 'border-ant-sx bg-ant-sx-light'
                  : 'border-gray-200 bg-ant-bg hover:border-gray-300'
              }`}
            >
              {hasPhoto ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-ant-sx/10 flex items-center justify-center">
                      <i className="ri-image-line text-xl text-ant-sx/50" />
                    </div>
                    <p className="text-xxs text-ant-text-secondary mt-1 font-medium">Ảnh {idx + 1}</p>
                  </div>
                  <button
                    onClick={() => onRemove(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ant-error text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                    aria-label="Xóa ảnh"
                  >
                    <i className="ri-close-line text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAdd}
                  disabled={photos.length >= maxCount}
                  className="flex flex-col items-center gap-1.5 p-2 w-full h-full justify-center disabled:opacity-40 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i className="ri-camera-line text-lg text-ant-text-secondary/40" />
                  </div>
                  <span className="text-xxs text-ant-text-secondary/60 font-medium">
                    {idx < requiredCount ? 'Bắt buộc' : 'Tùy chọn'}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      {missingCount > 0 && (
        <p className="text-xxs text-ant-error mt-1.5 flex items-center gap-1">
          <i className="ri-error-warning-line text-xs" />
          Bắt buộc chụp tối thiểu {requiredCount} ảnh bằng chứng
        </p>
      )}
    </div>
  );
}