import React from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { CommonBorderButton, CommonButton } from '../index'
import { useNavigate } from 'react-router-dom'
import en from '../../i18/en.json'
import he from '../../i18/he.json'
import bgvs from "../../assets/Bgvs.png"; // <-- Image import
import arrow from "../../assets/ArrowIcon.svg"; // <-- Image import
import { IoClose } from 'react-icons/io5'
import { FiCheck } from 'react-icons/fi'
import { GoArrowRight } from 'react-icons/go'

function BeforeVsAfter({ language }) {
  const navigate = useNavigate();
  const t = language === 'he' ? he.beforeVsAfter : en.beforeVsAfter;
  return (
    <section className="w-full min-h-screen md:flex flex-col items-center justify-center py-8 px-8">
    {/*
      <section className="w-full min-h-screen md:flex flex-col items-center justify-center md:py-[64px] py-8 md:px-[80px] px-8">
      */}
      {/* Background card */}
      <div
        className="mx-auto rounded-[32px] shadow-2xl md:py-[80px] md:px-[206px] md:gap-[64px] gap-8 p-8 flex flex-col items-center "
        style={{
          // backgroundImage: `url(${bgvs})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#000" // fallback color, optional
        }}
      >
        <div className='flex flex-col md:w-[830px] gap-[16px]'>
          {/* Heading */}
          <h2 className="text-3xl md:text-48 font-extrabold text-center text-white font-testtiemposfine">{t.heading}</h2>
          <p className="text-center text-gray-300 max-w-lg mx-auto text-20">
            {t.subheading}
          </p>
        </div>
        {/* Comparison Cards */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-[24px]">
          {/* Before Card */}
          <div
            className="flex flex-col shadow-lg p-6 md:p-[32px] gap-[32px] md:min-w-[371px] max-w-md"
            style={{
              borderRadius: 'var(--radius-2xl, 16px)',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              background: 'linear-gradient(90deg, rgba(219, 234, 254, 0.08) 0%, rgba(243, 232, 255, 0.08) 100%)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div className="flex items-center gap-[20px]">
              <div className="w-[48px] h-[48px] rounded-[8px] flex items-center justify-center bg-[#FEE4E2]">
                <IoClose className="text-customErrorRed text-[24px]" />
              </div>
              <div>
                <span className="font-bold text-24 text-white">{t.beforeTitle}</span>
                <div className="text-customErrorRed font-semibold text-18">{t.beforeTagline}</div>
              </div>
            </div>
            <div>
              <ul className="flex flex-col gap-[16px]">
                {t.beforeList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-[8px] text-white/90 text-18"><FaTimes className="text-customErrorRed" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <img src={arrow} alt="arrow" className="w-10 h-10" />
          </div>
          {/* After Card */}
          <div
            className="flex flex-col shadow-lg p-6 md:p-[32px] gap-[32px] md:min-w-[371px] max-w-md"
            style={{
              borderRadius: 'var(--radius-2xl, 16px)',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              background: 'linear-gradient(90deg, rgba(219, 234, 254, 0.08) 0%, rgba(243, 232, 255, 0.08) 100%)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div className="flex items-center gap-[20px]">
              <span className="w-[48px] h-[48px] rounded-[8px] flex items-center justify-center bg-[#D3F8DF]">
                <FiCheck className="text-customSuccessGreen text-[24px]" />
              </span>
              <div>
                <span className="font-bold text-24 text-white">{t.afterTitle}</span>
                <p className="text-text-[24px] font-semibold text-[#099250] text-18">{t.afterTagline}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-[16px]">
              {t.afterList.map((item, idx) => (
                <li key={idx} className="flex items-center gap-[8px] text-white/90 text-18"><FiCheck className="text-[#099250]" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
        {/* Button */}
        <CommonBorderButton
          text={t.button}
          onClick={() => navigate('/login')}
          className="!text-white rounded-lg px-[18px] pt-[12px] pb-[10px] font-bold text-24 mx-auto mt-2"
          icon={<GoArrowRight />}
          iconPosition="right"
        />
      </div>
    </section>
  )
}

export default BeforeVsAfter
