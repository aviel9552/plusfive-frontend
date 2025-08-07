import React from 'react'
import aiImg from '../../assets/AiBg.svg'
import { GoArrowRight } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'
import { CommonBorderButton, CommonButton, CommonGradientText } from '../index'
import en from '../../i18/en.json'
import he from '../../i18/he.json'

function AiAgent({ language }) {
  const navigate = useNavigate();
  const t = language === 'he' ? he.aiAgent : en.aiAgent;
  return (
    <div className="mx-auto w-full">
      <section className="flex flex-col lg:flex-row items-center justify-evenly md:py-[64px] py-8 md:px-[80px] px-8 md:gap-[66px] gap-10 bg-white dark:bg-customGray rounded-3xl">
        {/* Left: Image Card */}
        <div className="rounded-3xl max-w-md">
          <img src={aiImg} alt="AI Agent" className="md:w-[645px] w-full h-auto rounded-2xl" />
        </div>
        {/* Right: Text Content */}
        <div className="flex-1 max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start justify-center gap-[32px]">

          <div className='flex flex-col gap-[16px]'>
            <div>
              <h2 className="text-3xl md:text-48 font-extrabold text-customLightTextColor dark:text-white leading-tight font-testtiemposfine">
                {t.heading1}
                {/*
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DF64CC] via-[#FF2380] to-[#FE5D39]"> {t.heading2} </span> 
        */}
                <CommonGradientText className="text-3xl md:text-48 font-extrabold font-testtiemposfine">
                  &nbsp;{t.heading2}&nbsp;
                </CommonGradientText>
                {t.heading3}
              </h2>
            </div>

            <div>
              <span className="text-customBoldTextColor dark:text-white text-base md:text-20 ">
                {t.description}
              </span>
            </div>
          </div>

          <div>
            <CommonBorderButton
              text={t.button}
              onClick={() => navigate('/login')}
              icon={<GoArrowRight />}
              iconPosition="right"
              className="!text-white rounded-lg px-[18px] pt-[12px] pb-[10px] font-bold text-20"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default AiAgent
