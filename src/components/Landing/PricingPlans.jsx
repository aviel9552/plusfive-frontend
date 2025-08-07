import React, { useState } from 'react';
import { CommonButton, CommonGradientText, CommonOutlineGradintButton } from '../index';
import en from '../../i18/en.json';
import he from '../../i18/he.json';
import Bg from '../../assets/Bg.png';
import CheckIcon from '../../assets/CheckIcon.svg';
import { MdAutoAwesome } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function PricingPlans({ language }) {
  const [yearly, setYearly] = useState(true);
  const navigate = useNavigate();
  const lang = language === 'he' ? he : en;
  const plans = lang.pricingPlans.plans;

  const heading1 = lang.pricingPlans.heading1;
  const heading2 = lang.pricingPlans.heading2;
  const subheading = lang.pricingPlans.subheading;
  const toggleMonthly = lang.pricingPlans.toggleMonthly;
  const toggleYearly = lang.pricingPlans.toggleYearly;
  const yearlyBadge = lang.pricingPlans.yearlyBadge;
  const customPricingText = lang.pricingPlans.customPricingText;

  return (
    <section
      id="pricing"
      className="relative w-full flex flex-col items-center justify-center md:py-[64px] py-8 md:px-[80px] px-8 overflow-hidden"
      style={{
        backgroundImage: `url(${Bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // ya hata do agar content zyada hai
        height: 'auto',     // add this
      }}
    >
      {/* Starry effect (optional, can use bg pattern or custom) */}
      {/* <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, rgba(24,24,40,0.9) 100%)'}} /> */}

      <div className='flex flex-col items-center justify-center gap-[64px]'>

        {/* Heading */}
        <div className="relative z-10 flex flex-col items-center gap-[24px]">
          <div className='flex flex-col items-center justify-center gap-[16px]'>
            <h2 className="text-4xl md:text-48 text-center">
            {/*
              <span
                className="font-bold font-testtiemposfine"
                style={{
                  background: 'linear-gradient(265deg, #DF64CC 50.66%, #FF2380 54.97%, #FE5D39 58.94%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {heading1}
              </span>
               */}

              <CommonGradientText className="text-3xl md:text-48 font-bold font-testtiemposfine">
                &nbsp;{heading1}&nbsp;
              </CommonGradientText>
              <span className="font-bold text-white font-testtiemposfine">&nbsp;{heading2}</span>
            </h2>
            <p className="text-lg md:text-20 text-gray-300 text-center font-medium max-w-2xl">{subheading}</p>
          </div>
          {/* Toggle */}
          <div className="flex items-center gap-4 mb-2">
            <span className={`text-16 font-medium ${!yearly ? 'text-white' : 'text-gray-400'}`}>{toggleMonthly}</span>
            <button
              className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors duration-300 ${yearly ? 'bg-pink-500' : 'bg-gray-600'}`}
              onClick={() => setYearly(y => !y)}
              aria-label="Toggle yearly pricing"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${yearly ? 'translate-x-5' : ''}`}
              />
            </button>
            <span className={`text-16 font-medium ${yearly ? 'text-white' : 'text-gray-400'}`}>{toggleYearly}</span>
            <span className={`ml-2 px-2 pt-.5 py-1 rounded-lg text-xs ${yearly ? 'bg-pink-600/20 text-pink-400' : 'text-gray-400'}`}>{yearlyBadge}</span>
          </div>
        </div>

        <div>
          {/* Pricing Cards */}
          <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`
                    flex flex-col justify-between rounded-2xl shadow-xl p-7 md:p-[24px] min-h-[540px] transition-all
                    ${idx === 1 ? 'border-2' : 'border-2 border-white/10'}
                    relative
                  `}
                style={{
                  boxShadow: '0 8px 40px 0 #0002',
                  borderRadius: '20px',
                  ...(idx === 1 && {
                    '--border-radius': '20px',
                    '--border-width': '2px',
                    appearance: 'none',
                    position: 'relative',
                    border: '0',
                    zIndex: '2',
                    boxSizing: 'border-box'
                  })
                }}
              >
                {/* Badge 
                  {plan.badge && (
                    <div className="absolute top-4 right-6 bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-[13px] py-[10px] rounded-full flex items-center gap-[6px]">
                      <MdAutoAwesome className="text-purple-500 dark:text-purple-400 text-[16px]" />
                      <span className="font-bold bg-gradient-to-br from-[#FF2380] to-[#675DFF] text-transparent bg-clip-text">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  */}
                {/* Title & Desc */}
                <div className=''>
                  <div className='flex flex-col items-start gap-[28px]'>
                    <div className='flex flex-col items-start gap-[12px]'>
                      <div className='flex items-center justify-between w-full'>
                        <h3 className="text-2xl md:text-[30px] font-bold text-white">{plan.name}</h3>

                        {plan.badge && (
                          <div className=" bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-[13px] py-[10px] rounded-full flex items-center gap-[6px]">
                            <MdAutoAwesome className="text-purple-500 dark:text-purple-400 text-[16px]" />
                            <span className="font-bold bg-gradient-to-br from-[#FF2380] to-[#675DFF] text-transparent bg-clip-text">
                              {plan.badge}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className={`text-[#FFFFFFB8] text-base md:text-16 font-medium ${idx === 0 ? 'max-w-[232px]' : ''}`}>{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="">
                      {plan.custom ? (
                        <span className="text-2xl md:text-36 font-bold text-white">{customPricingText}</span>
                      ) : (
                        <span className="text-4xl md:text-36 font-extrabold text-white">{yearly ? (plan.price === 0 ? '$0' : `$${Math.round(plan.price * 0.3)}`) : `$${plan.price}`}</span>
                      )}
                      {!plan.custom && <span className="text-24 text-gray-400 font-medium ml-1">{plan.priceUnit}</span>}
                    </div>

                  </div>

                  {/* Features
                    */}
                </div>

                {/* Divider */}
                <div className="border-t border-[#FFFFFF1A] my-[24px]"></div>

                <ul className=" flex flex-col gap-[16px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex justify-start gap-[12px] text-base md:text-16 text-white">
                      <img src={CheckIcon} alt="Check" className="flex-shrink-0 w-[24px] h-[24px]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {/* Button */}
                <div className="mt-auto pt-2">
                  {plan.highlight ? (
                    <CommonButton
                      text={plan.buttonText}
                      onClick={() => navigate('/login')}
                      className="w-full py-3 text-16 font-bold rounded-xl"
                    />
                  ) : plan.buttonText === "Contact Sales" ? (
                    <CommonOutlineGradintButton
                      text={plan.buttonText}
                      onClick={() => navigate('/contact-sales')}
                      className="w-full py-3 text-16 font-bold rounded-xl cursor-pointer"
                    />
                  ) : (
                    <CommonOutlineGradintButton
                      text={plan.buttonText}
                      onClick={() => navigate('/login')}
                      className="w-full py-3 text-16 font-bold rounded-xl "
                    // textColor="text-white"
                    />
                  )}
                </div>
                {idx === 1 && (
                  <style jsx>{`
                    div::after {
                      --m-i: linear-gradient(#000, #000);
                      --m-o: content-box, padding-box;
                      content: "";
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      height: 100%;
                      padding: var(--border-width);
                      border-radius: var(--border-radius);
                      background-image: linear-gradient(259deg, #FE5D39 3.28%, #FF2380 49.86%, #DF64CC 100.32%);
                      -webkit-mask-image: var(--m-i), var(--m-i);
                      mask-image: var(--m-i), var(--m-i);
                      -webkit-mask-origin: var(--m-o);
                      mask-origin: var(--m-o);
                      -webkit-mask-clip: var(--m-o);
                      mask-composite: exclude;
                      -webkit-mask-composite: destination-out;
                      filter: hue-rotate(0);
                      z-index: -1;
                    }
                    
                    div,
                    div::after {
                      box-sizing: border-box;
                    }
                  `}</style>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>


    </section>
  );
}

export default PricingPlans;
