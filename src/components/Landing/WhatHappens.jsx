import React from 'react'
import en from '../../i18/en.json'
import he from '../../i18/he.json'
import { CommonGradientText } from '../index'
import UsersIcon from '../../assets/Users.svg'
import ChatIcon from '../../assets/Chat.svg'
import BarIcon from '../../assets/Bar.svg'
import UpArrowIcon from '../../assets/UpArrow.svg'
import BellIcon from '../../assets/Bell.svg'
import CheckIcon from '../../assets/Check.svg'
import LinkIcon from '../../assets/Link.svg'

const icons = [
  <img src={UsersIcon} alt="Users" className="w-[40px] h-[40px]" />,
  <img src={ChatIcon} alt="Chat" className="w-[40px] h-[40px]" />,
  <img src={BarIcon} alt="Bar Chart" className="w-[40px] h-[40px]" />,
  <img src={CheckIcon} alt="Check" className="w-[40px] h-[40px]" />,
  <img src={UpArrowIcon} alt="Up Arrow" className="w-[40px] h-[40px]" />,
  <img src={BellIcon} alt="Bell" className="w-[40px] h-[40px]" />,
  <img src={LinkIcon} alt="Link" className="w-[40px] h-[40px]" />,
  <img src={UsersIcon} alt="Users" className="w-[40px] h-[40px]" />
];

function WhatHappens({ language }) {
  const t = language === 'he' ? he.whatHappens : en.whatHappens;
  return (
    <section id="features" className="w-full flex flex-col items-center justify-center px-8 md:px-0 bg-white dark:bg-customGray">
      <div className="container md:p-[64px] md:gap-[64px] inline-flex flex-col ">
        <div>
          {/* Heading */}
          <h2 className="text-3xl md:text-48 font-extrabold text-center text-customLightTextColor dark:text-white mb-4 font-testtiemposfine">
            {t.heading1}
            {/*
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DF64CC] via-[#FF2380] to-[#FE5D39]">{t.heading2}</span>
              */}
            <CommonGradientText className="text-3xl md:text-48 font-extrabold font-testtiemposfine">
              &nbsp;{t.heading2}&nbsp;
            </CommonGradientText>
            {t.heading3}
            <br className="hidden md:block" /> {t.heading4}
          </h2>
          {/* Subheading */}
          <p className="text-center text-customBoldTextColor dark:text-gray-300 max-w-2xl mx-auto text-20">
            {t.subheading}
          </p>
        </div>
        {/* Table/Card */}
        <div className="w-full overflow-x-auto mx-auto my-8">
          <div className="min-w-[700px] max-w-5xl bg-white dark:bg-customBlack rounded-2xl border border-gray-200 dark:border-customBorderColor mx-auto p-6 md:p-[24px]">
            {/* Header Row */}
            <div className="grid grid-cols-2 gap-0 relative bg-transparent">
              <div className="font-bold text-20 dark:bg-customGray bg-black text-white pl-[16px] pr-[84px] py-[12px] w-full block rounded-l-2xl font-testtiemposfine">{language === 'he' ? 'מה תקבל' : 'What You Get'}</div>
              {/* Divider सिर्फ md+ पर ही render हो */}
              <div className="block absolute top-0 bottom-0 left-1/2 w-[0.01rem] bg-[#606060] rounded"></div>
              <div className="font-bold text-20 dark:bg-customGray bg-black text-white pl-[16px] pr-[84px] py-[12px] w-full block rounded-r-2xl font-testtiemposfine">{language === 'he' ? 'איך זה עובד' : 'How It Works'}</div>
            </div>
            {/* Divider below header */}
            {/* <div className="w-full border-b-2 border-gray-200"></div> */}
            <div>
              {t.rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-2 items-center border-b border-[#00000014] dark:border-customBorderColor bg-white dark:bg-customBlack relative` + (i === t.rows.length - 1 ? ' rounded-b-0' : '')}>
                  <div className="flex items-center gap-[16px] py-[12px] pl-[12px] pr-[84px]">
                    <span className="w-[40px] h-[40px] flex items-center justify-center">{icons[i]}</span>
                    <span className="text-customLightTextColor dark:text-white text-base md:text-18 font-medium">{row.text}</span>
                  </div>
                  {/* Vertical divider for each row - only on md+ */}
                  <div className="block absolute top-0 bottom-0 left-1/2 w-[0.01rem] bg-gray-200 dark:bg-customBorderColor"></div>
                  <div className="py-[18px] pl-[24px] pr-[84px] text-customLightTextColor dark:text-gray-300 text-base md:text-18">{row.how}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatHappens