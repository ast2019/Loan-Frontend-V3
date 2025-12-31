import React from 'react';
import { useNavigate } from 'react-router-dom';
import Stepper6 from '../components/Stepper6';
import { safeStorage } from '../services/apiClient';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    safeStorage.setItem('touran:termsAccepted', 'true');
    safeStorage.setItem('touran:termsAcceptedAt', new Date().toISOString());
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
          <div className="space-y-4 text-sm text-gray-800 text-justify leading-7 p-2 h-96 overflow-y-auto border rounded-lg bg-gray-50">
  
  {/* عنوان اصلی */}
  <h3 className="font-bold text-lg text-center mb-2">
    قوانین و مقررات طرح تسهیلات سفر و گردشگری توران
  </h3>

  {/* متن مقدمه */}
  <p>
    من با ثبت درخواست و انتخاب گزینه مطالعه و پذیرش قوانین و مقررات، بدین‌وسیله ضمن اظهار به اطلاع و آگاهی کامل از مفاد پیام زیر، تبعات و مسئولیت‌های ناشی از آن را آگاهانه و با رضایت کامل پذیرفتم.
  </p>

  {/* لیست قوانین */}
  <div className="space-y-3">
    
    <div>
      <span className="font-bold block text-gray-900">۱- ماهیت طرح:</span>
      <p>
        طرح تسهیلات سفر و گردشگری توران، تسهیلاتی بانکی بوده و تأمین مالی آن توسط بانک شهر صورت گرفته و صرفاً اجرای خدمات گردشگری آن توسط شرکت توسعه گردشگری شهرآیین و بر بستر پلتفرم «تی‌تی‌شهر» انجام می‌پذیرد. بنابراین تأیید یا رد درخواست تسهیلات، مبلغ و مدت بازپرداخت، نرخ سود و نوع وثایق، طبق ضوابط و مقررات بانک شهر بوده و شرکت گردشگری شهرآیین در رابطه مسئولیتی ندارد.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۲- نحوه پرداخت تسهیلات:</span>
      <p>
        مبلغ تسهیلات پس از کسر کارمزدهای مربوطه، به زیرساخت، خدمات اداری و خدمات گردشگری، به‌صورت اعتبار (Wallet) در کیف پول اختصاصی متقاضی در پلتفرم تی‌تی‌شهر شارژ می‌شود و به‌صورت نقدی قابل برداشت نمی‌باشد.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۳- محدوده مصرف اعتبار:</span>
      <p>
        اعتبار واریزشده صرفاً جهت خرید خدمات گردشگری قابل ارائه در پلتفرم تی‌تی‌شهر (از جمله پرواز، هتل، تور، اقامتگاه، حمل‌ونقل و سایر خدمات فعال) قابل استفاده بوده و امکان تبدیل آن به وجه نقد یا انتقال به غیر وجود ندارد.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۴- کارمزدها و هزینه‌ها:</span>
      <p>
        استفاده از این طرح مشمول کارمزدهای بانکی، زیرساختی و اداری بوده و این هزینه‌ها مطابق ضوابط اعلامی، قبل از شارژ اعتبار از مبلغ تسهیلات کسر می‌گردد.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۵- اعتبارسنجی و تضامین:</span>
      <p>
        تخصیص تسهیلات، منوط به انجام فرآیند اعتبارسنجی بانکی است و نیازمند ارائه ضامن، گواهی کسر از حقوق یا سایر تضامین مورد تأیید بانک شهر می‌باشد.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۶- مسئولیت استفاده از خدمات:</span>
      <p>
        مسئولیت انتخاب، رزرو و استفاده از خدمات گردشگری بر عهده متقاضی بوده و شرکت توسعه گردشگری شهرآیین در چارچوب قوانین و شرایط پلتفرم، صرفاً ارائه‌دهنده بستر و خدمات گردشگری است.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۷- عدم امکان اعتراض پس از پذیرش:</span>
      <p>
        اینجانب به‌عنوان متقاضی دریافت تسهیلات فوق‌الذکر، ضمن اظهار اطلاع و آگهی کامل از مفاد و نحوه‌ی اجرای طرح، با پذیرش این مقررات، حق هرگونه ادعا، اعتراض یا شکایت نسبت به مواردی از قبیل نحوه پرداخت تسهیلات به‌صورت ولت، کسر کارمزدها، عدم پرداخت نقدی تسهیلات، شرایط اعتبارسنجی و تصمیم بانک را از خود سلب و ساقط نمودم.
      </p>
    </div>

    <div>
      <span className="font-bold block text-gray-900">۸- لازم‌الاجرا بودن مقررات:</span>
      <p>
        این مقررات پس از پذیرش، برای متقاضی لازم‌الاجرا بوده و به‌عنوان مبنای حقوقی همکاری تلقی می‌گردد.
      </p>
    </div>

  </div>

  {/* متن تعهد پایانی */}
  <div className="mt-4 pt-4 border-t border-gray-200">
    <p className="font-semibold text-gray-900">
      اینجانب کلیه قوانین و مقررات طرح تسهیلات سفر توران را مطالعه کرده و با آگاهی کامل از مفاد و ضوابط آن، تمامی تعهدات و مسئولیت‌های ناشی از اجرای آن را پذیرفتم.
    </p>
  </div>

</div>
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