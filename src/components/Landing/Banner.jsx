import React from 'react';
import { CommonButton } from '../index';
import { useNavigate } from 'react-router-dom';
import en from '../../i18/en.json';
import he from '../../i18/he.json';
import cardBg from "../../assets/card.png";
import { FaArrowRight } from 'react-icons/fa';

function Banner({ language }) {
  const navigate = useNavigate();
  const lang = language === 'he' ? he : en;
  const ctaHeading = lang.faq.ctaHeading;
  const ctaText = lang.faq.ctaText;
  const ctaButtonText = lang.faq.ctaButtonText;


  return (
    <section className="w-full flex flex-col items-center justify-center bg-transparent md:py-[64px] py-8 md:px-[80px] px-8">

      {/* CTA Banner */}
      <div className="container mx-auto">
        <div
          className="w-full mx-auto rounded-2xl md:rounded-3xl px-6 md:px-[72px] py-10 md:pt-[40px] md:pb-[54px] flex flex-col md:flex-row items-center md:items-start justify-between gap-8"
          style={{
            backgroundImage: `url(${cardBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#181828" // fallback color, optional
          }}
        >
          <div className="flex-1 flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[16px]">
              <h3 className="text-2xl md:text-48 font-extrabold text-white font-testtiemposfine">{ctaHeading}</h3>
              <p className="text-white/70 text-base md:text-20">{ctaText}</p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto ">
              <CommonButton
                text={ctaButtonText}
                onClick={() => navigate('/login')}
                icon={<FaArrowRight />}
                iconPosition="right"
                gap="gap-[6px]"
                className="px-[18px] p-[12px] text-16 font-bold rounded-[8px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;