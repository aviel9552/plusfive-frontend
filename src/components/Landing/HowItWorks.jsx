import React from 'react'
import QRImage from '../../assets/Frame.svg';
import StartLine from '../../assets/StartLine.svg';
import LineLong from '../../assets/LineLong.svg';
import LastLine from '../../assets/LastLine.svg';
import en from '../../i18/en.json';
import he from '../../i18/he.json';

function HowItWorks({ language }) {
  const t = language === 'he' ? he.howItWorks : en.howItWorks;
  return (
    <section id="howitworks" className="w-full flex flex-col items-center justify-center bg-transparent md:py-[64px] py-8 md:px-[80px] px-8">
      {/* Heading */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-[16px]">
        <h2 className="text-4xl md:text-48 font-extrabold text-customLightTextColor dark:text-white text-center tracking-tight font-testtiemposfine">{t.heading}</h2>
        <p className="text-lg md:text-20 text-customBoldTextColor dark:text-gray-300 text-center font-medium">{t.subheading}</p>
      </div>
      {/* Content Row */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-[88px] md:gap-20">
        {/* Left: Steps */}
        <div className="flex-1 flex justify-center relative max-w-xl w-full min-w-[471px]  md:gap-[8px]">
          {/* Line Images with Numbered Circles */}
          <div className="flex flex-col items-center gap-[8px] justify-center mt-1">
            <div>
              {/* StartLine */}
              <img src={StartLine} alt="Start Line" className="w-2 h-10" />
            </div>

            {/* Numbered Circles with LineLong between them */}
            <div className="flex flex-col items-center gap-[10px]">
              {t.steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-[8px]">
                  {/* Numbered Circle */}
                  <div className={`flex-shrink-0 w-[40px] h-[40px] rounded-full flex items-center justify-center font-bold text-20 pt-1 shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-pink-500 to-pink-400 text-white border-pink-200' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-neutral-700'}`}>
                    {idx + 1}
                  </div>

                  {/* LineLong between circles (except after last circle) */}
                  {idx < t.steps.length - 1 && (
                    <img src={LineLong} alt="Long Line" className="w-3 h-10" />
                  )}
                </div>
              ))}
            </div>

            <div>
              {/* LastLine */}
              <img src={LastLine} alt="Last Line" className="w-2 h-10" />
            </div>
          </div>

          <div className='flex flex-col gap-[20px]'>
            <ol className=" flex flex-col gap-10 md:gap-[30px] pt-[60px]">
              {t.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-5 relative">
                  {/* Numbered circle */}
                  {/*
                  <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-xl border-4 shadow-sm pt-[0.4rem] ${idx === 0 ? 'bg-gradient-to-br from-pink-500 to-pink-400 text-white border-pink-200' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-neutral-700'}`}>{idx + 1}</div>
                */}
                  <div className='flex flex-col gap-[2px]'>
                    <div className="font-bold text-customLightTextColor dark:text-white text-lg md:text-20 ">
                      {step.title}
                    </div>
                    <div className="text-customBoldTextColor dark:text-gray-300 text-base md:text-20 ">
                      {step.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className=" text-pink-500 font-extrabold text-base md:text-18">{t.tagline}</div>
          </div>
          {/* Pink text at the end */}
        </div>
        {/* Right: Chart Card */}
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="relative w-full max-w-md rounded-3xl flex">
            {/* Chart Image */}
            <img
              src={QRImage}
              alt="QR Code Chart"
              className="w-full md:w-[645px] h-auto md:h-[500px] rounded-2xl object-contain "
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
