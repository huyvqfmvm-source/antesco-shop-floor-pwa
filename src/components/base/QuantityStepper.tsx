interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  size?: 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  md: { btn: 'w-10 h-10 text-base', input: 'h-10 w-16 text-sm', container: 'gap-1' },
  lg: { btn: 'w-12 h-12 text-lg', input: 'h-12 w-20 text-base', container: 'gap-1.5' },
  xl: { btn: 'w-14 h-14 text-xl', input: 'h-14 w-24 text-lg', container: 'gap-2' },
};

export default function QuantityStepper({
  value, onChange, min = 0, max = 999999, unit, label, size = 'lg', disabled = false, className = '',
}: QuantityStepperProps) {
  const sc = SIZE_CONFIG[size];

  const decrement = () => { if (value > min) onChange(value - 1); };
  const increment = () => { if (value < max) onChange(value + 1); };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && <span className="text-xs font-semibold text-ant-text-secondary mb-1.5">{label}</span>}
      <div className={`flex items-center ${sc.container}`}>
        <button
          onClick={decrement}
          disabled={disabled || value <= min}
          className={`${sc.btn} rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center font-bold text-ant-text cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <span className={`${sc.btn.includes('14') ? 'text-xl' : 'text-base'}`}>−</span>
        </button>
        <div className={`${sc.input} rounded-xl bg-white border border-gray-200 flex items-center justify-center font-mono font-bold text-ant-text`}>
          {value}
        </div>
        <button
          onClick={increment}
          disabled={disabled || value >= max}
          className={`${sc.btn} rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center font-bold text-ant-text cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <span className={`${sc.btn.includes('14') ? 'text-xl' : 'text-base'}`}>+</span>
        </button>
      </div>
      {unit && <span className="text-xxs text-ant-text-secondary mt-1 font-medium">{unit}</span>}
    </div>
  );
}