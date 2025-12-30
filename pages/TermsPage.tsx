import React from 'react';
import { useNavigate } from 'react-router-dom';
import Stepper6 from '../components/Stepper6';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    // Save acceptance to localStorage to gate Step 3
    try {
      localStorage.setItem('touran:termsAccepted', 'true');
      localStorage.setItem('touran:termsAcceptedAt', new Date().toISOString());
    } catch (e) {
      console.warn("Could not save terms acceptance", e);
    }
    
    // Proceed to Dashboard/Next Step
    navigate('/app');
  };

  return (
    <div className="space-y-6">
      <Stepper6 currentStep={2} />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
          شرایط و قوانین دریافت تسهیلات
        </h1>
        
        <div className="space-y-4 text-slate-600 leading-8 text-justify">
          <p>
            به سامانه تسهیلات سفر طرح توران خوش آمدید. پیش از شروع فرآیند ثبت درخواست، لطفاً موارد زیر را به دقت مطالعه فرمایید:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>سقف تسهیلات تا مبلغ ۱۰۰ میلیون تومان می‌باشد.</li>
            <li>بازپرداخت اقساط در دوره‌های ۱۲، ۱۸ و ۲۴ ماهه امکان‌پذیر است.</li>
            <li>داشتن حساب فعال در بانک شهر الزامی است (یا امکان افتتاح حساب آنلاین).</li>
            <li>نداشتن چک برگشتی و بدهی معوق بانکی برای متقاضی و ضامن الزامی است.</li>
            <li>فرآیند اعتبارسنجی به صورت آنلاین و از طریق سامانه شاهکار انجام می‌شود.</li>
            <li>پس از تایید نهایی، مبلغ وام به صورت اعتبار در "کیف پول سفر" شما شارژ خواهد شد.</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleAccept}
            className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20 w-full md:w-auto"
          >
            شرایط را مطالعه کردم و می‌پذیرم
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;