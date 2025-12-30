import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number; // 1 to 6
}

const STEPS = [
  "ورود/ثبت‌نام", // Step 1
  "شرایط طرح",   // Step 2
  "تکمیل اطلاعات", // Step 3
  "صدور معرفی‌نامه",
  "اعتبارسنجی بانک",
  "دریافت اعتبار"
];

const Stepper6: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-4">
      {/* Mobile View: Simple text */}
      <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100 mb-4">
         <span className="text-sm text-slate-500">گام {currentStep} از 6</span>
         <span className="font-bold text-primary">{STEPS[currentStep - 1]}</span>
         <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
             <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(currentStep / 6) * 100}%` }}
             />
         </div>
      </div>

      {/* Desktop View: Full Stepper */}
      <div className="hidden md:flex justify-between items-center relative">
        {/* Connecting Line */}
        <div className="absolute top-5 right-0 left-0 h-0.5 bg-slate-200 -z-10" />
        
        {STEPS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-2 relative bg-f5f5f5 px-2">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white
                  ${isCompleted ? 'border-primary bg-primary text-white' : ''}
                  ${isCurrent ? 'border-primary text-primary shadow-md scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'border-slate-300 text-slate-300' : ''}
                `}
              >
                {isCompleted ? <Check size={20} /> : <span>{stepNum}</span>}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-primary font-bold' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper6;