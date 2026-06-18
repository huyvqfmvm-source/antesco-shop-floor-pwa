interface ProcessStepperProps {
  steps: { label: string; done?: boolean; active?: boolean; color?: string }[];
  className?: string;
}

const STEP_COLORS: Record<string, string> = {
  sx: 'bg-ant-sx border-ant-sx text-white',
  nk: 'bg-ant-nk border-ant-nk text-white',
  xk: 'bg-ant-xk border-ant-xk text-white',
  qm: 'bg-ant-qm border-ant-qm text-white',
};

export default function ProcessStepper({ steps, className = '' }: ProcessStepperProps) {
  return (
    <div className={`flex items-center gap-1 overflow-x-auto ${className}`}>
      {steps.map((step, i) => {
        const color = step.color || 'sx';
        const isDone = step.done;
        const isActive = step.active;

        const circleClass = isDone || isActive
          ? (STEP_COLORS[color] || STEP_COLORS.sx)
          : 'bg-gray-100 border-gray-200 text-ant-text-secondary';

        return (
          <div key={i} className="flex items-center gap-1 shrink-0">
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xxs font-bold transition-all ${circleClass}`}>
              {isDone ? <i className="ri-check-line text-xxs" /> : i + 1}
            </div>
            <span className={`text-xxs font-medium whitespace-nowrap ${isActive ? 'text-ant-text' : 'text-ant-text-secondary'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-5 h-0.5 rounded-full mx-0.5 ${isDone ? (color === 'sx' ? 'bg-ant-sx' : color === 'nk' ? 'bg-ant-nk' : color === 'xk' ? 'bg-ant-xk' : 'bg-ant-qm') : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}